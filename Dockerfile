FROM docker.io/cloudflare/sandbox:0.7.0

# Build cache bust: 2026-02-14-v44-auto-approve-pairing
# Install Node.js 22 (required by openclaw) and rsync (for R2 backup sync)
# The base image has Node 20, we need to replace it with Node 22
# Using direct binary download for reliability
ENV NODE_VERSION=22.13.1
RUN apt-get update && apt-get install -y xz-utils ca-certificates rsync git \
    && curl -fsSLk https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz -o /tmp/node.tar.xz \
    && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
    && rm /tmp/node.tar.xz \
    && node --version \
    && npm --version

# Install pnpm globally
RUN npm install -g pnpm

# Install openclaw (latest version with OAuth support)
RUN npm install -g openclaw@latest \
    && openclaw --version

# Install ws module globally for CDP browser automation scripts
RUN npm install -g ws

# Ensure globally installed modules are findable by scripts
ENV NODE_PATH=/usr/local/lib/node_modules

# Create openclaw directories
# Note: openclaw still uses ~/.clawdbot for config compatibility
RUN mkdir -p /root/.clawdbot \
    && mkdir -p /root/.clawdbot-templates \
    && mkdir -p /root/clawd \
    && mkdir -p /root/clawd/skills \
    && mkdir -p /root/clawd/warm-memory \
    && mkdir -p /root/clawd/.modification-history \
    && mkdir -p /root/clawd/brain-memory/reflections

# Copy startup script (version: 2026-02-04-v3)
COPY start-moltbot.sh /usr/local/bin/start-moltbot.sh
RUN chmod +x /usr/local/bin/start-moltbot.sh && echo "start-moltbot.sh version: 2026-02-14-v71-auto-approve-pairing"

# Copy default configuration template
COPY moltbot.json.template /root/.clawdbot-templates/moltbot.json.template

# Copy custom skills
COPY skills/ /root/clawd/skills/

# Set working directory
WORKDIR /root/clawd

# Expose the gateway port
EXPOSE 18789
