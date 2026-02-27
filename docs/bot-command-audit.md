# Moltworker Bot — Command & UX Audit

> Use this document as context when consulting external AI about restructuring
> the bot's command system. It describes the current state, pain points, and
> goals.

## What is Moltworker?

A **multi-model AI assistant** running on Cloudflare Workers, accessed via
Telegram. It connects to 30+ AI models (via OpenRouter + direct APIs), has
15 real-time tools (GitHub, web, crypto, weather, code sandbox, etc.), and
an "Orchestra Mode" for autonomous multi-step project execution.

## The 4 Discovery Surfaces

Users discover commands through 4 different surfaces that are **inconsistent**
with each other:

### 1. Telegram Command Menu (BotFather popup — 14 commands)
The popup that appears when you tap the `/` button in the text input field.
Limited to 14 entries (practical limit — Telegram allows more but it scrolls):

```
/start     — Welcome & feature overview
/help      — Full command reference
/pick      — Choose a model (buttons)
/models    — All models with prices
/new       — Clear conversation
/img       — Generate an image
/briefing  — Daily briefing (weather+news)
/costs     — Token usage summary
/status    — Bot status & info
/saves     — List saved checkpoints
/ar        — Toggle auto-resume
/resume    — Resume task with optional model override
/credits   — OpenRouter balance
/syncall   — Sync full model catalog from OpenRouter
```

### 2. /start Welcome Menu (10 buttons)
```
[💻 Coding]  [🔍 Research]  [🎨 Images]
[🔧 Tools]   [👁️ Vision]     [🧠 Reasoning]
[🎼 Orchestra] [🤖 Pick a Model] [🌐 Sync Models]
[📖 All Commands]
```
These are feature-category buttons that open help text, NOT command shortcuts.
Overlap: "Pick a Model" ≈ /pick, "Sync Models" ≈ /syncall, "All Commands" = /help.

### 3. /help Text (92 lines, 9 sections)
Sections: Core, Costs & Credits, Daily Briefing, Task History, Image Generation,
Checkpoints, Models (quick switch), Cloudflare API, Orchestra Mode, Special
Prefixes, Vision.

Lists ~33 commands — more than the popup but still missing ~18 functional commands.

### 4. Undocumented Commands (18 commands that work but aren't listed anywhere)
```
/info            — alias for /status
/steer <text>    — inject instruction into running task mid-execution (very useful!)
/brief           — alias for /briefing
/usage           — alias for /costs
/checkpoints     — alias for /saves
/save [name]     — show checkpoint details (different from /saves which lists all)
/saveinfo [name] — alias for /save
/delcheckpoint   — alias for /delsave
/automode        — alias for /ar
/autoresume      — alias for /ar
/sync            — alias for /syncmodels
/syncreset       — clear all dynamic models, revert to static catalog
/skill info      — show current skill details
/skill reload    — reload skill from R2
/skill preview   — preview skill prompt
/orchestra       — alias for /orch
/orch unset      — clear locked repo
/orch status     — alias for /orch roadmap
/orch run <repo> — run with explicit repo
```

Also undocumented: `/briefing set <city>`, `/briefing <city>`,
`/briefing <lat,lon> [subreddit] [arxiv]` subcommands.

Special keyword `continue` (not a / command) resumes from checkpoint.

---

## The 3 Layers of Model Management (the messy part)

This is where the real confusion lives. There are **3 overlapping layers**
for managing which AI models are available:

### Layer 1: Static Catalog (code-level, requires deploy)
- **File**: `src/openrouter/models.ts` — hardcoded `MODELS` object
- **Contains**: ~26 curated models with full metadata (alias, OpenRouter ID, name,
  cost, capabilities like supportsTools, supportsVision, parallelCalls, maxContext)
- **Examples**: `/deep` → DeepSeek V3.2, `/sonnet` → Claude Sonnet 4.5,
  `/opus` → Claude Opus 4.6, `/dcode` → DeepSeek Direct API
- **Update mechanism**: Edit TypeScript source → deploy → takes effect
- **Problem**: To update `/sonnet` from 4.5 → 4.6, or change pricing, or add
  a new model — you need a code change. There is NO bot command to patch this.

