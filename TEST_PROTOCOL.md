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
| 35 | `/new` | Clears conversation |
| 36 | `/load test1` | Restores conversation |
| 37 | `/delsave test1` | Deletes checkpoint |
| 38 | `/credits` | Shows OpenRouter balance |
| 39 | `/costs` | Shows token usage |

---

## Results

Copy this table, fill in as you go:

```
| # | Pass? | Notes |
|---|-------|-------|
| 1 | | |
| 2 | | |
| ... | | |
| 39 | | |
```

**Pass criteria:** All 39 tests pass. If any fail, note the exact response and which model was active.
