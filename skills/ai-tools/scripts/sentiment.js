#!/usr/bin/env node
/**
 * AI Tools - Sentiment Analysis
 * Analyze sentiment and emotional tone of text
 * Usage: node sentiment.js <text>
 */

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    text: '',
    model: 'claude-3-5-haiku-20241022'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--model' && args[i + 1]) {
      result.model = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      result.text = args.slice(i).join(' ');
      break;
    }
  }

  return result;
}

async function analyzeSentiment(text, model) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_GATEWAY_API_KEY;
  const baseUrl = process.env.AI_GATEWAY_BASE_URL || 'https://api.anthropic.com';

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY or AI_GATEWAY_API_KEY required');
  }

  const systemPrompt = `You are a sentiment analysis expert. Analyze the sentiment and emotional tone of text. Return ONLY a JSON object with this structure:
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "score": number between -1 (most negative) and 1 (most positive),
  "confidence": number between 0 and 1,
  "emotions": array of detected emotions with intensity (0-1),
  "tone": brief description of the overall tone,
  "keywords": array of sentiment-bearing words
}`;

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Analyze the sentiment of this text:\n\n${text}`
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const responseText = data.content[0].text;

  let analysis;
  try {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
    analysis = JSON.parse(jsonStr);
  } catch {
    analysis = { raw: responseText, parseError: true };
  }

  return {
    text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    analysis,
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
    console.error('Usage: node sentiment.js <text>');
    console.error('Options:');
    console.error('  --model <model>   Model to use (default: claude-3-5-haiku-20241022)');
    process.exit(1);
  }

  try {
    const result = await analyzeSentiment(options.text, options.model);
    console.log(JSON.stringify(result, null, 2));

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();
