# Free Models Integration Spec — Storia Digital AI Hub

> **Version**: 1.4 (Grok-reviewed + maintenance + archetypes + memory + Deep Mode tier)  
> **Date**: 2026-02-11  
> **Author**: Claude Opus 4.6 — reviewed by Grok (8.5/10 → adjustments applied)  
> **Sources**: cheahjs/free-llm-api-resources (6.6k ★), Grok analysis, Storia project knowledge  
> **Location**: `claude-share/brainstorming/free-models-integration-spec.md`  
> **Depends on**: `ai-models-spec-storia.md` v2.3, ClawRouter (Phase 3.1), LLM Proxy (`/api/llm-proxy/route.ts`)  
> **⚠️ Limits volatile** — last verified Feb 2026. Free-tier quotas change frequently. §10 FreeModelWatcher handles this automatically.

---

## 1. Executive Summary

Storia's BYOK philosophy ("Every AI. Your Keys. Zero Markup.") creates a cold-start problem: new users without API keys can't experience the platform. Free LLM tiers solve this by providing an instant, zero-friction onboarding path where users can chat, code, and research immediately—then graduate to their own keys for higher limits and premium models.

This spec defines how to integrate free-tier LLM providers into Storia's existing architecture (LLM proxy, ClawRouter, Model Playground) without compromising the BYOK core or adding platform costs.

**Strategic outcome**: User signs up → chats with Llama 3.3 70B via Groq in under 30 seconds → no API key needed → converts to BYOK when they hit daily limits.

---

## 2. Provider Catalog — Ranked by Storia Fit

### 2.1 Tier 1: Primary Free Providers (Integrate First)

These providers offer the best combination of model quality, generous limits, and API compatibility with Storia's existing infrastructure.

#### OpenRouter Free Tier

- **URL**: `openrouter.ai/api/v1` (already in LLM_ALLOWED_HOSTS roadmap)
- **API format**: OpenAI-compatible (works with existing LLM proxy)
- **Limits**: 20 req/min, 50 req/day (1,000/day with $10 lifetime top-up — **recommended for beta**)
- **⚠️ Reality check**: Free model availability fluctuates weekly. Some models rotate in/out of `:free` status. Expect 20-30 reliably free models at any given time, not 40+. Some free models are low-priority / queued during peak hours.
- **Top free models** (verified Feb 2026, subject to change):
  - `meta-llama/llama-3.3-70b-instruct:free` — Solid general-purpose (GPT-4o mini / Sonnet 3.5 class, not GPT-4 class)
  - `deepseek/deepseek-r1-0528:free` — Strong reasoning/research chain-of-thought
  - `deepseek/deepseek-chat-v3.1:free` — Fast general chat
  - `nousresearch/hermes-3-llama-3.1-405b:free` — Largest free instruct model, rivals paid frontier for deep reasoning
  - `mistralai/devstral-2:free` — Mistral's agentic coding model, strong multi-file refactoring
  - `tngtech/deepseek-r1t2-chimera:free` — Reasoning chimera variant, rising in usage
  - `qwen/qwen3-235b-a22b:free` — Largest free MoE model available
  - `qwen/qwen3-coder:free` — Coding specialist
  - `moonshotai/kimi-k2:free` — Agent-capable, long context
  - `z-ai/glm-4.5-air:free` — GLM family free variant
- **Storia value**: Single API key unlocks all free models. OpenRouter is already planned for Phase 2.6.1. Free models use the same endpoint as paid models—just append `:free` to the model string.
- **Data training**: No opt-in required for free tier
- **Integration effort**: 2h (already OpenAI-compatible)

#### Groq

- **URL**: `api.groq.com` (already in LLM_ALLOWED_HOSTS roadmap)
- **API format**: OpenAI-compatible
- **Limits**: Varies per model—Llama 3.3 70B gets 1,000 req/day at 12,000 tokens/min; Llama 3.1 8B gets 14,400 req/day
- **⚠️ Reality check**: 70B models hit 429 quickly under heavy use. Route 8B for drafts/speed (14,400 RPD headroom is massive), reserve 70B for quality-critical paths.
- **Top free models**:
  - `llama-3.1-8b-instant` — **Default speed pick**: Sub-second, 14,400 req/day
  - `llama-3.3-70b-versatile` — Best quality, but 1,000 req/day burns fast
  - `qwen/qwen3-32b` — Strong reasoning
  - `moonshotai/kimi-k2-instruct` — Agent tasks
  - `openai/gpt-oss-120b` — Large open-source model (1,000 RPD)
- **Storia value**: Fastest inference of any free provider. Ideal for ClawRouter's "Max Speed" preset. The 8B model at 14,400 RPD is the workhorse—use it for simple queries, iteration loops, and drafts. Reserve 70B for when quality matters.
- **Data training**: No opt-in required
- **Integration effort**: 2h

### 2.1.5 Tier 1.5: High Value but Higher Risk (Phase 1.5)

#### Google AI Studio (Gemini API)

- **URL**: `generativelanguage.googleapis.com`
- **API format**: Google Gemini SDK (not OpenAI-compatible; needs adapter)
- **Limits**: Gemini 2.5 Flash: nominally 250 req/day, 10 req/min — but **actual limits frequently lower** (~20-100 RPD reported after Dec 2025 reductions); Gemini 2.5 Pro: essentially gone from true free tier (2 RPM, 50 RPD)
- **⚠️ Reality check**: Google has repeatedly cut free-tier quotas in late 2025 / early 2026. Flash is still usable but unreliable as a primary provider. Quota volatility makes this risky as a default route.
- **Top free models**:
  - `gemini-2.5-flash` — Strong multimodal, huge context window (when quota allows)
  - `gemini-2.5-flash-lite` — Budget variant, ~1,000 req/day (more stable)
  - `gemma-3-27b-instruct` — Open-weight, 14,400 req/day (most reliable Google option)
- **Storia value**: Massive context windows (1M+ tokens) make this the best choice for research tasks IF quotas hold. Gemma 3 27B is the safe bet here — stable, generous, open-weight.
- **Data training**: ⚠️ Data used for training outside UK/CH/EEA/EU. Must flag clearly in UI.
- **Integration effort**: 8-10h (Gemini SDK adapter, different error format, safety block handling, content type differences)
- **Recommendation**: **Phase 1.5** — implement after Groq + OpenRouter are proven. Default routing should prefer non-Google unless user is in EU and needs long context. Use Cerebras or OpenRouter DeepSeek R1 for research tasks instead.

#### Cerebras

- **URL**: `api.cerebras.ai`
- **API format**: OpenAI-compatible
- **Limits**: 30 req/min, 14,400 req/day, 1M tokens/day (generous on paper)
- **⚠️ Reality check**: Token limits are generous but request caps can be lower in practice for shared keys. Popular models (Qwen 235B, 480B) face contention during peak hours. Add health monitoring early.
- **Top free models**:
  - `llama-3.3-70b` — High-quality general reasoning
  - `qwen/qwen3-235b-a22b` — Massive MoE model (contention risk)
  - `qwen/qwen3-coder-480b` — 10 req/min, 100 req/day (very limited but powerful)
  - `llama-4-scout` / `llama-4-maverick` — Latest Llama 4 variants
- **Storia value**: Highest daily token limits of any free provider. Best for heavy research sessions and long coding workflows when Groq/OpenRouter quotas are exhausted. Strong Phase 1.5 / fallback candidate.
- **Data training**: No explicit policy found — monitor
- **Integration effort**: 2h

### 2.2 Tier 2: Specialized Providers (Phase 2)

#### Mistral (La Plateforme + Codestral)

- **URL**: `api.mistral.ai` / `codestral.mistral.ai` (both in LLM_ALLOWED_HOSTS roadmap)
- **API format**: OpenAI-compatible
- **Limits**: La Plateforme: 1 req/sec, 500K tokens/min, 1B tokens/month (!); Codestral: 30 req/min, 2K req/day
- **Models**: Mistral Small/Medium/Nemo (La Plateforme), Codestral (code-specialized)
- **Storia value**: Codestral is the best free coding model available—80+ language support, purpose-built for code generation. La Plateforme's 1B tokens/month is extremely generous for the Experiment plan.
- **Caveats**: ⚠️ Experiment plan **requires opting into data training** + phone verification. This is a significant privacy hit that conflicts with Storia's trust-first philosophy.
- **Recommendation**: **Phase 2** — default off for most users due to privacy concern. Offer as opt-in with clear disclosure. Users who want Codestral's coding power can add their own Mistral key (free to create) instead.
- **Integration effort**: 3h

#### Cloudflare Workers AI

- **URL**: Workers AI binding (native Cloudflare, no external API call needed)
- **API format**: Cloudflare Workers AI API (proprietary but simple)
- **Limits**: 10,000 neurons/day (shared across all models)
- **Models**: Llama 3.x, Gemma 3, Qwen 2.5/3, DeepSeek variants, Mistral Small 3.1
- **Storia value**: Zero latency—runs on the same edge network as Storia itself. No external API call, no SSRF considerations. Ideal as the fastest possible fallback for simple queries. Already in the stack.
- **Caveats**: Models are often quantized (lower quality than full-precision equivalents). Neuron limits can be confusing—actual request count varies by model size.
- **Integration effort**: 4h (Workers AI binding vs REST API in existing proxy)

