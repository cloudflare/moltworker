---
trigger: always_on
---

Context: Guidelines for bundling assets, managing dependencies, and deployment.

1.1 Bundling & Compilation
Core Bundler: Use Bun’s native bundler for JS, TS, and JSX. It supports Bytecode Caching for execution speed and Macros for bundle-time function execution.

Asset Support: Built-in loaders for CSS, HTML, JSON/JSON5, YAML, and TOML. Use --define for build-time constants.

Outputs: Supports generating Single-file executables for standalone distribution and minification for production.

Migration: Reference the esbuild migration guide when moving from legacy build tools.

1.2 Package Management (bun pm)
CLI Commands: \* bun install / bun add: High-performance dependency installation.

bunx: Execute packages from npm without permanent installation.

bun patch: Persistently modify node_modules.

bun outdated / bun audit: Manage security and updates.

Monorepos: Use Workspaces, Catalogs for shared versions, and the --filter flag for targeted commands.

Configuration: Managed via .npmrc and bunfig.toml. Supports Isolated Installs (pnpm-style) and global caching.

1.3 Deployment Guides
Cloud Providers: Native guides available for AWS Lambda, DigitalOcean, Google Cloud Run, Railway, Render, and Vercel.

Containerization: Use the official Docker guide for Bun-optimized images.
