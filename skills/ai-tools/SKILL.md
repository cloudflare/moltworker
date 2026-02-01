---
name: ai-tools
description: AI/ML utilities including embeddings generation, vision analysis, text-to-speech, and structured output extraction. Supports Anthropic Claude, OpenAI, and compatible APIs.
---

# AI Tools

Modern AI/ML capabilities for embeddings, vision, speech, and structured data extraction.

## Prerequisites

Requires one of these environment variables:
- `ANTHROPIC_API_KEY` - For Claude models
- `OPENAI_API_KEY` - For OpenAI models
- `AI_GATEWAY_API_KEY` + `AI_GATEWAY_BASE_URL` - For Cloudflare AI Gateway

## Quick Start

### Generate Embeddings
```bash
node /path/to/skills/ai-tools/scripts/embeddings.js "Your text to embed"
```

### Analyze Image
```bash
node /path/to/skills/ai-tools/scripts/vision.js /path/to/image.png "Describe this image"
```

### Extract Structured Data
```bash
node /path/to/skills/ai-tools/scripts/extract.js "John Doe, 30 years old, lives in NYC" --schema '{"name":"string","age":"number","city":"string"}'
```

## Scripts

### embeddings.js
Generate vector embeddings for semantic search and RAG.

**Usage:**
```bash
node embeddings.js <text> [OPTIONS]
```

**Options:**
- `--model <model>` - Embedding model (default: text-embedding-3-small)
- `--dimensions <n>` - Output dimensions (default: 1536)
- `--output <file>` - Save embeddings to file

### vision.js
Analyze images using multimodal AI models.

**Usage:**
```bash
node vision.js <image> <prompt> [OPTIONS]
```

**Arguments:**
- `<image>` - Path to image file or URL
- `<prompt>` - Question or instruction about the image

**Options:**
- `--model <model>` - Vision model (default: claude-3-5-sonnet-20241022)
- `--detail <level>` - Image detail: auto, low, high (default: auto)

### extract.js
Extract structured data from unstructured text.

**Usage:**
```bash
node extract.js <text> --schema <json_schema>
```

**Options:**
- `--schema <json>` - JSON schema defining expected output structure
- `--model <model>` - Model to use (default: claude-3-5-sonnet-20241022)

### summarize.js
Intelligent text summarization with configurable length.

**Usage:**
```bash
node summarize.js <text|file> [OPTIONS]
```

**Options:**
- `--length <words>` - Target summary length (default: 100)
- `--style <style>` - Style: brief, detailed, bullets (default: brief)
- `--file` - Treat input as file path

### sentiment.js
Analyze sentiment and emotional tone.

**Usage:**
```bash
node sentiment.js <text>
```

## Examples

### Semantic Search Embeddings
```bash
node embeddings.js "Machine learning is transforming healthcare" --output embedding.json
```

### Image Description
```bash
node vision.js screenshot.png "What UI elements are visible? List any errors."
```

### Extract Contact Info
```bash
node extract.js "Contact Sarah at sarah@example.com or call 555-0123" \
  --schema '{"name":"string","email":"string","phone":"string"}'
```

### Summarize Article
```bash
node summarize.js article.txt --file --length 50 --style bullets
```

## Output Formats

### embeddings.js
```json
{
  "model": "text-embedding-3-small",
  "dimensions": 1536,
  "embedding": [0.123, -0.456, ...],
  "usage": { "tokens": 8 }
}
```

### vision.js
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "analysis": "The image shows...",
  "usage": { "input_tokens": 1200, "output_tokens": 150 }
}
```

### extract.js
```json
{
  "extracted": { "name": "John", "age": 30, "city": "NYC" },
  "confidence": 0.95
}
```

## Supported Models

### Embeddings
- `text-embedding-3-small` (OpenAI)
- `text-embedding-3-large` (OpenAI)
- `@cf/baai/bge-base-en-v1.5` (Cloudflare)

### Vision
- `claude-3-5-sonnet-20241022` (Anthropic)
- `claude-3-opus-20240229` (Anthropic)
- `gpt-4o` (OpenAI)
- `gpt-4o-mini` (OpenAI)

### Text
- `claude-3-5-sonnet-20241022` (Anthropic)
- `claude-3-5-haiku-20241022` (Anthropic)
- `gpt-4o` (OpenAI)
- `gpt-4o-mini` (OpenAI)