#### Cohere

- **URL**: `api.cohere.com`
- **API format**: Cohere SDK (not OpenAI-compatible; needs adapter)
- **Limits**: 20 req/min, 1,000 req/month (very restrictive)
- **Models**: Command-A (reasoning), Aya Vision/Expanse (multilingual, 23 languages)
- **Storia value**: Best multilingual free option. Aya models support languages that other free providers don't cover well. Command-A includes built-in RAG citations.
- **Integration effort**: 5h (needs Cohere adapter)

### 2.3 Tier 3: Trial Credit Providers (Bonus Onboarding)

These providers offer one-time credits. Storia can surface them as "get started" bonuses—a user gets $30 of Baseten credit or $10 of AI21 credit just by creating an account.

| Provider | Credits | Duration | Best Models | Integration Value |
|----------|---------|----------|-------------|-------------------|
| **Baseten** | $30 | No expiry | Any model (pay-per-compute) | Highest free credit |
| **AI21** | $10 | 3 months | Jamba family | Unique architecture |
| **Nebius** | $1 | No expiry | Various open models | Low effort |
| **Fireworks** | $1 | No expiry | Various open models | Fast inference |
| **SambaNova** | $5 | 3 months | Llama, DeepSeek variants | Custom silicon |
| **Hyperbolic** | $1 | No expiry | DeepSeek, Qwen3, GPT-OSS | Broad selection |

**Storia action**: Create a "Free Credits Guide" page showing users how to claim these trial credits for providers Storia already supports. No integration work needed—just documentation + deep links.

---

## 3. Architecture — How Free Models Fit Into Storia

### 3.1 System Overview

```
User Request
    │
    ▼
┌─────────────────────────────────────────────────┐
│ Storia Frontend (Cockpit)                        │
│  ├── Model Selector (shows free badge)          │
│  ├── ClawRouter Override (free tier option)      │
│  └── Quota Dashboard (remaining free calls)     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ /api/llm-proxy/route.ts                          │
│  ├── Auth check (logged in? → allow free tier)  │
│  ├── ClawRouter (routes by complexity + tier)    │
│  ├── FreeModelRouter (manages provider quotas)   │
│  └── SSRF allowlist (LLM_ALLOWED_HOSTS)         │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┼─────────┬──────────┐
         ▼         ▼         ▼          ▼
    ┌─────────┐ ┌──────┐ ┌────────┐ ┌──────────┐
    │OpenRouter│ │ Groq │ │Cerebras│ │Cloudflare│
    │  :free   │ │      │ │        │ │Workers AI│
    └─────────┘ └──────┘ └────────┘ └──────────┘
```

### 3.2 FreeModelRouter — New Module

**Location**: `src/lib/free-router/`

This module manages free-tier provider quotas, fallback chains, and rate limiting. It sits alongside (not replacing) ClawRouter.

```typescript
// src/lib/free-router/types.ts
interface FreeProvider {
  id: string;                    // 'openrouter-free' | 'groq' | 'cerebras' | etc.
  endpoint: string;              // API base URL
  models: FreeModel[];           // Available models
  limits: ProviderLimits;        // Rate limits
  apiKeySource: 'storia' | 'user'; // Who provides the key
  dataTrainingWarning?: string;  // If provider uses data for training
}

interface FreeModel {
  id: string;                    // 'llama-3.3-70b-instruct:free'
  displayName: string;           // 'Llama 3.3 70B'
  provider: string;              // 'openrouter-free'
  capabilities: ModelCapability[]; // ['chat', 'code', 'reasoning', 'vision']
  contextWindow: number;         // 128000
  maxOutputTokens: number;       // 4096
  qualityTier: 'economy' | 'standard' | 'premium';
  speedRating: 1 | 2 | 3 | 4 | 5; // 5 = fastest
}

interface ProviderLimits {
  requestsPerMinute: number;
  requestsPerDay: number;
  tokensPerMinute?: number;
  tokensPerDay?: number;
}

interface QuotaState {
  providerId: string;
  userId: string;
  requestsUsedToday: number;
  tokensUsedToday: number;
  lastResetAt: string;           // ISO date
  isExhausted: boolean;
}
```

### 3.3 Quota Tracking (D1 Table)

```sql
-- drizzle/migrations/XXXX_free_model_quotas.sql
CREATE TABLE IF NOT EXISTS free_model_quotas (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  requests_used INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  reset_date TEXT NOT NULL,       -- YYYY-MM-DD, resets daily
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, provider_id, reset_date)
);

CREATE INDEX idx_free_quotas_user ON free_model_quotas(user_id, reset_date);
```

### 3.4 Provider API Key Management

**Critical design decision**: Free-tier providers require API keys, but these are *Storia's platform keys*, not user keys. This creates a shared resource that needs protection.

**Approach — Platform Keys in Env Vars**:

```
# wrangler.toml (secrets, not committed)
FREE_OPENROUTER_KEY = "sk-or-v1-..."     # OpenRouter free-tier key
FREE_GROQ_KEY = "gsk_..."                 # Groq free-tier key
FREE_CEREBRAS_KEY = "csk-..."             # Cerebras free-tier key
FREE_GOOGLE_AI_KEY = "AIza..."            # Google AI Studio key
```

**Per-user rate limiting** is essential to prevent a single user from exhausting the platform's shared quota. This is where the `free_model_quotas` D1 table comes in—each user gets their own daily allocation within the provider's total limits.

**Allocation strategy** (conservative — start low, scale up based on actual burn rates):

| Provider | Provider Daily Limit | Per-User Allocation (Beta) | Per-User Allocation (Post-Launch) | Platform-Wide Daily Cap |
|----------|---------------------|---------------------------|-----------------------------------|------------------------|
| OpenRouter | 50 req/day (1,000 w/ top-up) | 15 req/day | 5-8 req/day | 80% of provider limit |
| Groq (8B) | 14,400 req/day | 100 req/day | 40 req/day | 80% of provider limit |
| Groq (70B) | 1,000 req/day | 30 req/day | 15 req/day | 70% of provider limit |
| Cerebras | 14,400 req/day | 80 req/day | 30 req/day | 80% of provider limit |
| Google AI | 250 req/day (nominal) | 15 req/day | 8 req/day | 60% of provider limit |
| Workers AI | 10,000 neurons/day | Shared pool | Shared pool | N/A (edge native) |

**Platform-wide daily cap**: Stop routing to a provider when platform-wide usage hits the cap percentage. This prevents the last few users of the day from getting 100% error rates. When cap is hit, FreeModelRouter skips that provider in the fallback chain.

These allocations should be configurable via env vars and auto-adjusted as the user base grows. The D1 quota table tracks both per-user and platform-wide daily totals.

### 3.5 ClawRouter Integration

ClawRouter already classifies queries by complexity (simple/medium/complex) and routes to economy/standard/premium model tiers. Free models slot into this naturally:

```typescript
// Extension to existing ClawRouter presets
const FREE_TIER_ROUTING = {
  'max-speed': {
    economy: 'groq/llama-3.1-8b-instant',           // Sub-second, 14,400 RPD
    standard: 'groq/llama-3.3-70b-versatile',       // Fast + capable (reserve quota)
    premium: 'cerebras/qwen3-235b-a22b',             // Best free reasoning
  },
  'balanced': {
    economy: 'groq/llama-3.1-8b-instant',            // Speed workhorse
    standard: 'openrouter/llama-3.3-70b-instruct:free', // Solid all-rounder
    premium: 'openrouter/deepseek/deepseek-r1-0528:free', // Strong reasoning
  },
  'max-quality': {
    economy: 'openrouter/llama-3.3-70b-instruct:free',
    standard: 'cerebras/qwen3-235b-a22b',            // Large MoE
    premium: 'openrouter/deepseek/deepseek-r1-0528:free', // Best free reasoning
  },
};
// Note: Google Gemini added to 'research' preset in Phase 1.5 only
```

**Fallback chain** (with redundancy — try alternative models within same provider before moving on):

```
Groq/8B (fastest) → Groq/70B (quality) → OpenRouter/Llama:free → OpenRouter/DeepSeek:free
  → Cerebras/Llama → Cerebras/Qwen → Workers AI (edge fallback) → Quota Exhausted
```

Each provider gets TWO shots with different models before the chain moves on. This maximizes utilization of each provider's separate model quotas.

### 3.6 SSRF Allowlist Updates

Phased additions to `LLM_ALLOWED_HOSTS`:

```typescript
// Phase 1 MVP (Groq + OpenRouter)
'openrouter.ai',
'api.groq.com',

// Phase 1.5 (Cerebras)
'api.cerebras.ai',

// Phase 2 (Google AI, if quotas stabilize)
'generativelanguage.googleapis.com',

// Workers AI doesn't need SSRF allowlist (native binding)
```

