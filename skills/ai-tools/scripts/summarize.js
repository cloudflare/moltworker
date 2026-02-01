#!/usr/bin/env node
/**
 * AI Tools - Text Summarization
 * Intelligent summarization with configurable length and style
 * Usage: node summarize.js <text|file> [OPTIONS]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into an options object for the summarizer.
 *
 * Recognizes these flags: `--length <n>`, `--style <style>`, `--file`, `--model <model>`.
 * Any non-option argument (not starting with `--`) is treated as the input text.
 *
 * @returns {{text: string, length: number, style: string, isFile: boolean, model: string}}
 * An object containing parsed options:
 * - `text`: the input text or file path (when `isFile` is true).
 * - `length`: target summary length in words (default 100).
 * - `style`: summary style (e.g., "brief", "detailed", "bullets"; default "brief").
 * - `isFile`: `true` if the input should be read from a file (set by `--file`), otherwise `false`.
 * - `model`: model name to use for summarization (default "claude-3-5-sonnet-20241022").
 */
function parseArgs() {
  const result = {
    text: '',
    length: 100,
    style: 'brief',
    isFile: false,
    model: 'claude-3-5-sonnet-20241022'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--length' && args[i + 1]) {
      result.length = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--style' && args[i + 1]) {
      result.style = args[i + 1];
      i++;
    } else if (args[i] === '--file') {
      result.isFile = true;
    } else if (args[i] === '--model' && args[i + 1]) {
      result.model = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      result.text = args[i];
    }
  }

  return result;
}

/**
 * Generate a summary for given text using the configured Anthropic-compatible API.
 *
 * @param {string} text - The input text to summarize.
 * @param {number} length - Target summary length in words.
 * @param {string} style - One of "brief", "detailed", or "bullets" controlling summary format.
 * @param {string} model - Model identifier to use for the API request.
 * @returns {Promise<{
 *   summary: string,
 *   style: string,
 *   targetWords: number,
 *   actualWords: number,
 *   originalLength: number,
 *   model: string,
 *   usage: { input_tokens: number, output_tokens: number }
 * }>} An object containing the generated summary, metadata about lengths and model, and token usage.
 * @throws {Error} If neither ANTHROPIC_API_KEY nor AI_GATEWAY_API_KEY is set.
 * @throws {Error} If the API responds with a non-OK status (includes HTTP status and response body).
 */
async function summarize(text, length, style, model) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_GATEWAY_API_KEY;
  const baseUrl = process.env.AI_GATEWAY_BASE_URL || 'https://api.anthropic.com';

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY or AI_GATEWAY_API_KEY required');
  }

  const styleInstructions = {
    brief: `Provide a concise summary in approximately ${length} words.`,
    detailed: `Provide a comprehensive summary in approximately ${length} words, covering key points and context.`,
    bullets: `Summarize the key points as a bulleted list with approximately ${length} words total.`
  };

  const instruction = styleInstructions[style] || styleInstructions.brief;

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: 'You are a skilled summarizer. Create clear, accurate summaries while preserving key information.',
      messages: [{
        role: 'user',
        content: `${instruction}\n\nText to summarize:\n${text}`
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const summary = data.content[0].text;

  return {
    summary,
    style,
    targetWords: length,
    actualWords: summary.split(/\s+/).length,
    originalLength: text.length,
    model,
    usage: {
      input_tokens: data.usage.input_tokens,
      output_tokens: data.usage.output_tokens
    }
  };
}

/**
 * Orchestrates the CLI: parse command-line options, read input text or file, call `summarize`, and print the JSON result.
 *
 * Exits with code 1 after printing usage if no input is provided, or after printing an error object when summarization fails.
 */
async function main() {
  const options = parseArgs();

  if (!options.text) {
    console.error('Usage: node summarize.js <text|file> [OPTIONS]');
    console.error('Options:');
    console.error('  --length <words>  Target summary length (default: 100)');
    console.error('  --style <style>   Style: brief, detailed, bullets (default: brief)');
    console.error('  --file            Treat input as file path');
    console.error('  --model <model>   Model to use');
    process.exit(1);
  }

  try {
    let text = options.text;

    if (options.isFile) {
      const filePath = path.resolve(options.text);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      text = fs.readFileSync(filePath, 'utf-8');
    }

    const result = await summarize(text, options.length, options.style, options.model);
    console.log(JSON.stringify(result, null, 2));

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();