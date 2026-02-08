# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-08

---

## Current Task: Phase 2.5.4 — Currency Conversion Tool

### Phase 2.5.4: Currency Conversion (ExchangeRate-API)

Add a `convert_currency` tool using the free ExchangeRate-API (no auth required).

#### Tool Definition
```typescript
{
  name: 'convert_currency',
  description: 'Convert between currencies using live exchange rates. Supports 150+ currencies.',
  parameters: {
    type: 'object',
    properties: {
      from: { type: 'string', description: 'Source currency code (e.g., USD, EUR, CZK)' },
      to: { type: 'string', description: 'Target currency code (e.g., EUR, USD, GBP)' },
      amount: { type: 'string', description: 'Amount to convert (default: 1)' },
    },
    required: ['from', 'to'],
  },
}
```

#### API
- **Endpoint:** `https://api.exchangerate-api.com/v4/latest/{FROM}`
- **Auth:** None required (free tier)
- **Response:** `{ rates: { USD: 1.0, EUR: 0.85, ... } }`

#### Files to Modify
1. **`src/openrouter/tools.ts`** — Add tool definition + `convertCurrency()` handler
2. **`src/openrouter/tools.test.ts`** — Add tests (success, invalid currency, API error, default amount)

#### Implementation Notes
- Validate currency codes (uppercase, 3 chars)
- Format output nicely: "100 USD = 85.23 EUR (rate: 0.8523)"
- Cache exchange rates for 30 minutes (similar to briefing cache)
- Handle API errors gracefully

### Other Known Bugs (Lower Priority)
- **BUG-1:** "Processing complex task..." shown for ALL messages (UX, `task-processor.ts:476`)
- **BUG-2:** DeepSeek doesn't proactively use tools (needs system prompt hint)
- **BUG-5:** `/use fluxpro` + text → "No response" (image-gen model detection missing)

### Success Criteria
- [ ] `convert_currency` tool works correctly
- [ ] Tests added
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

### Key Files
- `src/openrouter/tools.ts` — Tool definitions and execution
- `src/openrouter/tools.test.ts` — Tool tests

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | 2.5.4: Currency conversion (ExchangeRate-API) | 1h |
| Then | 2.1: Token/cost tracking | Medium |
| Then | BUG-1: "Processing complex task..." UX fix | Low |
| Then | BUG-2: DeepSeek tool prompting | Medium |
| Then | BUG-5: fluxpro text UX fix | Low |
| Then | 2.5.6: Crypto expansion (CoinCap + DEX Screener) | 4h |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-08 | Phase 2.5.7: Daily briefing aggregator + BUG-3/BUG-4 fixes | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 1.3: Configurable reasoning per model | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.5: News feeds (HN/Reddit/arXiv) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.3: Weather tool (Open-Meteo) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.2: Chart image generation (QuickChart) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.1: URL metadata tool (Microlink) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 1.1: Parallel tool execution | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.2: Model capability metadata | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.5: Upstream sync (7 cherry-picks) | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-07 | Phase 0: Add Pony Alpha, GPT-OSS-120B, GLM 4.7 | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
| 2026-02-06 | Tool-calling landscape analysis | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
