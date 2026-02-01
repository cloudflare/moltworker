#!/usr/bin/env node
/**
 * AI Tools - Embeddings Generator
 * Generate vector embeddings for semantic search and RAG
 * Usage: node embeddings.js <text> [OPTIONS]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into an options object for embedding generation.
 *
 * Recognizes `--model`, `--dimensions`, and `--output`; the first non-option argument is used as the input text.
 * @returns {{text: string, model: string, dimensions: number, output: string|null}} An object containing:
 *  - `text`: the input text to embed (empty string if not provided),
 *  - `model`: embedding model name (default `"text-embedding-3-small"`),
 *  - `dimensions`: requested embedding dimensionality (default `1536`),
 *  - `output`: optional file path to save the result, or `null` if not set.
 */
function parseArgs() {
  const result = {
    text: '',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--model' && args[i + 1]) {
      result.model = args[i + 1];
      i++;
    } else if (args[i] === '--dimensions' && args[i + 1]) {
      result.dimensions = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      result.output = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      result.text = args[i];
    }
  }

  return result;
}

/**
 * Generate a vector embedding for the provided text using an OpenAI-compatible embeddings API.
 *
 * @param {string} text - The input text to embed.
 * @param {string} model - The embedding model identifier to use.
 * @param {number} dimensions - The expected dimensionality of the returned embedding.
 * @returns {{model: string, dimensions: number, embedding: number[], usage: {tokens: number}}} An object containing the model, dimensions, the embedding vector, and token usage.
 * @throws {Error} If no API key is available via OPENAI_API_KEY or AI_GATEWAY_API_KEY.
 * @throws {Error} If the remote API responds with a non-OK status (message includes HTTP status and response body).
 */
async function generateEmbeddings(text, model, dimensions) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  const baseUrl = process.env.AI_GATEWAY_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY or AI_GATEWAY_API_KEY required for embeddings');
  }

  const response = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: text,
      dimensions
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    model,
    dimensions,
    embedding: data.data[0].embedding,
    usage: { tokens: data.usage.total_tokens }
  };
}

/**
 * Parse command-line arguments, generate embeddings for the provided text, and either save the full result to a file or print a truncated preview.
 *
 * Parses argv for text, model, dimensions, and output options; if no text is provided prints usage and exits with code 1. Calls generateEmbeddings with the parsed options, and on success either writes the complete result as pretty JSON to the specified output file or prints a truncated embedding preview (first five values plus an indicator of total length). On failure logs a JSON error and exits with code 1.
 */
async function main() {
  const options = parseArgs();

  if (!options.text) {
    console.error('Usage: node embeddings.js <text> [OPTIONS]');
    console.error('Options:');
    console.error('  --model <model>      Embedding model (default: text-embedding-3-small)');
    console.error('  --dimensions <n>     Output dimensions (default: 1536)');
    console.error('  --output <file>      Save embeddings to file');
    process.exit(1);
  }

  try {
    const result = await generateEmbeddings(options.text, options.model, options.dimensions);

    if (options.output) {
      fs.writeFileSync(path.resolve(options.output), JSON.stringify(result, null, 2));
      console.log(JSON.stringify({
        success: true,
        saved: options.output,
        dimensions: result.dimensions,
        usage: result.usage
      }, null, 2));
    } else {
      // Truncate embedding array for display
      const displayResult = {
        ...result,
        embedding: result.embedding.slice(0, 5).concat(['...', `(${result.embedding.length} total)`])
      };
      console.log(JSON.stringify(displayResult, null, 2));
    }

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();