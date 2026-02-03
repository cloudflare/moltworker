# Self-Hosted AI Agent with Zero Trust Access

A complete guide to deploying your own personal AI assistant on Cloudflare Workers with Telegram integration.

---

> ⚠️ **DISCLAIMER**
> 
> This is an experimental project for developers and tinkerers. By following this guide, you acknowledge that:
> 
> - **You will encounter issues.** This is bleeding-edge technology combining multiple services.
> - **You will need to troubleshoot.** Error messages, failed deployments, and unexpected behavior are part of the journey.
> - **You run this at your own risk.** There are no guarantees of uptime, security, or functionality.
> - **You will need to tinker.** Configuration, debugging, and customization require technical skills.
> - **Costs can vary.** API usage, especially with AI providers, can add up quickly if not monitored.
> - **APIs change.** Cloudflare, Anthropic, Moonshot, and Telegram may update their APIs at any time.
> 
> This guide is provided "as-is" without warranty. If you're not comfortable with command-line tools, reading logs, and solving problems independently, this project may not be for you.

---

## What is OpenClaw?

OpenClaw (formerly Clawdbot) is an open-source personal AI agent created by **Peter Steinberger**, a Viennese software engineer and entrepreneur. Peter is the founder of PSPDFKit, a widely-used PDF SDK company, and has been a prominent figure in the iOS/macOS developer community for over a decade. His work on OpenClaw brings the same attention to detail and developer experience that made PSPDFKit successful.

OpenClaw is designed to be your **personal AI assistant** that you fully control. Unlike cloud-based AI services where your data flows through third-party servers, OpenClaw runs in your own infrastructure, giving you complete ownership of your conversations, files, and context.

### What Can OpenClaw Do?

- 💬 **Chat naturally** via Telegram, Discord, Slack, or web interface
- 🔧 **Execute code** and run commands in a sandboxed environment
- 📁 **Work with files** - read, write, and organize documents
- 🌐 **Browse the web** - fetch information and summarize content
- 🔄 **Maintain context** - remembers your preferences and past conversations
- 🤖 **Run autonomously** - schedule tasks and cron jobs
- 🛠️ **Extensible skills** - add custom capabilities via plugins

---

## Why Cloudflare Workers?

Cloudflare Workers provide a unique combination of benefits for hosting an AI agent:

| Feature | Benefit |
|---------|---------|
| **Sandboxed Containers** | Your agent runs in an isolated container - no access to your local files or network |
| **Zero Trust Security** | Cloudflare Access provides enterprise-grade authentication without complex setup |
| **Global Edge Network** | Low latency responses from anywhere in the world |
| **Persistent Storage** | R2 object storage keeps your data backed up and synced |
| **Cost Effective** | ~$5/month for Workers Paid plan covers most personal use |
| **No Server Management** | No VPS to maintain, patch, or secure |

The sandboxed architecture means even if your AI agent were somehow compromised, it cannot access anything outside its container.

---

## Prerequisites

Before starting, you'll need:

- [ ] A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [ ] Node.js 18+ installed locally
- [ ] Git installed
- [ ] A Telegram account (for bot setup)
- [ ] An AI provider API key (Anthropic or Moonshot)

---

## Step 1: Set Up Cloudflare

### 1.1 Upgrade to Workers Paid Plan

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Plans**
3. Subscribe to the **Workers Paid** plan (~$5/month)

This is required for:
- Durable Objects (container state)
- Longer execution times
- Higher request limits

### 1.2 Enable R2 Storage

1. In the Cloudflare Dashboard, go to **R2 Object Storage**
2. Click **Create bucket**
3. Name it `moltbot-data`
4. Note your **Account ID** from the URL or sidebar

### 1.3 Create R2 API Credentials

1. Go to **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Give it **Object Read & Write** permissions for your bucket
4. Save the **Access Key ID** and **Secret Access Key** - you'll need these later

### 1.4 Set Up Cloudflare Access (Zero Trust)

This protects your agent's web dashboard with authentication:

1. Go to **Zero Trust** in the Cloudflare sidebar
2. Navigate to **Access** → **Applications**
3. Click **Add an application** → **Self-hosted**
4. Configure:
   - **Application name**: `Moltbot`
   - **Session duration**: 24 hours (or your preference)
   - **Application domain**: `moltbot-sandbox.YOUR_SUBDOMAIN.workers.dev`
5. Add a policy:
   - **Policy name**: `Allow Me`
   - **Action**: Allow
   - **Include**: Emails - `your-email@example.com`
6. Save and note the **Application Audience (AUD)** tag
7. Your **Team Domain** is: `YOUR_TEAM.cloudflareaccess.com`

---

## Step 2: Create Your Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow the prompts:
   - Choose a **name** (e.g., "My AI Assistant")
   - Choose a **username** (must end in `bot`, e.g., `my_ai_assistant_bot`)
4. BotFather will give you a **token** like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. Save this token securely!

### Optional: Customize Your Bot

Send these commands to @BotFather:
```
/setdescription - Add a description
/setabouttext - Add about text
/setuserpic - Upload a profile picture
```

---

## Step 3: Get Your AI Provider API Key

