import { describe, it, expect } from 'vitest';
import { CapturingBot } from './capturing-bot';

describe('CapturingBot', () => {
  it('captures sendMessage calls', async () => {
    const bot = new CapturingBot();
    const msg = await bot.sendMessage(123, 'Hello world', { parseMode: 'HTML' });

    expect(bot.captured).toHaveLength(1);
    expect(bot.captured[0]).toEqual({
      type: 'text',
      chatId: 123,
      text: 'Hello world',
      parseMode: 'HTML',
    });
    expect(msg.message_id).toBeGreaterThan(0);
    expect(msg.chat.id).toBe(123);
    expect(msg.text).toBe('Hello world');
  });

  it('captures sendMessageWithButtons calls', async () => {
    const bot = new CapturingBot();
    const buttons = [[{ text: 'Click me', callback_data: 'test' }]];
    await bot.sendMessageWithButtons(42, 'Choose:', buttons);

    expect(bot.captured).toHaveLength(1);
    expect(bot.captured[0].type).toBe('text_with_buttons');
    expect(bot.captured[0].buttons).toEqual(buttons);
  });

  it('captures sendChatAction calls', async () => {
    const bot = new CapturingBot();
    await bot.sendChatAction(123, 'typing');

    expect(bot.captured).toHaveLength(1);
    expect(bot.captured[0]).toEqual({
      type: 'action',
      chatId: 123,
      action: 'typing',
    });
  });

  it('captures editMessage calls', async () => {
    const bot = new CapturingBot();
    await bot.editMessage(123, 456, 'Updated text');

    expect(bot.captured).toHaveLength(1);
    expect(bot.captured[0]).toEqual({
      type: 'edit',
      chatId: 123,
      messageId: 456,
      text: 'Updated text',
    });
  });

  it('captures deleteMessage calls', async () => {
    const bot = new CapturingBot();
    await bot.deleteMessage(123, 456);

    expect(bot.captured).toHaveLength(1);
    expect(bot.captured[0]).toEqual({
      type: 'delete',
      chatId: 123,
      messageId: 456,
    });
  });

  it('captures sendPhoto calls', async () => {
    const bot = new CapturingBot();
    await bot.sendPhoto(123, 'https://example.com/photo.jpg', 'A photo');

    expect(bot.captured).toHaveLength(1);
    expect(bot.captured[0]).toEqual({
      type: 'photo',
      chatId: 123,
      photoUrl: 'https://example.com/photo.jpg',
      caption: 'A photo',
    });
  });

  it('assigns unique message IDs to each message', async () => {
    const bot = new CapturingBot();
    const msg1 = await bot.sendMessage(1, 'First');
    const msg2 = await bot.sendMessage(1, 'Second');
    const msg3 = await bot.sendMessageWithButtons(1, 'Third', []);

    expect(msg1.message_id).not.toBe(msg2.message_id);
    expect(msg2.message_id).not.toBe(msg3.message_id);
  });

  it('captures multiple calls in sequence', async () => {
    const bot = new CapturingBot();
    await bot.sendChatAction(1, 'typing');
    await bot.sendMessage(1, 'Hello');
    await bot.editMessage(1, 1000, 'Edited');
    await bot.deleteMessage(1, 1000);

    expect(bot.captured).toHaveLength(4);
    expect(bot.captured.map(m => m.type)).toEqual(['action', 'text', 'edit', 'delete']);
  });

  it('stubs getFile and downloadFileBase64 without error', async () => {
    const bot = new CapturingBot();
    const file = await bot.getFile('some-id');
    const base64 = await bot.downloadFileBase64('some/path');

    expect(file).toBeDefined();
    expect(base64).toBe('');
  });

  it('stubs setWebhook and setMyCommands', async () => {
    const bot = new CapturingBot();
    expect(await bot.setWebhook('https://example.com')).toBe(true);
    expect(await bot.setMyCommands([{ command: 'test', description: 'Test' }])).toBe(true);
  });
});
