#!/usr/bin/env node
/**
 * System Info - Overview
 * Get comprehensive system information
 * Usage: node overview.js [OPTIONS]
 */

const os = require('os');
const fs = require('fs');

const args = process.argv.slice(2);

/**
 * Parse command-line options for output format and a specific section.
 *
 * Scans the global `args` array for `--format <value>` and `--section <value>` pairs and produces an object describing the requested output `format` and `section`.
 *
 * @returns {{format: string, section: string|null}} An object with `format` (default `'json'`) and `section` (default `null`) where `section` is the requested section name or `null` if none was provided.
 */
function parseArgs() {
  const result = {
    format: 'json',
    section: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      result.format = args[i + 1];
      i++;
    } else if (args[i] === '--section' && args[i + 1]) {
      result.section = args[i + 1];
      i++;
    }
  }

  return result;
}

/**
 * Collects CPU information and computes overall CPU usage percentage across all cores.
 * @returns {{model: string, cores: number, speed: number, usage: number}} An object containing:
 *  - model: CPU model string (or 'Unknown' if unavailable).
 *  - cores: number of logical CPU cores.
 *  - speed: clock speed of the first CPU in MHz (or 0 if unavailable).
 *  - usage: percentage of non-idle CPU time across all cores, rounded to one decimal place.
 */
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }

  return {
    model: cpus[0]?.model || 'Unknown',
    cores: cpus.length,
    speed: cpus[0]?.speed || 0,
    usage: Math.round((1 - totalIdle / totalTick) * 100 * 10) / 10
  };
}

/**
 * Collects current system memory statistics.
 *
 * @returns {{total: number, used: number, free: number, usedPercent: number, totalFormatted: string, usedFormatted: string, freeFormatted: string}}
 * An object containing:
 * - total: Total memory in bytes.
 * - used: Used memory in bytes.
 * - free: Free memory in bytes.
 * - usedPercent: Percentage of memory used (0–100), rounded to one decimal place.
 * - totalFormatted: Human-readable total memory string.
 * - usedFormatted: Human-readable used memory string.
 * - freeFormatted: Human-readable free memory string.
 */
function getMemoryInfo() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  return {
    total,
    used,
    free,
    usedPercent: Math.round((used / total) * 100 * 10) / 10,
    totalFormatted: formatBytes(total),
    usedFormatted: formatBytes(used),
    freeFormatted: formatBytes(free)
  };
}

/**
 * Gather disk usage information for the root path on supported platforms (Linux); otherwise indicate disk info is unavailable.
 *
 * @returns {Object} On success, an object with:
 *  - `path` {string} root path measured ("/"),
 *  - `total` {number} total bytes,
 *  - `used` {number} used bytes,
 *  - `free` {number} free bytes,
 *  - `usedPercent` {number} percentage of used space rounded to one decimal,
 *  - `totalFormatted` {string} human-readable total,
 *  - `usedFormatted` {string} human-readable used,
 *  - `freeFormatted` {string} human-readable free.
 *  On unsupported platforms or failure, an object with:
 *  - `note` {string} explanatory message,
 *  - `available` {boolean} set to `false`.
 */
function getDiskInfo() {
  // This is a simplified version - full disk info requires native bindings
  try {
    if (process.platform === 'linux') {
      const stat = fs.statfsSync('/');
      const total = stat.blocks * stat.bsize;
      const free = stat.bfree * stat.bsize;
      const used = total - free;

      return {
        path: '/',
        total,
        used,
        free,
        usedPercent: Math.round((used / total) * 100 * 10) / 10,
        totalFormatted: formatBytes(total),
        usedFormatted: formatBytes(used),
        freeFormatted: formatBytes(free)
      };
    }
  } catch {
    // statfsSync not available
  }

  return {
    note: 'Disk info requires platform-specific implementation',
    available: false
  };
}

/**
 * Collects non-internal network interfaces and their addresses.
 *
 * @returns {Array<Object>} An array of network interface entries, each with:
 *  - name: interface name,
 *  - address: IP address,
 *  - family: address family (e.g., 'IPv4' or 'IPv6'),
 *  - mac: MAC address,
 *  - netmask: network mask.
 */
function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const result = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;

    for (const addr of addrs) {
      if (addr.internal) continue;

      result.push({
        name,
        address: addr.address,
        family: addr.family,
        mac: addr.mac,
        netmask: addr.netmask
      });
    }
  }

  return result;
}

/**
 * Collects and returns operating system and environment details.
 * @returns {Object} An object containing OS and runtime environment fields:
 * - platform: platform identifier (e.g., 'linux', 'darwin', 'win32')
 * - release: OS release string
 * - arch: CPU architecture (e.g., 'x64')
 * - hostname: system host name
 * - uptime: system uptime in seconds
 * - uptimeFormatted: human-readable uptime string (days/hours/minutes)
 * - type: OS name (e.g., 'Linux', 'Windows_NT')
 * - version: OS version string or 'N/A' if unavailable
 * - homedir: current user's home directory path
 * - tmpdir: system temporary directory path
 */
