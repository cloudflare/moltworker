---
name: system-info
description: System monitoring and diagnostics. Get CPU, memory, disk, network stats, process information, environment details, and health checks for services and endpoints.
---

# System Info

System monitoring, diagnostics, and health checking utilities.

## Quick Start

### System Overview
```bash
node /path/to/skills/system-info/scripts/overview.js
```

### Health Check
```bash
node /path/to/skills/system-info/scripts/health.js https://api.example.com/health
```

### Process List
```bash
node /path/to/skills/system-info/scripts/processes.js
```

## Scripts

### overview.js
Get comprehensive system information.

**Usage:**
```bash
node overview.js [OPTIONS]
```

**Options:**
- `--format <fmt>` - Output format: json, text (default: json)
- `--section <s>` - Specific section: cpu, memory, disk, network, os

**Output includes:**
- OS information
- CPU details and usage
- Memory usage
- Disk space
- Network interfaces
- Node.js/runtime version

### health.js
Check health of services and endpoints.

**Usage:**
```bash
node health.js <url> [OPTIONS]
node health.js --config <file>
```

**Options:**
- `--timeout <ms>` - Request timeout (default: 5000)
- `--expect <code>` - Expected HTTP status (default: 200)
- `--config <file>` - Check multiple endpoints from config file

**Config file format:**
```json
{
  "endpoints": [
    { "name": "API", "url": "https://api.example.com/health" },
    { "name": "DB", "url": "https://db.example.com/ping", "expect": 204 }
  ]
}
```

### processes.js
List and monitor processes.

**Usage:**
```bash
node processes.js [OPTIONS]
```

**Options:**
- `--sort <field>` - Sort by: cpu, memory, pid, name (default: memory)
- `--limit <n>` - Number of processes (default: 20)
- `--filter <name>` - Filter by process name
- `--tree` - Show process tree

### metrics.js
Collect and format metrics.

**Usage:**
```bash
node metrics.js [OPTIONS]
```

**Options:**
- `--format <fmt>` - Output: json, prometheus, statsd
- `--prefix <p>` - Metric name prefix
- `--interval <ms>` - Continuous monitoring interval

### env.js
Environment and configuration diagnostics.

**Usage:**
```bash
node env.js [OPTIONS]
```

**Options:**
- `--show-values` - Show environment variable values (caution: may expose secrets)
- `--check <vars>` - Verify required variables exist (comma-separated)
- `--filter <pattern>` - Filter by pattern

## Examples

### Full System Report
```bash
node overview.js --format text
```

### Check API Health
```bash
node health.js https://api.myapp.com/health --timeout 10000
```

### Find Memory-Hungry Processes
```bash
node processes.js --sort memory --limit 10
```

### Export Prometheus Metrics
```bash
node metrics.js --format prometheus --prefix myapp
```

### Verify Required Environment
```bash
node env.js --check "DATABASE_URL,API_KEY,SECRET_KEY"
```

## Output Formats

### overview.js
```json
{
  "os": {
    "platform": "linux",
    "release": "5.15.0",
    "arch": "x64",
    "hostname": "server-1",
    "uptime": 86400
  },
  "cpu": {
    "model": "Intel Xeon",
    "cores": 8,
    "usage": 23.5
  },
  "memory": {
    "total": 16000000000,
    "used": 8000000000,
    "free": 8000000000,
    "usedPercent": 50.0
  },
  "disk": {
    "total": 500000000000,
    "used": 200000000000,
    "free": 300000000000,
    "usedPercent": 40.0
  }
}
```

### health.js
```json
{
  "url": "https://api.example.com/health",
  "status": "healthy",
  "statusCode": 200,
  "responseTime": 145,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### metrics.js (Prometheus)
```
# HELP system_cpu_usage_percent CPU usage percentage
# TYPE system_cpu_usage_percent gauge
system_cpu_usage_percent 23.5
# HELP system_memory_used_bytes Memory used in bytes
# TYPE system_memory_used_bytes gauge
system_memory_used_bytes 8000000000
```

## Use Cases

- **CI/CD Health Gates**: Verify services before deployment
- **Monitoring Dashboards**: Export metrics to monitoring systems
- **Debugging**: Diagnose resource issues
- **Capacity Planning**: Track resource utilization trends
- **Environment Validation**: Ensure required config is present
