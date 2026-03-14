/**
 * MentraOS AppServer for OpenClaw augment.
 *
 * Bridges Mentra Live smart glasses (mic, camera, display) to the
 * OpenClaw AI agent running in the Cloudflare Sandbox container.
 *
 * Note: This module defines the augment interface. In a Worker environment,
 * the actual MentraOS SDK connection is handled via the /mentra/* HTTP routes
 * since Workers run in V8 isolates (no long-lived TCP connections).
 */

import { formatForGlasses } from './display-format';
import { queryOpenClaw, type BridgeConfig } from './glass-bridge';

export interface AugmentConfig {
  gatewayUrl: string;
  gatewayToken: string;
  apiKey: string;
  port?: number;
}

export interface GlassesSession {
  sendText: (text: string) => void;
}

export interface TranscriptionEvent {
  text: string;
  isFinal: boolean;
}

export interface PhotoEvent {
  imageData: string;
}

/**
 * OpenClawAugment — MentraOS AppServer
 * package: com.weavelogic.openclaw
 *
 * Handles glasses session lifecycle:
 * - onConnect: shows ready message
 * - onTranscription: processes voice input through OpenClaw
 * - onPhoto: analyzes camera captures through OpenClaw vision
 * - onButtonPress: activates listening mode
 */
export class OpenClawAugment {
  readonly packageName = 'com.weavelogic.openclaw';
  private bridgeConfig: BridgeConfig;

  constructor(private config: AugmentConfig) {
    this.bridgeConfig = {
      gatewayUrl: config.gatewayUrl,
      gatewayToken: config.gatewayToken,
    };
  }

  onConnect(session: GlassesSession): void {
    session.sendText('WeaveLogic AI\nReady');
  }

  async onTranscription(session: GlassesSession, event: TranscriptionEvent): Promise<void> {
    if (!event.isFinal) return;

    session.sendText('Thinking...');
    try {
      const response = await queryOpenClaw(this.bridgeConfig, {
        message: event.text,
      });
      session.sendText(formatForGlasses(response));
    } catch (err) {
      console.error('[Mentra] Transcription query failed:', err);
      session.sendText('Sorry, something went wrong.\nPlease try again.');
    }
  }

  async onPhoto(session: GlassesSession, event: PhotoEvent): Promise<void> {
    session.sendText('Analyzing...');
    try {
      const response = await queryOpenClaw(this.bridgeConfig, {
        message: 'What do you see? Be concise.',
        imageData: event.imageData,
      });
      session.sendText(formatForGlasses(response));
    } catch (err) {
      console.error('[Mentra] Photo query failed:', err);
      session.sendText('Could not analyze image.\nPlease try again.');
    }
  }

  onButtonPress(session: GlassesSession): void {
    session.sendText('Listening...');
  }
}