---

## 4. Onboarding Funnel — The "Zero to Chat" Experience

### 4.1 User Journey

```
1. User arrives at Storia → sees landing page
2. Signs up (email + password, no API key required)
3. Zori greets: "Hey! You can start chatting RIGHT NOW with free AI models! 🦎⚡"
4. User enters first message → routed to Llama 3.3 70B on Groq (fastest)
5. ClawRouter badge shows: "🆓 Free Tier · Groq · Llama 3.3 70B · 42/50 daily requests left"
6. After ~10 messages, Vex nudges: "You've used 10 of your 50 daily free messages.
   Add your own API key for unlimited access → Settings"
7. User eventually adds BYOK keys → graduates to full platform
```

### 4.2 UI Components

#### Free Model Badge (extend existing ClawRouterBadge)

The existing `ClawRouterBadge.tsx` already shows model name, tier, and savings. Extend it with:

- 🆓 "Free" badge when using platform-provided free models
- Remaining quota counter: "38/50 requests today"
- ⚠️ Data training warning icon for Google AI Studio models
- Upgrade CTA: "Add your API key for unlimited access"

#### Model Selector — Free Section

```
┌──────────────────────────────────────────────┐
│ Choose Model                                  │
│                                               │
│ 🆓 FREE MODELS (no API key needed)           │
│  ├── Llama 3.1 8B     [Groq]     ⚡ Fastest  │
│  ├── Llama 3.3 70B    [Groq]     🏆 Quality  │
│  ├── DeepSeek R1       [OpenRouter] 🧠 Smart  │
│  ├── Qwen3 Coder      [OpenRouter] 💻 Code    │
│  └── + 20 more free models...                │
│                                               │
│ 🔑 YOUR MODELS (BYOK)                        │
│  ├── Claude 4.5 Sonnet  [Anthropic]          │
│  ├── GPT-5.2            [OpenAI]             │
│  └── Add API key...                          │
│                                               │
│ ℹ️ Free models have daily limits. Add your    │
│    own API keys for unlimited, premium access │
└──────────────────────────────────────────────┘
```

#### Quota Dashboard (extend SavingsWidget in SitMon)

```
┌──────────────────────────────────────────────┐
│ Free Tier Usage Today                         │
│                                               │
│ OpenRouter  ████████░░░░░░░░  8/10 requests  │
│ Groq        ██████░░░░░░░░░░  32/50 requests │
│ Cerebras    ██░░░░░░░░░░░░░░  12/100 requests│
│ Google AI   ░░░░░░░░░░░░░░░░  0/25 requests  │
│                                               │
│ Resets in: 6h 42m                             │
│                                               │
│ 💡 Vex says: "Add your own Groq key ($0 -    │
│    they're free!) and get 14,400 req/day      │
│    instead of 50. Obviously more efficient."  │
└──────────────────────────────────────────────┘
```

### 4.3 Gecko Nudge Strategy

The geckos should naturally encourage BYOK adoption without being pushy. Nudges trigger at specific quota thresholds:

| Trigger | Gecko | Message |
|---------|-------|---------|
| First message (free tier) | Zori | "Welcome! You're using Llama 3.3 70B for FREE! I'm so excited! 🦎" |
| 50% quota used | Kai | "You're flowing well today. Free models refresh tomorrow, or you can add your own keys in Settings for unlimited." |
| 80% quota used | Vex | "Logically, you should know: you have 10 free requests left today. Adding a Groq API key (free to create) gives you 14,400/day. The math is clear." |
| Quota exhausted | Razz | "You've hit the daily limit! 🔥 Two options: wait until tomorrow, or add your API key RIGHT NOW and keep going. I'd go with option 2." |
| After 3 days of free usage | Kai | "You've been using Storia for 3 days now. Here's a guide to getting your own API keys—many providers are free or very cheap." |

---

## 5. User Archetypes & Routing Intelligence

The free tier serves two fundamentally different user types with opposing needs. Routing them to the same models wastes quota and degrades experience for both. This section defines archetype-aware routing — the strategic layer that makes Storia's free tier feel premium despite costing $0.

### 5.1 The Two Archetypes

#### Archetype A: "Conversational" (~70-80% of free-tier DAU)

The majority. They use AI for quick chat, coaching, shopping advice, brainstorming, emotional check-ins, productivity tips, language practice, casual Q&A.

| Attribute | Value |
|-----------|-------|
| **Latency tolerance** | Very low — sub-2s mandatory, sub-1s ideal. They bounce if it feels laggy. |
| **Quality needs** | "Good enough" is fine. Templates + memory + persona deliver 80-90% of value. |
| **Message pattern** | Short, frequent, casual. 10-50 messages/session. Rarely exceeds 200 tokens/message. |
| **Model sweet spot** | 8B-27B class: Groq Llama 3.1 8B, Gemma 3 12B/27B, Mistral Small 3.2 |
| **Token cost per session** | ~2K-10K tokens (cheap) |
| **Conversion path** | Hits daily request quota → upgrades for unlimited chat volume |
| **Gecko fit** | Full personality shines here — Zori's energy, Kai's calm coaching. But save tokens: use pre-written persona templates, not dynamic generation. |

#### Archetype B: "Vibe Coder / Deep Thinker" (~20-30% of free-tier DAU)

The power users. They use AI for coding, debugging, architecture review, long document analysis, math reasoning, multi-step planning, content creation with iteration.

| Attribute | Value |
|-----------|-------|
| **Latency tolerance** | Very high — 30s-5min acceptable. Even longer for big refactors if quality is excellent. |
| **Quality needs** | Critical. Accuracy and depth over speed. A wrong code suggestion wastes more time than waiting. |
| **Message pattern** | Long, complex, fewer per session. 5-15 messages but 500-2000+ tokens each. Code blocks, file pastes. |
| **Model sweet spot** | 70B+, MoE: DeepSeek R1, Qwen3 235B/Coder 480B, Hermes 405B, Llama 3.3 70B |
| **Token cost per session** | ~20K-200K tokens (expensive) |
| **Conversion path** | Hits daily token/quality limits → upgrades for premium models (Claude, GPT-5) + unlimited depth |
| **Gecko fit** | Vex's efficiency and Razz's action bias work here. Minimal personality overhead — they want results, not banter. |

### 5.2 Archetype Detection — The Classifier

The existing ClawRouter heuristic classifier (regex/keyword + token count) can be extended with archetype detection. This doesn't need ML — simple signals are enough:

```typescript
// src/lib/free-router/archetype-detector.ts

type UserArchetype = 'conversational' | 'deep-thinker' | 'unknown';

interface ArchetypeSignals {
  messageLength: number;          // Token count of current message
  hasCodeBlocks: boolean;         // ```...``` or indented code
  hasTechnicalTerms: boolean;     // regex: /refactor|debug|deploy|function|class|API|regex|SQL|.../ 
  hasFileReferences: boolean;     // paths, filenames, extensions
  sessionMessageCount: number;    // How many messages so far this session
  avgMessageLength: number;       // Running average for this session
  hasReasoningMarkers: boolean;   // "step by step", "think about", "analyze", "compare"
  hasCasualMarkers: boolean;      // "hey", "thanks", "lol", "help me with", short questions
}

function detectArchetype(signals: ArchetypeSignals): UserArchetype {
  let deepScore = 0;
  let casualScore = 0;

  // Message length is the strongest single signal
  if (signals.messageLength > 300) deepScore += 3;
  else if (signals.messageLength < 50) casualScore += 3;

  // Code blocks are near-definitive
  if (signals.hasCodeBlocks) deepScore += 5;

  // Technical vocabulary
  if (signals.hasTechnicalTerms) deepScore += 2;
  if (signals.hasFileReferences) deepScore += 2;

  // Reasoning markers
  if (signals.hasReasoningMarkers) deepScore += 2;

  // Casual markers
  if (signals.hasCasualMarkers) casualScore += 2;

  // Session pattern: many short messages = conversational
  if (signals.sessionMessageCount > 8 && signals.avgMessageLength < 80) casualScore += 2;

  // Session pattern: few long messages = deep thinker
  if (signals.sessionMessageCount < 5 && signals.avgMessageLength > 200) deepScore += 2;

  if (deepScore >= 5) return 'deep-thinker';
  if (casualScore >= 4) return 'conversational';
  return 'unknown'; // Default to conversational routing (safer, faster)
}
```

**Key principle**: When in doubt, route conversational. It's faster and cheaper. A conversational user getting a fast response is happy. A deep thinker getting a fast-but-shallow response will naturally rephrase or switch to "Deep Mode" (UI toggle).

### 5.3 Archetype-Aware Routing Tables

This replaces the flat task-type routing from v1.1 with a two-track system:

