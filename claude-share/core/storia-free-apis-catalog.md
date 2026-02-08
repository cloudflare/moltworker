# Free Public APIs for Storia — Integration Catalog

**Date**: 2026-02-08  
**Source**: public-apis/public-apis (383k ⭐), mixedanalytics.com, publicapis.io, and targeted research  
**Filter**: Free tier or no auth required · REST/JSON · Cloudflare Workers compatible

---

## How to Read This

Each API is mapped to a **Storia feature** with effort estimate and priority.  
🟢 = No auth needed (call from browser)  
🔑 = Free API key required (call from server)  
✅ = Already using

---

## 1. Situation Monitor — News & Data Feeds

The Situation Monitor already has RSS + CoinGecko. These APIs would make it significantly richer.

### Crypto & DeFi (Expand beyond CoinGecko)

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| ✅ CoinGecko | 🟢 | Already integrated — prices, market cap | `api.coingecko.com/api/v3/` |
| CoinCap | 🟢 | Real-time prices via WebSocket + REST, 2000+ assets | `api.coincap.io/v2/assets` |
| CoinPaprika | 🟢 | Coin details, exchanges, historical, people behind projects | `api.coinpaprika.com/v1/coins/btc-bitcoin` |
| CoinLore | 🟢 | Simple ticker data, global stats | `api.coinlore.net/api/tickers/` |
| DEX Screener | 🟢 | On-chain DEX pair data across all chains | `api.dexscreener.com/latest/dex/search?q=WBNB` |
| GeckoTerminal | 🟢 | DEX pool data (by CoinGecko team) | `api.geckoterminal.com/api/v2/networks` |
| Binance (public) | 🟢 | 24h ticker, order book, trades | `api4.binance.com/api/v3/ticker/24hr` |
| Gemini | 🟢 | BTC/ETH market data | `api.gemini.com/v2/ticker/btcusd` |
| Kraken | 🟢 | Trades, OHLC, order book | `api.kraken.com/0/public/Trades?pair=ltcusd` |
| KuCoin | 🟢 | Market stats per symbol | `api.kucoin.com/api/v1/market/stats?symbol=BTC-USDT` |
| OKX | 🟢 | Spot tickers, all instruments | `okx.com/api/v5/market/tickers?instType=SPOT` |
| 0x | 🟢 | Token/pool stats across DEX liquidity | `0x.org` |
| 1inch | 🟢 | DEX aggregator data | `1inch.io` |
| DIA | 🟢 | 3,000+ token prices via GraphQL + REST | `diadata.org` |
| Blockchain.com | 🟢 | Bitcoin network stats, exchange rates | `blockchain.info/stats` |

**Recommendation**: Add **CoinCap** (WebSocket for live prices), **DEX Screener** (DeFi pairs), and **CoinPaprika** (richer metadata than CoinGecko alone). These three + existing CoinGecko = comprehensive Web3 coverage.

**Effort**: 4h to add 3 new providers to Situation Monitor data sources.

### Currency & Forex

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| ExchangeRate-API | 🟢 | 150+ currencies, no key needed | `open.er-api.com/v6/latest/USD` |
| Currency-api (fawazahmed0) | 🟢 | 150+ currencies via CDN, no rate limits | `cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json` |
| CoinBase currencies | 🟢 | Fiat currency codes + names | `api.coinbase.com/v2/currencies` |
| NBP Web (Poland) | 🟢 | Exchange rates + gold prices | `api.nbp.pl/api/cenyzlota/last/30/?format=json` |

**Recommendation**: Add **ExchangeRate-API** — one call, 150 currencies, zero auth. Perfect for Web3 Life Manager fiat conversion.

**Effort**: 1h.

