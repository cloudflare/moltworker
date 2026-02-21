import { describe, it, expect } from 'vitest';

/**
 * AI Gateway provider to OpenClaw ModelApi mapping logic
 * Extracted from start-openclaw.sh for testing
 */
function getModelApi(gwProvider: string, modelId: string): string {
  const apiMap: Record<string, string> = {
    anthropic: 'anthropic-messages',
    'google-ai-studio': 'google-generative-ai',
    bedrock: 'bedrock-converse-stream',
  };
  let api = apiMap[gwProvider] || 'openai-completions';

  // workers-ai: parse @cf/<vendor>/<model> to select API based on vendor
  if (gwProvider === 'workers-ai') {
    const vendorMatch = modelId.match(/^@cf\/([^/]+)\//);
    if (vendorMatch) {
      const vendor = vendorMatch[1];
      if (vendor === 'meta') {
        api = 'ollama'; // LLaMA models use ollama API
      }
      // openai, mistral, etc. stay as openai-completions
    }
  }

  return api;
}

/**
 * Parse CF_AI_GATEWAY_MODEL into provider and model ID
 */
function parseGatewayModel(raw: string): { gwProvider: string; modelId: string } {
  const slashIdx = raw.indexOf('/');
  return {
    gwProvider: raw.substring(0, slashIdx),
    modelId: raw.substring(slashIdx + 1),
  };
}

describe('AI Gateway Provider to ModelApi Mapping', () => {
  describe('parseGatewayModel', () => {
    it('parses provider/model format', () => {
      const result = parseGatewayModel('anthropic/claude-sonnet-4-5');
      expect(result.gwProvider).toBe('anthropic');
      expect(result.modelId).toBe('claude-sonnet-4-5');
    });

    it('handles workers-ai with nested path', () => {
      const result = parseGatewayModel('workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast');
      expect(result.gwProvider).toBe('workers-ai');
      expect(result.modelId).toBe('@cf/meta/llama-3.3-70b-instruct-fp8-fast');
    });
  });

  describe('Cloudflare AI Gateway Providers', () => {
    // https://developers.cloudflare.com/ai-gateway/usage/providers

    describe('anthropic', () => {
      it('maps to anthropic-messages', () => {
        expect(getModelApi('anthropic', 'claude-sonnet-4-5')).toBe('anthropic-messages');
        expect(getModelApi('anthropic', 'claude-3-5-haiku-latest')).toBe('anthropic-messages');
        expect(getModelApi('anthropic', 'claude-3-opus-20240229')).toBe('anthropic-messages');
      });
    });

    describe('openai', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('openai', 'gpt-4o')).toBe('openai-completions');
        expect(getModelApi('openai', 'gpt-4-turbo')).toBe('openai-completions');
        expect(getModelApi('openai', 'gpt-3.5-turbo')).toBe('openai-completions');
        expect(getModelApi('openai', 'o1-preview')).toBe('openai-completions');
      });
    });

    describe('azure-openai', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('azure-openai', 'gpt-4o-deployment')).toBe('openai-completions');
        expect(getModelApi('azure-openai', 'gpt-35-turbo')).toBe('openai-completions');
      });
    });

    describe('google-ai-studio', () => {
      it('maps to google-generative-ai', () => {
        expect(getModelApi('google-ai-studio', 'gemini-1.5-pro')).toBe('google-generative-ai');
        expect(getModelApi('google-ai-studio', 'gemini-1.5-flash')).toBe('google-generative-ai');
        expect(getModelApi('google-ai-studio', 'gemini-2.0-flash')).toBe('google-generative-ai');
      });
    });

    describe('google-vertex-ai', () => {
      it('maps to openai-completions (uses OpenAI-compatible endpoint)', () => {
        expect(getModelApi('google-vertex-ai', 'gemini-1.5-pro')).toBe('openai-completions');
      });
    });

    describe('bedrock', () => {
      it('maps to bedrock-converse-stream', () => {
        expect(getModelApi('bedrock', 'anthropic.claude-3-sonnet-20240229-v1:0')).toBe(
          'bedrock-converse-stream',
        );
        expect(getModelApi('bedrock', 'amazon.titan-text-express-v1')).toBe('bedrock-converse-stream');
        expect(getModelApi('bedrock', 'meta.llama3-70b-instruct-v1:0')).toBe('bedrock-converse-stream');
      });
    });

    describe('workers-ai', () => {
      describe('meta models (LLaMA)', () => {
        it('maps to ollama API', () => {
          expect(getModelApi('workers-ai', '@cf/meta/llama-3.3-70b-instruct-fp8-fast')).toBe('ollama');
          expect(getModelApi('workers-ai', '@cf/meta/llama-3.1-8b-instruct')).toBe('ollama');
          expect(getModelApi('workers-ai', '@cf/meta/llama-3.2-3b-instruct')).toBe('ollama');
          expect(getModelApi('workers-ai', '@cf/meta/llama-3-8b-instruct')).toBe('ollama');
          expect(getModelApi('workers-ai', '@cf/meta/llama-2-7b-chat-fp16')).toBe('ollama');
        });
      });

      describe('openai models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/openai/whisper')).toBe('openai-completions');
        });
      });

      describe('mistral models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/mistral/mistral-7b-instruct-v0.1')).toBe(
            'openai-completions',
          );
          expect(getModelApi('workers-ai', '@cf/mistral/mistral-7b-instruct-v0.2-lora')).toBe(
            'openai-completions',
          );
        });
      });

      describe('qwen models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/qwen/qwen1.5-14b-chat-awq')).toBe('openai-completions');
          expect(getModelApi('workers-ai', '@cf/qwen/qwen1.5-7b-chat-awq')).toBe('openai-completions');
        });
      });

      describe('deepseek models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/deepseek-ai/deepseek-math-7b-instruct')).toBe(
            'openai-completions',
          );
        });
      });

      describe('google models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/google/gemma-7b-it-lora')).toBe('openai-completions');
          expect(getModelApi('workers-ai', '@cf/google/gemma-2b-it-lora')).toBe('openai-completions');
        });
      });

      describe('microsoft models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/microsoft/phi-2')).toBe('openai-completions');
        });
      });

      describe('tinyllama models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/tinyllama/tinyllama-1.1b-chat-v1.0')).toBe(
            'openai-completions',
          );
        });
      });

      describe('thebloke models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/thebloke/discolm-german-7b-v1-awq')).toBe(
            'openai-completions',
          );
        });
      });

      describe('defog models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/defog/sqlcoder-7b-2')).toBe('openai-completions');
        });
      });

      describe('nexusflow models', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', '@cf/nexusflow/starling-lm-7b-beta')).toBe(
            'openai-completions',
          );
        });
      });

      describe('non-@cf format (fallback)', () => {
        it('maps to openai-completions', () => {
          expect(getModelApi('workers-ai', 'some-other-model')).toBe('openai-completions');
        });
      });
    });

    describe('groq', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('groq', 'llama-3.3-70b-versatile')).toBe('openai-completions');
        expect(getModelApi('groq', 'mixtral-8x7b-32768')).toBe('openai-completions');
        expect(getModelApi('groq', 'gemma2-9b-it')).toBe('openai-completions');
      });
    });

    describe('mistral', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('mistral', 'mistral-large-latest')).toBe('openai-completions');
        expect(getModelApi('mistral', 'mistral-medium-latest')).toBe('openai-completions');
        expect(getModelApi('mistral', 'mistral-small-latest')).toBe('openai-completions');
        expect(getModelApi('mistral', 'codestral-latest')).toBe('openai-completions');
      });
    });

    describe('cohere', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('cohere', 'command-r-plus')).toBe('openai-completions');
        expect(getModelApi('cohere', 'command-r')).toBe('openai-completions');
        expect(getModelApi('cohere', 'command-light')).toBe('openai-completions');
      });
    });

    describe('deepseek', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('deepseek', 'deepseek-chat')).toBe('openai-completions');
        expect(getModelApi('deepseek', 'deepseek-coder')).toBe('openai-completions');
        expect(getModelApi('deepseek', 'deepseek-reasoner')).toBe('openai-completions');
      });
    });

    describe('perplexity', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('perplexity', 'llama-3.1-sonar-large-128k-online')).toBe(
          'openai-completions',
        );
        expect(getModelApi('perplexity', 'llama-3.1-sonar-small-128k-chat')).toBe('openai-completions');
      });
    });

    describe('openrouter', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('openrouter', 'anthropic/claude-3-opus')).toBe('openai-completions');
        expect(getModelApi('openrouter', 'openai/gpt-4-turbo')).toBe('openai-completions');
        expect(getModelApi('openrouter', 'google/gemini-pro')).toBe('openai-completions');
      });
    });

    describe('huggingface', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('huggingface', 'meta-llama/Meta-Llama-3-8B-Instruct')).toBe(
          'openai-completions',
        );
        expect(getModelApi('huggingface', 'mistralai/Mistral-7B-Instruct-v0.2')).toBe(
          'openai-completions',
        );
      });
    });

    describe('replicate', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('replicate', 'meta/llama-2-70b-chat')).toBe('openai-completions');
      });
    });

    describe('xai', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('xai', 'grok-beta')).toBe('openai-completions');
        expect(getModelApi('xai', 'grok-2')).toBe('openai-completions');
      });
    });

    describe('cerebras', () => {
      it('maps to openai-completions', () => {
        expect(getModelApi('cerebras', 'llama3.1-8b')).toBe('openai-completions');
        expect(getModelApi('cerebras', 'llama3.1-70b')).toBe('openai-completions');
      });
    });

    // Audio/Speech providers (not typically used for chat, but included for completeness)
    describe('elevenlabs', () => {
      it('maps to openai-completions (default)', () => {
        expect(getModelApi('elevenlabs', 'eleven_multilingual_v2')).toBe('openai-completions');
      });
    });

    describe('deepgram', () => {
      it('maps to openai-completions (default)', () => {
        expect(getModelApi('deepgram', 'nova-2')).toBe('openai-completions');
      });
    });

    describe('cartesia', () => {
      it('maps to openai-completions (default)', () => {
        expect(getModelApi('cartesia', 'sonic-english')).toBe('openai-completions');
      });
    });

    // Image generation providers
    describe('fal-ai', () => {
      it('maps to openai-completions (default)', () => {
        expect(getModelApi('fal-ai', 'flux/dev')).toBe('openai-completions');
      });
    });

    describe('ideogram', () => {
      it('maps to openai-completions (default)', () => {
        expect(getModelApi('ideogram', 'ideogram-v2')).toBe('openai-completions');
      });
    });

    // Other providers
    describe('baseten', () => {
      it('maps to openai-completions (default)', () => {
        expect(getModelApi('baseten', 'custom-model')).toBe('openai-completions');
      });
    });

    describe('parallel', () => {
      it('maps to openai-completions (default)', () => {
        expect(getModelApi('parallel', 'parallel-model')).toBe('openai-completions');
      });
    });

    describe('unknown providers', () => {
      it('maps to openai-completions as default', () => {
        expect(getModelApi('future-provider', 'some-model')).toBe('openai-completions');
        expect(getModelApi('custom', 'model-x')).toBe('openai-completions');
      });
    });
  });
});
