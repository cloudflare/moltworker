#!/usr/bin/env node
/**
 * System Info - Metrics
 * Collect and format system metrics
 * Usage: node metrics.js [OPTIONS]
 */

const os = require('os');

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    format: 'json',
    prefix: 'system',
    interval: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      result.format = args[i + 1];
      i++;
    } else if (args[i] === '--prefix' && args[i + 1]) {
      result.prefix = args[i + 1];
      i++;
    } else if (args[i] === '--interval' && args[i + 1]) {
      result.interval = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return result;
}

function collectMetrics() {
  const cpus = os.cpus();
  let cpuIdle = 0;
  let cpuTotal = 0;

  for (const cpu of cpus) {
    for (const type in cpu.times) {
      cpuTotal += cpu.times[type];
    }
    cpuIdle += cpu.times.idle;
  }

  const cpuUsage = ((cpuTotal - cpuIdle) / cpuTotal) * 100;
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  const memUsed = memTotal - memFree;
  const loadAvg = os.loadavg();

  return {
    timestamp: Date.now(),
    cpu: {
      usage_percent: Math.round(cpuUsage * 100) / 100,
      cores: cpus.length,
      load_1m: loadAvg[0],
      load_5m: loadAvg[1],
      load_15m: loadAvg[2]
    },
    memory: {
      total_bytes: memTotal,
      used_bytes: memUsed,
      free_bytes: memFree,
      usage_percent: Math.round((memUsed / memTotal) * 100 * 100) / 100
    },
    process: {
      heap_used_bytes: process.memoryUsage().heapUsed,
      heap_total_bytes: process.memoryUsage().heapTotal,
      rss_bytes: process.memoryUsage().rss,
      uptime_seconds: process.uptime()
    },
    system: {
      uptime_seconds: os.uptime(),
      platform: os.platform(),
      arch: os.arch()
    }
  };
}

function formatPrometheus(metrics, prefix) {
  const lines = [];

  // CPU metrics
  lines.push(`# HELP ${prefix}_cpu_usage_percent CPU usage percentage`);
  lines.push(`# TYPE ${prefix}_cpu_usage_percent gauge`);
  lines.push(`${prefix}_cpu_usage_percent ${metrics.cpu.usage_percent}`);

  lines.push(`# HELP ${prefix}_cpu_cores Number of CPU cores`);
  lines.push(`# TYPE ${prefix}_cpu_cores gauge`);
  lines.push(`${prefix}_cpu_cores ${metrics.cpu.cores}`);

  lines.push(`# HELP ${prefix}_load_average System load average`);
  lines.push(`# TYPE ${prefix}_load_average gauge`);
  lines.push(`${prefix}_load_average{period="1m"} ${metrics.cpu.load_1m}`);
  lines.push(`${prefix}_load_average{period="5m"} ${metrics.cpu.load_5m}`);
  lines.push(`${prefix}_load_average{period="15m"} ${metrics.cpu.load_15m}`);

  // Memory metrics
  lines.push(`# HELP ${prefix}_memory_total_bytes Total memory in bytes`);
  lines.push(`# TYPE ${prefix}_memory_total_bytes gauge`);
  lines.push(`${prefix}_memory_total_bytes ${metrics.memory.total_bytes}`);

  lines.push(`# HELP ${prefix}_memory_used_bytes Used memory in bytes`);
  lines.push(`# TYPE ${prefix}_memory_used_bytes gauge`);
  lines.push(`${prefix}_memory_used_bytes ${metrics.memory.used_bytes}`);

  lines.push(`# HELP ${prefix}_memory_usage_percent Memory usage percentage`);
  lines.push(`# TYPE ${prefix}_memory_usage_percent gauge`);
  lines.push(`${prefix}_memory_usage_percent ${metrics.memory.usage_percent}`);

  // Process metrics
  lines.push(`# HELP ${prefix}_process_heap_bytes Process heap memory`);
  lines.push(`# TYPE ${prefix}_process_heap_bytes gauge`);
  lines.push(`${prefix}_process_heap_bytes{type="used"} ${metrics.process.heap_used_bytes}`);
  lines.push(`${prefix}_process_heap_bytes{type="total"} ${metrics.process.heap_total_bytes}`);

  lines.push(`# HELP ${prefix}_process_rss_bytes Process resident set size`);
  lines.push(`# TYPE ${prefix}_process_rss_bytes gauge`);
  lines.push(`${prefix}_process_rss_bytes ${metrics.process.rss_bytes}`);

  // Uptime
  lines.push(`# HELP ${prefix}_uptime_seconds System uptime in seconds`);
  lines.push(`# TYPE ${prefix}_uptime_seconds counter`);
  lines.push(`${prefix}_uptime_seconds ${metrics.system.uptime_seconds}`);

  return lines.join('\n');
}

function formatStatsd(metrics, prefix) {
  const lines = [];

  lines.push(`${prefix}.cpu.usage:${metrics.cpu.usage_percent}|g`);
  lines.push(`${prefix}.cpu.load_1m:${metrics.cpu.load_1m}|g`);
  lines.push(`${prefix}.cpu.load_5m:${metrics.cpu.load_5m}|g`);
  lines.push(`${prefix}.memory.used:${metrics.memory.used_bytes}|g`);
  lines.push(`${prefix}.memory.usage_percent:${metrics.memory.usage_percent}|g`);
  lines.push(`${prefix}.process.heap_used:${metrics.process.heap_used_bytes}|g`);
  lines.push(`${prefix}.process.rss:${metrics.process.rss_bytes}|g`);
  lines.push(`${prefix}.uptime:${metrics.system.uptime_seconds}|g`);

  return lines.join('\n');
}

function main() {
  const options = parseArgs();

  const output = () => {
    const metrics = collectMetrics();

    let formatted;
    switch (options.format) {
      case 'prometheus':
        formatted = formatPrometheus(metrics, options.prefix);
        break;
      case 'statsd':
        formatted = formatStatsd(metrics, options.prefix);
        break;
      default:
        formatted = JSON.stringify(metrics, null, 2);
    }

    console.log(formatted);
  };

  if (options.interval) {
    // Continuous monitoring
    output();
    setInterval(output, options.interval);
  } else {
    output();
  }
}

main();