### News & Content

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| HackerNews | 🟢 | Top/new/best stories, real-time | `hacker-news.firebaseio.com/v0/topstories.json` |
| Reddit (public JSON) | 🟢 | Any subreddit's top posts (append `.json`) | `reddit.com/r/cryptocurrency/top.json?limit=10` |
| Reddit Stocks (Tradestie) | 🟢 | WallStreetBets trending tickers | `tradestie.com/api/v1/apps/reddit` |
| WordPress (any site) | 🟢 | Posts from any WP site | `techcrunch.com/wp-json/wp/v2/posts?per_page=10` |
| Wikipedia pageviews | 🟢 | Trending topics by pageview stats | `wikimedia.org/api/rest_v1/metrics/pageviews/...` |
| Crossref | 🟢 | Academic/scholarly metadata | `api.crossref.org/journals?query=artificial+intelligence` |
| arXiv | 🟢 | AI/ML research papers | `export.arxiv.org/api/query?search_query=all:LLM` |

**Recommendation**: Add **HackerNews** + **Reddit public JSON** + **arXiv** to Situation Monitor. These three give you tech pulse, crypto sentiment, and AI research in one sweep. No API keys needed.

**Effort**: 3h (add as data sources alongside existing RSS feeds).

---

## 2. Gecko Personality Enrichment

APIs that make gecko conversations more alive and contextual.

### Quotes & Inspiration

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| Quotable | 🟢 | 75K+ quotes, searchable by tag/author | `api.quotable.io/quotes/random` |
| Advice Slip | 🟢 | Random advice ("Kai says...") | `api.adviceslip.com/advice` |
| icanhazdadjoke | 🟢 | Dad jokes (Razz energy) | `icanhazdadjoke.com/` (Accept: application/json) |
| JokeAPI | 🟢 | Jokes by category, safe-mode filter | `v2.jokeapi.dev/joke/Any?safe-mode` |
| Affirmations | 🟢 | Positive affirmations (Zori vibes) | `affirmations.dev/` |

**Recommendation**: Add **Quotable** for Kai's wisdom moments and **Advice Slip** for gecko personality flair. These cost nothing and add charm to empty states, daily briefings, and loading screens.

**Effort**: 2h (utility function + gecko personality injection).

### Calendar & Events

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| Nager.Date | 🟢 | Public holidays for 100+ countries | `date.nager.at/api/v2/publicholidays/2026/US` |
| UK Bank Holidays | 🟢 | UK specific | `gov.uk/bank-holidays.json` |

**Recommendation**: Add **Nager.Date** — geckos can wish you happy holidays, adjust briefing tone on weekends/holidays.

**Effort**: 1h.

### Weather

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| Open-Meteo | 🟢 | Full weather forecast, no key, no limits | `api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true` |
| 7Timer | 🟢 | Simple weather icons/data | `7timer.info` |
| OpenWeatherMap | 🔑 | 1000 calls/day free, more data | `api.openweathermap.org` |

**Recommendation**: **Open-Meteo** is the winner — completely free, no auth, no rate limits, high resolution. Gecko daily briefings: "Zori says: grab an umbrella! 🌧️"

**Effort**: 2h.

---

## 3. Content Creator (Phase 3A)

### Images & Media

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| Lorem Picsum | 🟢 | Random high-quality placeholder images | `picsum.photos/800/400` |
| DiceBear | 🟢 | SVG avatar generation from any seed | `api.dicebear.com/6.x/pixel-art/svg` |
| RoboHash | 🟢 | Unique robot/alien images from text | `robohash.org/yourtext.png` |
| Art Institute of Chicago | 🟢 | Museum artwork (public domain) | `api.artic.edu/api/v1/artworks/search?q=landscape` |
| Metropolitan Museum | 🟢 | 490K+ artworks, many public domain | `collectionapi.metmuseum.org/public/collection/v1/objects/100` |
| ReSmush | 🟢 | Image compression/optimization | `api.resmush.it` |

**Recommendation**: **DiceBear** for user avatars (gecko-themed styles!), **Lorem Picsum** for content placeholders, **ReSmush** for image optimization in blog posts.

**Effort**: 3h.

