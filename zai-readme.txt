## Add these new secrets:

npx wrangler secret put ANTHROPIC_API_KEY
# Enter your API key (e.g., your z.ai key)

npx wrangler secret put ANTHROPIC_BASE_URL
# Enter the base URL (e.g., https://api.z.ai/api/anthropic)

npx wrangler secret put ANTHROPIC_DEFAULT_OPUS_MODEL
# Enter the model ID for the "Opus" tier (e.g., glm-4.7)

npx wrangler secret put ANTHROPIC_DEFAULT_SONNET_MODEL
# Enter the model ID for the "Sonnet" tier (e.g., glm-4.7)

npx wrangler secret put ANTHROPIC_DEFAULT_HAIKU_MODEL
# Enter the model ID for the "Haiku" tier (e.g., glm-4.7-flash)
