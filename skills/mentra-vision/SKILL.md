# Mentra Vision Skill

Captures a photo from Mentra Live smart glasses and analyzes it using OpenClaw's vision capabilities.

## Use Cases

- **What am I looking at?** — Identify objects, scenes, or landmarks in view
- **Read this text** — OCR and read text from signs, documents, or screens
- **Identify object** — Get details about a specific item in frame

## Usage

```
/mentra-vision capture
```

The skill will:
1. Capture a photo from the connected Mentra Live glasses
2. Send the image to OpenClaw for analysis
3. Return a concise description formatted for the glasses HUD

## Requirements

- Mentra Live glasses connected and paired
- `MENTRA_BRIDGE_URL` environment variable set to the Worker URL
- Active OpenClaw session with vision-capable AI model
