#!/usr/bin/env node
/**
 * Web Scraper - Metadata Extraction
 * Extract structured metadata from web pages
 * Usage: node metadata.js <url>
 */

const args = process.argv.slice(2);

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

function extractOpenGraph(meta) {
  const og = {};
  for (const [key, value] of Object.entries(meta)) {
    if (key.startsWith('og:')) {
      og[key.substring(3)] = value;
    }
  }
  return Object.keys(og).length > 0 ? og : null;
}

function extractTwitterCard(meta) {
  const twitter = {};
  for (const [key, value] of Object.entries(meta)) {
    if (key.startsWith('twitter:')) {
      twitter[key.substring(8)] = value;
    }
  }
  return Object.keys(twitter).length > 0 ? twitter : null;
}

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

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim().replace(/\s+/g, ' ') : null;
}

function extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (match) return match[1];

  const match2 = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match2 ? match2[1] : null;
}

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