function getOsInfo() {
  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    uptimeFormatted: formatUptime(os.uptime()),
    type: os.type(),
    version: os.version?.() || 'N/A',
    homedir: os.homedir(),
    tmpdir: os.tmpdir()
  };
}

/**
 * Collects information about the current Node.js runtime and process environment.
 * @returns {{node: string, v8: string, platform: string, arch: string, pid: number, cwd: string, execPath: string}} An object containing runtime and process details:
 * - `node`: Node.js version string (e.g., "v16.14.0").
 * - `v8`: V8 engine version string.
 * - `platform`: Node.js platform identifier (process.platform).
 * - `arch`: CPU architecture identifier (process.arch).
 * - `pid`: Current process ID.
 * - `cwd`: Current working directory of the process.
 * - `execPath`: Absolute path to the Node.js executable.
 */
function getRuntimeInfo() {
  return {
    node: process.version,
    v8: process.versions.v8,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    cwd: process.cwd(),
    execPath: process.execPath
  };
}

/**
 * Convert a byte count into a human-readable string using 1024-based units.
 * @param {number} bytes - The size in bytes.
 * @return {string} The formatted size with two decimal places and a unit (B, KB, MB, GB, or TB).
 */
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

/**
 * Format an uptime duration given in seconds into a compact human-readable string.
 * @param {number} seconds - Uptime duration in seconds.
 * @returns {string} A compact formatted duration (e.g., "1d 2h 3m"); returns "< 1m" if under one minute.
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}

/**
 * Format the collected system information into a human-readable multiline text overview.
 * @param {Object} info - Aggregated system information.
 * @param {Object} info.os - OS section with fields: `platform`, `arch`, `release`, `hostname`, `uptimeFormatted`.
 * @param {Object} info.cpu - CPU section with fields: `model`, `cores`, `usage`.
 * @param {Object} info.memory - Memory section with fields: `totalFormatted`, `usedFormatted`, `freeFormatted`, `usedPercent`.
 * @param {Object} info.disk - Disk section; when `info.disk.available === false` the disk section will be omitted.
 * @param {Array<Object>} info.network - Array of network interfaces, each with `name`, `address`, and `family`.
 * @param {Object} info.runtime - Runtime section with fields: `node`, `v8`, `pid`.
 * @returns {string} A multiline plain-text representation of the system overview suitable for console output. */
function formatText(info) {
  const lines = [];

  lines.push('=== System Overview ===');
  lines.push('');

  lines.push('OS:');
  lines.push(`  Platform: ${info.os.platform} ${info.os.arch}`);
  lines.push(`  Release: ${info.os.release}`);
  lines.push(`  Hostname: ${info.os.hostname}`);
  lines.push(`  Uptime: ${info.os.uptimeFormatted}`);
  lines.push('');

  lines.push('CPU:');
  lines.push(`  Model: ${info.cpu.model}`);
  lines.push(`  Cores: ${info.cpu.cores}`);
  lines.push(`  Usage: ${info.cpu.usage}%`);
  lines.push('');

  lines.push('Memory:');
  lines.push(`  Total: ${info.memory.totalFormatted}`);
  lines.push(`  Used: ${info.memory.usedFormatted} (${info.memory.usedPercent}%)`);
  lines.push(`  Free: ${info.memory.freeFormatted}`);
  lines.push('');

  if (info.disk.available !== false) {
    lines.push('Disk:');
    lines.push(`  Total: ${info.disk.totalFormatted}`);
    lines.push(`  Used: ${info.disk.usedFormatted} (${info.disk.usedPercent}%)`);
    lines.push(`  Free: ${info.disk.freeFormatted}`);
    lines.push('');
  }

  lines.push('Network:');
  for (const iface of info.network) {
    lines.push(`  ${iface.name}: ${iface.address} (${iface.family})`);
  }
  lines.push('');

  lines.push('Runtime:');
  lines.push(`  Node.js: ${info.runtime.node}`);
  lines.push(`  V8: ${info.runtime.v8}`);
  lines.push(`  PID: ${info.runtime.pid}`);

  return lines.join('\n');
}

/**
 * Collects system information (either a single requested section or a full report) and writes it to stdout in JSON or plain-text format.
 *
 * The output format and optional single-section selection are taken from command-line arguments parsed by parseArgs.
 * When emitting the full report a timestamp is included; when a single section is requested only that section is produced.
 */
function main() {
  const options = parseArgs();

  const sections = {
    os: getOsInfo,
    cpu: getCpuUsage,
    memory: getMemoryInfo,
    disk: getDiskInfo,
    network: getNetworkInfo,
    runtime: getRuntimeInfo
  };

  let info;

  if (options.section && sections[options.section]) {
    info = { [options.section]: sections[options.section]() };
  } else {
    info = {
      timestamp: new Date().toISOString(),
      os: getOsInfo(),
      cpu: getCpuUsage(),
      memory: getMemoryInfo(),
      disk: getDiskInfo(),
      network: getNetworkInfo(),
      runtime: getRuntimeInfo()
    };
  }

  if (options.format === 'text') {
    console.log(formatText(info));
  } else {
    console.log(JSON.stringify(info, null, 2));
  }
}

main();