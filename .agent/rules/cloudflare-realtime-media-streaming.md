---
trigger: always_on
---

Realtime Media & Streaming

## Context

Use this rule for Agents that handle Voice, Video, or high-frequency data streams.

## Standards

1.  **Calls**: Use the `RealtimeKit` SDK/APIs for managing WebRTC sessions.
2.  **Pipelines**: Use Cloudflare Pipelines to offload high-volume stream data to R2/Iceberg; do not write to D1 for high-frequency streams.
3.  **TURN**: Configure `turn_service` in `wrangler.jsonc` if clients are behind restrictive firewalls.
4.  **Tracks**: Explicitly manage media tracks; ensure unused tracks are closed to save bandwidth.

## Code Pattern (Wrangler Config)

````jsonc
// wrangler.jsonc additions
{
  "turn_service": {
    "enabled": true
  },
  "pipelines": [
    {
      "name": "agent-analytics",
      "source": "stream-binding",
      "sink": "r2-data-catalog"
    }
  ]
}

## Code Pattern (Track Management)

```typescript
// Pseudo-code for handling media tracks in a Realtime Agent
async onTrack(track: MediaStreamTrack) {
  if (track.kind === 'audio') {
     // Pipe audio to AI model for transcription
     const stream = track.getReadableStream();
     await this.transcribe(stream);
  }
}
````