```typescript
// src/lib/free-router/archetype-routing.ts

const CONVERSATIONAL_ROUTING = {
  // Optimized for: speed, low token cost, high daily quota
  'max-speed': {
    economy:  'groq/llama-3.1-8b-instant',           // Sub-second, 14,400 RPD
    standard: 'groq/llama-3.1-8b-instant',           // Still fast — don't waste 70B quota on chat
    premium:  'groq/llama-3.3-70b-versatile',        // Only for complex conversational
  },
  'balanced': {
    economy:  'groq/llama-3.1-8b-instant',
    standard: 'openrouter/google/gemma-3-27b-it:free', // Good mid-range
    premium:  'openrouter/llama-3.3-70b-instruct:free',
  },
  'max-quality': {
    economy:  'openrouter/google/gemma-3-27b-it:free',
    standard: 'openrouter/llama-3.3-70b-instruct:free',
    premium:  'openrouter/llama-3.3-70b-instruct:free', // Ceiling for conversational
  },
};

const DEEP_THINKER_ROUTING = {
  // Optimized for: quality, depth, large context windows
  // Latency budget: 30s-300s acceptable
  'max-speed': {
    economy:  'groq/llama-3.3-70b-versatile',        // Fast but capable
    standard: 'groq/qwen/qwen3-32b',                 // Good reasoning
    premium:  'cerebras/qwen3-235b-a22b',             // Best quality at speed
  },
  'balanced': {
    economy:  'openrouter/llama-3.3-70b-instruct:free',
    standard: 'openrouter/deepseek/deepseek-r1-0528:free', // Chain-of-thought
    premium:  'openrouter/nousresearch/hermes-3-llama-3.1-405b:free', // Largest free instruct
  },
  'max-quality': {
    economy:  'openrouter/deepseek/deepseek-chat-v3.1:free',
    standard: 'openrouter/deepseek/deepseek-r1-0528:free',
    premium:  'cerebras/qwen/qwen3-coder-480b',      // Largest free model (100 RPD)
  },
};

// Coding-specific override (sub-archetype of deep-thinker)
const CODING_ROUTING = {
  economy:  'openrouter/qwen/qwen3-coder:free',
  standard: 'openrouter/mistralai/devstral-2:free',   // Mistral's coding agent model
  premium:  'cerebras/qwen/qwen3-coder-480b',
};
```

### 5.4 UI: "Quick Chat" vs "Deep Mode" Toggle

Auto-detection handles most cases, but power users should be able to explicitly choose:

```
┌──────────────────────────────────────────────┐
│ [Chat input field...                       ] │
│                                              │
│ ⚡ Quick Chat          🧠 Deep Mode          │
│  └ Fast, conversational  └ Coding, reasoning │
│    Sub-second replies      May take 30s-5min │
│    Uses: Llama 8B-70B      Uses: DeepSeek R1 │
│                              Qwen3 235B/Coder│
│                                              │
│ Current: ⚡ Auto (detecting...)              │
└──────────────────────────────────────────────┘
```

**Behavior**:
- Default: "Auto" — archetype detector routes dynamically per message
- User clicks "Deep Mode" → locks all messages to deep-thinker routing for this session
- User clicks "Quick Chat" → locks to conversational routing
- Deep Mode shows a progress indicator: "🧠 Brewing deep insights..." (sets expectation for latency)

### 5.5 The Flywheel: How Archetypes Feed Each Other

```
Conversational users (70-80%)          Vibe coders (20-30%)
        │                                      │
        │ High volume, low cost                │ High engagement, willing to pay
        │ per user (~2K-10K tokens)            │ per user (~20K-200K tokens)
        │                                      │
        ▼                                      ▼
   Viral word-of-mouth              BYOK conversion + Pro upgrades
   "Free AI that actually works"    "Better than $20/mo subscriptions"
        │                                      │
        └──────────────┬───────────────────────┘
                       │
                       ▼
              More users → more data on routing quality
              → better archetype detection → better UX
              → more word-of-mouth → more users
```

**Monetization alignment — three tiers, not two**:

| Tier | Price | Target Archetype | What They Get |
|------|-------|-----------------|---------------|
| **Free** | $0 | Conversational (majority) | 20-30 free models, daily quota limits, minimal gecko personality, Quick Chat routing |
| **Deep Mode** | $3-5/mo | Vibe coders (entry) | Unlimited deep-thinker routing, higher daily token budget (500K+), full gecko personality, priority queue on Cerebras/OR, access to Hermes 405B + Devstral 2 via platform keys |
| **Pro (BYOK+)** | $9/mo | Power users (both archetypes) | Everything in Deep Mode + premium model access via own keys, zero markup, ClawRouter full features, SitMon Pro, Project Memory unlimited |

**Why $3-5/mo Deep Mode matters**: Vibe coders already pay $10-20/mo for tools (Cursor, GitHub Copilot, ChatGPT Plus). A $3-5 tier that gives them unlimited access to 70B+ free models with smart routing is an instant decision — less than a coffee. It captures revenue from users who won't bother setting up BYOK keys but want more than the free tier. The margin is nearly pure profit since the models are free — we're selling routing intelligence and convenience.

**Conversion funnel**:
```
Free (conversational) → stays free, provides volume
Free (deep thinker) → hits token limits → Deep Mode ($3-5/mo) → power user → Pro/BYOK ($9/mo)
```

