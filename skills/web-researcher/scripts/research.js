#!/usr/bin/env node
/**
 * Web Research Script - Search the web using Serper (Google Search) API
 *
 * Usage: node research.js "search query" [--num 5] [--fetch]
 *   --num N    Number of results (default: 5)
 *   --fetch    Also fetch and extract text from top 3 result URLs
 *
 * Requires: SERPER_API_KEY environment variable
 */

const https = require('https');
const http = require('http');

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_URL = 'https://google.serper.dev/search';

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 10000;
    const parsedUrl = new URL(url);
    const mod = parsedUrl.protocol === 'https:' ? https : http;

    const req = mod.request(parsedUrl, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });

    if (options.body) req.write(options.body);
    req.end();
  });
}

async function serperSearch(query, num = 5) {
  if (!SERPER_API_KEY) {
    throw new Error('SERPER_API_KEY environment variable not set');
  }

  const res = await httpRequest(SERPER_URL, {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num }),
    timeout: 15000,
  });

  if (res.status !== 200) {
    throw new Error(`Serper API error: ${res.status} ${res.data}`);
  }

  return JSON.parse(res.data);
}

function stripHtml(html) {
  // Remove script and style blocks
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode common entities
  text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

async function fetchPageContent(url, maxChars = 2000) {
  try {
    const res = await httpRequest(url, { timeout: 8000 });
    if (res.status === 301 || res.status === 302) {
      const location = res.headers.location;
      if (location) return fetchPageContent(location, maxChars);
    }
    if (res.status !== 200) return null;

    const text = stripHtml(res.data);
    return text.substring(0, maxChars);
  } catch {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  let query = '';
  let num = 5;
  let shouldFetch = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--num' && args[i + 1]) {
      num = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--fetch') {
      shouldFetch = true;
    } else if (!query) {
      query = args[i];
    }
  }

  if (!query) {
    console.error('Usage: node research.js "search query" [--num 5] [--fetch]');
    process.exit(1);
  }

  const searchData = await serperSearch(query, num);

  const results = [];
  const organic = searchData.organic || [];

  for (let i = 0; i < organic.length; i++) {
    const item = organic[i];
    const result = {
      title: item.title,
      url: item.link,
      snippet: item.snippet || '',
    };

    // Fetch full content for top 3 results if --fetch flag
    if (shouldFetch && i < 3) {
      const content = await fetchPageContent(item.link);
      if (content) result.content = content;
    }

    results.push(result);
  }

  // Include knowledge graph if available
  let knowledgeGraph = null;
  if (searchData.knowledgeGraph) {
    const kg = searchData.knowledgeGraph;
    knowledgeGraph = {
      title: kg.title,
      type: kg.type,
      description: kg.description,
    };
  }

  const output = {
    query,
    timestamp: new Date().toISOString(),
    resultCount: results.length,
    results,
  };

  if (knowledgeGraph) output.knowledgeGraph = knowledgeGraph;

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});
