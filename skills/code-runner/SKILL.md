---
name: code-runner
description: Execute code snippets in multiple languages with sandboxed environments. Supports JavaScript, TypeScript, Python, and shell scripts with timeout protection and output capture.
---

# Code Runner

Execute code snippets safely with output capture and timeout protection.

## Quick Start

### Run JavaScript
```bash
node /path/to/skills/code-runner/scripts/run.js --lang js "console.log('Hello')"
```

### Run from File
```bash
node /path/to/skills/code-runner/scripts/run.js --file script.py --lang python
```

### REPL Mode
```bash
node /path/to/skills/code-runner/scripts/repl.js --lang js
```

## Scripts

### run.js
Execute code snippets in various languages.

**Usage:**
```bash
node run.js <code> --lang <language>
node run.js --file <path> --lang <language>
```

**Options:**
- `--lang <lang>` - Language: js, ts, python, py, shell, bash (required)
- `--file <path>` - Execute code from file instead of argument
- `--timeout <ms>` - Execution timeout (default: 30000)
- `--stdin <data>` - Provide stdin input
- `--args <args>` - Command-line arguments (comma-separated)
- `--env <json>` - Environment variables as JSON

### eval.js
Quick JavaScript expression evaluation.

**Usage:**
```bash
node eval.js <expression>
```

**Features:**
- Direct expression evaluation
- Access to Math, JSON, Date built-ins
- Returns evaluated result

### repl.js
Interactive REPL for testing code.

**Usage:**
```bash
node repl.js --lang <language>
```

**Commands:**
- `.exit` - Exit REPL
- `.clear` - Clear context
- `.help` - Show help

### benchmark.js
Benchmark code execution time.

**Usage:**
```bash
node benchmark.js <code> --lang <language> [OPTIONS]
```

**Options:**
- `--iterations <n>` - Number of runs (default: 100)
- `--warmup <n>` - Warmup runs (default: 10)

## Supported Languages

| Language | Aliases | Runtime |
|----------|---------|---------|
| JavaScript | js, javascript, node | Node.js |
| TypeScript | ts, typescript | ts-node / tsx |
| Python | py, python, python3 | python3 |
| Shell | sh, shell, bash | /bin/bash |

## Examples

### JavaScript
```bash
node run.js --lang js "
const arr = [1, 2, 3, 4, 5];
const sum = arr.reduce((a, b) => a + b, 0);
console.log('Sum:', sum);
"
```

### Python
```bash
node run.js --lang python "
import json
data = {'name': 'test', 'value': 42}
print(json.dumps(data, indent=2))
"
```

### Shell Script
```bash
node run.js --lang bash "
for i in 1 2 3; do
  echo \"Number: \$i\"
done
"
```

### With Input
```bash
node run.js --lang python --stdin "Hello World" "
import sys
data = sys.stdin.read()
print(f'Received: {data}')
"
```

### With Arguments
```bash
node run.js --lang js --args "arg1,arg2" "
console.log('Args:', process.argv.slice(2));
"
```

### Benchmark
```bash
node benchmark.js --lang js --iterations 1000 "
const result = Array(100).fill(0).map((_, i) => i * 2);
"
```

## Output Format

### run.js
```json
{
  "success": true,
  "language": "javascript",
  "exitCode": 0,
  "stdout": "Hello World\n",
  "stderr": "",
  "duration": 45,
  "timedOut": false
}
```

### benchmark.js
```json
{
  "language": "javascript",
  "iterations": 100,
  "warmupRuns": 10,
  "results": {
    "min": 2.3,
    "max": 15.7,
    "mean": 4.2,
    "median": 3.8,
    "stdDev": 2.1,
    "p95": 8.5,
    "p99": 12.3
  },
  "unit": "ms"
}
```

## Security Notes

- Code runs in a subprocess with timeout protection
- No network isolation (use container for full sandbox)
- File system access is available
- Environment variables can be passed explicitly
- For untrusted code, use containerized execution

## Error Handling

```json
{
  "success": false,
  "language": "python",
  "exitCode": 1,
  "stdout": "",
  "stderr": "NameError: name 'undefined_var' is not defined",
  "duration": 120,
  "error": "Process exited with code 1"
}
```

## Best Practices

1. **Set timeouts** for long-running code
2. **Capture output** for debugging
3. **Use explicit language** flags
4. **Validate input** before execution
5. **Handle errors** gracefully