### Option A: Anthropic (Claude) - Recommended

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and add billing
3. Go to **API Keys** → **Create Key**
4. Save your API key (starts with `sk-ant-`)

### Option B: Moonshot (Kimi K2.5) - Budget Option

Kimi K2.5 is significantly cheaper than Claude while still being highly capable:

1. Go to [platform.moonshot.cn](https://platform.moonshot.cn)
2. Create an account
3. Navigate to API Keys and create one
4. Save your API key

> **Note**: For Moonshot support, use the fork at [github.com/highnet/moltworker](https://github.com/highnet/moltworker)

---

## Step 4: Deploy the Worker

### 4.1 Clone the Repository

**For Anthropic (standard setup):**
```bash
git clone https://github.com/cloudflare/moltworker.git
cd moltworker
```

**For Moonshot/Kimi support:**
```bash
git clone https://github.com/highnet/moltworker.git
cd moltworker
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Configure Secrets

Run each command and paste the value when prompted:

```bash
# Required: Gateway protection token (make up a secure random string)
npx wrangler secret put MOLTBOT_GATEWAY_TOKEN

# Required: Your AI provider key
npx wrangler secret put ANTHROPIC_API_KEY
# OR for Moonshot:
npx wrangler secret put MOONSHOT_API_KEY

# Required: Cloudflare Access configuration
npx wrangler secret put CF_ACCESS_TEAM_DOMAIN
# Enter: your-team.cloudflareaccess.com

npx wrangler secret put CF_ACCESS_AUD
# Enter: your Application Audience tag from Step 1.4

# Required: Telegram bot
npx wrangler secret put TELEGRAM_BOT_TOKEN
# Enter: your bot token from Step 2

npx wrangler secret put TELEGRAM_DM_POLICY
# Enter: pairing (recommended) or open

# Required: R2 Storage
npx wrangler secret put R2_ACCESS_KEY_ID
# Enter: your R2 access key from Step 1.3

npx wrangler secret put R2_SECRET_ACCESS_KEY
# Enter: your R2 secret key from Step 1.3
```

### 4.4 Deploy

```bash
npm run build
npx wrangler deploy
```

The first deployment will:
1. Build the worker code
2. Build and push the container image
3. Configure the Durable Object bindings
4. Set up the cron schedule for R2 backups

You'll see output like:
```
Deployed moltbot-sandbox triggers
  https://moltbot-sandbox.YOUR_SUBDOMAIN.workers.dev
```

---

## Step 5: Pair Your Telegram

### 5.1 Access the Admin Dashboard

1. Open your worker URL: `https://moltbot-sandbox.YOUR_SUBDOMAIN.workers.dev`
2. Cloudflare Access will prompt you to authenticate
3. Once logged in, you'll see the Moltbot Control UI

### 5.2 Pair Your Telegram Account

1. Navigate to the **Admin** panel at `/_admin/`
2. Open Telegram and send any message to your bot
3. In the Admin panel, you'll see a pairing request
4. Click **Approve** to link your Telegram account

### 5.3 Start Chatting!

Send a message to your bot on Telegram. Try:
- "Hello! What can you do?"
- "What's the weather like in Vienna?"
- "Write a haiku about coding"

---

## Troubleshooting

### Bot shows "typing" but never responds

Check the AI provider API key:
- **Moonshot**: May have exhausted free tier credits
- **Anthropic**: Verify billing is set up

View logs:
```bash
npx wrangler tail
```

### Telegram messages not received

The webhook might be interfering with polling mode. Clear it:
```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/deleteWebhook"
```

### "Gateway token missing" error

Make sure you've set `MOLTBOT_GATEWAY_TOKEN` and are accessing with the token:
```
https://your-worker.workers.dev?token=YOUR_GATEWAY_TOKEN
```

Or use Cloudflare Access which handles authentication automatically.

### Container keeps restarting

Check container logs in the debug endpoint (if enabled):
```
https://your-worker.workers.dev/debug/processes?logs=true
```

---

## Security Considerations

1. **Rotate your Telegram bot token** if you ever expose it publicly
2. **Use strong gateway tokens** - generate with: `openssl rand -hex 32`
3. **Review Cloudflare Access policies** regularly
4. **Enable 2FA** on your Cloudflare account
5. **Monitor usage** via Cloudflare Analytics

---

## Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| Cloudflare Workers Paid | $5 |
| R2 Storage (10GB free) | $0 |
| Anthropic API | ~$5-20 (usage based) |
| **OR** Moonshot API | ~$1-5 (usage based) |
| **Total** | **~$6-25/month** |

---

## Resources

- 📖 [OpenClaw Documentation](https://docs.openclaw.ai/start/getting-started)
- 📝 [Introducing OpenClaw Blog Post](https://openclaw.ai/blog/introducing-openclaw)
- ☁️ [Cloudflare Moltworker Announcement](https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/)
- 🐙 [Official Moltworker Repository](https://github.com/cloudflare/moltworker)
- 🔧 [Moonshot/Kimi Fork](https://github.com/highnet/moltworker)

---

## Contributing

Found an issue or want to improve this guide? Open a PR on the [moltworker repository](https://github.com/highnet/moltworker).

---

*Last updated: February 2026*