The casual users subsidize nothing (they're essentially free to serve). Deep Mode captures the "willing to pay a little" segment that BYOK misses. Pro captures the power users who want full control.

### 5.6 Archetype-Aware Quota Budgeting

Different archetypes should burn quota differently:

```typescript
const QUOTA_WEIGHTS = {
  'conversational': {
    // Each request costs 1 "quota unit" — they make many cheap requests
    requestWeight: 1,
    // But their total token budget per day is capped lower
    dailyTokenBudget: 50_000,
  },
  'deep-thinker': {
    // Each request costs 3 "quota units" — fewer but more expensive
    requestWeight: 3,
    // Higher token budget (they need it for code/long context)
    dailyTokenBudget: 200_000,
  },
};
```

This means a conversational user might get 50 requests/day at ~1K tokens each, while a deep thinker gets ~17 "equivalent requests" but with much larger token allowances per request. Both feel like they have enough — but the platform's actual token spend stays controlled.

### 5.7 Provider Fallback Chains (Archetype-Aware)

When a provider is rate-limited or down, the FreeModelRouter cascades through alternatives — but the fallback chain differs by archetype:

```typescript
const FALLBACK_CHAINS = {
  'conversational': [
    // Priority: speed, then breadth, then edge
    'groq/llama-3.1-8b-instant',
    'groq/llama-3.3-70b-versatile',
    'openrouter/google/gemma-3-27b-it:free',
    'openrouter/llama-3.3-70b-instruct:free',
    'cloudflare/llama-3.3-70b-instruct-fp8',    // Edge fallback
  ],
  'deep-thinker': [
    // Priority: quality, then reasoning, then depth
    'openrouter/deepseek/deepseek-r1-0528:free',
    'openrouter/nousresearch/hermes-3-llama-3.1-405b:free', // Largest free instruct model
    'cerebras/qwen3-235b-a22b',
    'openrouter/deepseek/deepseek-chat-v3.1:free',
    'groq/llama-3.3-70b-versatile',
    'openrouter/llama-3.3-70b-instruct:free',
  ],
  'coding': [
    // Priority: code quality, then depth
    'openrouter/qwen/qwen3-coder:free',
    'openrouter/mistralai/devstral-2:free',              // Mistral's coding agent
    'openrouter/deepseek/deepseek-chat-v3.1:free',
    'cerebras/qwen/qwen3-coder-480b',
    'groq/qwen/qwen3-32b',
    'openrouter/llama-3.3-70b-instruct:free',            // General fallback
  ],
};
```

Each chain gets TWO shots with different models within the same provider before moving on, maximizing per-provider quota utilization.

### 5.8 Prompt Optimization by Archetype

Free tiers are rate-limited, so each request must be maximally effective. The optimization strategy differs by archetype:

**Conversational users**:
- Ultra-compressed system prompts (~15 tokens, no gecko personality overhead)
- Semantic caching is highly effective — repetitive coaching questions hit cache 30-60% of the time
- Pre-written persona templates make 8B models feel premium without dynamic generation
- Memory/RAG layer provides continuity across sessions cheaply (see §5.10)

```typescript
const CONVERSATIONAL_SYSTEM = `You are a helpful AI assistant on Storia.Digital.
Respond concisely and naturally.`; // ~15 tokens
```

**Deep thinkers**:
- Fuller system prompts OK (they use fewer, larger requests anyway)
- Batch multi-step coding tasks into single calls when possible (plan → code → test)
- No caching — each request is unique enough that cache hits are rare
- Pre-format code context to minimize wasted tokens (strip comments, collapse whitespace)

```typescript
const DEEP_THINKER_SYSTEM = `You are a senior developer assistant on Storia.Digital.
Think step by step. Show your reasoning. Provide complete, working code.
If the task is complex, break it into phases and implement each.`; // ~40 tokens
```

### 5.9 Hybrid Free + BYOK Strategy

Users with some API keys can mix free and paid models — and archetype awareness makes this smarter:

- **Conversational + BYOK**: Free tier handles 90% of their chat. BYOK keys only used when they explicitly pick a premium model or hit free quota.
- **Deep thinker + BYOK**: Free tier handles drafts/planning. BYOK keys used for final code generation, complex reasoning, or when they switch to Claude/GPT-5 for quality-critical work.

Show savings in the Cockpit SavingsWidget: "You saved $0.12 by using free Llama 3.3 for drafting instead of Claude Sonnet. Final version used your Anthropic key."

### 5.10 Memory & RAG Layer — Making Cheap Models Feel Premium

The biggest amplifier for free-tier quality isn't a better model — it's context. An 8B model with good memory and relevant context outperforms a 70B model with none. This is especially true for conversational users who return daily with the same themes (fitness, habits, projects).

**Architecture: Pinecone Free Tier + D1 hybrid**

Pinecone's free tier (as of Feb 2026) offers:
- 1 index, 2GB storage, ~100K vectors with 1536 dimensions
- No credit card required, generous for a small-to-medium user base
- Serverless, no infrastructure to manage

This is more than enough for Storia's free-tier memory layer. Each user's conversation summaries and key facts get embedded and stored as vectors. On each new message, query Pinecone for top-k relevant past context and inject it into the system prompt.

```typescript
// src/lib/free-router/memory-rag.ts

interface UserMemoryEntry {
  userId: string;
  embedding: number[];       // 1536-dim from a free embedding model
  text: string;              // Summarized conversation chunk
  metadata: {
    timestamp: string;
    topic: string;           // Auto-tagged: 'fitness', 'coding', 'shopping', etc.
    archetype: string;       // Which archetype was active when this was stored
  };
}

// Embedding options (all free):
// 1. Cloudflare Workers AI: @cf/baai/bge-base-en-v1.5 (768-dim, edge-native, zero cost)
// 2. OpenRouter: free embedding models when available
// 3. Pinecone inference API: built-in embedding (simplest, no extra provider)

async function getRelevantContext(
  userId: string,
  currentMessage: string,
  topK: number = 3
): Promise<string[]> {
  const embedding = await generateEmbedding(currentMessage);
  const results = await pinecone.query({
    vector: embedding,
    topK,
    filter: { userId },
    includeMetadata: true,
  });
  return results.matches.map(m => m.metadata.text);
}

// Inject into system prompt (adds ~100-200 tokens, huge quality boost)
function buildContextualPrompt(
  basePrompt: string,
  relevantContext: string[]
): string {
  if (relevantContext.length === 0) return basePrompt;
  return `${basePrompt}
Relevant context from past conversations:
${relevantContext.map(c => `- ${c}`).join('\n')}`;
}
```

**Cost breakdown**:
- Pinecone: $0/mo (free tier)
- Embeddings: $0/mo (Workers AI or Pinecone inference)
- D1 for metadata/index: $0/mo (free tier)
- Quality uplift: Massive — returning users feel "remembered" even on 8B models

**Per-archetype memory strategy**:
- **Conversational**: Heavy memory usage. Store conversation summaries, user preferences, recurring topics. Cache frequent queries. This is where memory matters most — coaching and personal AI live or die on continuity.
- **Deep thinker**: Lighter memory. Store project context, code preferences, past architectural decisions. Don't cache — their queries are too unique. Instead, offer explicit "pin this context" for repo/project details.

**Fallback without Pinecone**: If Pinecone is unavailable or not yet implemented, fall back to D1 + simple keyword matching (existing Project Memory pattern). Lower quality but functional. Pinecone is a Phase 1.5 enhancement, not a Phase 1 blocker.

**Future upgrade path**: When Cloudflare Vectorize leaves beta and pricing stabilizes, migrate from Pinecone to Vectorize for a fully edge-native stack. The abstraction layer in `memory-rag.ts` makes this a provider swap, not a rewrite.

---

## 6. Data Training Transparency

**Non-negotiable**: Storia's trust-first philosophy requires full transparency about which free providers use data for training.

### 6.1 Provider Training Policies

| Provider | Uses Data for Training? | Opt-Out Available? |
|----------|------------------------|--------------------|
| OpenRouter (free) | No (per provider ToS) | N/A |
| Groq | No | N/A |
| Cerebras | Unclear (no explicit policy) | Unknown |
| Google AI Studio | **Yes** (outside UK/CH/EEA/EU) | No (free tier only) |
| Mistral (Experiment) | **Yes** (opted in by default) | No (Experiment plan requires it) |
| Cloudflare Workers AI | No | N/A |
| Cohere | No (trial/production) | N/A |

### 6.2 UI Disclosure

Models from providers that use data for training must show a persistent warning:

```
⚠️ This free model may use your conversations for training.
   Your data is not encrypted or private on this provider.
   [Use a different free model] [Add your own key]
```

The warning should be:
- Shown in the model selector next to affected models
- Shown in the ClawRouter badge when an affected model is active
- Dismissable per session but re-shown on new sessions
- Linkable to a detailed explanation page

### 6.3 Geographic Handling

For Google AI Studio specifically, if Storia has access to user location (from ipapi integration planned in Free APIs catalog), it can auto-select:

- EU/UK/CH users → Google AI Studio is safe (no training)
- Other users → Show warning, or prefer non-Google free models by default

---

## 7. Model Playground Integration (Phase 2)

The planned Model Playground becomes significantly more powerful with free models—users can benchmark models without spending anything.

### 7.1 "Free Model Arena"

```
┌──────────────────────────────────────────────┐
│ 🏟️ Free Model Arena                          │
│                                               │
│ Compare free models side-by-side. No API      │
│ keys needed. Find your favorite, then go BYOK │
│ for unlimited access.                         │
│                                               │
│ Prompt: "Explain quantum computing simply"    │
│                                               │
│ ┌─────────────────┐ ┌─────────────────┐      │
│ │ Llama 3.3 70B   │ │ Gemini 2.5 Flash│      │
│ │ via Groq         │ │ via Google AI   │      │
│ │ ⚡ 0.8s          │ │ ⚡ 1.2s          │      │
│ │                  │ │                 │      │
│ │ [response...]    │ │ [response...]   │      │
│ │                  │ │                 │      │
│ │ 👍 👎            │ │ 👍 👎           │      │
│ └─────────────────┘ └─────────────────┘      │
│                                               │
│ 📊 Community votes: Llama wins 62% of matches│
└──────────────────────────────────────────────┘
```

### 7.2 "BYOK Savings Calculator"

Show users exactly what they'd pay with their own keys versus what they get free:

```
┌──────────────────────────────────────────────┐
│ 💰 What would today cost with BYOK?          │
│                                               │
│ Your 47 free messages today would have cost:  │
│  • $0.00 with Groq (free tier, own key)      │
│  • $0.03 with DeepSeek V3 (own key)          │
│  • $0.18 with Claude Sonnet (own key)        │
│  • $0.42 with GPT-5.2 (own key)             │
│                                               │
│ Tip: Many providers offer free API keys!      │
│ Groq, Google AI, Mistral—all free to start.  │
│ [Get Free API Keys Guide]                    │
└──────────────────────────────────────────────┘
```

---

## 8. Implementation Roadmap

### Phase 1: MVP Free Tier — Groq + OpenRouter Only (6-8h) — Target: Beta Launch

| Task | Effort | Owner | Priority |
|------|--------|-------|----------|
| Create `src/lib/free-router/` module (types, config, router) | 2h | Claude | 🔴 HIGH |
| Add `free_model_quotas` D1 migration + platform-wide caps | 1h | Claude | 🔴 HIGH |
| Integrate FreeModelRouter into `/api/llm-proxy/route.ts` | 2h | Claude | 🔴 HIGH |
| Add platform API keys to wrangler secrets (Groq + OR only) | 0.5h | PetrAnto | 🔴 HIGH |
| Extend ClawRouterBadge with free tier indicator + quota counter | 1h | Claude | 🔴 HIGH |
| Basic quota check endpoint `GET /api/free-tier/quota` | 0.5h | Claude | 🔴 HIGH |
| Buy OpenRouter $10 lifetime top-up (50 → 1,000 RPD) | $10 | PetrAnto | 🔴 HIGH |
| **FreeModelWatcher MVP**: cron probe + D1 logging + emergency core | 4h | Claude | 🔴 HIGH |
| **Graceful 404/429 auto-disable** in FreeModelRouter | 1h | Claude | 🔴 HIGH |

**MVP outcome**: New users chat immediately. Quota tracking prevents abuse. **Watcher auto-disables broken models and falls back silently.** PetrAnto doesn't need to monitor anything day-to-day.

### Phase 1.5: Expand Providers + Watcher Intelligence + Memory (8-12h) — Target: 2-4 weeks after beta

| Task | Effort | Owner | Priority |
|------|--------|-------|----------|
| Add Cerebras to FreeModelRouter (OpenAI-compatible) | 2h | Claude | 🟡 MEDIUM |
| **Full confidence scoring engine** (§10.4) | 3h | Claude | 🟡 MEDIUM |
| **Discovery auto-fetch** from provider /models APIs (§10.2) | 2h | Claude | 🟡 MEDIUM |
| **Moltbot alert integration** (§10.7) | 1h | Claude | 🟡 MEDIUM |
| **Pinecone free-tier integration** for memory/RAG (§5.10) | 3h | Claude | 🟡 MEDIUM |
| **Archetype detector** — classifier + "Quick Chat" / "Deep Mode" toggle (§5.2, §5.4) | 2h | Claude | 🟡 MEDIUM |
| Quota display widget in Cockpit | 1.5h | Codex | 🟡 MEDIUM |
| cheahjs repo RSS feed → SitMon (§10.10) | 0.5h | Claude | 🟢 LOW |

**Phase 1.5 outcome**: System auto-discovers new free models, scores them, promotes/demotes without human intervention. Memory layer makes 8B models feel premium for returning users. Archetype-aware routing gives conversational users sub-second speed and vibe coders deep reasoning.

### Phase 2: Full Experience + Deep Mode Tier + Admin (16-22h) — Target: Post-Beta

| Task | Effort | Owner | Priority |
|------|--------|-------|----------|
| **Deep Mode tier** ($3-5/mo) — Stripe integration, tier-based routing/quotas (§5.5) | 4h | Claude | 🟡 MEDIUM |
| Google AI Studio adapter (if quotas stabilize) | 8-10h | Claude | 🟡 MEDIUM |
| Free Model Arena in Model Playground | 6h | Claude + Codex | 🟡 MEDIUM |
| Gecko nudge system (quota-based triggers) | 3h | Claude | 🟡 MEDIUM |
| BYOK Savings Calculator widget | 2h | Codex | 🟡 MEDIUM |
| Data training transparency warnings (full UI) | 2h | Claude | 🟡 MEDIUM |
| "Get Free API Keys" guide page | 2h | Codex | 🟡 MEDIUM |
| **Admin: Watcher dashboard** (model list, scores, probe history, events) | 4h | Claude | 🟡 MEDIUM |
| **Admin: Manual override UI** (force-enable/disable, edit known issues) | 2h | Claude | 🟢 LOW |

### Phase 3: Advanced Optimization (12-18h) — Target: Post-Launch

| Task | Effort | Owner | Priority |
|------|--------|-------|----------|
| Semantic response caching (D1 + Pinecone embeddings) | 4h | Claude | 🟢 LOW |
| Community model voting/ratings | 4h | Claude + Codex | 🟢 LOW |
| Auto-scale per-user quotas based on total user count | 2h | Claude | 🟢 LOW |
| Migrate Pinecone → Cloudflare Vectorize (if pricing stabilizes) | 3h | Claude | 🟢 LOW |
| Archetype ML classifier (replace regex with lightweight model) | 4h | Claude | 🟢 LOW |

---

## 9. Monitoring & Abuse Prevention

### 9.1 Platform Key Protection

Platform-provided API keys are a shared resource. Abuse vectors:

| Threat | Mitigation |
|--------|------------|
| Single user exhausting daily quota | Per-user D1 quota tracking with hard limits |
| Platform-wide quota burn | Platform-wide daily caps per provider (§3.4) — stop routing at 70-80% utilization |
| Scripted/automated abuse | Cloudflare rate limiting (already deployed) + **CAPTCHA on signup** (Turnstile, free) |
| Bulk account creation | Email verification + optional phone verify for elevated free-tier limits |
| API key extraction via client | Keys stay server-side only—never sent to frontend |
| Free tier cost spiral | Env var caps per provider; PagerDuty/email alert on 80% platform-wide usage |
| Anonymous session abuse | Signed cookie + IP fingerprint; max 3-5 req/session before forced signup |

### 9.2 Monitoring Dashboard (for PetrAnto)

Track via existing SitMon or separate admin panel:

**Critical metrics (check daily during beta)**:
- Per-provider utilization % (are we hitting platform-wide caps?)
- Provider error rates, 429s, and latency (early warning for quota cuts)
- Per-user usage distribution (is anyone dominating?)
- **Conversion rate: free tier → BYOK** (the key business metric)

**Secondary metrics (check weekly)**:
- Total free-tier requests/day (all users combined)
- Model-level usage distribution (which free models are most popular?)
- Fallback chain trigger frequency (how often does primary provider fail?)
- Average requests before BYOK conversion (how many free messages until users add keys?)

**Alerts** (automated):
- Provider utilization > 70%: Warning to PetrAnto
- Provider utilization > 90%: Auto-reduce per-user allocations by 20%
- Provider returning > 10% error rate: Flag for investigation
- New user conversion rate < 5%: Review onboarding funnel

### 9.3 Cost Projections

Free tier costs to Storia: **$10 one-time + $0/month ongoing** for API calls.

| Cost Item | Amount | Frequency | ROI |
|-----------|--------|-----------|-----|
| OpenRouter $10 lifetime top-up | $10 | **One-time (do in Phase 1)** | 20x daily limit (50 → 1,000 RPD) |
| Groq API key | $0 | Free | 14,400 RPD on 8B models |
| Cerebras API key | $0 | Free | 14,400 RPD, 1M tokens/day |
| D1 storage for quotas | $0 | Free tier covers it | Negligible rows |
| Workers compute for routing | $0 | Already in existing proxy | No incremental cost |

The $10 OpenRouter top-up is the single best investment in the entire spec. Do it before beta launch. Total platform cost for free tier: **$10 forever.**

---

## 10. Automated Maintenance & Self-Healing

**Design goal**: PetrAnto spends **zero hours per week** on free-tier maintenance once the system is tuned. The platform discovers, validates, activates, and deactivates free models autonomously, with alerts only for decisions that require human judgment (privacy policy changes, major provider shutdowns).

### 10.1 Architecture — The FreeModelWatcher

A Cloudflare Workers Cron Trigger (free tier supports 5 cron triggers) runs every 6 hours, performing three jobs: Discovery, Health Probing, and Self-Healing.

```
┌─────────────────────────────────────────────────────────────┐
│ FreeModelWatcher (Cron Trigger — every 6h)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ 1. Discovery  │  │ 2. Probing   │  │ 3. Self-Healing   │  │
│  │               │  │              │  │                   │  │
│  │ Fetch model   │→│ Send test    │→│ Score + activate/ │  │
│  │ lists from    │  │ prompt to    │  │ deactivate models │  │
│  │ provider APIs │  │ each model   │  │ + alert on drift  │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│                          │                     │             │
│                          ▼                     ▼             │
│                   ┌────────────┐      ┌──────────────────┐  │
│                   │ D1: probes │      │ D1: model_registry│  │
│                   │ (history)  │      │ (active/staged)   │  │
│                   └────────────┘      └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │ Alerts (only on      │
              │ human-needed events) │
              │  • Telegram bot      │
              │  • SitMon dashboard  │
              └──────────────────────┘
```

**Location**: `src/lib/free-router/watcher.ts` + `src/workers/free-model-watcher.ts` (Cron Trigger)

### 10.2 Job 1: Discovery — Fetching Available Free Models

Every 6 hours, the watcher queries provider APIs for currently available free models.

```typescript
// src/lib/free-router/discovery.ts

interface DiscoveredModel {
  providerId: string;
  modelId: string;
  displayName: string;
  contextWindow: number;
  pricing: { prompt: number; completion: number }; // $0 = free
  capabilities: string[];
  lastSeen: string; // ISO date
}

const DISCOVERY_SOURCES = {
  openrouter: {
    // OpenRouter exposes all models with pricing via API
    url: 'https://openrouter.ai/api/v1/models',
    filter: (model: any) => {
      const promptPrice = parseFloat(model.pricing?.prompt ?? '1');
      const completionPrice = parseFloat(model.pricing?.completion ?? '1');
      return promptPrice === 0 && completionPrice === 0;
    },
    // Also check: openrouter.ai/api/v1/models?supported_parameters=tools
    // for tool-calling support filtering
  },
  groq: {
    // Groq exposes models via OpenAI-compatible endpoint
    url: 'https://api.groq.com/openai/v1/models',
    // All Groq models are currently free — filter by active status
    filter: (model: any) => model.active !== false,
  },
  cerebras: {
    url: 'https://api.cerebras.ai/v1/models',
    filter: (model: any) => true, // All currently free
  },
};

async function discoverFreeModels(): Promise<DiscoveredModel[]> {
  const discovered: DiscoveredModel[] = [];
  for (const [providerId, source] of Object.entries(DISCOVERY_SOURCES)) {
    try {
      const res = await fetch(source.url, {
        headers: { Authorization: `Bearer ${getProviderKey(providerId)}` },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const models = (data.data || data).filter(source.filter);
      discovered.push(...models.map(m => normalize(providerId, m)));
    } catch (e) {
      // Log failure, don't crash — other providers still run
      logDiscoveryError(providerId, e);
    }
  }
  return discovered;
}
```

**OpenRouter special case**: OpenRouter also provides a meta-route `openrouter/auto` that auto-selects the best free model. The watcher should track which model `auto` resolves to, as this reflects OpenRouter's own quality ranking.

### 10.3 Job 2: Health Probing — Validating Models Actually Work

Discovery tells us what *should* be available. Probing tells us what *actually works right now*.

```typescript
// src/lib/free-router/prober.ts

interface ProbeResult {
  modelId: string;
  providerId: string;
  success: boolean;
  latencyMs: number;
  errorCode?: number;       // 404, 429, 403, 500, etc.
  errorMessage?: string;
  respondedModelId?: string; // What model actually responded (detect aliases)
  timestamp: string;
}

const PROBE_PROMPT = {
  model: '', // set per-probe
  messages: [{ role: 'user', content: 'Respond with exactly one word: OK' }],
  max_tokens: 5,
  temperature: 0,
};

async function probeModel(
  providerId: string,
  modelId: string
): Promise<ProbeResult> {
  const start = Date.now();
  try {
    const res = await fetch(getEndpoint(providerId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getProviderKey(providerId)}`,
      },
      body: JSON.stringify({ ...PROBE_PROMPT, model: modelId }),
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return {
        modelId, providerId, success: false,
        latencyMs, errorCode: res.status,
        errorMessage: await res.text().catch(() => ''),
        timestamp: new Date().toISOString(),
      };
    }

    const data = await res.json();
    return {
      modelId, providerId, success: true,
      latencyMs,
      respondedModelId: data.model, // Detect silent model swaps
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    return {
      modelId, providerId, success: false,
      latencyMs: Date.now() - start,
      errorMessage: e instanceof Error ? e.message : 'Unknown',
      timestamp: new Date().toISOString(),
    };
  }
}
```

**Probe budget**: Each probe costs 1 free-tier request. With ~30 models across 3 providers, that's ~30 requests/probe cycle × 4 cycles/day = ~120 requests/day on the platform keys. Use the lowest-limit key (OpenRouter) sparingly — probe only the top 5-8 OpenRouter models, not all 30+. Groq and Cerebras have enough headroom to probe all models.

### 10.4 Job 3: Self-Healing — Confidence Scoring & Auto-Management

Each model gets a **confidence score** (0-100) that determines its routing status.

```typescript
// src/lib/free-router/scorer.ts

