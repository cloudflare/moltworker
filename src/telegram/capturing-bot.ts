/**
 * CapturingBot — A TelegramBot subclass that captures all outputs instead of
 * making real Telegram API calls. Used by the /simulate endpoint to test
 * bot commands and chat flows without Telegram.
 */

import { TelegramBot } from './handler';
import type { TelegramMessage, TelegramFile, InlineKeyboardButton } from './handler';

/** A single captured output from the bot */
export interface CapturedMessage {
  type: 'text' | 'text_with_buttons' | 'photo' | 'edit' | 'edit_with_buttons' | 'delete' | 'action' | 'callback_answer';
  chatId: number;
  text?: string;
  parseMode?: string;
  buttons?: InlineKeyboardButton[][];
  messageId?: number;
  photoUrl?: string;
  caption?: string;
  action?: string;
}

/**
 * CapturingBot extends TelegramBot and overrides all methods that communicate
 * with the Telegram API. Instead of making HTTP requests, it captures the
 * calls in the `captured` array for later inspection.
 */
export class CapturingBot extends TelegramBot {
  public captured: CapturedMessage[] = [];
  private nextMessageId = 1000;

  constructor() {
    super('capturing-bot-dummy-token');
  }

  private nextId(): number {
    return this.nextMessageId++;
  }

  private makeFakeMessage(chatId: number, text: string): TelegramMessage {
    return {
      message_id: this.nextId(),
      chat: { id: chatId, type: 'private' },
      date: Math.floor(Date.now() / 1000),
      text,
    };
  }

  override async sendMessage(chatId: number, text: string, options?: {
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
    replyToMessageId?: number;
  }): Promise<TelegramMessage> {
    this.captured.push({
      type: 'text',
      chatId,
      text,
      parseMode: options?.parseMode,
    });
    return this.makeFakeMessage(chatId, text);
  }

  override async sendChatAction(chatId: number, action: 'typing' | 'upload_photo' = 'typing'): Promise<void> {
    this.captured.push({ type: 'action', chatId, action });
  }

  override async sendPhoto(chatId: number, photoUrl: string, caption?: string): Promise<void> {
    this.captured.push({ type: 'photo', chatId, photoUrl, caption });
  }

  override async sendPhotoBase64(chatId: number, _base64Data: string, caption?: string): Promise<void> {
    this.captured.push({ type: 'photo', chatId, caption });
  }

  override async sendMessageWithButtons(
    chatId: number,
    text: string,
    buttons: InlineKeyboardButton[][],
    options?: { parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML' }
  ): Promise<TelegramMessage> {
    this.captured.push({
      type: 'text_with_buttons',
      chatId,
      text,
      buttons,
      parseMode: options?.parseMode,
    });
    return this.makeFakeMessage(chatId, text);
  }

  override async editMessage(chatId: number, messageId: number, text: string): Promise<void> {
    this.captured.push({ type: 'edit', chatId, messageId, text });
  }

  override async editMessageWithButtons(
    chatId: number,
    messageId: number,
    text: string,
    buttons: InlineKeyboardButton[][] | null
  ): Promise<void> {
    this.captured.push({
      type: 'edit_with_buttons',
      chatId,
      messageId,
      text,
      buttons: buttons || undefined,
    });
  }

  override async deleteMessage(chatId: number, messageId: number): Promise<void> {
    this.captured.push({ type: 'delete', chatId, messageId });
  }

  override async setWebhook(_url: string): Promise<boolean> {
    return true;
  }

  override async setMyCommands(_commands: { command: string; description: string }[]): Promise<boolean> {
    return true;
  }

  override async answerCallbackQuery(
    _callbackQueryId: string,
    options?: { text?: string; showAlert?: boolean }
  ): Promise<void> {
    this.captured.push({ type: 'callback_answer', chatId: 0, text: options?.text });
  }

  override async editMessageReplyMarkup(
    chatId: number,
    messageId: number,
    buttons: InlineKeyboardButton[][] | null
  ): Promise<void> {
    this.captured.push({
      type: 'edit_with_buttons',
      chatId,
      messageId,
      buttons: buttons || undefined,
    });
  }

  override async getFile(_fileId: string): Promise<TelegramFile> {
    return { file_id: 'fake', file_unique_id: 'fake' };
  }

  override async downloadFileBase64(_filePath: string): Promise<string> {
    return '';
  }
}
