---
name: data-transform
description: Data transformation utilities for JSON, CSV, XML, YAML, and Markdown. Parse, convert, query, and transform data between formats with JQ-like filtering support.
---

# Data Transform

Convert and transform data between formats with powerful querying capabilities.

## Quick Start

### JSON to CSV
```bash
node /path/to/skills/data-transform/scripts/convert.js data.json --to csv
```

### Query JSON with JSONPath
```bash
node /path/to/skills/data-transform/scripts/query.js data.json "$.users[*].name"
```

### Parse CSV
```bash
node /path/to/skills/data-transform/scripts/parse.js data.csv --format csv
```

## Scripts

### convert.js
Convert between data formats.

**Usage:**
```bash
node convert.js <input> --to <format> [OPTIONS]
```

**Formats:**
- `json` - JSON
- `csv` - Comma-separated values
- `tsv` - Tab-separated values
- `yaml` - YAML
- `xml` - XML
- `markdown` - Markdown table
- `html` - HTML table

**Options:**
- `--to <format>` - Target format (required)
- `--from <format>` - Source format (auto-detected if not specified)
- `--output <file>` - Save to file
- `--pretty` - Pretty print output

### query.js
Query and filter data using JSONPath or JQ-like syntax.

**Usage:**
```bash
node query.js <input> <query> [OPTIONS]
```

**Query Syntax:**
- `$.field` - Access field
- `$.array[0]` - Array index
- `$.array[*]` - All array elements
- `$.array[?(@.age > 18)]` - Filter
- `$..name` - Recursive descent

**Options:**
- `--format <fmt>` - Input format (default: auto)
- `--output <fmt>` - Output format: json, csv, lines (default: json)

### parse.js
Parse data files with format detection.

**Usage:**
```bash
node parse.js <input> [OPTIONS]
```

**Options:**
- `--format <fmt>` - Force input format
- `--validate` - Validate and report errors
- `--schema <file>` - Validate against JSON schema

### transform.js
Apply transformations to data.

**Usage:**
```bash
node transform.js <input> --map <expression>
node transform.js <input> --filter <expression>
node transform.js <input> --sort <field>
```

**Options:**
- `--map <expr>` - Transform each item (JS expression)
- `--filter <expr>` - Filter items (JS expression)
- `--sort <field>` - Sort by field
- `--reverse` - Reverse order
- `--unique <field>` - Remove duplicates
- `--group <field>` - Group by field
- `--limit <n>` - Limit results

### diff.js
Compare two data files.

**Usage:**
```bash
node diff.js <file1> <file2> [OPTIONS]
```

**Options:**
- `--format <fmt>` - Output format: unified, json, side-by-side
- `--ignore-order` - Ignore array order
- `--ignore-case` - Case-insensitive comparison

## Examples

### Convert JSON Array to CSV
```bash
echo '[{"name":"John","age":30},{"name":"Jane","age":25}]' | node convert.js - --to csv
```
Output:
```
name,age
John,30
Jane,25
```

### Query Nested Data
```bash
node query.js api-response.json "$.data.users[?(@.active==true)].email"
```

### Transform Data
```bash
node transform.js users.json --filter "x.age >= 18" --sort age --map "{name: x.name, adult: true}"
```

### CSV to Markdown Table
```bash
node convert.js report.csv --to markdown
```
Output:
```markdown
| Name | Score |
|------|-------|
| Alice | 95 |
| Bob | 87 |
```

### Compare JSON Files
```bash
node diff.js old-config.json new-config.json --format unified
```

### Validate JSON Against Schema
```bash
node parse.js data.json --validate --schema schema.json
```

## Supported Formats

| Format | Read | Write | Notes |
|--------|------|-------|-------|
| JSON | ✅ | ✅ | Full support |
| CSV | ✅ | ✅ | Auto-detects headers |
| TSV | ✅ | ✅ | Tab-delimited |
| YAML | ✅ | ✅ | Single document |
| XML | ✅ | ✅ | Basic support |
| Markdown | ✅ | ✅ | Tables only |
| HTML | ❌ | ✅ | Tables only |

## Output Formats

### query.js (JSON mode)
```json
{
  "query": "$.users[*].name",
  "results": ["John", "Jane", "Bob"],
  "count": 3
}
```

### diff.js (JSON mode)
```json
{
  "added": [{"path": "$.newField", "value": "new"}],
  "removed": [{"path": "$.oldField", "value": "old"}],
  "changed": [{"path": "$.field", "old": 1, "new": 2}],
  "unchanged": 10
}
```
