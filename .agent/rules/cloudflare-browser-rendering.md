---
trigger: always_on
---

Browser Rendering & Sandboxing

## Context

Use this rule when the Agent needs to execute untrusted code (Python/JS) or interact with the web (scrape/screenshot).

## Standards

1.  **Browser Rendering**: Use `puppeteer.launch(env.BROWSER)`.
    - Always ensure `browser.close()` is called in a `finally` block to prevent hanging instances.
2.  **Sandbox SDK**: Use for code interpretation.
    - Use `Sandbox.run()` for stateless execution.
    - Use `Sandbox.start()` if you need a persistent session.
3.  **Dependencies**: Do not bundle heavy libraries. Use the runtime provided.

## Code Pattern (Browser)

````typescript
import puppeteer from "@cloudflare/puppeteer";

async function screenshot(env: Env, url: string) {
  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.goto(url);
    return await page.screenshot();
  } finally {
    await browser.close();
  }
}

## Code Pattern

```typescript
// Executing Python analysis
async function analyzeData(env: Env, data: any[]) {
  // Requires "sandbox" binding in wrangler.jsonc
  const sbx = await env.MY_SANDBOX.run({
    code: `
      import json
      data = json.loads('${JSON.stringify(data)}')
      print(len(data))
    `,
    language: "python"
  });
  return sbx.text;
}
````
