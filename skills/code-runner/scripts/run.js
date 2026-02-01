#!/usr/bin/env node
/**
 * Code Runner - Execute Code
 * Execute code snippets in various languages
 * Usage: node run.js <code> --lang <language>
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into an execution options object.
 *
 * Parses known flags (--lang, --file, --timeout, --stdin, --args, --env) and
 * treats the first non-flag token as inline code. Unknown flags are ignored.
 *
 * @returns {{code: string, lang: string|null, file: string|null, timeout: number, stdin: string|null, args: string[], env: Object}}
 * An options object with the following properties:
 * - code: Inline code provided as a non-flag argument, or an empty string.
 * - lang: Lowercased language identifier from `--lang`, or `null`.
 * - file: File path from `--file`, or `null`.
 * - timeout: Timeout in milliseconds (parsed from `--timeout`), default 30000.
 * - stdin: String to write to the child process stdin (from `--stdin`), or `null`.
 * - args: Array of additional positional arguments (from `--args`, comma-separated), default [].
 * - env: Environment variables parsed from JSON provided to `--env`, default {}.
 */
function parseArgs() {
  const result = {
    code: '',
    lang: null,
    file: null,
    timeout: 30000,
    stdin: null,
    args: [],
    env: {}
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang' && args[i + 1]) {
      result.lang = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      result.file = args[i + 1];
      i++;
    } else if (args[i] === '--timeout' && args[i + 1]) {
      result.timeout = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--stdin' && args[i + 1]) {
      result.stdin = args[i + 1];
      i++;
    } else if (args[i] === '--args' && args[i + 1]) {
      result.args = args[i + 1].split(',');
      i++;
    } else if (args[i] === '--env' && args[i + 1]) {
      result.env = JSON.parse(args[i + 1]);
      i++;
    } else if (!args[i].startsWith('--')) {
      result.code = args[i];
    }
  }

  return result;
}

/**
 * Map a language identifier to its execution configuration.
 * 
 * Returns an object describing the command to run, file extension, and canonical language name for the given identifier.
 * @param {string} lang - Language identifier (e.g., "js", "typescript", "python", "bash"). Matching is done against known keys.
 * @returns {{cmd: string, cmdArgs?: string[], ext: string, name: string} | null} The execution configuration, or `null` if the language is not supported.
 */
function getLanguageConfig(lang) {
  const configs = {
    js: { cmd: 'node', ext: '.js', name: 'javascript' },
    javascript: { cmd: 'node', ext: '.js', name: 'javascript' },
    node: { cmd: 'node', ext: '.js', name: 'javascript' },
    ts: { cmd: 'npx', cmdArgs: ['tsx'], ext: '.ts', name: 'typescript' },
    typescript: { cmd: 'npx', cmdArgs: ['tsx'], ext: '.ts', name: 'typescript' },
    python: { cmd: 'python3', ext: '.py', name: 'python' },
    py: { cmd: 'python3', ext: '.py', name: 'python' },
    python3: { cmd: 'python3', ext: '.py', name: 'python' },
    shell: { cmd: '/bin/bash', ext: '.sh', name: 'shell' },
    bash: { cmd: '/bin/bash', ext: '.sh', name: 'shell' },
    sh: { cmd: '/bin/sh', ext: '.sh', name: 'shell' }
  };

  return configs[lang] || null;
}