### Text & Language Tools

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| Free Dictionary | 🟢 | Definitions, phonetics, audio | `api.dictionaryapi.dev/api/v2/entries/en/digital` |
| Datamuse | 🟢 | Word associations, rhymes, synonyms | `api.datamuse.com/words?ml=ringing+in+the+ears` |
| PurgoMalum | 🟢 | Profanity filter | `purgomalum.com/service/json?text=...` |
| Lingva Translate | 🟢 | Free translation (Google Translate alternative) | Self-hosted or public instances |

**Recommendation**: **PurgoMalum** for content moderation, **Datamuse** for gecko writing suggestions ("Kai suggests a better word...").

**Effort**: 2h.

---

## 4. Web3 Life Manager (Phase 3B)

### Blockchain Data

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| Blockchain.com | 🟢 | BTC stats, exchange rates, block info | `blockchain.info/stats` |
| 0x | 🟢 | Token/pool stats across DEXs | `0x.org` |
| 1inch | 🟢 | DEX aggregator quotes | `1inch.io` |
| DEX Screener | 🟢 | Multi-chain DEX pair screener | `api.dexscreener.com` |
| Etherscan | 🔑 | Ethereum address balances, tx history, contracts | `api.etherscan.io` |
| Alchemy | 🔑 | Multi-chain node access, NFT data | `alchemy.com` |
| Moralis | 🔑 | Wallet, token, NFT, DeFi data across EVM chains | `moralis.io` |
| CoinMap | 🟢 | Physical locations accepting crypto | `coinmap.org/api/v1/venues/` |

**Recommendation**: **DEX Screener** (no auth, real-time DeFi), **Etherscan** (free key, essential for wallet tracking), **Moralis** (free tier, NFT metadata for gecko NFT integration).

**Effort**: 8h (wallet tracking + portfolio display).

---

## 5. Developer & Utility Tools

### Geolocation & IP

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| IPify | 🟢 | Get user's public IP | `api.ipify.org?format=json` |
| ipapi | 🟢 | Geo from IP (city, country, timezone) | `ipapi.co/json/` |
| GeoJS | 🟢 | IP geolocation | `get.geojs.io/v1/ip/geo.json` |
| Country.is | 🟢 | Country from IP | `api.country.is/9.9.9.9` |
| Nominatim (OSM) | 🟢 | Forward/reverse geocoding | `nominatim.openstreetmap.org/search.php?city=tokyo&format=jsonv2` |
| Zippopotamus | 🟢 | Zip code → city/state for 60 countries | `api.zippopotam.us/us/90210` |

**Recommendation**: **ipapi** for auto-detecting user timezone/location (improves Situation Monitor regional relevance). **Nominatim** for any geocoding needs.

**Effort**: 1h.

### QR Code & URL Tools

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| goQR | 🟢 | Generate QR codes | `api.qrserver.com/v1/create-qr-code/?data=hello&size=200x200` |
| is.gd | 🟢 | URL shortener | `is.gd/create.php?format=simple&url=example.com` |
| Microlink | 🟢 | URL metadata + screenshots | `api.microlink.io/?url=https://github.com` |
| Wayback Machine | 🟢 | Check if URL was archived | `archive.org/wayback/available?url=google.com` |
| URLhaus | 🟢 | Malware URL database | `urlhaus-api.abuse.ch/v1/urls/recent/` |

**Recommendation**: **Microlink** is gold — extracts title, description, image, author from any URL. Perfect for link previews in chat and Situation Monitor. **goQR** for sharing/payments.

**Effort**: 2h.

### Charts & Visualization

| API | Auth | What It Adds | URL |
|-----|------|-------------|-----|
| QuickChart | 🟢 | Chart.js charts as images via URL | `quickchart.io/chart?c={type:'bar',...}` |
| Image-Charts | 🟢 | Google Charts-style image API | `image-charts.com/chart?cht=p3&...` |

**Recommendation**: **QuickChart** — generate chart images for Telegram bot `/brief` command and Discord digests without client-side rendering.

