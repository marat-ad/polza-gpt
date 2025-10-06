/**
 * Environment configuration interface for PolzaGPT
 * 
 * This interface defines the environment variables required for the application,
 * particularly for Google Sheets API integration.
 */

export interface Env {
  /**
   * Google Sheets document ID
   * This is the unique identifier for the spreadsheet containing expert data
   * Example: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
   */
  GOOGLE_SHEET_ID: string;

  /**
   * Google Service Account credentials in JSON format
   * This should be a stringified JSON object containing the service account key
   * downloaded from Google Cloud Console
   */
  GOOGLE_SERVICE_ACCOUNT_KEY: string;

  /**
   * KV namespace for caching expert data
   * Used to store cached Google Sheets data with 1-hour TTL
   */
  EXPERTS_KV: KVNamespace;

  /**
   * Telegram Bot API token
   * This is the token obtained from @BotFather when creating the bot
   */
  TELEGRAM_BOT_TOKEN: string;

  /**
   * Telegram webhook secret
   * Secret key used for webhook validation to ensure requests come from Telegram
   */
  TELEGRAM_WEBHOOK_SECRET: string;

  /**
   * Allowed group chat IDs
   * Comma-separated list of Telegram group chat IDs where the bot is authorized to respond
   * Example: "-1001234567890,-1009876543210"
   */
  ALLOWED_GROUP_CHAT_IDS: string;

  /**
   * Allowed user IDs
   * Comma-separated list of Telegram user IDs who are whitelisted for direct messages
   * Example: "123456789,987654321"
   */
  ALLOWED_USER_IDS: string;
}