FROM docker.io/cloudflare/sandbox:0.7.0

# Install Node.js 22 (required by moltbot) and rsync (for R2 backup sync)
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

# Install moltbot globally
# Note: The npm package is still named "clawdbot" - using that until the moltbot package is published
RUN npm install -g clawdbot@latest \
    && clawdbot --version

# Create moltbot directories
# Note: When R2 is mounted, MOLTBOT_STATE_DIR env var points to the mount path
# Templates are stored in /root/.moltbot-templates for initialization
RUN mkdir -p /root/.moltbot \
    && mkdir -p /root/.moltbot-templates \
    && mkdir -p /root/molt \
    && mkdir -p /root/molt/skills

# Copy startup script
# Build cache bust: 2026-01-27-v22-rename-to-moltbot
COPY start-moltbot.sh /usr/local/bin/start-moltbot.sh
RUN chmod +x /usr/local/bin/start-moltbot.sh

# Copy default configuration template
COPY moltbot.json.template /root/.moltbot-templates/moltbot.json.template

# Set working directory
WORKDIR /root/molt

# Expose the gateway port
EXPOSE 18789
