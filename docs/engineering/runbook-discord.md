---
title: "Discord App Setup Runbook"
slug: runbook-discord
version: 1.0.0
description: "How to create and configure a Discord app and bot for moltworker."
lastUpdated: 2026-02-10
authors:
  - engineering@contentguru.ai
audience: internal
access:
  level: internal
  requires: authentication
vectorize:
  enabled: true
  index: internal
category: engineering
tags:
  - security
  - devops
  - runbook
deprecated: false
---

This runbook covers creating a Discord application and bot, capturing the required token, and storing it securely.

## Prerequisites

- Discord account with access to the org workspace.
- Permission to create and manage apps in the Discord Developer Portal.

## Create the Application

1. Open the Discord Developer Portal and create a new application.
2. Name the app using the environment prefix:
   - Production: prod-stream-<name>
   - Staging: stg-stream-<name>
3. Add an app icon and a short description (optional but recommended).
4. Leave "Interactions Endpoint URL" blank unless we are using HTTP interactions.

Example content (customize as needed):

- Name: prod-stream-streamkinetics
- Description: "Internal assistant for StreamKinetics environments."
- Tags: ai, assistant, internal, ops, support

## Add and Configure the Bot

1. Go to Bot tab and click "Add Bot".
2. Disable "Public Bot" unless this should be installable by anyone.
   - If "Public Bot" is disabled, set Installation -> Install Link to "None" to avoid
     the "Private application cannot have a default authorization link" warning.
3. Reset and copy the bot token. This becomes `DISCORD_BOT_TOKEN`.
4. Enable only required intents. Default to all off unless needed.
   - Message Content Intent: enable only if the bot must read message bodies.
   - Server Members Intent: enable only if user/member data is required.
   - Presence Intent: enable only if presence data is required.

## OAuth2 Install (If Needed)

Use OAuth2 installation when either of these is true:

- You want to add the bot to a server without an existing owner/admin running the install.
- You need slash commands (application commands) or permission-granted bot access.

In our current setup, we only do this if we are actively deploying the Discord channel and
need the bot in a real server. Otherwise, it can be deferred.

Steps:

1. Go to OAuth2 tab and open URL Generator.
2. Select scopes: bot, applications.commands.
3. Select permissions needed for the bot's features (minimum recommended):
  - View Channels
  - Send Messages
  - Read Message History
  - Use Application Commands
4. Generate and use the URL to install the bot in the target server.

## Store Secrets

Store the bot token with the normal secret flow:

```bash
skclaw secrets sync --env production --env-file <secure-source>
# or
skclaw secrets sync --env staging --env-file <secure-source>
```

Reference: [Secrets Runbook](runbook-secrets.md)

## Verification

- `skclaw secrets doctor --env-file <secure-source>` reports no missing keys.
- Bot can connect and respond in a test channel.

## Notes

- Use separate Discord apps for staging and production.
- Treat the bot token as a secret at all times. If exposed, rotate immediately.
