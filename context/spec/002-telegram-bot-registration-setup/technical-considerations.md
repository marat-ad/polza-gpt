# Technical Specification: Telegram Bot Registration & Setup

- **Functional Specification:** [002-telegram-bot-registration-setup/functional-spec.md](./functional-spec.md)
- **Status:** Draft
- **Author(s):** Claude Code

---

## 1. High-Level Technical Approach

This feature integrates Telegram bot functionality into the existing Cloudflare Workers application using the grammy library (as specified in the architecture). The implementation adds a webhook endpoint to receive Telegram updates, a service layer for bot logic and authorization, and configuration for whitelisting authorized chats and users.

**Core Components:**
1. **grammy library integration** for Telegram Bot API
2. **Webhook endpoint** (`POST /webhook`) to receive updates from Telegram
3. **Telegram service layer** (`src/services/telegram.ts`) for bot logic, authorization, and message routing
4. **Environment variables** for bot token and whitelists
5. **Integration with existing Cloudflare Workers handler** in `src/index.ts`

The bot will validate authorization against whitelists, extract and validate queries, and respond with placeholder messages (search functionality to be implemented in a future feature).

---

## 2. Proposed Solution & Implementation Plan (The "How")

### 2.1. Dependencies

**Add grammy to package.json:**
```bash
npm install grammy
```

### 2.2. Environment Variables & Configuration

**Update `src/config/env.ts`** to add:

```typescript
export interface Env {
  // Existing variables
  GOOGLE_SHEET_ID: string;
  GOOGLE_SERVICE_ACCOUNT_KEY: string;
  EXPERTS_KV: KVNamespace;

  // New Telegram bot variables
  TELEGRAM_BOT_TOKEN: string;                    // Bot API token from @BotFather
  TELEGRAM_WEBHOOK_SECRET: string;               // Secret for webhook validation (optional but recommended)
  ALLOWED_GROUP_CHAT_IDS: string;                // Comma-separated list (e.g., "-1001234567890,-1009876543210")
  ALLOWED_USER_IDS: string;                      // Comma-separated list (e.g., "123456789,987654321")
}
```

**Configuration Storage:**
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` stored as Cloudflare Workers secrets (via `wrangler secret put`)
- `ALLOWED_GROUP_CHAT_IDS` and `ALLOWED_USER_IDS` stored in `wrangler.toml` vars section (can be updated without re-deploying secrets)

### 2.3. Telegram Service Layer

**Create `src/services/telegram.ts`:**

```typescript
import { Bot, webhookCallback } from 'grammy';
import type { Env } from '../config/env';

// Main bot setup and message handler logic
export function createBot(env: Env) {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  // Parse whitelists from comma-separated strings
  const allowedGroupChatIds = env.ALLOWED_GROUP_CHAT_IDS.split(',').map(id => id.trim());
  const allowedUserIds = env.ALLOWED_USER_IDS.split(',').map(id => id.trim());

  // Authorization check helper
  function isAuthorized(chatId: number, userId: number, isGroup: boolean): boolean {
    if (isGroup) {
      return allowedGroupChatIds.includes(chatId.toString());
    } else {
      return allowedUserIds.includes(userId.toString());
    }
  }

  // Message handler
  bot.on('message:text', async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';
    const messageText = ctx.message.text;

    // Authorization check
    if (!isAuthorized(chatId, userId, isGroup)) {
      await ctx.reply("Этот бот доступен только в авторизованном чате сообщества.");
      return;
    }

    // Extract query text
    let query = messageText;
    if (isGroup) {
      // Remove @polza79bot mention from anywhere in the text
      query = messageText.replace(/@polza79bot/gi, '').trim();
    } else {
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

    // Placeholder response (search not yet implemented)
    await ctx.reply(
      "✅ Бот активен. Функция поиска экспертов скоро будет доступна!",
      { reply_to_message_id: ctx.message.message_id }
    );
  });

  // Error handler
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

// Export webhook handler for Cloudflare Workers
export function getTelegramWebhookHandler(env: Env) {
  const bot = createBot(env);
  return webhookCallback(bot, 'cloudflare-mod');
}
```

### 2.4. Webhook Endpoint Integration

**Update `src/index.ts`** to add webhook endpoint:

```typescript
import type { Env } from './config/env';
import { getExpertData, SheetsUnavailableError } from './services/sheets';
import { getTelegramWebhookHandler } from './services/telegram';

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    
    // Telegram webhook endpoint
    if (url.pathname === '/webhook' && request.method === 'POST') {
      try {
        const webhookHandler = getTelegramWebhookHandler(env);
        return await webhookHandler(request);
      } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Webhook error', { status: 500 });
      }
    }

    // Existing endpoints (health, data, etc.)
    // ... rest of existing code
  },
};
```

### 2.5. Webhook Setup

**Set webhook URL using Telegram Bot API:**
```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://polza-gpt.your-worker.workers.dev/webhook", "secret_token": "<TELEGRAM_WEBHOOK_SECRET>"}'
```

This will be done manually after deployment or via a setup script.

---

## 3. Impact and Risk Analysis

### System Dependencies

**This change depends on:**
- Existing Cloudflare Workers infrastructure
- Telegram Bot API availability
- Environment variables properly configured

**This change affects:**
- `src/index.ts` (adds webhook endpoint)
- `src/config/env.ts` (adds new environment variables)

**No impact on:**
- Existing Google Sheets integration
- Existing `/health`, `/data`, `/experts` endpoints

### Potential Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Webhook failures or missed updates | Telegram retries failed webhooks automatically; log all errors for monitoring |
| Bot token exposure | Store as Cloudflare Workers secret (never in code or wrangler.toml) |
| Cloudflare Workers cold starts causing slow first responses | Acceptable for MVP; documented in product definition as expected behavior |
| Incorrect chat/user ID whitelisting | Document how to find chat IDs and user IDs using bot logs or Telegram API |
| grammy compatibility with Cloudflare Workers | grammy is specifically designed for serverless environments; use webhooks (not long polling) |

---

## 4. Testing Strategy

### Manual Testing Approach (MVP)

**Test Scenarios:**

1. **Authorized Group Chat:**
   - Send "@polza79bot find iOS developer" → expect placeholder response with reply
   - Send "find @polza79bot iOS developer" → expect placeholder response with reply
   - Send "find iOS developer @polza79bot" → expect placeholder response with reply
   - Send "@polza79bot" (empty query) → expect usage example message

2. **Whitelisted User DM:**
   - Send "find iOS developer" → expect placeholder response
   - Send empty message → expect usage example message

3. **Unauthorized Access:**
   - Mention bot in different group → expect "Этот бот доступен только в авторизованном чате сообщества."
   - Send DM from non-whitelisted user → expect "Этот бот доступен только в авторизованном чате сообщества."

4. **Error Scenarios:**
   - Temporarily use invalid bot token → expect error logging and graceful failure
   - Temporarily break webhook endpoint → verify Telegram retries

**No automated tests initially** for MVP. Can be added in future iterations if needed.
