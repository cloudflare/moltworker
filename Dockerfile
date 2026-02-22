FROM docker.io/cloudflare/sandbox:0.7.0

# Install Node.js 22 (required by OpenClaw), rclone (for R2 persistence), and git (for repo clone)
# The base image has Node 20, we need to replace it with Node 22
# Using direct binary download for reliability
ENV NODE_VERSION=22.13.1
RUN ARCH="$(dpkg --print-architecture)" \
    && case "${ARCH}" in \
         amd64) NODE_ARCH="x64" ;; \
         arm64) NODE_ARCH="arm64" ;; \
         *) echo "Unsupported architecture: ${ARCH}" >&2; exit 1 ;; \
       esac \
    && apt-get update && apt-get install -y xz-utils ca-certificates rclone git \
    && curl -fsSLk https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz -o /tmp/node.tar.xz \
    && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
    && rm /tmp/node.tar.xz \
    && node --version \
    && npm --version

# Install pnpm globally
RUN npm install -g pnpm

# Install OpenClaw (latest version)
RUN npm install -g openclaw@latest \
    && openclaw --version

# Install ws module globally for CDP browser automation scripts
RUN npm install -g ws

# Ensure globally installed modules are findable by scripts
ENV NODE_PATH=/usr/local/lib/node_modules

# Create OpenClaw directories
RUN mkdir -p /root/.openclaw \
    && mkdir -p /root/clawd \
    && mkdir -p /root/clawd/skills \
    && mkdir -p /root/clawd/warm-memory \
    && mkdir -p /root/clawd/.modification-history \
    && mkdir -p /root/clawd/brain-memory/reflections \
    && mkdir -p /root/clawd/warm-memory/portfolio

# Copy startup script
# Build cache bust: 2026-02-22-v80-notion-api
COPY start-openclaw.sh /usr/local/bin/start-openclaw.sh
RUN chmod +x /usr/local/bin/start-openclaw.sh

# Copy custom skills (both live and pristine copy for post-R2-restore overlay)
COPY skills/ /root/clawd/skills/
COPY skills/ /root/clawd/.skills-pristine/

# Copy permanent memory seed file (built-in OpenClaw memory, no temporal decay)
COPY MEMORY.md /root/clawd/MEMORY.md

# Copy HVF portfolio companies list for portfolio-research cron
COPY portfolio-companies.md /root/clawd/portfolio-companies.md

# Copy agent communication scripts
COPY scripts/ /root/clawd/moltworker/scripts/
COPY TOOLS.md /root/clawd/moltworker/TOOLS.md

# Set working directory
WORKDIR /root/clawd

# Expose the gateway port
EXPOSE 18789
