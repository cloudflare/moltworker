---
name: installer
description: Install OpenClaw plugins and skills from npm or ClawHub. Provides install_plugin, install_skill, and list_installed tools for managing extensions in the Cloudflare Worker environment.
---

# Installer Skill

A skill for installing OpenClaw plugins and skills in the Cloudflare Worker environment.

## Tools

### install_plugin

Installs an OpenClaw plugin by name.

**Parameters:**
- `name` (string): The plugin name or package to install. Should be a scoped npm package (e.g., `@getfoundry/foundry-openclaw`).

**Usage:**
```
"Install the @getfoundry/foundry-openclaw plugin"
```

**Notes:**
- Plugins are in-process code modules that extend OpenClaw with tools, RPC methods, CLI commands, and background services.
- Installed via `openclaw plugins install <name>`
- Managed under plugins config in OpenClaw.
- This tool calls the `/api/plugins/install` endpoint which executes the installation in the container.

### install_skill

Installs an OpenClaw skill by slug from ClawHub.

**Parameters:**
- `slug` (string): The skill slug to install from ClawHub (e.g., `research`, `code-analysis`, etc.).

**Usage:**
```
"Install the research skill from ClawHub"
```

**Notes:**
- Skills are AgentSkills-compatible folders with SKILL.md that teach agents how to use tools.
- Installed via `clawdhub install <slug>`
- Loaded from multiple sources: bundled (~/.openclaw/skills), managed workspace (<workspace>/skills), plugin-provided, and extra dirs.
- This tool calls the `/api/skills/install` endpoint which executes the installation in the container.

## Security

The installation is protected by Cloudflare Access authentication when accessing the admin API.

## Installation Process

When you install a plugin or skill:

1. The skill calls the appropriate API endpoint on the worker.
2. The worker executes `openclaw plugins install` or `clawdhub install` in the container.
3. The installation process includes:
   - Downloading dependencies via npm
   - Installing the plugin/skill to the appropriate directory
   - Updating the installation manifest in R2 storage
4. The OpenClaw gateway is restarted to load the new plugin/skill.
5. Installation persists across container restarts via R2 backup.

## Example Conversations

**Installing a Plugin:**
```
User: I need the Foundry skill for OpenClaw
AI: I can help you install the @getfoundry/foundry-openclaw plugin. This will enable advanced code analysis capabilities. The installation may take 1-2 minutes depending on dependencies.

User: Please install it
AI: [Calling install_plugin tool]

[The installation proceeds...]
AI: Installation completed successfully! The @getfoundry/foundry-openclaw plugin is now installed. The gateway has been restarted to load the new plugin.
```

**Installing a Skill:**
```
User: I want to add a skill for web research
AI: I can install the web-research skill from ClawHub. This skill will enable web browsing and information gathering capabilities.

User: Install the web-research skill
AI: [Calling install_skill tool]

[The installation proceeds...]
AI: Installation completed successfully! The web-research skill is now installed and available for use in conversations.
```

## Troubleshooting

If an installation fails:

1. **Timeout**: Installations may timeout after 2 minutes. Check the worker logs for details.
2. **Network issues**: npm package downloads may fail. Retry the installation.
3. **Dependency conflicts**: Some plugins/skills may have conflicting dependencies. Check the error message.
4. **R2 storage**: If R2 is not configured, installations will persist until the next container restart.

To check installation status, visit the admin UI at `/_admin/` or use the list tools:
```
"List all installed plugins and skills"
```
