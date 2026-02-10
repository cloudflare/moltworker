import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ProcessRegistry } from "./lib/process-registry.js";
import { spawn } from "bun";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import * as os from "os";

// Initialize registry - Singleton instance for the unified server
const registry = new ProcessRegistry({
  autoReconcile: true
});

// Run reconciliation immediately
await registry.reconcile();

export async function registerProcessTools(server: McpServer) {
  server.registerTool(
    "start_background_process",
    {
      description:
        "Starts a long-running shell command in the background. Returns a tracking ID that survives server restarts. Use this for ANY command expected to run longer than 5 seconds (e.g. npm install, docker build, migrations).",
      inputSchema: z.object({
        commandId: z.string().describe("Unique ID for this task (e.g. 'npm-install-v1')"),
        command: z.string().describe("Shell command to execute"),
        args: z.array(z.string()).optional().describe("Arguments for the command"),
        cwd: z.string().optional().describe("Working directory")
      })
    },
    async ({ commandId, command, args = [], cwd }) => {
      try {
        // Check if already running
        const existing = registry.get(commandId);
        if (existing && existing.status === "running") {
          return {
            content: [
              {
                type: "text",
                text: `Process '${commandId}' is already running (PID: ${existing.pid})`
              }
            ]
          };
        }

        const logDir = join(os.tmpdir(), "gemini_logs");
        // Ensure log dir exists
        if (!existsSync(logDir)) {
          mkdirSync(logDir, { recursive: true });
        }

        const stdoutPath = join(logDir, `${commandId}.out.log`);
        const stderrPath = join(logDir, `${commandId}.err.log`);

        // Spawn detached process using 'sh -c' for robustness
        const subprocess = spawn(["sh", "-c", `${command} ${args.join(" ")}`], {
          cwd: cwd || process.cwd(),
          stdout: "pipe",
          stderr: "pipe"
          // Bun spawn is essentially detached from the event loop by default
          // if we don't await it, but we need to ensure we don't kill it on exit.
          // Standard Bun.spawn processes are children.
          // For true detachment in node we'd use detached: true.
          // In this context, just persisting the PID allows us to recover "knowledge" of it.
        });

        // Setup file writers
        const stdoutFile = Bun.file(stdoutPath);
        const stderrFile = Bun.file(stderrPath);
        const writerOut = stdoutFile.writer();
        const writerErr = stderrFile.writer();

        // Pipe streams using ReadableStream's pipeTo
        subprocess.stdout.pipeTo(
          new WritableStream({
            write(chunk) {
              writerOut.write(chunk);
            },
            close() {
              writerOut.end();
            }
          })
        );

        subprocess.stderr.pipeTo(
          new WritableStream({
            write(chunk) {
              writerErr.write(chunk);
            },
            close() {
              writerErr.end();
            }
          })
        );

        // Register immediately
        await registry.register(commandId, command, subprocess.pid, {
          stdout: stdoutPath,
          stderr: stderrPath
        });

        // Handle completion
        subprocess.exited.then(async (code: number) => {
          const status = code === 0 ? "completed" : "failed";
          await registry.updateStatus(commandId, status, code);
        });

        return {
          content: [
            {
              type: "text",
              text: `Started process '${commandId}' (PID: ${subprocess.pid}).\nLogs:\n${stdoutPath}\n${stderrPath}`
            }
          ]
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to start process: ${message}` }]
        };
      }
    }
  );

  server.registerTool(
    "check_process_status",
    {
      description:
        "Checks the status of a background process by ID. Use this to poll for completion of tasks started with start_background_process.",
      inputSchema: z.object({
        commandId: z.string()
      })
    },
    async ({ commandId }) => {
      // Reconcile first to ensure we aren't reporting ghosts
      await registry.reconcile();

      const proc = registry.get(commandId);
      if (!proc) {
        return {
          isError: true,
          content: [{ type: "text", text: `Process '${commandId}' not found.` }]
        };
      }

      let outputSnippet = "";
      if (proc.logFiles?.stdout) {
        try {
          const file = Bun.file(proc.logFiles.stdout);
          if (await file.exists()) {
            const text = await file.text();
            // Get the last 1000 characters
            outputSnippet = "\n--- Last Output ---" + text.slice(-1000);
          }
        } catch {
          /* ignore read error */
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `Status: ${proc.status}\nPID: ${proc.pid}\nExit Code: ${proc.exitCode ?? "Running"}${outputSnippet}`
          }
        ]
      };
    }
  );
}