### Layer 2: Dynamic Models (user-curated via /syncmodels, persisted in R2)
- **Command**: `/syncmodels` — interactive picker for FREE models from OpenRouter
- **How it works**: Fetches free models list, shows toggle buttons (add/remove/replace),
  user confirms, changes saved to R2
- **Priority**: Overrides auto-synced models but NOT static catalog
- **Used for**: Cherry-picking which free models to include

### Layer 3: Auto-Synced Full Catalog (via /syncall, persisted in R2)
- **Command**: `/syncall` — fetches ALL models from OpenRouter, stores in R2
- **Priority**: Lowest — static catalog and dynamic models override these
- **Display**: Only "notable highlights" shown in /models (top 2 per major provider)
- **Used for**: Having access to any OpenRouter model by alias

### How Model Resolution Works
```
getModel(alias) checks in order:
  1. Static MODELS catalog (highest priority)
  2. Dynamic models (from /syncmodels, stored in R2)
  3. Auto-synced models (from /syncall, stored in R2)
  → First match wins
```

### The Pain Points

1. **No way to update static models without code deploy**
   - Sonnet 4.5 → 4.6 (same price, better model) requires editing models.ts
   - Same for Opus 4.5 → 4.6, or any other version bump
   - Want: a `/modelupdate sonnet id=anthropic/claude-sonnet-4.6` command

2. **`/synccheck` is read-only**
   - It detects price changes, missing models, new versions — but only reports
   - Want: actionable buttons to apply updates directly

3. **`/auto` model exists but is hidden**
   - `openrouter/auto` is in static catalog but doesn't appear in /models
   - It has `isFree: true` but no `supportsTools` — so it can't use any tools

4. **No simple "upgrade model in-place" workflow**
   - When Anthropic replaces Sonnet 4.5 with 4.6 at the same price, the ideal
     flow would be: /synccheck detects it → shows "Sonnet 4.5 → 4.6 available,
     same price" → button to apply → done, no deploy needed

5. **Alias confusion**: `/sonnet` points to 4.5, `/opus` points to 4.6,
   `/opus45` points to 4.5 — inconsistent naming across generations

---

## Complete Command Inventory (51 commands + 19 button actions)

### Core (10 commands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/start` | YES | no | Welcome menu with feature buttons |
| `/help` | YES | built-in | Full 92-line command reference |
| `/use <alias>` | no | YES | Set active model |
| `/pick` | YES | YES | Interactive model picker (buttons) |
| `/model` | no | YES | Show current model info |
| `/models` | YES | YES | Full catalog with prices |
| `/new` | YES | YES | Clear conversation (alias for /clear) |
| `/clear` | no | YES | Clear conversation |
| `/cancel` | no | YES | Stop running task |
| `/ping` | no | YES | Latency check |

### Status & Info (4 commands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/status` | YES | YES | Bot status, model, features |
| `/info` | no | **NO** | Alias for /status |
| `/test` | no | YES | Smoke tests |
| `/steer <text>` | no | **NO** | Inject instruction into running task |

### Credits & Costs (4 commands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/credits` | YES | YES | OpenRouter balance |
| `/costs` | YES | YES | Token usage today |
| `/costs week` | no | YES | 7-day breakdown |
| `/usage` | no | **NO** | Alias for /costs |

### Checkpoints (9 commands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/saves` | YES | YES | List all checkpoint slots |
| `/checkpoints` | no | **NO** | Alias for /saves |
| `/save [name]` | no | **NO** | Show checkpoint details |
| `/saveinfo` | no | **NO** | Alias for /save |
| `/saveas <name>` | no | YES | Save current state to named slot |
| `/load <name>` | no | YES | Restore from named slot |
| `/delsave <name>` | no | YES | Delete a slot |
| `/delcheckpoint` | no | **NO** | Alias for /delsave |
| `/resume [model]` | YES | YES | Resume from checkpoint |

