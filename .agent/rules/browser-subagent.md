---
trigger: always_on
---

For local testing, which we always validate before pushing code, only run the browser subagent once you understand if the server is running or not. It runs on localhost:5173 and is executed via package.json with `bun run dev:local`. Ensure you understand how the seeding data works, it's normally fine, but if changes are made we need to ensure they affect the correct database (check package.json scripts).

Most testing requires my account joshua@contentguru.ai using google auth.
