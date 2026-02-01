#!/usr/bin/env node
/**
 * AI Tools - Structured Data Extraction
 * Extract structured data from unstructured text using AI
 * Usage: node extract.js <text> --schema <json_schema>
 */

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into an options object containing text, schema, and model.
 *
 * Recognizes:
 * - `--schema <value>`: parses the following value as JSON; if parsing fails, returns the raw string.
 * - `--model <value>`: sets the model name.
 * - the first non-flag argument: treated as the text input.
 *
 * @returns {{ text: string, schema: Object|string|null, model: string }} An object with:
 *  - `text`: the input text (empty string if not provided),
 *  - `schema`: a parsed object, raw schema string, or `null` if not provided,
 *  - `model`: the model name (defaults to `'claude-3-5-sonnet-20241022'`).
 */
function parseArgs() {
  const result = {
    text: '',
    schema: null,
    model: 'claude-3-5-sonnet-20241022'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--schema' && args[i + 1]) {
      try {
        result.schema = JSON.parse(args[i + 1]);
      } catch {
        result.schema = args[i + 1];
      }
      i++;
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
 * Extract structured data from unstructured text according to a JSON schema.
 *
 * Sends the text and schema to the configured Anthropic-compatible API and returns the parsed JSON result (or a parse error payload) along with model and token usage.
 *
 * @param {string} text - The input text to extract data from.
 * @param {Object|string} schema - The expected JSON schema (object or preformatted JSON string) describing the output structure.
 * @param {string} model - The model identifier to use for the API request.
 * @returns {{extracted: Object, model: string, usage: {input_tokens: number, output_tokens: number}}} The extraction result: `extracted` is the parsed JSON (or `{ raw, parseError: true }` on parse failure), `model` is the model used, and `usage` contains token counts.
 * @throws {Error} If no API key is configured or the API responds with a non-OK status.
 */
async function extractStructured(text, schema, model) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_GATEWAY_API_KEY;
  const baseUrl = process.env.AI_GATEWAY_BASE_URL || 'https://api.anthropic.com';

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY or AI_GATEWAY_API_KEY required');
  }

  const schemaStr = typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2);

  const systemPrompt = `You are a data extraction assistant. Extract structured data from the provided text according to the given schema. Return ONLY valid JSON matching the schema, no additional text.`;

  const userPrompt = `Extract data from this text according to the schema.

Schema:
${schemaStr}

Text:
${text}

Return only the JSON object with extracted values. Use null for fields that cannot be determined.`;

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
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const responseText = data.content[0].text;

  // Parse JSON from response
  let extracted;
  try {
    // Try to extract JSON from markdown code block if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
    extracted = JSON.parse(jsonStr);
  } catch {
    extracted = { raw: responseText, parseError: true };
  }

  return {
    extracted,
    model,
    usage: {
      input_tokens: data.usage.input_tokens,
      output_tokens: data.usage.output_tokens
    }
  };
}

/**
 * Parse command-line arguments, validate required inputs, run structured extraction, and print the result or an error.
 *
 * If required arguments are missing or extraction fails, prints usage or an error object and exits the process with code 1.
 */
async function main() {
  const options = parseArgs();

  if (!options.text || !options.schema) {
    console.error('Usage: node extract.js <text> --schema <json_schema>');
    console.error('');
    console.error('Options:');
    console.error('  --schema <json>   JSON schema defining expected output');
    console.error('  --model <model>   Model to use (default: claude-3-5-sonnet-20241022)');
    console.error('');
    console.error('Example:');
    console.error('  node extract.js "John Doe, age 30" --schema \'{"name":"string","age":"number"}\'');
    process.exit(1);
  }

  try {
    const result = await extractStructured(options.text, options.schema, options.model);
    console.log(JSON.stringify(result, null, 2));

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();