function calculateScore(
  model: DiscoveredModel,
  recentProbes: ProbeResult[],    // Last 24h of probes
  knownIssues: KnownIssue[],      // Privacy, deprecation flags
): { score: number; status: 'active'|'staged'|'disabled'; reasons: string[] } {

  let score = 50; // Base score for any discovered model
  const reasons: string[] = [];

  // === Positive signals ===
  const successRate = recentProbes.filter(p => p.success).length
    / Math.max(recentProbes.length, 1);
  if (successRate >= 1.0)       { score += 25; reasons.push('+25: 100% probe success (24h)'); }
  else if (successRate >= 0.75) { score += 15; reasons.push('+15: 75%+ probe success'); }
  else if (successRate < 0.5)   { score -= 20; reasons.push('-20: <50% probe success'); }

  // Latency (median of successful probes)
  const latencies = recentProbes.filter(p => p.success).map(p => p.latencyMs);
  const med = median(latencies);
  if (med && med < 2000)       { score += 10; reasons.push('+10: fast (<2s)'); }
  else if (med && med > 10000) { score -= 10; reasons.push('-10: slow (>10s)'); }

  // Provider stability bonus
  if (['groq', 'openrouter'].includes(model.providerId)) {
    score += 10; reasons.push('+10: stable provider');
  }

  // Feature support bonuses
  if (model.capabilities?.includes('tool_use')) { score += 5; }
  if (model.capabilities?.includes('vision'))   { score += 5; }

  // === Negative signals ===
  const privacyIssue = knownIssues.find(i =>
    i.type === 'data-training' && matchesModel(i, model));
  if (privacyIssue) { score -= 30; reasons.push('-30: data used for training'); }

  const deprecation = knownIssues.find(i =>
    i.type === 'deprecation' && matchesModel(i, model));
  if (deprecation) { score -= 50; reasons.push('-50: deprecated'); }

  // Consecutive failures
  if (countConsecutiveFailures(recentProbes) >= 3) {
    score -= 30; reasons.push('-30: 3+ consecutive failures');
  }

  // Hard disable on 404 "model not found"
  const notFound = recentProbes.some(p =>
    p.errorCode === 404 || p.errorMessage?.includes('not found'));
  if (notFound) { score = 0; reasons.push('=0: model not found (404)'); }

  // === Status determination ===
  const status = score >= 85 ? 'active' : score >= 60 ? 'staged' : 'disabled';
  return { score, status, reasons };
}
```

**Status transitions**:

| From | To | Condition | Speed |
|------|----|-----------|-------|
| staged → active | Score ≥ 85 for **2 consecutive cycles** | Slow (12h minimum) — prevents flickering |
| active → disabled | 404 or 3+ consecutive failures | **Immediate** — fail fast |
| active → staged | Score drops below 85 | Next cycle |
| disabled → staged | Score recovers above 60 | Next cycle |

**Key rule**: Promote slowly, demote instantly. Users never see a model that just started working 6 hours ago — it needs to prove itself over 12h. But a broken model is pulled within one cycle.

### 10.5 Emergency Core — The Unhackable Fallback

These models are **always available** and cannot be auto-disabled. They are hardcoded and only changed by code deploy.

```typescript
const EMERGENCY_CORE = [
  { provider: 'groq',       model: 'llama-3.1-8b-instant' },
  { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  { provider: 'cloudflare', model: '@cf/meta/llama-3.3-70b-instruct-fp8' },
];
```

If the entire dynamic model list degrades, routing falls to emergency core. Users always get *something*.

### 10.6 D1 Schema for Maintenance Data

```sql
-- Model registry with dynamic status
CREATE TABLE IF NOT EXISTS free_model_registry (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'staged',
  confidence_score INTEGER NOT NULL DEFAULT 50,
  score_reasons TEXT,                   -- JSON array
  capabilities TEXT,                    -- JSON array
  context_window INTEGER,
  data_training_risk TEXT DEFAULT 'unknown',
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_probe_at TEXT,
  last_status_change TEXT NOT NULL DEFAULT (datetime('now')),
  disabled_reason TEXT,
  UNIQUE(provider_id, model_id)
);

-- Probe history (rolling 7 days, older rows purged weekly)
CREATE TABLE IF NOT EXISTS free_model_probes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  provider_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  success INTEGER NOT NULL,
  latency_ms INTEGER,
  error_code INTEGER,
  error_message TEXT,
  responded_model_id TEXT,
  probed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_probes_model ON free_model_probes(provider_id, model_id, probed_at);

-- Audit trail (never purged)
CREATE TABLE IF NOT EXISTS free_model_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_type TEXT NOT NULL,
  provider_id TEXT,
  model_id TEXT,
  old_status TEXT,
  new_status TEXT,
  old_score INTEGER,
  new_score INTEGER,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_events_time ON free_model_events(created_at);
```

### 10.7 Alerting — Only When Humans Are Needed

The system handles 80-90% of changes silently. Alerts fire via **moltbot Telegram** (already built) + SitMon.

| Event | Level | Auto-Action | Human Needed? |
|-------|-------|-------------|---------------|
| New model discovered | ℹ️ | Staged (probes begin) | No |
| Model auto-activated (85+, 2 cycles) | ℹ️ | Added to routing pool | No |
| Model auto-disabled (404 / 3+ failures) | ⚠️ | Removed, fallback takes over | No (unless top model) |
| Provider > 70% utilization | ⚠️ | Auto-reduce allocation 10% | Review if persistent |
| Provider > 90% utilization | 🔴 | Auto-reduce 30%, skip in routing | Check for limit cuts |
| **All models from a provider failing** | 🔴 | Emergency core activates | **YES** — investigate |
| **Data-training policy change detected** | 🔴 | Flagged, NOT auto-disabled | **YES** — decide |
| Free model count drops > 30% in 24h | ⚠️ | No auto-action | **YES** — policy change? |
| Silent model swap detected | ⚠️ | Flag, keep routing | Review |

**Alert format** (via moltbot):

```
🦎 Vex [FreeModelWatcher]
━━━━━━━━━━━━━━━━━━━━━
⚠️ Model auto-disabled

Provider: OpenRouter
Model: stepfun/stepfun-3.5-flash:free
Reason: 3 consecutive probe failures (404)
Score: 85 → 0
Action: Removed from routing. Fallback active.
Human action: None needed.
━━━━━━━━━━━━━━━━━━━━━
```

### 10.8 Graceful UI Degradation

| Scenario | UI Behavior |
|----------|------------|
| 1-2 models disabled | Invisible — fallback chain handles silently |
| > 20% disabled | Subtle banner: "Some free models temporarily unavailable" |
| Provider fully down | Badge: "🆓 Free · [fallback provider]" |
| All free models down | Emergency core only. Banner: "Limited mode — add your API key" (conversion moment) |
| Model renamed/aliased | Watcher detects `responded_model_id ≠ requested`, auto-updates display |

### 10.9 Known Issues Database — The Manual Override Layer

Some things can't be auto-detected: ToS changes, privacy policy shifts, geo-restrictions. These live in a config file updated via code deploy. This is the **only part that needs occasional human attention** — quarterly deep audits.

```typescript
// src/lib/free-router/known-issues.ts
const KNOWN_ISSUES: KnownIssue[] = [
  {
    type: 'data-training',
    providerId: 'google-ai',
    severity: 'warning',
    description: 'Uses data for training outside UK/CH/EEA/EU.',
    addedAt: '2026-02-11',
  },
  {
    type: 'data-training',
    providerId: 'mistral-experiment',
    severity: 'critical',
    description: 'Experiment plan requires opt-in to data training.',
    addedAt: '2026-02-11',
  },
  {
    type: 'deprecation',
    modelId: 'llama-guard-3-8b',
    providerId: 'groq',
    severity: 'warning',
    description: 'Scheduled removal. See console.groq.com/docs/deprecations.',
    addedAt: '2026-02-11',
    expiresAt: '2026-04-01', // Auto-removes after date
  },
];
```

### 10.10 Community Intelligence — cheahjs Repo Sync

The `cheahjs/free-llm-api-resources` repo (6.6k ★) is the best community source for free LLM changes. Rather than parsing its markdown (fragile), feed its commit RSS into the existing Situation Monitor:

```typescript
// Add to SitMon RSS feeds
const FREE_LLM_WATCH = {
  url: 'https://github.com/cheahjs/free-llm-api-resources/commits/main.atom',
  category: 'free-models',
  checkInterval: '24h',
};
```

When a new commit is detected, it appears in the SitMon feed. PetrAnto sees it passively alongside other news — no separate checking needed.

### 10.11 Cron Configuration

```toml
# wrangler.toml
[triggers]
crons = [
  "0 */6 * * *",    # Every 6h: discovery + probe + score
  "0 3 * * 0",      # Weekly Sun 3AM: purge probe rows >7 days
]
```

**Resource cost**: ~30-40 HTTP requests/cycle, ~50 D1 rows/cycle. Well within free tier.

---

## 11. Competitive Positioning

### 11.1 How This Differentiates Storia

| Platform | Free Access? | BYOK? | Model Routing? |
|----------|-------------|-------|----------------|
| ChatGPT Free | Yes (GPT-4o mini) | No | No |
| Claude Free | Yes (Sonnet, limited) | No | No |
| Gemini Free | Yes (Flash) | No | No |
| Poe | Yes (limited) | No | No |
| **Storia** | **Yes (20-30+ models)** | **Yes** | **Yes (ClawRouter)** |

No other platform offers free access to 20-30 models across multiple providers with automatic routing AND the option to bring your own keys for unlimited access. This is Storia's unique position: **try everything free, then own your AI experience with BYOK.**

### 11.2 Marketing Angle

> "Start chatting with 20+ free AI models instantly. When you're ready, bring your own API keys for unlimited, zero-markup access. No subscription required."

This message hits three pain points: cost (free), choice (20+ models across providers), and control (BYOK).

### 11.3 Savings Calculator Caveat (per Grok review)

Be careful with the savings calculator — many "free" own-key providers (Groq, Google, Mistral) already offer generous free tiers individually. The savings comparison should focus on premium models (Claude, GPT-5, Grok) rather than implying all BYOK usage costs money. Frame it as: "Here's what this conversation would cost on premium models → but you got it free."

---

## 12. Open Questions — With Recommendations

1. **Should free tier require login?** → **YES** (both Claude and Grok agree). Quota tracking requires user identity. Anonymous access complicates abuse prevention massively. However, consider a **session-only anonymous tier** with very low limits (3-5 req/session) to let visitors test before even creating an account → forces signup for serious use → better quota control and conversion tracking.

2. **OpenRouter $10 top-up**: → **YES, before beta ends** (both agree). It 20x's the daily limit from 50 to 1,000. For $10 one-time this is the highest-ROI investment in the entire spec. Do it in Phase 1.

3. **Workers AI vs external providers**: → **Reserve for max-speed/edge fallback only** (both agree). Quantized models are noticeably lower quality. Don't default to it for quality-critical paths. Use as the last resort in the fallback chain.

4. **Per-user quota generosity during beta**: → Start with the "Beta" column allocations in §3.4. Monitor actual burn rates for 2-4 weeks. Tune down to "Post-Launch" allocations only when user count exceeds ~50 and provider utilization consistently hits 60%+.

5. **Gecko personality on free tier**: → **Minimal on free, full on BYOK** (strong consensus). This is a natural conversion lever. Free tier gets helpful but plain responses. BYOK unlocks Zori/Kai/Vex/Razz personalities. After quota nudge, offer a "preview" of gecko personality to show what they're missing.

6. **Anonymous session tier** (new — per Grok): → Consider allowing 3-5 free requests per browser session WITHOUT login. This lowers the barrier to "aha moment" even further. Session tracking via signed cookie (no D1 row needed). After 3-5 messages: "Create a free account to keep chatting!" This is a proven SaaS funnel pattern.

---

## 13. Quick Reference — Free Model Recommendations by Use Case

| Use Case | Best Free Model | Provider | Phase | Why |
|----------|----------------|----------|-------|-----|
| General chat | Llama 3.1 8B Instant | Groq | 1 | Fastest, massive quota (14,400 RPD) |
| Quality chat | Llama 3.3 70B Instruct | Groq / OpenRouter | 1 | Solid all-rounder (GPT-4o-mini class) |
| Coding | Devstral 2 / Qwen3 Coder | OpenRouter | 1 | Mistral's agentic coder + Qwen specialist |
| Coding (heavy) | Qwen3 Coder 480B | Cerebras | 1.5 | Largest free coding model (100 RPD) |
| Reasoning/math | DeepSeek R1-0528 | OpenRouter | 1 | Purpose-built CoT |
| Deep reasoning | Hermes 3 Llama 405B | OpenRouter | 1 | Largest free instruct, rivals frontier |
| Heavy analysis | Qwen3 235B A22B | Cerebras | 1.5 | Largest free MoE (contention risk) |
| Creative writing | Llama 3.3 70B | OpenRouter | 1 | Best creative output among free |
| Translation | Mistral Small 3.2 | OpenRouter | 1 | 80+ languages |
| Research (long docs) | Gemini 2.5 Flash | Google AI | 2 | 1M token context (quota volatile) |
| Quick drafts | Llama 3.1 8B Instant | Groq | 1 | Sub-second responses |
| Multimodal (images) | Gemini 2.5 Flash | Google AI | 2 | Best free vision (EU users preferred) |
| Edge/fallback | Llama 3.3 70B FP8 | Workers AI | 1 | Zero external latency |

**⚠️ Model availability changes frequently. The FreeModelWatcher (§10) handles this automatically — this table is a snapshot for initial routing configuration only.**

---

## 14. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-11 | Initial spec (Claude Opus 4.6) |
| 1.1 | 2026-02-11 | Grok review incorporated: conservative quotas, Google AI demoted to Phase 1.5, Groq 8B emphasized for speed, platform-wide daily caps, anonymous session tier, model count corrected (20-30 not 40+), implementation phased as MVP(Groq+OR) → 1.5(Cerebras) → 2(Google+Arena) |
| 1.2 | 2026-02-11 | Added §10 Automated Maintenance & Self-Healing: FreeModelWatcher cron (discovery, probing, confidence scoring), emergency core fallback, D1 schema for model registry/probes/events, moltbot alerting, graceful UI degradation, known issues database, cheahjs repo RSS sync. Maintenance added to Phase 1/1.5/2 roadmaps. Target: zero weekly manual maintenance. |
| 1.3 | 2026-02-11 | Rewrote §5 as User Archetypes & Routing Intelligence (per Grok segmentation analysis): Conversational (70-80% DAU, sub-2s latency, 8B-27B models) vs Vibe Coder/Deep Thinker (20-30% DAU, 30s-5min latency OK, 70B+ models). Added archetype detector classifier, dual routing tables, "Quick Chat" vs "Deep Mode" UI toggle, flywheel economics, archetype-aware quota budgeting (token-weighted), per-archetype fallback chains, per-archetype prompt optimization, hybrid BYOK strategy per archetype. |
| 1.4 | 2026-02-11 | Added: (1) Deep Mode tier at $3-5/mo between Free and Pro — captures vibe coders willing to pay a little without full BYOK setup; (2) Hermes 3 Llama 405B (largest free instruct) and Devstral 2 (Mistral's agentic coder) added to routing tables, fallback chains, and provider catalog; (3) §5.10 Memory & RAG layer using Pinecone free tier (100K vectors, $0/mo) + Workers AI embeddings — makes 8B models feel premium for returning users via context injection. Roadmap updated: Pinecone + archetype detector in Phase 1.5, Deep Mode Stripe integration in Phase 2, Pinecone → Vectorize migration in Phase 3. |

---

*End of spec. This document should be added to `claude-share/brainstorming/` and referenced from GLOBAL_ROADMAP.md under a new "Free Tier Integration" section.*
