---
name: http-client
description: Make HTTP requests to external APIs. Supports GET, POST, PUT, DELETE with JSON and form data. Use for fetching data, calling APIs, and webhooks.
---

# HTTP Client

Make HTTP requests to external APIs and services.

## Quick Start

### GET Request
```bash
node /path/to/skills/http-client/scripts/request.js GET https://api.example.com/data
```

### POST with JSON
```bash
node /path/to/skills/http-client/scripts/request.js POST https://api.example.com/users '{"name":"John"}'
```

### With Headers
```bash
node /path/to/skills/http-client/scripts/request.js GET https://api.example.com/data --header "Authorization: Bearer token123"
```

## Scripts

### request.js
General-purpose HTTP request script.

**Usage:**
```bash
node request.js <METHOD> <URL> [BODY] [OPTIONS]
```

**Options:**
- `--header "Key: Value"` - Add custom header (can be used multiple times)
- `--output <file>` - Save response to file
- `--timeout <ms>` - Request timeout (default: 30000)

### fetch-json.js
Simplified script for JSON APIs.

**Usage:**
```bash
node fetch-json.js <URL> [--post '{"data":"value"}']
```

## Examples

### Fetch JSON Data
```bash
node request.js GET https://jsonplaceholder.typicode.com/posts/1
```

### Post Form Data
```bash
node request.js POST https://httpbin.org/post '{"key":"value"}' --header "Content-Type: application/json"
```

### Download File
```bash
node request.js GET https://example.com/file.pdf --output downloaded.pdf
```

## Response Format

The script outputs JSON with:
```json
{
  "status": 200,
  "headers": { "content-type": "application/json" },
  "body": { "response": "data" }
}
```

## Error Handling

- Network errors return exit code 1 with error message
- HTTP errors (4xx, 5xx) return the response with status code
- Timeout errors after 30 seconds (configurable)
