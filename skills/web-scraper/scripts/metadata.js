#!/usr/bin/env node
/**
 * Web Scraper - Metadata Extraction
 * Extract structured metadata from web pages
 * Usage: node metadata.js <url>
 */

const args = process.argv.slice(2);

/**
 * Parse command-line arguments to extract a target URL and an optional timeout.
 *
 * Looks for a non-flag argument to use as the `url` and the `--timeout <ms>` flag to set the request timeout.
 * @returns {{url: string, timeout: number}} An object with `url` (empty string if not provided) and `timeout` in milliseconds (default 30000).
 */
function parseArgs() {
  const result = {
    url: '',
    timeout: 30000
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--timeout' && args[i + 1]) {
      result.timeout = parseInt(args[i + 1], 10);
      i++;
    } else if (!args[i].startsWith('--')) {
      result.url = args[i];
    }
  }

  return result;
}

/**
 * Extracts meta tag values from an HTML string into a key-value map.
 * @param {string} html - The HTML source to parse.
 * @returns {Object} An object mapping meta names and properties (for example `"description"`, `"og:title"`, or `"charset"`) to their string values; returns an empty object if no meta tags are found.
 */
function extractMetaTags(html) {
  const meta = {};
  const regex = /<meta[^>]+>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const tag = match[0];

    // name/content pair
    const nameMatch = tag.match(/name=["']([^"']+)["']/i);
    const contentMatch = tag.match(/content=["']([^"']+)["']/i);

    if (nameMatch && contentMatch) {
      meta[nameMatch[1]] = contentMatch[1];
    }

    // property/content pair (Open Graph)
    const propMatch = tag.match(/property=["']([^"']+)["']/i);
    if (propMatch && contentMatch) {
      meta[propMatch[1]] = contentMatch[1];
    }

    // charset
    const charsetMatch = tag.match(/charset=["']?([^"'\s>]+)["']?/i);
    if (charsetMatch) {
      meta['charset'] = charsetMatch[1];
    }
  }

  return meta;
}

/**
 * Extracts Open Graph properties from a meta map.
 * Strips the `og:` prefix from any meta keys that start with `og:` and returns an object of those properties.
 * @param {Object<string, any>} meta - Map of meta keys to values (e.g., `{ "og:title": "Example" }`).
 * @returns {Object<string, any>|null} An object whose keys are Open Graph property names without the `og:` prefix (e.g., `{ title: "Example" }`), or `null` if no Open Graph properties are present.
 */
function extractOpenGraph(meta) {
  const og = {};
  for (const [key, value] of Object.entries(meta)) {
    if (key.startsWith('og:')) {
      og[key.substring(3)] = value;
    }
  }
  return Object.keys(og).length > 0 ? og : null;
}

/**
 * Extracts Twitter Card metadata from a map of meta entries.
 *
 * @param {Object} meta - Map of meta keys to values (e.g., `'twitter:card': 'summary'`).
 * @returns {Object|null} An object of Twitter Card properties with the `twitter:` prefix removed (e.g., `{ card: 'summary' }`), or `null` if no Twitter Card entries are present.
 */
function extractTwitterCard(meta) {
  const twitter = {};
  for (const [key, value] of Object.entries(meta)) {
    if (key.startsWith('twitter:')) {
      twitter[key.substring(8)] = value;
    }
  }
  return Object.keys(twitter).length > 0 ? twitter : null;
}

/**
 * Extracts and parses all JSON-LD blocks from an HTML document.
 * @param {string} html - The HTML source to scan for JSON-LD <script> blocks.
 * @returns {Object[]|null} An array of parsed JSON-LD objects if any are present, `null` otherwise.
 */
function extractJsonLd(html) {
  const jsonLd = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      if (Array.isArray(data)) {
        jsonLd.push(...data);
      } else {
        jsonLd.push(data);
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }

  return jsonLd.length > 0 ? jsonLd : null;
}

/**
 * Extracts and normalizes the content of the first <title> tag from an HTML string.
 * @param {string} html - The HTML source to search.
 * @returns {string|null} The page title with collapsed whitespace and trimmed ends, or `null` if no title tag is found.
 */
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim().replace(/\s+/g, ' ') : null;
}

/**
 * Finds the canonical URL declared in an HTML document.
 * @param {string} html - The HTML source to search for a canonical link tag.
 * @returns {string|null} The canonical URL if a `<link rel="canonical" href="...">` is present, otherwise `null`.
 */
function extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (match) return match[1];

  const match2 = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match2 ? match2[1] : null;
}

/**
 * Finds the page's favicon URL in the provided HTML, or returns the default /favicon.ico resolved against baseUrl.
 *
 * @param {string} html - The page's HTML source to search for favicon link tags.
 * @param {string} baseUrl - Base URL used to resolve protocol-relative (`//...`) and root-relative (`/...`) hrefs.
 * @returns {string} The resolved favicon URL.
 */
function extractFavicon(html, baseUrl) {
  const patterns = [
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      let href = match[1];
      if (href.startsWith('//')) href = 'https:' + href;
      else if (href.startsWith('/')) href = new URL(href, baseUrl).href;
      return href;
    }
  }

  return new URL('/favicon.ico', baseUrl).href;
}

/**
 * Fetches the configured URL, extracts structured metadata from the HTML, and prints the consolidated result as pretty-printed JSON to stdout.
 *
 * If no URL is provided, prints usage information and exits with code 1. Respects the configured request timeout; on timeout or other failures prints a JSON object containing an `error` string and the original `url`, then exits with code 1.
 */
async function main() {
  const options = parseArgs();

  if (!options.url) {
    console.error('Usage: node metadata.js <url>');
    console.error('Options:');
    console.error('  --timeout <ms>  Request timeout (default: 30000)');
    process.exit(1);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    const response = await fetch(options.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MetadataBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const meta = extractMetaTags(html);

    const result = {
      url: options.url,
      finalUrl: response.url,
      title: extractTitle(html),
      description: meta.description || meta['og:description'] || null,
      canonical: extractCanonical(html),
      favicon: extractFavicon(html, response.url),
      author: meta.author || null,
      keywords: meta.keywords || null,
      robots: meta.robots || null,
      openGraph: extractOpenGraph(meta),
      twitterCard: extractTwitterCard(meta),
      jsonLd: extractJsonLd(html),
      meta: {
        charset: meta.charset,
        viewport: meta.viewport,
        themeColor: meta['theme-color']
      }
    };

    console.log(JSON.stringify(result, null, 2));

  } catch (err) {
    console.error(JSON.stringify({
      error: err.name === 'AbortError' ? 'timeout' : err.message,
      url: options.url
    }));
    process.exit(1);
  }
}

main();