---
name: web-scraper
description: Modern web scraping with structured data extraction. Fetch web pages, extract content using CSS selectors, parse structured data (JSON-LD, Open Graph, meta tags), and handle pagination.
---

# Web Scraper

Modern web scraping with intelligent content extraction.

## Quick Start

### Fetch and Extract
```bash
node /path/to/skills/web-scraper/scripts/fetch.js https://example.com
```

### Extract with Selectors
```bash
node /path/to/skills/web-scraper/scripts/extract.js https://example.com --selector "h1,h2,p"
```

### Get Structured Data
```bash
node /path/to/skills/web-scraper/scripts/metadata.js https://example.com
```

## Scripts

### fetch.js
Fetch web page content with smart extraction.

**Usage:**
```bash
node fetch.js <url> [OPTIONS]
```

**Options:**
- `--output <fmt>` - Output format: text, html, markdown (default: text)
- `--timeout <ms>` - Request timeout (default: 30000)
- `--user-agent <ua>` - Custom User-Agent string
- `--headers <json>` - Custom headers as JSON
- `--follow` - Follow redirects (default: true)

### extract.js
Extract specific elements using CSS selectors.

**Usage:**
```bash
node extract.js <url> --selector <css> [OPTIONS]
```

**Options:**
- `--selector <css>` - CSS selector (required)
- `--attr <name>` - Extract attribute instead of text
- `--multiple` - Return all matches (default: first only)
- `--json` - Output as JSON array

### metadata.js
Extract structured metadata from pages.

**Usage:**
```bash
node metadata.js <url> [OPTIONS]
```

**Extracts:**
- Title, description, canonical URL
- Open Graph tags (og:title, og:image, etc.)
- Twitter Card data
- JSON-LD structured data
- Meta tags

### links.js
Extract and analyze links from a page.

**Usage:**
```bash
node links.js <url> [OPTIONS]
```

**Options:**
- `--internal` - Only internal links
- `--external` - Only external links
- `--filter <pattern>` - Filter by URL pattern
- `--format <fmt>` - Output: json, csv, list

### sitemap.js
Parse and process XML sitemaps.

**Usage:**
```bash
node sitemap.js <url> [OPTIONS]
```

**Options:**
- `--discover` - Auto-discover sitemap from robots.txt
- `--filter <pattern>` - Filter URLs by pattern
- `--limit <n>` - Limit number of URLs

## Examples

### Extract Article Content
```bash
node fetch.js https://blog.example.com/article --output markdown
```

### Get All Product Links
```bash
node extract.js https://shop.example.com --selector "a.product-link" --attr href --multiple
```

### Extract Open Graph Data
```bash
node metadata.js https://example.com
```
Output:
```json
{
  "title": "Example Page",
  "description": "Page description",
  "openGraph": {
    "title": "Example OG Title",
    "image": "https://example.com/image.jpg",
    "type": "website"
  }
}
```

### Get External Links
```bash
node links.js https://example.com --external --format csv
```

### Process Sitemap
```bash
node sitemap.js https://example.com/sitemap.xml --filter "/blog/"
```

## Output Formats

### fetch.js (markdown)
```markdown
# Page Title

Main content extracted and converted to markdown...

## Section Heading

Paragraph text with [links](https://example.com).
```

### extract.js (JSON)
```json
{
  "url": "https://example.com",
  "selector": "h2",
  "matches": [
    { "text": "First Heading", "html": "<h2>First Heading</h2>" },
    { "text": "Second Heading", "html": "<h2>Second Heading</h2>" }
  ],
  "count": 2
}
```

### metadata.js
```json
{
  "url": "https://example.com",
  "title": "Page Title",
  "description": "Meta description",
  "canonical": "https://example.com/page",
  "openGraph": {
    "title": "OG Title",
    "description": "OG Description",
    "image": "https://example.com/og-image.jpg",
    "type": "article"
  },
  "twitterCard": {
    "card": "summary_large_image",
    "site": "@example"
  },
  "jsonLd": [
    { "@type": "Article", "headline": "Article Title" }
  ]
}
```

## Best Practices

- **Respect robots.txt**: Check before scraping
- **Rate limiting**: Add delays between requests
- **User-Agent**: Use descriptive UA strings
- **Caching**: Cache responses when appropriate
- **Error handling**: Handle 404s, timeouts gracefully

## Notes

- For JavaScript-rendered pages, use the `cloudflare-browser` skill
- This skill uses HTTP fetch (no JavaScript execution)
- Some sites may block automated requests
