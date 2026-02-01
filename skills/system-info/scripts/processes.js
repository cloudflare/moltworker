#!/usr/bin/env node
/**
 * System Info - Process List
 * List and monitor processes
 * Usage: node processes.js [OPTIONS]
 */

const { execSync } = require('child_process');
const os = require('os');

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into an options object for process listing.
 * @returns {{sort: string, limit: number, filter: string|null, tree: boolean}} The parsed options:
 *  - sort: sorting key ('cpu', 'pid', 'name', or 'memory'; defaults to 'memory')
 *  - limit: maximum number of processes to return (defaults to 20)
 *  - filter: lowercase substring to filter process commands by, or `null` if not set
 *  - tree: `true` if the --tree flag was provided, `false` otherwise
 */
function parseArgs() {
  const result = {
    sort: 'memory',
    limit: 20,
    filter: null,
    tree: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--sort' && args[i + 1]) {
      result.sort = args[i + 1];
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      result.limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--filter' && args[i + 1]) {
      result.filter = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--tree') {
      result.tree = true;
    }
  }

  return result;
}

/**
 * Gather current system processes into an array of normalized process objects.
 *
 * Collects processes using platform-appropriate system commands (ps on Linux/macOS, tasklist on Windows)
 * and returns an array of objects containing pid, command, memory and other metadata. On error, returns a single
 * fallback entry describing the running Node.js process with limited information.
 *
 * @returns {Array<Object>} An array of process objects. Each object may contain:
 * - `pid` {number} - Process ID.
 * - `command` {string} - The command or executable name.
 * - `user` {string|undefined} - Owning user (present on Unix).
 * - `cpu` {number} - CPU usage percentage (if available; otherwise 0).
 * - `memory` {number} - Memory usage percentage (Unix `%MEM`) or 0 for Windows/tasklist entries.
 * - `vsz` {number|undefined} - Virtual memory size in bytes (present on Unix).
 * - `rss` {number} - Resident set size in bytes.
 * - `state` {string|undefined} - Process state/flags (present on Unix).
 * - `started` {string|undefined} - Process start time (present on Unix).
 * - `time` {string|undefined} - CPU time string (present on Unix).
 * - `note` {string|undefined} - Present on fallback entries to indicate limited information.
 */
function getProcesses() {
  const platform = os.platform();
  const processes = [];

  try {
    if (platform === 'linux' || platform === 'darwin') {
      // Use ps command
      const output = execSync(
        'ps aux --no-headers 2>/dev/null || ps aux | tail -n +2',
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );

      const lines = output.trim().split('\n');

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 11) continue;

        const [user, pid, cpu, mem, vsz, rss, tty, stat, start, time, ...cmdParts] = parts;

        processes.push({
          pid: parseInt(pid, 10),
          user,
          cpu: parseFloat(cpu),
          memory: parseFloat(mem),
          vsz: parseInt(vsz, 10) * 1024,
          rss: parseInt(rss, 10) * 1024,
          state: stat,
          started: start,
          time,
          command: cmdParts.join(' ')
        });
      }
    } else if (platform === 'win32') {
      // Use tasklist on Windows
      const output = execSync(
        'tasklist /FO CSV /NH',
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );

      const lines = output.trim().split('\n');

      for (const line of lines) {
        const match = line.match(/"([^"]+)","(\d+)","([^"]+)","([^"]+)","([^"]+)"/);
        if (match) {
          const [, name, pid, sessionName, sessionNum, memUsage] = match;
          const memBytes = parseInt(memUsage.replace(/[^\d]/g, ''), 10) * 1024;

          processes.push({
            pid: parseInt(pid, 10),
            command: name,
            memory: 0,
            rss: memBytes,
            cpu: 0
          });
        }
      }
    }
  } catch (err) {
    // Fallback to basic Node.js process info
    processes.push({
      pid: process.pid,
      command: process.argv.join(' '),
      memory: (process.memoryUsage().heapUsed / os.totalmem()) * 100,
      rss: process.memoryUsage().rss,
      cpu: 0,
      note: 'Limited process info available'
    });
  }

  return processes;
}

/**
 * Format a byte count as a human-readable string with an appropriate unit.
 * @param {number} bytes - The number of bytes to format.
 * @returns {string} A string formatted as "<value> <unit>" with one decimal place; units are B, KB, MB, or GB (e.g., "1.0 KB").
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

/**
 * Gather processes, apply filter/sort/limit options, and print a JSON summary to stdout.
 *
 * The printed JSON contains a timestamp, count, sortedBy, and a processes array.
 * Each process entry is augmented with `rssFormatted` (human-readable RSS) and
 * `commandShort` (command truncated to 60 characters, with an ellipsis if truncated).
 */
function main() {
  const options = parseArgs();

  let processes = getProcesses();

  // Filter
  if (options.filter) {
    processes = processes.filter(p =>
      p.command?.toLowerCase().includes(options.filter)
    );
  }

  // Sort
  const sortField = options.sort === 'cpu' ? 'cpu' :
                    options.sort === 'pid' ? 'pid' :
                    options.sort === 'name' ? 'command' : 'memory';

  processes.sort((a, b) => {
    if (sortField === 'command') {
      return (a.command || '').localeCompare(b.command || '');
    }
    return (b[sortField] || 0) - (a[sortField] || 0);
  });

  // Limit
  processes = processes.slice(0, options.limit);

  // Format output
  const output = {
    timestamp: new Date().toISOString(),
    count: processes.length,
    sortedBy: options.sort,
    processes: processes.map(p => ({
      ...p,
      rssFormatted: formatBytes(p.rss || 0),
      commandShort: p.command?.substring(0, 60) + (p.command?.length > 60 ? '...' : '')
    }))
  };

  console.log(JSON.stringify(output, null, 2));
}

main();