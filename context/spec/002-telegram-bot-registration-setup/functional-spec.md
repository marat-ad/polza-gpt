# Functional Specification: Telegram Bot Registration & Setup

- **Roadmap Item:** Bot Registration & Setup - Register the bot with Telegram and configure it to respond to @mentions in group chats
- **Status:** Draft
- **Author:** Claude Code

---

## 1. Overview and Rationale (The "Why")

The Polza community already exists on Telegram with ~400 expert records in a Google Sheets database. To provide convenient, controlled access to this expert database while preventing data leaks, we need a Telegram bot that serves as a secure entry point. 

**Problem:** Community members need to find experts but sharing the full spreadsheet would expose all data and create privacy concerns.

**Solution:** A Telegram bot (@polza79bot) that responds to @mentions in the authorized community chat and to DMs from whitelisted users (e.g., admins), providing controlled access to expert data.

**Success Criteria:** The bot is registered, responds only in authorized contexts (specific group chat or DMs from whitelisted users), and correctly handles various user interaction scenarios with appropriate Russian-language messages.

---

## 2. Functional Requirements (The "What")

### 2.1. Bot Configuration

- The bot (@polza79bot) must be configured with a **whitelist of allowed group chat IDs**.
- The bot must be configured with a **whitelist of allowed user IDs** for direct messages.
- The bot must only respond to @mentions in the **specific authorized group chat(s)**.
- The bot must only respond to direct messages from **whitelisted users** (e.g., admins).
- The bot must **not** respond to DMs from non-whitelisted users.
- The bot must **not** work in any unauthorized group chats.

**Acceptance Criteria:**
- [ ] Given the bot is mentioned in an authorized group chat, when a user sends any message with @polza79bot, then the bot processes the message.
- [ ] Given a whitelisted user sends a direct message to the bot, when the message is received, then the bot processes the message normally.
- [ ] Given a non-whitelisted user sends a direct message to the bot, when the message is received, then the bot responds with: "Этот бот доступен только в авторизованном чате сообщества."
- [ ] Given the bot is mentioned in an unauthorized group chat, when a user sends a message with @polza79bot, then the bot responds with: "Этот бот доступен только в авторизованном чате сообщества."

### 2.2. Message Handling in Group Chats

- When someone @mentions the bot in the authorized chat, the bot must respond **immediately in the same chat**.
- The bot response must utilize **Telegram's native reply mechanism** (reply-to-message) so it's clear what the bot is responding to.
- Everyone in the group must be able to **see the bot's response** (public, not private).

**Acceptance Criteria:**
- [ ] Given a user mentions @polza79bot in the authorized chat, when the bot responds, then the response appears in the same chat thread.
- [ ] Given a user mentions @polza79bot in the authorized chat, when the bot responds, then the response uses Telegram's reply-to-message feature to reference the original query.
- [ ] Given a user mentions @polza79bot in the authorized chat, when the bot responds, then all group members can see the response.

### 2.3. Message Handling in Direct Messages

- When a whitelisted user sends a direct message to the bot, the bot must respond directly without requiring @mention.

**Acceptance Criteria:**
- [ ] Given a whitelisted user sends a DM with query text, when the message is received, then the bot processes and responds normally.
- [ ] Given a whitelisted user sends a DM, when the bot responds, then the response appears in the same DM thread.

### 2.4. Query Validation

- If a user mentions the bot with **no query text** (just "@polza79bot" in groups, or empty message in DMs), the bot must respond with usage instructions.

**Acceptance Criteria:**
- [ ] Given a user sends "@polza79bot" with no additional text in the authorized chat, when the message is processed, then the bot responds with: "Пожалуйста, укажите запрос. Например: @polza79bot найди мне iOS разработчика"
- [ ] Given a whitelisted user sends an empty DM, when the message is processed, then the bot responds with: "Пожалуйста, укажите запрос. Например: найди мне iOS разработчика"

### 2.5. Placeholder Response (MVP)

- Since expert search functionality is not yet implemented, the bot must respond with a **placeholder message** for any valid query.

**Acceptance Criteria:**
- [ ] Given a user mentions @polza79bot with a query text in the authorized chat, when the message is processed, then the bot responds with: "✅ Бот активен. Функция поиска экспертов скоро будет доступна!"
- [ ] Given a whitelisted user sends a DM with query text, when the message is processed, then the bot responds with: "✅ Бот активен. Функция поиска экспертов скоро будет доступна!"

### 2.6. Error Handling

- If the Telegram API is unavailable or fails, the bot must respond with an error message if possible.

**Acceptance Criteria:**
- [ ] Given the Telegram API fails during message processing, when the bot attempts to respond, then it sends: "Не удалось обработать ваш запрос. Пожалуйста, попробуйте позже."
- [ ] Given the Telegram API is completely unavailable, when the bot cannot send any response, then the failure is logged for monitoring.

---

## 3. Scope and Boundaries

### In-Scope

- Bot registration and configuration with @BotFather (using existing @polza79bot)
- Whitelist configuration for authorized group chat ID(s)
- Whitelist configuration for authorized DM user ID(s) (e.g., admins)
- Basic message handling and routing logic
- Authorization checks (authorized vs unauthorized chats/users)
- Query validation (empty vs non-empty queries)
- All user-facing messages in Russian
- Telegram reply-to-message mechanism for group chat responses
- Error handling for Telegram API failures
- Placeholder responses for MVP (before search is implemented)

### Out-of-Scope

- Actual expert search functionality (covered in next roadmap item)
- Bot commands like `/help`, `/start`, etc.
- Rate limiting or anti-spam features
- Admin commands for managing the whitelist dynamically
- Analytics or usage tracking
- Multi-language support beyond Russian