### Auto-resume & Routing (4 commands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/ar` | YES | YES | Toggle auto-resume |
| `/automode` | no | **NO** | Alias for /ar |
| `/autoresume` | no | **NO** | Alias for /ar |
| `/autoroute` | no | YES | Toggle fast-model routing |

### Model Sync (5 commands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/syncmodels` | no | YES | Interactive free model picker |
| `/sync` | no | **NO** | Alias for /syncmodels |
| `/syncall` | YES | YES | Full catalog sync from OpenRouter |
| `/synccheck` | no | YES | Check for model updates (read-only) |
| `/syncreset` | no | **NO** | Nuclear reset: clear all dynamic models |

### Image Generation (1 command, 4 sub-variants)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/img <prompt>` | YES | YES | Generate image (default: FLUX.2 Pro) |
| `/img fluxklein` | no | YES | FLUX.2 Klein |
| `/img fluxpro` | no | YES | FLUX.2 Pro |
| `/img fluxflex` | no | YES | FLUX.2 Flex (text) |
| `/img fluxmax` | no | YES | FLUX.2 Max (highest quality) |

### Briefing (1 command, hidden subcommands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/briefing` | YES | YES | Daily digest |
| `/brief` | no | **NO** | Alias |
| `/briefing set <city>` | no | **NO** | Save default location |
| `/briefing <city>` | no | **NO** | One-off for city |

### Task History (2 commands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/learnings` | no | YES | Task patterns & success rates |
| `/sessions` | no | YES | Acontext replay sessions |

### Orchestra Mode (9+ subcommands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/orch set <repo>` | no | YES | Lock default repo |
| `/orch unset` | no | **NO** | Clear locked repo |
| `/orch init <desc>` | no | YES | Create roadmap + scaffold |
| `/orch next` | no | YES | Execute next task |
| `/orch next <task>` | no | YES | Execute specific task |
| `/orch run <repo>` | no | **NO** | Execute with explicit repo |
| `/orch roadmap` | no | YES | View roadmap |
| `/orch status` | no | **NO** | Alias for roadmap |
| `/orch history` | no | YES | Past task history |
| `/orch redo <task>` | no | YES | Re-implement failed task |
| `/orch reset <task>` | no | YES | Uncheck task for re-run |

### Cloudflare API (2 commands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/cloudflare search` | no | YES | Search CF API endpoints |
| `/cloudflare execute` | no | YES | Run TypeScript against CF SDK |
| `/cf` | no | YES | Shortcut alias |

### Skills (3 commands)
| Command | In popup? | In /help? | What it does |
|---------|-----------|-----------|-------------|
| `/skill info` | no | **NO** | Show current skill |
| `/skill reload` | no | **NO** | Reload from R2 |
| `/skill preview` | no | **NO** | Preview prompt |

### Model Quick-Switch (26+ aliases)
Any `/alias` matching a model name auto-switches to that model.
e.g., `/deep`, `/sonnet`, `/grok`, `/flash`, etc.

---

## What I Want Help With

1. **How to restructure the command menu (BotFather popup)** to make the most
   important 14 commands actually useful — current selection feels random
   (why is /syncall in the popup but not /cancel or /orch?)

2. **How to simplify model management** — the 3-layer system is confusing.
   What's the best UX for:
   - Quick model version bumps (4.5 → 4.6)
   - Adding a new model that just came out
   - Removing deprecated models

3. **How to organize /help** — 92 lines is too long for Telegram. Should it be
   broken into sub-help pages? A menu with buttons?

4. **Alias strategy** — when Anthropic releases Sonnet 4.6, should `/sonnet`
   auto-point to latest? Should old versions get explicit aliases (`/sonnet45`)?
   How to handle the transition without breaking users' muscle memory?

5. **Which undocumented commands should be promoted** — `/steer` is incredibly
   useful for long tasks but completely hidden. What else is worth surfacing?

6. **The /start menu** — is the feature-category approach (Coding, Research,
   Images) the right UX? Or should it be more action-oriented?

7. **Discoverability** — new users have no idea about Orchestra mode, the
   checkpoint system, or advanced features. How to progressively disclose?
