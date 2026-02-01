#!/usr/bin/env node
/**
 * AI Tools - Text Summarization
 * Intelligent summarization with configurable length and style
 * Usage: node summarize.js <text|file> [OPTIONS]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

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