/**
 * Execute the provided code using the given language configuration and options, capturing output and execution metadata.
 *
 * @param {string} code - Source code to write to a temporary file and execute.
 * @param {{ cmd: string, cmdArgs?: string[], ext: string, name: string }} config - Execution configuration for the target language:
 *   - cmd: command to run (e.g., 'node', 'python3'),
 *   - cmdArgs: additional command arguments to prepend before the temp file path,
 *   - ext: file extension for the temporary file (e.g., '.js'),
 *   - name: human-readable language name.
 * @param {{ timeout: number, args?: string[], env?: Object.<string,string>, stdin?: string }} options - Execution options:
 *   - timeout: maximum runtime in milliseconds,
 *   - args: additional CLI arguments appended after the temp file path,
 *   - env: environment variables to merge with the current process.env,
 *   - stdin: string to write to the child process stdin.
 * @returns {{ success: boolean, language: string, exitCode: number|null, stdout: string, stderr: string, duration: number, timedOut: boolean, error: string|null }} An object describing the execution result:
 *   - success: `true` if the process exited with code 0 and did not time out, `false` otherwise.
 *   - language: the configured language name.
 *   - exitCode: process exit code, or `null` if the run timed out or failed to start.
 *   - stdout: captured standard output (trimmed).
 *   - stderr: captured standard error (trimmed).
 *   - duration: execution duration in milliseconds.
 *   - timedOut: `true` if the process was killed due to timeout.
 *   - error: a descriptive error message when applicable (`'Execution timed out'`, process exit description, or spawn error), or `null` on success.
 */
async function runCode(code, config, options) {
  return new Promise((resolve) => {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `code_${Date.now()}${config.ext}`);

    fs.writeFileSync(tempFile, code);

    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const cmdArgs = [...(config.cmdArgs || []), tempFile, ...options.args];
    const proc = spawn(config.cmd, cmdArgs, {
      env: { ...process.env, ...options.env },
      timeout: options.timeout
    });

    const timeoutId = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, options.timeout);

    if (options.stdin) {
      proc.stdin.write(options.stdin);
      proc.stdin.end();
    }

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (exitCode) => {
      clearTimeout(timeoutId);

      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // Ignore cleanup errors
      }

      const duration = Date.now() - startTime;

      resolve({
        success: exitCode === 0 && !timedOut,
        language: config.name,
        exitCode: timedOut ? null : exitCode,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        duration,
        timedOut,
        error: timedOut ? 'Execution timed out' : (exitCode !== 0 ? `Process exited with code ${exitCode}` : null)
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutId);

      try {
        fs.unlinkSync(tempFile);
      } catch {
        // Ignore cleanup errors
      }

      resolve({
        success: false,
        language: config.name,
        exitCode: null,
        stdout: '',
        stderr: '',
        duration: Date.now() - startTime,
        timedOut: false,
        error: err.message
      });
    });
  });
}

/**
 * Orchestrates command-line parsing, validation, code loading, execution, and process exit.
 *
 * Parses CLI options, validates the requested language and input (inline code or file), executes the code with the resolved language configuration, prints the execution result as JSON to stdout, and exits the process with code 0 on success or 1 on failure. On validation errors or missing inputs it writes an error message (plain text or JSON) to stderr and exits with code 1.
 */
async function main() {
  const options = parseArgs();

  if (!options.lang) {
    console.error('Usage: node run.js <code> --lang <language>');
    console.error('       node run.js --file <path> --lang <language>');
    console.error('');
    console.error('Languages: js, ts, python, shell, bash');
    console.error('');
    console.error('Options:');
    console.error('  --lang <lang>     Language (required)');
    console.error('  --file <path>     Execute from file');
    console.error('  --timeout <ms>    Timeout (default: 30000)');
    console.error('  --stdin <data>    Provide stdin');
    console.error('  --args <a,b,c>    Command arguments');
    console.error('  --env <json>      Environment variables');
    process.exit(1);
  }

  const config = getLanguageConfig(options.lang);
  if (!config) {
    console.error(JSON.stringify({
      error: `Unsupported language: ${options.lang}`,
      supported: ['js', 'ts', 'python', 'shell', 'bash']
    }));
    process.exit(1);
  }

  let code = options.code;

  if (options.file) {
    const filePath = path.resolve(options.file);
    if (!fs.existsSync(filePath)) {
      console.error(JSON.stringify({ error: `File not found: ${filePath}` }));
      process.exit(1);
    }
    code = fs.readFileSync(filePath, 'utf-8');
  }

  if (!code) {
    console.error(JSON.stringify({ error: 'No code provided' }));
    process.exit(1);
  }

  const result = await runCode(code, config, options);
  console.log(JSON.stringify(result, null, 2));

  process.exit(result.success ? 0 : 1);
}

main();