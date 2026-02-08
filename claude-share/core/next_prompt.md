# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-08

---

## Current Task: Phase 1.3 — Configurable Reasoning per Model

### Requirements

You are working on Moltworker, a multi-platform AI assistant gateway on Cloudflare Workers.

Add configurable reasoning support for models that expose reasoning control. Phase 1.2 already added `reasoning` metadata (`'none' | 'fixed' | 'configurable'`) to all models in `models.ts`. Now wire it up so models with `reasoning: 'configurable'` get the appropriate API parameter passed.

### Models with Configurable Reasoning

1. **DeepSeek V3.2** (`deepseek/deepseek-chat-v3-0324`): `reasoning: { enabled: boolean }`
2. **Gemini 3 Flash** (`google/gemini-3-flash`): `reasoning: { effort: 'minimal' | 'low' | 'medium' | 'high' }`
3. **Grok 4.1** (`x-ai/grok-4-1`): `reasoning: { enabled: boolean }`

### Files to modify

1. **`src/openrouter/client.ts`** — Add reasoning parameter to ChatCompletionRequest when model supports it
2. **`src/openrouter/models.ts`** — Verify reasoning metadata is correct for all models

### Implementation Notes

- Check `model.reasoning === 'configurable'` before adding the parameter
- Default behavior: auto-detect from task type (simple Q&A → disabled, coding/tool-use → medium, research → high)
- Allow user override via message prefix (e.g., `/deep think:high <message>`)
- Ensure backwards compatibility — models without reasoning support should be unaffected

### Success Criteria

- [ ] Models with `reasoning: 'configurable'` get reasoning parameter in API request
- [ ] Default reasoning level selected based on task type
- [ ] User can override reasoning level
- [ ] No regressions for models without reasoning support
- [ ] Tests added
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

### Key Files
- `src/openrouter/client.ts` — API client
- `src/openrouter/models.ts` — Model catalog with capability metadata

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | 2.5.7: Daily briefing aggregator | 6h |
| Then | 2.5.4: Currency conversion (ExchangeRate-API) | 1h |
| Then | 2.1: Token/cost tracking | Medium |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-08 | Phase 2.5.5: News feeds (HN/Reddit/arXiv) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.3: Weather tool (Open-Meteo) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.2: Chart image generation (QuickChart) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.1: URL metadata tool (Microlink) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 1.1: Parallel tool execution | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.2: Model capability metadata | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.5: Upstream sync (7 cherry-picks) | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-07 | Phase 0: Add Pony Alpha, GPT-OSS-120B, GLM 4.7 | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
| 2026-02-06 | Tool-calling landscape analysis | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
