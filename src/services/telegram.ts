/**
 * Telegram Bot service for PolzaGPT
 * 
 * This service handles Telegram bot initialization and message processing using grammy.
 * Currently implements basic message handling with placeholder responses.
 * Authorization and query processing will be added in future slices.
 */

import { Bot, webhookCallback } from 'grammy';
import type { Env } from '../config/env';
import { getExpertData } from './sheets';
import { findExpertsWithAI } from './gemini';

/**
 * Creates and configures a Telegram bot instance
 * 
 * @param env - Environment configuration containing Telegram bot token
 * @returns Configured Bot instance with message handlers
 */
export function createBot(env: Env) {
  // Create bot instance with the token from environment
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  // Parse whitelist from environment variables
  const allowedGroupChatIds = env.ALLOWED_GROUP_CHAT_IDS
    ? env.ALLOWED_GROUP_CHAT_IDS.split(',').map(id => id.trim())
    : [];
  
  const allowedUserIds = env.ALLOWED_USER_IDS
    ? env.ALLOWED_USER_IDS.split(',').map(id => id.trim())
    : [];

  /**
   * Checks if a user/chat is authorized to use the bot
   * 
   * @param chatId - Chat ID from Telegram
   * @param userId - User ID from Telegram  
   * @param isGroup - Whether this is a group chat
   * @returns true if authorized, false otherwise
   */
  function isAuthorized(chatId: number, userId: number, isGroup: boolean): boolean {
    if (isGroup) {
      return allowedGroupChatIds.includes(chatId.toString());
    } else {
      return allowedUserIds.includes(userId.toString());
    }
  }

  // Set up message handler for all text messages
  bot.on('message:text', async (ctx) => {
    try {
      // Extract chat and user information
      const chatId = ctx.chat.id;
      const userId = ctx.from.id;
      const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';

      // Check authorization
      if (!isAuthorized(chatId, userId, isGroup)) {
        await ctx.reply('Этот бот доступен только в авторизованном чате сообщества.');
        return;
      }

      // Get message text
      const messageText = ctx.message.text;

      // Extract query text
      let query = messageText;
      if (isGroup) {
        // Remove @polza79bot mention from anywhere in the text using regex
        query = messageText.replace(/@polza79bot/gi, '').trim();
      } else {
        // In DMs, use the entire message text
        query = messageText.trim();
      }

      // Validate query
      if (!query) {
        const exampleText = isGroup 
          ? "Пожалуйста, укажите запрос. Например: @polza79bot найди мне iOS разработчика"
          : "Пожалуйста, укажите запрос. Например: найди мне iOS разработчика";
        await ctx.reply(exampleText, { reply_to_message_id: ctx.message.message_id });
        return;
      }

      // Process query with AI integration
      try {
        // Fetch expert data from Google Sheets (with KV caching)
        const expertData = await getExpertData(env);
        
        // Use Gemini AI to process the query and find relevant experts
        const responseMessage = await findExpertsWithAI(query, expertData, env);
        
        // Send the AI-generated response to the user with MarkdownV2 parsing
        await ctx.reply(responseMessage, { 
          reply_to_message_id: ctx.message.message_id,
          parse_mode: 'MarkdownV2'
        });
      } catch (error) {
        console.error('Error processing query with AI:', error);
        // Send user-friendly error message in Russian
        await ctx.reply(
          'Не удалось обработать ваш запрос. Пожалуйста, попробуйте позже.',
          { reply_to_message_id: ctx.message.message_id }
        );
      }
    } catch (error) {
      console.error('Error sending message reply:', error);
      // Don't throw - let the webhook handler catch any issues
    }
  });

  // Error handler for bot errors
  bot.catch((err) => {
    console.error('Telegram bot error:', err);
    // Attempt to send error message to user if possible
    if (err.ctx) {
      err.ctx.reply("Не удалось обработать ваш запрос. Пожалуйста, попробуйте позже.")
        .catch((replyErr) => console.error('Failed to send error message:', replyErr));
    }
  });

  return bot;
}

/**
 * Creates and returns a Telegram webhook handler for Cloudflare Workers
 * 
 * @param env - Environment configuration
 * @returns Webhook callback function compatible with Cloudflare Workers
 */
export function getTelegramWebhookHandler(env: Env) {
  const bot = createBot(env);
  
  // Return webhook callback configured for Cloudflare Workers with secret token validation
  return webhookCallback(bot, 'cloudflare-mod', {
    secretToken: env.TELEGRAM_WEBHOOK_SECRET
  });
}