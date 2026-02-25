# Moltworker — Manual Test Protocol

Quick checklist to verify the bot works end-to-end.
Run top-to-bottom after every deploy. Takes ~10 minutes.

---

## Setup

1. Open Telegram, find your Moltworker bot
2. Send `/new` to start clean

---

## 1. Basics

| # | Action | Expected |
|---|--------|----------|
| 1 | `/start` | Welcome message explaining Chat, Vision, Tools, Images, Reasoning, JSON, Briefing |
| 2 | `/help` | Full command reference with all 12 tools listed individually |
| 3 | `/ping` | Pong + latency |
| 4 | `Hello!` | Normal chat response |
| 5 | `/model` | Shows current model (probably "auto") |

---

## 2. Model Switching

| # | Action | Expected |
|---|--------|----------|
| 6 | `/use deep` | Confirms switch to DeepSeek V3.2 |
| 7 | `/model` | Shows "deep" |
| 8 | `/pick` | Button grid appears |
| 9 | Tap any button | Confirms model switch |
| 10 | `/use nonexistent` | Error: model not found |

---

## 3. Tools (use `/use deep` or `/use gpt` first)

| # | Action | Expected |
|---|--------|----------|
| 11 | `What's the weather in Prague?` | Calls get_weather, shows temp + conditions |
| 12 | `What's the Bitcoin price?` | Calls get_crypto, shows price + market data |
| 13 | `Top 5 cryptos by market cap` | Calls get_crypto (top), shows ranked list |
| 14 | `Search for PEPE on DEX` | Calls get_crypto (dex), shows DEX pair data |
| 15 | `Where is 8.8.8.8 located?` | Calls geolocate_ip, shows Google DNS info |
| 16 | `Geolocate 1.1.1.1 and tell me the timezone` | Shows Cloudflare DNS + timezone |
| 17 | `What are today's top HN stories?` | Calls fetch_news, shows HackerNews stories |
| 18 | `Convert 100 USD to EUR` | Calls convert_currency, shows rate |

---

## 4. Vision

| # | Action | Expected |
|---|--------|----------|
| 19 | `/use gpt` then send a photo with caption: `What is this?` | Describes the image |
| 20 | Send a photo with caption: `What city is this? Check its weather` | Identifies city AND calls weather tool |
| 21 | Send a photo with no caption | Defaults to "What is in this image?" analysis |

---

## 5. Structured Output

