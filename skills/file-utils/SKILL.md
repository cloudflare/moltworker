---
name: file-utils
description: File system utilities for reading, writing, listing, and searching files. Includes tree view, file search by pattern, and text search within files.
---

# File Utilities

File system operations for reading, writing, and searching files.

## Quick Start

### List Directory
```bash
node /path/to/skills/file-utils/scripts/list.js /path/to/directory
```

### Read File
```bash
node /path/to/skills/file-utils/scripts/read.js /path/to/file.txt
```

### Write File
```bash
node /path/to/skills/file-utils/scripts/write.js /path/to/file.txt "Content to write"
```

### Search Files
```bash
node /path/to/skills/file-utils/scripts/search.js /path/to/dir "pattern" --content
```

## Scripts

### list.js
List directory contents with details.

**Usage:**
```bash
node list.js <path> [OPTIONS]
```

**Options:**
- `--recursive` or `-r` - List recursively
- `--tree` - Show as tree view
- `--hidden` - Include hidden files
- `--json` - Output as JSON

### read.js
Read file contents.

**Usage:**
```bash
node read.js <path> [OPTIONS]
```

**Options:**
- `--lines <start>:<end>` - Read specific line range
- `--head <n>` - Read first n lines
- `--tail <n>` - Read last n lines
- `--json` - Parse as JSON

### write.js
Write content to a file.

**Usage:**
```bash
node write.js <path> <content> [OPTIONS]
```

**Options:**
- `--append` - Append to existing file
- `--mkdir` - Create parent directories

### search.js
Search for files or content.

**Usage:**
```bash
node search.js <path> <pattern> [OPTIONS]
```

**Options:**
- `--content` - Search file contents (default: filename)
- `--ignore-case` or `-i` - Case insensitive search
- `--max <n>` - Maximum results (default: 100)

## Examples

### Tree View of Project
```bash
node list.js . --tree --recursive
```

### Read Lines 10-20
```bash
node read.js file.txt --lines 10:20
```

### Find All JavaScript Files
```bash
node search.js . "\.js$"
```

### Search for Text in Files
```bash
node search.js ./src "TODO" --content
```

## Output Format

### list.js (JSON mode)
```json
[
  { "name": "file.txt", "type": "file", "size": 1234, "modified": "2024-01-15T10:30:00Z" }
]
```

### search.js
```json
{
  "pattern": "TODO",
  "matches": [
    { "file": "src/index.js", "line": 42, "content": "// TODO: fix this" }
  ],
  "count": 1
}
```
