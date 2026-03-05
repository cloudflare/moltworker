#!/usr/bin/env node
/**
 * Cloudflare Browser Rendering - Web Page Fetch
 *
 * Navigates to a URL and extracts the text content. Use for reading
 * articles, documentation, county code sections, regulatory pages, etc.
 *
 * Usage: node fetch.js <url> [--html] [--save output.md]
 *
 * Default output: cleaned text content (innerText).
 * With --html: raw HTML (for structured content like tables).
 * With --save: writes to file instead of stdout.
 */

const { createClient } = require('./cdp-client');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const htmlMode = args.includes('--html');
const saveIdx = args.indexOf('--save');
const savePath = saveIdx !== -1 ? args[saveIdx + 1] : null;
const url = args.find(a => a.startsWith('http'));

if (!url) {
  console.error('Usage: node fetch.js <url> [--html] [--save output.md]');
  process.exit(1);
}

async function fetchPage() {
  const client = await createClient();

  try {
    await client.navigate(url, 5000);

    let content;
    if (htmlMode) {
      content = await client.getHTML();
    } else {
      // Extract clean text, removing nav/footer/script noise
      const result = await client.evaluate(`
        (() => {
          // Remove noisy elements
          ['nav', 'footer', 'header', 'script', 'style', 'noscript', '.cookie-banner', '.ad', '#cookie-consent']
            .forEach(sel => document.querySelectorAll(sel).forEach(el => el.remove()));

          // Get main content if available, otherwise body
          const main = document.querySelector('main, article, [role="main"], .content, #content');
          const source = main || document.body;

          // Get text and clean up whitespace
          return source.innerText
            .replace(/\\n{3,}/g, '\\n\\n')
            .trim();
        })()
      `);
      content = result.result?.value || '';
    }

    if (!content) {
      console.error('No content extracted from:', url);
      client.close();
      process.exit(1);
    }

    // Add source header
    const output = `# Source: ${url}\n\n${content}`;

    if (savePath) {
      const fullPath = path.resolve(savePath);
      fs.writeFileSync(fullPath, output);
      console.log(`Saved ${(output.length / 1024).toFixed(1)} KB to ${fullPath}`);
    } else {
      console.log(output);
    }

    client.close();
  } catch (err) {
    console.error('Fetch error:', err.message);
    client.close();
    process.exit(1);
  }
}

fetchPage();
