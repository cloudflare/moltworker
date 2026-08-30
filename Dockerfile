FROM docker.io/cloudflare/sandbox:0.7.20

# Install Node.js 22 (required by OpenClaw)
# The base image has Node 20, we need to replace it with Node 22
# Using direct binary download for reliability
# Note: rclone is no longer needed — persistence uses Sandbox SDK backup/restore API
ENV NODE_VERSION=22.22.3
RUN ARCH="$(dpkg --print-architecture)" \
    && case "${ARCH}" in \
         amd64) NODE_ARCH="x64" ;; \
         arm64) NODE_ARCH="arm64" ;; \
         *) echo "Unsupported architecture: ${ARCH}" >&2; exit 1 ;; \
       esac \
    && apt-get update && apt-get install -y xz-utils ca-certificates \
    && rm -rf /usr/local/lib/node_modules /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
    && curl -fsSLk https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz -o /tmp/node.tar.xz \
    && rm -rf /usr/local/lib/node_modules /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
    && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
    && rm /tmp/node.tar.xz \
    && node --version \
    && npm --version

# Install OpenClaw and its externalized Slack plugin. Keep both pinned to
# compatible releases for reproducible builds. The plugin is installed in the
# immutable global prefix so restoring /home/openclaw cannot remove it.
RUN npm install -g openclaw@2026.7.1-2 @openclaw/slack@2026.7.1 \
    && openclaw --version \
    && test -f /usr/local/lib/node_modules/@openclaw/slack/openclaw.plugin.json

# Use /home/openclaw as the home directory instead of /root.
# The Sandbox SDK backup API only allows directories under /home, /workspace,
# /tmp, or /var/tmp — not /root.
ENV HOME=/home/openclaw
RUN mkdir -p /home/openclaw/.openclaw \
    && mkdir -p /home/openclaw/clawd \
    && mkdir -p /home/openclaw/clawd/skills \
    && rm -rf /root/.openclaw \
    && ln -s /home/openclaw/.openclaw /root/.openclaw \
    && test -L /root/.openclaw \
    && ln -s /home/openclaw/clawd /root/clawd

# Copy startup configuration files
# Build cache bust: 2026-08-29-v38-slack-ready-hook
COPY container/patch-openclaw-config.cjs /usr/local/lib/openclaw/patch-openclaw-config.cjs
COPY container/install-moltworker-slack-ready-hook.cjs /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs
COPY container/hooks/moltworker-slack-ready/HOOK.md /usr/local/lib/openclaw/hooks/moltworker-slack-ready/HOOK.md
COPY container/hooks/moltworker-slack-ready/handler.js /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js
COPY config/workers-ai-models.json /usr/local/lib/config/workers-ai-models.json
COPY start-openclaw.sh /usr/local/bin/start-openclaw.sh
RUN chmod +x /usr/local/bin/start-openclaw.sh \
    && test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/HOOK.md \
    && test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js \
    && test -f /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs \
    && node --check /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js \
    && node --check /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs

# Copy custom skills
COPY skills/ /home/openclaw/clawd/skills/

# Ensure all files are readable for mksquashfs (Sandbox SDK backup).
# OpenClaw and other tools may create restrictive config files at runtime,
# but we fix build-time permissions here; runtime permissions are fixed
# before each backup via sandbox.exec("chmod -R a+rX /home/openclaw").
RUN chmod -R a+rX /home/openclaw

# Set working directory
WORKDIR /home/openclaw/clawd

# Expose the gateway port
EXPOSE 18789
