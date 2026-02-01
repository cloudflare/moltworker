#!/usr/bin/env node
/**
 * System Info - Overview
 * Get comprehensive system information
 * Usage: node overview.js [OPTIONS]
 */

const os = require('os');
const fs = require('fs');

const args = process.argv.slice(2);

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

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

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