| # | Action | Expected |
|---|--------|----------|
| 22 | `/use gpt` then `json: list 3 European capitals with population` | Valid JSON response |
| 23 | `/use deep` then `json: 3 programming languages with name and year` | Valid JSON response |
| 24 | `/use sonnet` then `json: list 3 colors` | Normal text (Sonnet doesn't support JSON mode) |

---

## 6. Reasoning

| # | Action | Expected |
|---|--------|----------|
| 25 | `/use deep` then `think:high explain quantum entanglement` | Deeper, more thorough response |
| 26 | `think:high json: analyze top 3 cryptos` | Reasoning + JSON combined |

---

## 7. Image Generation

| # | Action | Expected |
|---|--------|----------|
| 27 | `/img a cat astronaut floating in space` | Returns generated image |
| 28 | `/img fluxmax detailed portrait of a robot` | Returns higher quality image |

---

## 8. Briefing

| # | Action | Expected |
|---|--------|----------|
| 29 | `/briefing` | Shows weather + HN + Reddit + arXiv digest |

---

## 9. Bug Regressions

| # | Action | Expected |
|---|--------|----------|
| 30 | `/use deep` then `hello` | Status shows "Thinking..." (NOT "Processing complex task...") |
| 31 | `/use deep` then `What's the weather in Tokyo?` | DeepSeek actually CALLS the weather tool (doesn't guess) |
| 32 | `/use fluxpro` then `hello` | Bot says model is image-only, falls back to default |

---

## 10. Session Management

| # | Action | Expected |
|---|--------|----------|
| 33 | `/saveas test1` | Saves checkpoint |
| 34 | `/saves` | Shows "test1" in list |
| 35 | `/save test1` | Shows checkpoint details + AI summary of conversation |
| 36 | `/new` | Clears conversation |
| 37 | `/load test1` | Restores conversation |
| 38 | `/delsave test1` | Deletes checkpoint |
| 39 | `/credits` | Shows OpenRouter balance |
| 40 | `/costs` | Shows token usage |

---

## Results

Copy this table, fill in as you go:

```
| # | Pass? | Notes |
|---|-------|-------|
| 1 | | |
| 2 | | |
| ... | | |
| 40 | | |
```

**Pass criteria:** All 40 tests pass. If any fail, note the exact response and which model was active.

---

## 11. Phase 7B.6 — Latency Benchmark Protocol

> **Human checkpoint 7B.6:** Benchmark before/after — measure end-to-end latency on 5 representative tasks.
>
> Validates that Phase 7B speed optimizations (speculative execution, model routing,
> file prefetching, iteration reduction, streaming feedback) deliver real-world improvement.

### Prerequisites

- Deploy the current build with all 7B optimizations enabled
- Use Telegram (production path — Workers + Durable Objects)
- Run `/new` before each test to start with clean context
- Note the Cloudflare region (Workers dashboard → Analytics)

### What to Record

For each task, capture from the final response footer:

| Field | Source |
|-------|--------|
| **Wall-clock (s)** | `⏱️ Xs` in response footer |
| **Iterations** | `(N iter)` in response footer |
| **Tools used** | `[Used N tool(s): ...]` header |
| **Model** | `🤖 /alias` in footer |
| **Token cost** | Cost footer (if shown) |

Also note from the Telegram UX:
- **Time-to-first-update**: seconds from send until first "⏳" status appears
- **Progress clarity**: could you tell what the bot was doing? (Y/N)

### The 5 Benchmark Tasks

#### Task A: Simple Chat (tests 7B.2 — model routing)

```
/use auto
What is the capital of France?
```

| Metric | Expected |
|--------|----------|
| Wall-clock | < 5s |
| Iterations | 1 |
| Tools | 0 |
| Model | mini, flash, or haiku (NOT deep/gpt/sonnet) |

**What 7B.2 does:** Routes simple queries to a fast model instead of the default heavyweight.
**Pass:** Response arrives in ≤ 5s AND model shown is a fast candidate (mini/flash/haiku).

---

#### Task B: Multi-Tool Research (tests 7B.1 — speculative execution)

```
/use deep
What's the weather in Prague and what's Bitcoin trading at?
```

| Metric | Expected |
|--------|----------|
| Wall-clock | < 20s |
| Iterations | 1–2 |
| Tools | 2 (get_weather, get_crypto) |

**What 7B.1 does:** Starts tool execution during streaming — both tools should fire in parallel before the full response arrives.
**Pass:** Both tools called in a single iteration, wall-clock noticeably lower than 2× single-tool time.

---

#### Task C: GitHub File Reading (tests 7B.3 + 7B.4 — prefetch + injection)

```
/use deep
Read the README.md and package.json from PetrAnto/moltworker and summarize the project stack
```

| Metric | Expected (with 7B) | Baseline (without 7B) |
|--------|--------------------|-----------------------|
| Wall-clock | < 30s | ~45–60s |
| Iterations | 1–3 | 4–6 |
| Tools | 2–4 | 4–6 |

**What 7B.3 + 7B.4 do:** File paths are extracted from the user message, GitHub reads start in parallel with the first LLM call, and file contents are injected into context at the plan→work transition — so the model doesn't need separate `github_read_file` iterations.
**Pass:** Iteration count ≤ 3 AND wall-clock under 30s.

---

#### Task D: Orchestra Run (tests all 7B optimizations end-to-end)

Pick a repo with a ROADMAP.md (e.g., one previously initialized with `/orchestra init`):

```
/orchestra run <owner>/<repo>
```

| Metric | Expected (with 7B) | Baseline (without 7B) |
|--------|--------------------|-----------------------|
| Wall-clock | < 3 min | ~4–6 min |
| Iterations | 8–15 | 15–25 |
| Tools | 5–15 | 10–25 |

**What the full stack does:** File prefetch on roadmap/work-log reads, speculative execution on parallel-safe tool calls, fewer iterations due to injected file contents, streaming progress updates throughout.
**Pass:** Iteration count ≤ 15 AND progress messages showed meaningful context (tool names, plan steps).

---

#### Task E: Non-Tool Reasoning (tests 7B.5 — streaming feedback + baseline)

```
/use deep
think:high Compare the architectural trade-offs between microservices and monoliths for a team of 5 developers building a SaaS product. Consider deployment complexity, debugging, and team velocity.
```

| Metric | Expected |
|--------|----------|
| Wall-clock | < 30s |
| Iterations | 1 |
| Tools | 0 |
| Time-to-first-update | < 3s |

**What 7B.5 does:** Even with no tools, the streaming feedback shows the user a "⏳ 📋 Planning…" or "⏳ Thinking…" status within seconds.
**Pass:** First status message appears in ≤ 3s AND final response is substantive.

---

### Results Table

Copy and fill in:

```
| Task | Wall-clock | Iterations | Tools | Model | First-update | Progress clear? | Pass? | Notes |
|------|-----------|------------|-------|-------|-------------|----------------|-------|-------|
| A: Simple chat | | | | | | | | |
| B: Multi-tool | | | | | | | | |
| C: GitHub read | | | | | | | | |
| D: Orchestra | | | | | | | | |
| E: Reasoning | | | | | | | | |
```

### Pass Criteria

| Level | Requirement |
|-------|-------------|
| **PASS** | All 5 tasks meet their individual thresholds |
| **CONDITIONAL PASS** | 4/5 pass, the failing one is within 1.5× threshold |
| **FAIL** | 2+ tasks exceed threshold, or any task exceeds 2× threshold |

### Comparison Notes

If you have baseline measurements from before Phase 7B (pre-Feb 2026), record them here for delta analysis. Key metrics to compare:

- **Task C iteration count**: Should drop from ~5–6 to ~2–3 (7B.4's main win)
- **Task B wall-clock**: Should drop from ~25s to ~15s (7B.1's parallel tool execution)
- **Task A model**: Should route to mini/flash instead of default model (7B.2)
- **Task D iteration count**: Should drop by ~40% (compound effect of all optimizations)
