#!/usr/bin/env node
/**
 * Cloudflare Browser Rendering - Web Search
 *
 * Uses DuckDuckGo HTML (no JS required, no captchas) to search the web
 * and return structured results the agent can use for research.
 *
 * Usage: node search.js "query" [--max 10] [--json]
 *
 * Output: Markdown-formatted search results with title, URL, and snippet.
 * With --json: JSON array of {title, url, snippet} objects.
 */

const { createClient } = require('./cdp-client');
const path = require('path');

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const maxIdx = args.indexOf('--max');
const maxResults = maxIdx !== -1 ? parseInt(args[maxIdx + 1], 10) : 10;
const query = args.filter(a => a !== '--json' && a !== '--max' && (maxIdx === -1 || args.indexOf(a) !== maxIdx + 1)).join(' ');

if (!query) {
  console.error('Usage: node search.js "search query" [--max 10] [--json]');
  process.exit(1);
}

async function search() {
  const client = await createClient();

  try {
    // DuckDuckGo HTML version - lightweight, no JS needed, no captchas
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    await client.navigate(searchUrl, 4000);

    // Extract results via DOM
    const resultData = await client.evaluate(`
      JSON.stringify(
        Array.from(document.querySelectorAll('.result')).slice(0, ${maxResults}).map(r => {
          const link = r.querySelector('.result__a');
          const snippet = r.querySelector('.result__snippet');
          const urlEl = r.querySelector('.result__url');
          return {
            title: link ? link.innerText.trim() : '',
            url: link ? link.href : (urlEl ? urlEl.innerText.trim() : ''),
            snippet: snippet ? snippet.innerText.trim() : '',
          };
        }).filter(r => r.title && r.url)
      )
    `);

    const results = JSON.parse(resultData.result?.value || '[]');

    if (results.length === 0) {
      // Fallback: try extracting any links from the page
      const fallback = await client.evaluate(`
        JSON.stringify(
          Array.from(document.querySelectorAll('a[href]')).slice(0, ${maxResults}).map(a => ({
            title: a.innerText.trim(),
            url: a.href,
            snippet: ''
          })).filter(r => r.title && r.url && !r.url.includes('duckduckgo'))
        )
      `);
      const fallbackResults = JSON.parse(fallback.result?.value || '[]');

      if (fallbackResults.length === 0) {
        console.error('No results found for:', query);
        client.close();
        process.exit(1);
      }

      outputResults(fallbackResults);
    } else {
      outputResults(results);
    }

    client.close();
  } catch (err) {
    console.error('Search error:', err.message);
    client.close();
    process.exit(1);
  }
}

function outputResults(results) {
  if (jsonMode) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`## Search: "${query}"\n`);
    console.log(`Found ${results.length} results\n`);
    results.forEach((r, i) => {
      console.log(`### ${i + 1}. ${r.title}`);
      console.log(`> ${r.url}`);
      if (r.snippet) {
        console.log(`\n${r.snippet}`);
      }
      console.log('');
    });
  }
}

search();
