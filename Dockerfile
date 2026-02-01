FROM docker.io/cloudflare/sandbox:0.7.0

# Install Node.js 22 (required by clawdbot) and rsync (for R2 backup sync)
# The base image has Node 20, we need to replace it with Node 22
# Using direct binary download for reliability
ENV NODE_VERSION=22.13.1
RUN apt-get update && apt-get install -y xz-utils ca-certificates rsync \
    && curl -fsSLk https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz -o /tmp/node.tar.xz \
    && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
    && rm /tmp/node.tar.xz \
    && node --version \
    && npm --version

# Install pnpm globally
RUN npm install -g pnpm

# Install moltbot (CLI is still named clawdbot until upstream renames)
# Pin to specific version for reproducible builds
RUN npm install -g clawdbot@2026.1.24-3 \
    && clawdbot --version

# Create moltbot directories (paths still use clawdbot until upstream renames)
# Templates are stored in /root/.clawdbot-templates for initialization
RUN mkdir -p /root/.clawdbot \
    && mkdir -p /root/.clawdbot-templates \
    && mkdir -p /root/clawd \
    && mkdir -p /root/clawd/skills

# Copy startup script
# Build cache bust: 2026-02-01-v27-workspace-specs
COPY start-moltbot.sh /usr/local/bin/start-moltbot.sh
RUN chmod +x /usr/local/bin/start-moltbot.sh

# Copy default configuration template
COPY moltbot.json.template /root/.clawdbot-templates/moltbot.json.template

# Copy custom skills
COPY skills/ /root/clawd/skills/

# Copy workspace templates (specs, config)
# These provide baseline files that will be overwritten by R2 restore if backup exists
COPY workspace/ /root/clawd/

# Set working directory
WORKDIR /root/clawd

# Expose the gateway port
EXPOSE 18789
