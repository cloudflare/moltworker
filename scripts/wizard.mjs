#!/usr/bin/env node

// Moltworker Interactive Setup Wizard
//
// A zero-dependency interactive wizard that guides users through configuration.
// Uses Node.js readline (no npm install required).
//
// Usage:
//   node scripts/wizard.mjs
//   npm run wizard

import { createInterface } from "node:readline";
import { execSync } from "node:child_process";

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultValue) {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || "");
    });
  });
}

function askSecret(question) {
  return new Promise((resolve) => {
    // For secret input, we still use regular ask since Node readline
    // doesn't easily support hidden input without extra deps
    rl.question(`${question}: `, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function select(question, choices) {
  console.log(`\n${question}`);
  choices.forEach((c, i) => console.log(`  ${i + 1}) ${c.name}`));
  const answer = await ask("Choice", "1");
  const idx = parseInt(answer, 10) - 1;
  if (idx < 0 || idx >= choices.length) {
    console.log("Invalid choice, using default.");
    return choices[0].value;
  }
  return choices[idx].value;
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

function runVisible(cmd) {
  try {
    execSync(cmd, { encoding: "utf-8", stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Moltworker Setup Wizard");
  console.log("=======================\n");
  console.log("This wizard will walk you through configuring moltworker.");
  console.log("You can re-run it at any time to change settings.\n");

  // ── Preflight ──────────────────────────────────────────────────────────────

  const wranglerCheck = run("npx wrangler whoami");
  if (!wranglerCheck || wranglerCheck.includes("not logged in")) {
    console.error("ERROR: wrangler is not authenticated. Run: npx wrangler login");
    process.exit(1);
  }

  // Parse account table from wrangler whoami text output
  // Lines look like: │ Account Name │ account_id │
  const accounts = [];
  for (const line of wranglerCheck.split("\n")) {
    const match = line.match(/│\s*(.+?)\s*│\s*([a-f0-9]{32})\s*│/);
    if (match) {
      accounts.push({ name: match[1].trim(), id: match[2] });
    }
  }

  // ── Account ID ─────────────────────────────────────────────────────────────

  let accountId;
  if (accounts.length === 1) {
    accountId = accounts[0].id;
    console.log(`Account: ${accounts[0].name} (${accountId})\n`);
  } else if (accounts.length > 1) {
    console.log("Multiple accounts found:");
    accounts.forEach((a, i) => console.log(`  ${i + 1}) ${a.name} (${a.id})`));
    const choice = await ask("Select account", "1");
    const idx = parseInt(choice, 10) - 1;
    accountId = accounts[Math.max(0, Math.min(idx, accounts.length - 1))].id;
  } else {
    accountId = await ask("Cloudflare Account ID");
  }

  if (!accountId) {
    console.error("ERROR: Account ID is required.");
    process.exit(1);
  }

  // ── AI Provider ────────────────────────────────────────────────────────────

  const secrets = {};

  const provider = await select("How do you want to connect to an AI model?", [
    { name: "Anthropic API key (direct)", value: "anthropic" },
    { name: "Cloudflare AI Gateway", value: "gateway" },
  ]);

  if (provider === "anthropic") {
    const key = await askSecret("Anthropic API key (sk-ant-...)");
    if (!key) {
      console.error("ERROR: API key is required.");
      process.exit(1);
    }
    secrets.ANTHROPIC_API_KEY = key;
  } else {
    const key = await askSecret("AI Gateway API key");
    let url = await ask("AI Gateway base URL");
    if (!key || !url) {
      console.error("ERROR: Both API key and base URL are required.");
      process.exit(1);
    }
    // Strip trailing slashes
    url = url.replace(/\/+$/, "");
    secrets.AI_GATEWAY_API_KEY = key;
    secrets.AI_GATEWAY_BASE_URL = url;
  }

  // ── Gateway Token ──────────────────────────────────────────────────────────

  console.log("\nGenerating gateway token...");
  const token = run("openssl rand -hex 32");
  if (!token) {
    console.error("ERROR: Could not generate token. Is openssl installed?");
    process.exit(1);
  }
  secrets.MOLTBOT_GATEWAY_TOKEN = token;
  console.log("OK\n");

  // ── R2 Storage ─────────────────────────────────────────────────────────────

  const setupR2 = await ask(
    "Configure R2 persistent storage? (recommended)",
    "y"
  );

  if (setupR2.toLowerCase() === "y") {
    // Try to create bucket
    console.log("\nChecking R2 bucket 'moltbot-data'...");
    const bucketList = run("npx wrangler r2 bucket list");
    if (bucketList && bucketList.includes("moltbot-data")) {
      console.log("OK - bucket already exists");
    } else {
      console.log("Creating R2 bucket...");
      if (runVisible("npx wrangler r2 bucket create moltbot-data")) {
        console.log("OK - bucket created");
      } else {
        console.log("WARN - could not create bucket (may already exist)");
      }
    }

    console.log("\nR2 API tokens must be created in the Cloudflare dashboard:");
    console.log("  1. Go to R2 > Overview > Manage R2 API Tokens");
    console.log("  2. Create a token with Object Read & Write on 'moltbot-data'");
    console.log("  3. Enter the credentials below (or press Enter to skip)\n");

    const r2Key = await ask("R2 Access Key ID (Enter to skip)");
    if (r2Key) {
      const r2Secret = await askSecret("R2 Secret Access Key");
      secrets.R2_ACCESS_KEY_ID = r2Key;
      secrets.R2_SECRET_ACCESS_KEY = r2Secret;
      secrets.CF_ACCOUNT_ID = accountId;
    } else {
      console.log("Skipping R2 credentials - storage will be ephemeral.\n");
    }
  }

  // ── Chat Channels ──────────────────────────────────────────────────────────

  const setupChannels = await ask("Configure chat channels?", "n");

  if (setupChannels.toLowerCase() === "y") {
    console.log("");
    const tg = await ask("Telegram bot token (Enter to skip)");
    if (tg) secrets.TELEGRAM_BOT_TOKEN = tg;

    const dc = await ask("Discord bot token (Enter to skip)");
    if (dc) secrets.DISCORD_BOT_TOKEN = dc;

    const sl = await ask("Slack bot token (Enter to skip)");
    if (sl) {
      secrets.SLACK_BOT_TOKEN = sl;
      const sa = await ask("Slack app token");
      if (sa) secrets.SLACK_APP_TOKEN = sa;
    }
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  const count = Object.keys(secrets).length;
  console.log(`\nUploading ${count} secret(s)...`);

  const json = JSON.stringify(secrets);
  try {
    execSync("npx wrangler secret bulk", {
      input: json,
      encoding: "utf-8",
      stdio: ["pipe", "inherit", "inherit"],
    });
    console.log("OK - secrets uploaded\n");
  } catch {
    console.error("ERROR: Failed to upload secrets.");
    rl.close();
    process.exit(1);
  }

  // ── Deploy? ────────────────────────────────────────────────────────────────

  const deploy = await ask("Deploy now?", "y");
  if (deploy.toLowerCase() === "y") {
    console.log("\nDeploying...\n");
    runVisible("npm run deploy");
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log("\n========================================");
  console.log("Setup Complete");
  console.log("========================================\n");
  console.log("Gateway token (save this!):");
  console.log(`  ${token}\n`);
  console.log("Access your worker at:");
  console.log(
    `  https://moltbot-sandbox.<your-subdomain>.workers.dev/?token=${token}\n`
  );
  console.log("Next steps:");
  console.log("  - Set up Cloudflare Access for the admin UI (see README.md)");
  if (!secrets.R2_ACCESS_KEY_ID) {
    console.log("  - Configure R2 for persistent storage (see README.md)");
  }
  console.log("");

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