**Effort**: 2h (especially useful for moltworker).

---

## 6. Gecko Daily Briefing Concept

Combine multiple free APIs into a single gecko-delivered morning briefing:

```
🦎 Zori's Morning Briefing — Feb 8, 2026

☀️ Weather: 12°C, partly cloudy (Open-Meteo)
📈 BTC: $97,432 (+2.3%) · ETH: $3,891 (+1.1%) (CoinCap)
🔥 HN Top: "Claude 4.5 released" (HackerNews API)
💬 Reddit: $NVDA trending on WSB (Reddit Stocks)
📰 AI News: New paper on multi-agent systems (arXiv)
🎉 Today: No holidays (Nager.Date)
💡 Kai says: "The best time to plant a tree was 20 years ago.
   The second best time is now." (Quotable)

Total API cost: $0.00 | Zero auth keys needed
```

**Effort**: 6h to build the aggregator + gecko personality formatting.

---

## 7. Open Data & Research (Phase 3+)

| API | Auth | What It Adds | For |
|-----|------|-------------|-----|
| Open Library | 🟢 | Book data, covers, search | Content Creator |
| Wikipedia/Mediawiki | 🟢 | Article content, page data | Research skill |
| NASA | 🔑 (DEMO_KEY) | APOD, Mars photos, asteroids | Fun gecko content |
| Archive.org | 🟢 | Wayback Machine, digital archive | Research skill |
| FBI Wanted | 🟢 | Wanted persons data | Fun/trivia |
| USAspending | 🟢 | Federal spending data | Finance analysis |
| Open Food Facts | 🟢 | Food product database | Health/nutrition skill |
| House Stock Watcher | 🟢 | US Congress stock trades | Finance signals |
| Data USA | 🟢 | US demographics, economy | Research |

**Recommendation**: **House Stock Watcher** is fascinating for finance — Congress members' trades as a sentiment signal. **Open Library** for a future book recommendation skill.

---

## Priority Summary

### Immediate (Slot into current sprint — 0 cost, high impact)

| Bundle | APIs | Effort | Impact |
|--------|------|--------|--------|
| **Situation Monitor v2** | HackerNews + Reddit JSON + arXiv | 3h | HIGH — 3 new data feeds, zero auth |
| **Crypto expansion** | CoinCap + DEX Screener + CoinPaprika | 4h | HIGH — DeFi + richer metadata |
| **Currency conversion** | ExchangeRate-API | 1h | MEDIUM — 150 currencies, no auth |
| **URL previews** | Microlink | 1h | MEDIUM — rich link cards in chat |

### Quick Wins (2–4h each)

| Bundle | APIs | Effort | Impact |
|--------|------|--------|--------|
| **Gecko personality** | Quotable + Advice Slip + Open-Meteo + Nager.Date | 4h | MEDIUM — personality enrichment |
| **Daily briefing** | All above combined | 6h | HIGH — killer feature demo |
| **Chart images** | QuickChart | 2h | MEDIUM — moltbot `/brief` charts |
| **Avatars** | DiceBear | 1h | LOW — user profile avatars |

### Phase 3+ Backlog

| Bundle | APIs | Effort | Impact |
|--------|------|--------|--------|
| **Web3 wallet tracking** | Etherscan + Moralis + DEX Screener | 8h | HIGH |
| **Content Creator tools** | PurgoMalum + Datamuse + ReSmush | 3h | MEDIUM |
| **Research skill** | Wikipedia + Open Library + arXiv | 6h | MEDIUM |
| **Finance signals** | House Stock Watcher + Reddit Stocks | 4h | MEDIUM |

### Total: ~43h of work = 25+ free API integrations at $0/month cost

---

## Reference

- **public-apis/public-apis**: https://github.com/public-apis/public-apis (383k ⭐)
- **No-auth list**: https://mixedanalytics.com/blog/list-actually-free-open-no-auth-needed-apis/
- **Public APIs directory**: https://publicapis.io/
