#!/usr/bin/env node
/**
 * Read a web page via headless Chrome (Cloudflare Browser Rendering)
 *
 * Navigates to a URL, renders JavaScript, and extracts clean text.
 * Works on JS-heavy/SPA sites that plain HTTP fetch can't read.
 *
 * Usage:
 *   node read-page.js URL [--max-chars 3000] [--html] [--wait 4000]
 *
 * Options:
 *   --max-chars N  Max characters to extract (default: 3000)
 *   --html         Output raw HTML instead of text
 *   --wait N       Wait time in ms after navigation (default: 4000)
 *
 * Requires: CDP_SECRET, WORKER_URL environment variables
 */

const { createClient } = require('./cdp-client');

async function main() {
  var args = process.argv.slice(2);
  var url = '';
  var maxChars = 3000;
  var outputHtml = false;
  var waitMs = 4000;

  for (var i = 0; i < args.length; i++) {
    if (args[i] === '--max-chars' && args[i + 1]) {
      maxChars = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--html') {
      outputHtml = true;
    } else if (args[i] === '--wait' && args[i + 1]) {
      waitMs = parseInt(args[i + 1], 10);
      i++;
    } else if (!url) {
      url = args[i];
    }
  }

  if (!url) {
    console.error('Usage: node read-page.js URL [--max-chars 3000] [--html] [--wait 4000]');
    process.exit(1);
  }

  var client;
  try {
    client = await createClient({ timeout: 30000 });
    await client.setViewport(1280, 800, 1, false);
    await client.navigate(url, waitMs);

    if (outputHtml) {
      var html = await client.getHTML();
      if (html) {
        console.log(html.substring(0, maxChars));
      }
    } else {
      // Extract clean article text, stripping nav/footer/sidebar noise
      var expression = 'JSON.stringify((function() {' +
        'var article = document.querySelector("article") || document.querySelector("[role=main]") || document.querySelector("main");' +
        'var el = article || document.body;' +
        'var clone = el.cloneNode(true);' +
        'var remove = clone.querySelectorAll("nav, footer, aside, header, script, style, [role=navigation], [role=banner], [role=complementary]");' +
        'for (var i = 0; i < remove.length; i++) remove[i].remove();' +
        'return clone.innerText.replace(/\\\\s+/g, " ").trim().substring(0, ' + maxChars + ');' +
        '})())';

      var result = await client.send('Runtime.evaluate', {
        expression: expression,
        returnByValue: true
      });

      if (result && result.result && result.result.value) {
        var output = {
          url: url,
          timestamp: new Date().toISOString(),
          charCount: JSON.parse(result.result.value).length,
          content: JSON.parse(result.result.value)
        };
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.error('[ERROR] Could not extract text from page');
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('[ERROR] ' + err.message);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

main();
