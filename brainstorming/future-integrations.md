# Future Integrations & Improvements

This document tracks potential features and integrations for the Moltworker Telegram bot with OpenRouter.

## Current State (as of Feb 2026)

### What We Have
- **26+ AI models** via OpenRouter (DeepSeek, GPT, Claude, Gemini, Grok, Qwen, etc.)
- **Image generation** with FLUX.2 models (klein, pro, flex, max)
- **GitHub tools** (read files, list directories, API calls) with auto-auth
- **Durable Objects** for unlimited task time (no timeout)
- **User allowlist** security
- **Skills loading** from R2 storage
- **Status updates** during long operations

### Architecture
```
Telegram Webhook → Worker → Durable Object (for tool-using models)
                         → OpenRouter API → Any Model
                         → Direct response (for simple models)
```

---

## Priority 1: High Value, Low Effort

### 1.1 Browser Tool (CDP Integration)
**Status:** Not started
**Effort:** Low (binding already exists)
**Value:** High

The `BROWSER` binding is already configured in wrangler.jsonc. Add a tool that models can call:

```typescript
browse_url({
  url: string,
  action: "screenshot" | "extract_text" | "pdf" | "click" | "fill"
})
```

**Implementation:**
- Create `src/openrouter/tools/browser.ts`
- Add to AVAILABLE_TOOLS
- Use Cloudflare Browser Rendering API

**Use Cases:**
- "Take a screenshot of my website"
- "What does the homepage of X say?"
- "Check if my deployment is working"
- "Get the current price of BTC from coinbase"

### 1.2 Inline Buttons (Telegram)
**Status:** Not started
**Effort:** Low
**Value:** Medium

Add interactive buttons to responses for:
- Confirmations ("Create this PR?" [Yes] [No])
- Quick choices ("Which model?" [GPT] [Claude] [DeepSeek])
- Pagination for long results

**Implementation:**
- Add `sendMessageWithButtons()` to TelegramBot class
- Handle callback queries in `handleCallback()`
- Store pending actions in R2 or DO storage

### 1.3 Draft Streaming (Telegram)
**Status:** Not started
**Effort:** Medium
**Value:** Medium

Show partial responses as they stream in (requires threaded mode in BotFather).

**Implementation:**
- Enable streaming in OpenRouter client
- Use `editMessage` to update content as tokens arrive
- Throttle updates to avoid rate limits

---

## Priority 2: Discord Integration

### 2.1 Discord Read-Only (Announcements)
**Status:** Not started
**Effort:** Medium
**Value:** High (user requested)

Monitor Discord servers for announcements and forward to Telegram.

**Architecture Options:**

**Option A: Discord Bot (Full)**
- Create Discord bot with message read permissions
- Use discord.js or raw API
- Route messages through our OpenRouter handler

**Option B: Webhook Listener**
- Use Discord webhooks to receive specific channel updates
- Lighter weight, no bot needed
- Limited to channels with webhook setup

**Option C: User Account (Not Recommended)**
- Against Discord ToS
- Risk of ban

**Recommended: Option A with minimal permissions**

```typescript
// New env vars needed:
DISCORD_BOT_TOKEN
DISCORD_ANNOUNCEMENT_CHANNELS  // comma-separated channel IDs
DISCORD_FORWARD_TO_TELEGRAM    // telegram chat ID to forward to
```

**Features:**
- Monitor specific channels only
- Forward new messages to Telegram
- Optionally summarize with AI before forwarding
- Filter by keywords or roles

### 2.2 Discord Full Integration
**Status:** Future
**Effort:** High
**Value:** Medium

Full two-way Discord integration like Telegram:
- Respond to DMs
- Respond to mentions in servers
- Use same OpenRouter backend

---

## Priority 3: More Tools

### 3.1 Web Search Tool
**Status:** Not started
**Effort:** Medium
**Value:** High

Let models search the web for current information.

**Options:**
- Brave Search API (has free tier)
- SearXNG (self-hosted)
- Perplexity API
- Google Custom Search

```typescript
web_search({
  query: string,
  num_results?: number
})
```

### 3.2 Code Execution Tool
**Status:** Not started
**Effort:** High
**Value:** High

Run code snippets safely in a sandbox.

**Options:**
- Use existing Cloudflare Sandbox container
- Piston API (multi-language execution)
- Judge0 API

```typescript
run_code({
  language: "python" | "javascript" | "bash",
  code: string
})
```

### 3.3 File Management Tools
**Status:** Not started
**Effort:** Low
**Value:** Medium

Store and retrieve files from R2:

```typescript
save_file({ name: string, content: string })
read_file({ name: string })
list_files({ prefix?: string })
delete_file({ name: string })
```

### 3.4 Calendar/Reminder Tools
**Status:** Not started
**Effort:** Medium
**Value:** Medium

Set reminders that trigger via cron:

```typescript
set_reminder({
  message: string,
  when: string  // "in 2 hours", "tomorrow 9am", etc.
})
list_reminders()
delete_reminder({ id: string })
```

---

## Priority 4: Advanced Features

### 4.1 Proactive Notifications (Cron)
**Status:** Partial (cron exists for R2 backup)
**Effort:** Medium
**Value:** High

Use existing cron trigger for proactive tasks:
- Daily summaries
- Price alerts
- Website monitoring
- GitHub activity digest

### 4.2 Voice Messages
**Status:** Not started
**Effort:** High
**Value:** Medium

Handle Telegram voice messages:
- Transcribe with Whisper API
- Respond with TTS (ElevenLabs, OpenAI TTS)

### 4.3 Multi-User Workspaces
**Status:** Not started
**Effort:** High
**Value:** Low (currently single-user)

Share context between users:
- Team workspaces
- Shared conversation history
- Role-based access

### 4.4 Long-Term Memory
**Status:** Not started
**Effort:** Medium
**Value:** High

Persistent memory across conversations:
- Store facts in R2 (MEMORY.md like OpenClaw)
- Retrieve relevant memories for context
- User can view/edit memories

---

## Priority 5: Platform Integrations

### 5.1 Slack Integration
**Status:** Not started
**Effort:** Medium
**Value:** Low (unless needed)

Same pattern as Telegram but for Slack workspaces.

### 5.2 WhatsApp Integration
**Status:** Not started
**Effort:** High
**Value:** Medium

Via WhatsApp Business API (requires approval).

### 5.3 Email Integration
**Status:** Not started
**Effort:** Medium
**Value:** Medium

- Receive emails via Cloudflare Email Workers
- Send emails via Mailgun/SendGrid
- Summarize inbox, draft replies

---

## Technical Debt & Improvements

### Code Quality
- [ ] Add unit tests for tools
- [ ] Add integration tests for Telegram handler
- [ ] Add error tracking (Sentry?)
- [ ] Add request logging/analytics

### Performance
- [ ] Cache frequent API responses
- [ ] Optimize token usage (shorter system prompts)
- [ ] Batch tool calls where possible

### Security
- [ ] Rate limiting per user
- [ ] Input sanitization for tools
- [ ] Audit logging for sensitive operations

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Feb 2026 | Use OpenRouter instead of direct APIs | Unified access to 26+ models, simpler billing |
| Feb 2026 | Implement Durable Objects | Unlimited task time for complex coding |
| Feb 2026 | Bypass Gateway for Telegram | Custom multi-model support, image gen |

---

## Resources

- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Browser Rendering](https://developers.cloudflare.com/browser-rendering/)
- [OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [Discord API](https://discord.com/developers/docs)
