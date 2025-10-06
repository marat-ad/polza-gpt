# Task List: Telegram Bot Registration & Setup

This task list is organized into vertical slices. Each main task represents a complete, runnable increment of functionality. After completing each task, the application should be in a working state.

---

## Slice 1: Basic Webhook Endpoint (Foundation)

**Goal:** Create a minimal webhook endpoint that can receive Telegram updates and log them. The worker should successfully receive POST requests from Telegram without crashing.

- [x] **Slice 1: Set up basic webhook endpoint**
  - [x] Install `grammy` dependency: `npm install grammy`
  - [x] Update `src/config/env.ts` to add `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `ALLOWED_GROUP_CHAT_IDS`, and `ALLOWED_USER_IDS` to the `Env` interface
  - [x] Add a basic `POST /webhook` endpoint in `src/index.ts` that logs the request body and returns a 200 OK response
  - [x] Add `.dev.vars` with placeholder values for new environment variables (for local testing)
  - [x] Test locally with `wrangler dev` and use curl or Postman to send a test POST request to `/webhook`
  - [x] Verify the endpoint logs the request body and responds with 200 OK

---

## Slice 2: Bot Responds to Any Message (No Authorization)

**Goal:** Create the Telegram service layer with grammy and make the bot respond with a simple placeholder message to ANY message received. Authorization is not yet implemented.

- [x] **Slice 2: Implement basic bot message handling**
  - [x] Create `src/services/telegram.ts` with `createBot()` function
  - [x] Implement basic grammy bot setup with `bot.on('message:text')` handler
  - [x] Bot responds to all text messages with: "✅ Бот активен. Функция поиска экспертов скоро будет доступна!"
  - [x] Implement `getTelegramWebhookHandler()` function using `webhookCallback(bot, 'cloudflare-mod')`
  - [x] Update `src/index.ts` to import and use `getTelegramWebhookHandler()` in the `/webhook` endpoint
  - [x] Test locally: send a message to the bot from any chat and verify it responds with the placeholder message

---

## Slice 3: Add Authorization Checks (Group Chats & DMs)

**Goal:** Implement whitelist-based authorization. The bot should only process messages from authorized group chats or whitelisted users, and respond with an error message to unauthorized users.

- [x] **Slice 3: Implement authorization logic**
  - [x] Add whitelist parsing logic in `createBot()`: parse `ALLOWED_GROUP_CHAT_IDS` and `ALLOWED_USER_IDS` from comma-separated strings
  - [x] Implement `isAuthorized()` helper function that checks if chat/user is in whitelist
  - [x] Add authorization check at the beginning of the message handler
  - [x] If unauthorized, respond with: "Этот бот доступен только в авторизованном чате сообщества."
  - [x] Update `.dev.vars` with actual chat ID and user ID for testing
  - [x] Test locally: verify bot responds normally in authorized contexts and rejects unauthorized ones
  - [x] Test both group chat and DM scenarios

---

## Slice 4: Query Extraction and Validation

**Goal:** Implement query text extraction (removing @mention in groups) and validation (checking for empty queries). The bot should respond with appropriate usage instructions for empty queries.

- [x] **Slice 4: Implement query extraction and validation**
  - [x] Add query extraction logic: in groups, remove @polza79bot mention from anywhere in the text using regex
  - [x] In DMs, use the entire message text as the query
  - [x] Trim whitespace after extraction
  - [x] Add empty query validation: if query is empty after extraction, respond with usage instructions
  - [x] Usage message for groups: "Пожалуйста, укажите запрос. Например: @polza79bot найди мне iOS разработчика"
  - [x] Usage message for DMs: "Пожалуйста, укажите запрос. Например: найди мне iOS разработчика"
  - [x] Ensure `reply_to_message_id` is used for all bot responses
  - [x] Test locally: send queries with @mention in different positions (start, middle, end)
  - [x] Test locally: send empty queries (@polza79bot with no text, or empty DM)

---

## Slice 5: Error Handling and Finalization

**Goal:** Add comprehensive error handling for Telegram API failures and webhook errors. The bot should gracefully handle errors and log them appropriately.

- [x] **Slice 5: Implement error handling**
  - [x] Add `bot.catch()` error handler in `createBot()`
  - [x] In error handler, log the error with `console.error()`
  - [x] Attempt to send error message: "Не удалось обработать ваш запрос. Пожалуйста, попробуйте позже."
  - [x] If sending error message fails, log that failure as well
  - [x] Wrap webhook handler call in `src/index.ts` with try-catch
  - [x] Return 500 response with "Webhook error" message on caught errors
  - [x] Test locally: simulate error by temporarily using invalid bot token
  - [x] Verify errors are logged and user receives error message when possible

---

## Slice 6: Production Deployment and Webhook Setup

**Goal:** Deploy the bot to production, configure environment variables, and set up the Telegram webhook. The bot should be live and responding in the actual Telegram group.

- [x] **Slice 6: Deploy to production and configure webhook**
  - [x] Update `wrangler.toml` to add `ALLOWED_GROUP_CHAT_IDS` and `ALLOWED_USER_IDS` in the `[env.production]` vars section
  - [x] Set production secrets: `wrangler secret put TELEGRAM_BOT_TOKEN --env production`
  - [x] Set production secrets: `wrangler secret put TELEGRAM_WEBHOOK_SECRET --env production`
  - [x] Deploy to production: `npm run deploy`
  - [x] Set Telegram webhook using curl command with production worker URL
  - [x] Verify webhook is set: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
  - [x] Test in production: send test message to bot in authorized group chat
  - [x] Test in production: send DM from whitelisted user
  - [x] Test in production: try unauthorized scenarios (different group, non-whitelisted DM)
  - [x] Verify all test scenarios from functional spec work correctly
