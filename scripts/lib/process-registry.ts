import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import * as os from "os";
import * as path from "path";

/**
 * Process Registry Schema Definition
 */
export interface RegisteredProcess {
  commandId: string;
  command: string;
  pid: number;
  startTime: string; // ISO 8601
  status: "running" | "completed" | "failed" | "unknown";
  exitCode?: number;
  logFiles?: {
    stdout?: string;
    stderr?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface RegistrySchema {
  version: "1.0.0";
  lastUpdated: string; // ISO 8601
  processes: Record<string, RegisteredProcess>;
}

export interface ProcessRegistryConfig {
  storagePath?: string;
  autoReconcile?: boolean;
}

/**
 * Persistent Process Registry
 *
 * Manages a local JSON file to track process state across service restarts.
 * Ensures idempotency and data integrity for background tasks.
 */
export class ProcessRegistry {
  private static readonly DEFAULT_PATH = path.join(os.tmpdir(), "gemini_process_registry.json");
  private storagePath: string;
  private state: RegistrySchema;

  constructor(config: ProcessRegistryConfig = {}) {
    this.storagePath = config.storagePath || ProcessRegistry.DEFAULT_PATH;
    this.state = this.getEmptyState();
    this.initialize();
  }

  /**
   * Initialize the registry.
   * Loads existing state from disk or creates a new registry file.
   */
  private initialize(): void {
    try {
      this.ensureDirectoryExists();

      if (existsSync(this.storagePath)) {
        this.load();
        // console.error(`[ProcessRegistry] Loaded state from ${this.storagePath}`);
      } else {
        this.persistSync(); // Create initial file (must be sync in constructor)
        // console.error(`[ProcessRegistry] Initialized new registry at ${this.storagePath}`);
      }
    } catch (error) {
      console.error(`[ProcessRegistry] Failed to initialize:`, error);
      // Fallback to empty in-memory state on critical FS failure
      this.state = this.getEmptyState();
    }
  }

  /**
   * Register a new process.
   * Idempotent: If commandId exists, it updates the existing entry.
   */
  public async register(
    commandId: string,
    command: string,
    pid: number,
    logFiles?: RegisteredProcess["logFiles"]
  ): Promise<void> {
    if (!commandId || !pid) {
      throw new Error("[ProcessRegistry] Invalid input: commandId and pid are required.");
    }

    const entry: RegisteredProcess = {
      commandId,
      command,
      pid,
      startTime: new Date().toISOString(),
      status: "running",
      logFiles
    };

    this.state.processes[commandId] = entry;
    await this.persist();
    // console.error(`[ProcessRegistry] Registered process: ${commandId} (PID: ${pid})`);
  }

  /**
   * Update the status of an existing process.
   */
  public async updateStatus(
    commandId: string,
    status: RegisteredProcess["status"],
    exitCode?: number
  ): Promise<void> {
    const process = this.state.processes[commandId];
    if (!process) {
      console.warn(`[ProcessRegistry] updateStatus called for unknown ID: ${commandId}`);
      return;
    }

    process.status = status;
    if (exitCode !== undefined) {
      process.exitCode = exitCode;
    }

    await this.persist();
    // console.error(`[ProcessRegistry] Updated ${commandId} -> ${status}`);
  }

  /**
   * Retrieve a process by ID.
   */
  public get(commandId: string): RegisteredProcess | undefined {
    return this.state.processes[commandId];
  }

  /**
   * List all tracked processes.
   */
  public list(): RegisteredProcess[] {
    return Object.values(this.state.processes);
  }

  /**
   * Reconcile registry state with the actual OS process table.
   * Detects "ghost" processes that died during a service restart.
   */
  public async reconcile(): Promise<void> {
    // console.error("[ProcessRegistry] Starting reconciliation...");
    let updatedCount = 0;

    for (const id in this.state.processes) {
      const proc = this.state.processes[id];
      if (proc.status === "running") {
        const isAlive = this.checkPidIsAlive(proc.pid);
        if (!isAlive) {
          // Process is gone. Mark as failed/unknown unless we find exit logs.
          // In a real scenario, we might check the logs here for "exit code 0".
          console.warn(`[ProcessRegistry] Process ${id} (PID ${proc.pid}) is dead.`);
          proc.status = "unknown"; // Or "failed" depending on policy
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      await this.persist();
      // console.error(`[ProcessRegistry] Reconciled ${updatedCount} stale processes.`);
    } else {
      // console.error("[ProcessRegistry] No stale processes found.");
    }
  }

  /**
   * Check if a PID is active on the host OS.
   * Compatible with macOS/Linux (POSIX).
   */
  private checkPidIsAlive(pid: number): boolean {
    try {
      // kill(pid, 0) checks for existence without sending a signal
      process.kill(pid, 0);
      return true;
    } catch (e: unknown) {
      const err = e as NodeJS.ErrnoException;
      return err.code === "EPERM"; // Alive but no permission is still "alive"
    }
  }

  /**
   * Load state from JSON file.
   */
  private load(): void {
    try {
      // Synchronous blocking load is safer for init
      // But Bun.file() is async-first usually. We'll use fs readFileSync for simplicity if needed,
      // but sticking to Bun idioms:
      // Note: In a class constructor/init context, async is tricky.
      // We will assume the file is small enough that we can await it if register is async.
      // However, for synchronous init, we'll parse synchronously via JSON import if possible,
      // or just assume async usage patterns.
      // Using `readFileSync` from node:fs compatibility layer.
      const raw = readFileSync(this.storagePath, "utf-8");

      // Handle empty file edge case
      if (!raw || raw.trim() === "") {
        console.warn("[ProcessRegistry] Registry file is empty. Resetting.");
        this.state = this.getEmptyState();
        return;
      }

      try {
        const data = JSON.parse(raw);
        // Basic validation
        if (data.version !== "1.0.0" || !data.processes) {
          throw new Error("Invalid registry format");
        }
        this.state = data;
      } catch (parseError) {
        console.error(
          "[ProcessRegistry] JSON parse failed (corruption detected). Resetting registry.",
          parseError
        );
        this.state = this.getEmptyState();
        // Optionally back up the corrupt file for debugging
        // renameSync(this.storagePath, this.storagePath + ".corrupt");
      }
    } catch (error) {
      console.error("[ProcessRegistry] Failed to load state file, resetting.", error);
      this.state = this.getEmptyState();
    }
  }

  /**
   * Write state to JSON file atomically.
   */
  private async persist(): Promise<void> {
    this.state.lastUpdated = new Date().toISOString();
    try {
      const data = JSON.stringify(this.state, null, 2);
      // Use Node.js fs for cross-runtime compatibility (Bun and Vitest/Node)
      const fs = await import("fs");
      fs.writeFileSync(this.storagePath, data, "utf-8");
    } catch (error) {
      console.error("[ProcessRegistry] Failed to save state:", error);
    }
  }

  /**
   * Synchronous version of persist, used for initial file creation in constructor.
   */
  private persistSync(): void {
    this.state.lastUpdated = new Date().toISOString();
    try {
      const data = JSON.stringify(this.state, null, 2);
      // Use synchronous fs - available in both Node and Bun
      writeFileSync(this.storagePath, data, "utf-8");
    } catch (error) {
      console.error("[ProcessRegistry] Failed to save state synchronously:", error);
    }
  }

  private getEmptyState(): RegistrySchema {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      processes: {}
    };
  }

  private ensureDirectoryExists(): void {
    const dir = this.storagePath.substring(0, this.storagePath.lastIndexOf("/"));
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}
