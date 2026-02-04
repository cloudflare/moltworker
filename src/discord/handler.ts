/**
 * Discord Announcements Handler
 * Monitors Discord channels for announcements and forwards them to Telegram
 */

import { createOpenRouterClient, extractTextResponse, type ChatMessage } from '../openrouter/client';
import { TelegramBot } from '../telegram/handler';

// Discord API Types
export interface DiscordMessage {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  embeds?: DiscordEmbed[];
  attachments?: DiscordAttachment[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
}

export interface DiscordAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  guild_id?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
}

/**
 * Discord API client
 */
export class DiscordClient {
  private token: string;
  private baseUrl = 'https://discord.com/api/v10';

  constructor(token: string) {
    this.token = token;
  }

  private async fetch(endpoint: string, options?: RequestInit): Promise<Response> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bot ${this.token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * Get messages from a channel
   */
  async getMessages(channelId: string, limit: number = 10, after?: string): Promise<DiscordMessage[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (after) {
      params.set('after', after);
    }

    const response = await this.fetch(`/channels/${channelId}/messages?${params}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Discord API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Get channel info
   */
  async getChannel(channelId: string): Promise<DiscordChannel> {
    const response = await this.fetch(`/channels/${channelId}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Discord API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Get guild (server) info
   */
  async getGuild(guildId: string): Promise<DiscordGuild> {
    const response = await this.fetch(`/guilds/${guildId}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Discord API error: ${error}`);
    }

    return response.json();
  }
}

/**
 * Format Discord message for Telegram
 */
function formatDiscordMessage(message: DiscordMessage, channelName: string, guildName?: string): string {
  const parts: string[] = [];

  // Header with source info
  const source = guildName ? `${guildName} / #${channelName}` : `#${channelName}`;
  parts.push(`📢 Discord: ${source}`);
  parts.push(`From: ${message.author.username}`);
  parts.push('');

  // Main content
  if (message.content) {
    parts.push(message.content);
  }

  // Embeds
  if (message.embeds && message.embeds.length > 0) {
    for (const embed of message.embeds) {
      if (embed.title) {
        parts.push(`\n**${embed.title}**`);
      }
      if (embed.description) {
        parts.push(embed.description);
      }
      if (embed.fields) {
        for (const field of embed.fields) {
          parts.push(`\n${field.name}: ${field.value}`);
        }
      }
    }
  }

  // Attachments
  if (message.attachments && message.attachments.length > 0) {
    parts.push('\nAttachments:');
    for (const att of message.attachments) {
      parts.push(`- ${att.filename}: ${att.url}`);
    }
  }

  return parts.join('\n');
}

/**
 * Discord Announcements Handler
 */
export class DiscordAnnouncementsHandler {
  private discord: DiscordClient;
  private telegram: TelegramBot;
  private openrouterKey: string;
  private r2Bucket: R2Bucket;
  private channelIds: string[];
  private telegramChatId: number;

  constructor(
    discordToken: string,
    telegramToken: string,
    openrouterKey: string,
    r2Bucket: R2Bucket,
    channelIds: string[], // Discord channel IDs to monitor
    telegramChatId: number // Telegram chat to forward to
  ) {
    this.discord = new DiscordClient(discordToken);
    this.telegram = new TelegramBot(telegramToken);
    this.openrouterKey = openrouterKey;
    this.r2Bucket = r2Bucket;
    this.channelIds = channelIds;
    this.telegramChatId = telegramChatId;
  }

  /**
   * Get the last processed message ID for a channel
   */
  private async getLastMessageId(channelId: string): Promise<string | null> {
    const key = `discord/last_message/${channelId}`;
    const obj = await this.r2Bucket.get(key);
    if (obj) {
      return obj.text();
    }
    return null;
  }

  /**
   * Save the last processed message ID for a channel
   */
  private async setLastMessageId(channelId: string, messageId: string): Promise<void> {
    const key = `discord/last_message/${channelId}`;
    await this.r2Bucket.put(key, messageId);
  }

  /**
   * Check a channel for new announcements
   */
  async checkChannel(channelId: string): Promise<DiscordMessage[]> {
    const lastId = await this.getLastMessageId(channelId);
    const messages = await this.discord.getMessages(channelId, 10, lastId || undefined);

    // Messages are returned newest first, reverse for chronological processing
    messages.reverse();

    // Update last message ID if we got any
    if (messages.length > 0) {
      await this.setLastMessageId(channelId, messages[messages.length - 1].id);
    }

    return messages;
  }

  /**
   * Summarize messages using AI
   */
  async summarizeMessages(messages: DiscordMessage[], channelName: string): Promise<string> {
    if (messages.length === 0) {
      return '';
    }

    // If only 1 message, don't summarize
    if (messages.length === 1) {
      return '';
    }

    const client = createOpenRouterClient(this.openrouterKey);

    const content = messages.map(m => {
      let text = `[${m.author.username}]: ${m.content}`;
      if (m.embeds?.length) {
        for (const embed of m.embeds) {
          if (embed.title) text += `\n[Embed] ${embed.title}`;
          if (embed.description) text += `\n${embed.description}`;
        }
      }
      return text;
    }).join('\n\n---\n\n');

    const chatMessages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes Discord announcements. Be concise and focus on the key points. Output a brief summary in 2-3 sentences.',
      },
      {
        role: 'user',
        content: `Summarize these ${messages.length} announcements from #${channelName}:\n\n${content}`,
      },
    ];

    try {
      const response = await client.chatCompletion('haiku', chatMessages);
      return extractTextResponse(response);
    } catch (error) {
      console.error('[Discord] Failed to summarize:', error);
      return '';
    }
  }

