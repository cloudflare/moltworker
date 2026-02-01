#!/usr/bin/env node
/**
 * Web Scraper - Link Extraction
 * Extract and analyze links from a page
 * Usage: node links.js <url> [OPTIONS]
 */

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into the scraper options object.
 *
 * @returns {{url: string, internal: boolean, external: boolean, filter: string|null, format: string, timeout: number}}
 * An options object with the following properties:
 * @property {string} url - Target URL (first non-option argument) or empty string if none provided.
 * @property {boolean} internal - `true` when `--internal` was passed; otherwise `false`.
 * @property {boolean} external - `true` when `--external` was passed; otherwise `false`.
 * @property {string|null} filter - Pattern provided after `--filter`, or `null` if not set.
 * @property {string} format - Output format provided after `--format` (`json` by default).
 * @property {number} timeout - Request timeout in milliseconds provided after `--timeout` (30000 by default).
 */
function parseArgs() {
  const result = {
    url: '',
    internal: false,
    external: false,
    filter: null,
    format: 'json',
    timeout: 30000
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--internal') {
      result.internal = true;
    } else if (args[i] === '--external') {
      result.external = true;
    } else if (args[i] === '--filter' && args[i + 1]) {
      result.filter = args[i + 1];
      i++;
    } else if (args[i] === '--format' && args[i + 1]) {
      result.format = args[i + 1];
      i++;
    } else if (args[i] === '--timeout' && args[i + 1]) {
      result.timeout = parseInt(args[i + 1], 10);
      i++;
    } else if (!args[i].startsWith('--')) {
      result.url = args[i];
    }
  }

  return result;
}

/**
 * Extracts and normalizes anchor links from HTML using a base URL to resolve relative and protocol-relative hrefs.
 * @param {string} html - HTML content to scan for anchor (`<a>`) elements.
 * @param {string} baseUrl - Base URL used to resolve relative and protocol-relative href values.
 * @returns {Array<Object>} An array of link objects. Each object contains:
 *  - `url` (string): normalized absolute URL with any fragment removed,
 *  - `text` (string): visible link text trimmed to 100 characters,
 *  - `internal` (boolean): `true` if the link's hostname matches the base URL's hostname,
 *  - `external` (boolean): `true` if the link's hostname differs from the base URL's hostname,
 *  - `domain` (string): the link's hostname,
 *  - `path` (string): the link's pathname.
 * The function skips `javascript:`, `mailto:`, and `tel:` links and deduplicates identical URLs.
 */
function extractLinks(html, baseUrl) {
  const links = [];
  const regex = /<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  const seen = new Set();
  const base = new URL(baseUrl);

  while ((match = regex.exec(html)) !== null) {
    let href = match[1].trim();
    const text = match[2].replace(/<[^>]+>/g, '').trim();

    // Skip non-HTTP links
    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }

    // Resolve relative URLs
    try {
      if (href.startsWith('//')) {
        href = base.protocol + href;
      } else if (href.startsWith('/')) {
        href = base.origin + href;
      } else if (!href.startsWith('http')) {
        href = new URL(href, baseUrl).href;
      }

      // Normalize
      const url = new URL(href);
      url.hash = '';
      href = url.href;

      if (seen.has(href)) continue;
      seen.add(href);

      const isInternal = url.hostname === base.hostname;

      links.push({
        url: href,
        text: text.substring(0, 100),
        internal: isInternal,
        external: !isInternal,
        domain: url.hostname,
        path: url.pathname
      });

    } catch {
      // Invalid URL, skip
    }
  }

  return links;
}

/**
 * Fetches a web page, extracts and filters its links, and prints the results in the requested format.
 *
 * Reads CLI options (URL, --internal, --external, --filter, --format, --timeout) via parseArgs().
 * If no URL is provided, prints usage information and exits with status 1. Otherwise, it requests
 * the page, extracts links, applies the requested filters, and prints output as JSON (default),
 * CSV, or a simple list. On network or processing errors (including timeouts) it prints a JSON
 * error object to stderr and exits with status 1.
 */
async function main() {
  const options = parseArgs();

  if (!options.url) {
    console.error('Usage: node links.js <url> [OPTIONS]');
    console.error('Options:');
    console.error('  --internal        Only internal links');
    console.error('  --external        Only external links');
    console.error('  --filter <pat>    Filter by URL pattern');
    console.error('  --format <fmt>    Output: json, csv, list');
    console.error('  --timeout <ms>    Request timeout (default: 30000)');
    process.exit(1);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    const response = await fetch(options.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkBot/1.0)',
        'Accept': 'text/html'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    let links = extractLinks(html, response.url);

    // Apply filters
    if (options.internal) {
      links = links.filter(l => l.internal);
    }
    if (options.external) {
      links = links.filter(l => l.external);
    }
    if (options.filter) {
      const pattern = new RegExp(options.filter, 'i');
      links = links.filter(l => pattern.test(l.url));
    }

    // Format output
    switch (options.format) {
      case 'csv':
        console.log('url,text,internal,domain');
        links.forEach(l => {
          const text = l.text.replace(/"/g, '""');
          console.log(`"${l.url}","${text}",${l.internal},"${l.domain}"`);
        });
        break;

      case 'list':
        links.forEach(l => console.log(l.url));
        break;

      default:
        console.log(JSON.stringify({
          source: options.url,
          count: links.length,
          internal: links.filter(l => l.internal).length,
          external: links.filter(l => l.external).length,
          links
        }, null, 2));
    }

  } catch (err) {
    console.error(JSON.stringify({
      error: err.name === 'AbortError' ? 'timeout' : err.message,
      url: options.url
    }));
    process.exit(1);
  }
}

main();