  /**
   * Forward messages to Telegram
   */
  async forwardToTelegram(messages: DiscordMessage[], channelId: string): Promise<void> {
    if (messages.length === 0) {
      return;
    }

    try {
      // Get channel and guild info for context
      const channel = await this.discord.getChannel(channelId);
      let guildName: string | undefined;

      if (channel.guild_id) {
        try {
          const guild = await this.discord.getGuild(channel.guild_id);
          guildName = guild.name;
        } catch {
          // Ignore guild fetch errors
        }
      }

      // If multiple messages, send summary first
      if (messages.length > 1) {
        const summary = await this.summarizeMessages(messages, channel.name);
        if (summary) {
          await this.telegram.sendMessage(
            this.telegramChatId,
            `📋 Summary of ${messages.length} new messages from ${guildName || 'Discord'} / #${channel.name}:\n\n${summary}`
          );
        }
      }

      // Forward each message
      for (const message of messages) {
        const formatted = formatDiscordMessage(message, channel.name, guildName);
        await this.telegram.sendMessage(this.telegramChatId, formatted);

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error('[Discord] Failed to forward to Telegram:', error);
    }
  }

  /**
   * Check all monitored channels and forward new messages
   */
  async checkAllChannels(): Promise<{ channelId: string; newMessages: number }[]> {
    const results: { channelId: string; newMessages: number }[] = [];

    for (const channelId of this.channelIds) {
      try {
        const messages = await this.checkChannel(channelId);

        if (messages.length > 0) {
          await this.forwardToTelegram(messages, channelId);
        }

        results.push({ channelId, newMessages: messages.length });
      } catch (error) {
        console.error(`[Discord] Failed to check channel ${channelId}:`, error);
        results.push({ channelId, newMessages: -1 }); // -1 indicates error
      }
    }

    return results;
  }
}

/**
 * Create a Discord announcements handler
 */
export function createDiscordHandler(
  discordToken: string,
  telegramToken: string,
  openrouterKey: string,
  r2Bucket: R2Bucket,
  channelIds: string[],
  telegramChatId: number
): DiscordAnnouncementsHandler {
  return new DiscordAnnouncementsHandler(
    discordToken,
    telegramToken,
    openrouterKey,
    r2Bucket,
    channelIds,
    telegramChatId
  );
}
