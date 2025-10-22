# PolzaGPT

**AI-powered Telegram bot that instantly connects you with the right experts from your community.**

PolzaGPT transforms how communities find expertise. Instead of scrolling through endless spreadsheets or asking around in chat groups, simply describe what you need in natural language and get matched with relevant experts in seconds.

---

## 🎯 What It Does

PolzaGPT is a Telegram bot that helps community members quickly find experts from a curated database. Ask questions like:

- "I need an iOS developer with SwiftUI experience"
- "Who can help with React Native?"
- "Find me a marketing specialist in Moscow"
- "Show me all backend developers"

The bot uses Google's Gemini AI to understand your query semantically and returns 3-5 ranked expert matches with contact information - all within seconds.

---

## ✨ Key Features

- **Natural Language Search** - Ask in plain language, no keywords needed
- **AI-Powered Matching** - Understands context and intent using Google Gemini
- **Fast Results** - Cached data ensures quick responses (typically under 3 seconds)
- **Group & Direct Messages** - Works in authorized Telegram groups and private chats
- **Always Up-to-Date** - Syncs with Google Sheets database automatically
- **City Filtering** - Specify location to find experts in specific cities
- **Flexible Results** - Get top matches or ask to "show all" for comprehensive lists

---

## 🚀 Getting Started

### Prerequisites

Before setting up PolzaGPT, you'll need:

1. **Node.js** (v18 or higher)
2. **Telegram Bot Token** from [@BotFather](https://t.me/BotFather)
3. **Google Sheets** with your expert data
4. **Google Service Account** with Sheets API access
5. **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
6. **Cloudflare Account** (free tier works great)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/polza-gpt.git
cd polza-gpt
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Copy the example file and fill in your credentials:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your actual values:

```bash
# Google Sheets document ID (from the URL)
GOOGLE_SHEET_ID="your-sheet-id-here"

# Google Service Account credentials (JSON format)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Google Gemini API Key
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"

# Telegram Bot Token from @BotFather
TELEGRAM_BOT_TOKEN="123456789:ABC..."

# Webhook secret (generate a random string)
TELEGRAM_WEBHOOK_SECRET="your-random-secret"

# Allowed group chat IDs (comma-separated, negative numbers)
ALLOWED_GROUP_CHAT_IDS="-1001234567890"

# Allowed user IDs for DMs (comma-separated, positive numbers)
ALLOWED_USER_IDS="123456789"
```

4. **Prepare your Google Sheets database:**

Your spreadsheet should have columns for:
- Name (full name or nickname)
- Expertise (skills, specializations)
- Contacts (phone, Telegram, email)
- City (location)
- Year (graduation year or experience level)

Example structure:
```
Name          | Year | City   | Expertise                    | Contacts
------------- | ---- | ------ | ---------------------------- | ------------
Maria Ivanova | 2020 | Moscow | iOS, SwiftUI, React Native   | +7 900 ...
Alex Petrov   | 2019 | SPb    | Backend, Python, PostgreSQL  | @alex_dev
```

5. **Share the spreadsheet** with your service account email (found in the service account JSON)

---

## 🛠️ Development

### Run locally

Start the development server:

```bash
npm run dev
```

The bot will be available at `http://localhost:8787`

### Test the bot

1. **Set up webhook** (for local testing, use a tool like [ngrok](https://ngrok.com/)):

```bash
ngrok http 8787
```

2. **Register webhook with Telegram:**

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok.io/webhook&secret_token=your-webhook-secret"
```

3. **Add the bot** to your authorized Telegram group or send a direct message

4. **Try a query:**

In a group: `@your_bot_name найди iOS разработчика`
In DM: `найди мне backend разработчика`

### Available scripts

```bash
npm run dev        # Start development server
npm run typecheck  # Run TypeScript type checking
npm run deploy     # Deploy to Cloudflare Workers (production)
npm run logs       # View production logs
```

---

## ☁️ Deployment

### Deploy to Cloudflare Workers

1. **Create KV namespaces** for caching:

```bash
# Production
npx wrangler kv:namespace create EXPERTS_KV

# Development
npx wrangler kv:namespace create EXPERTS_KV --preview
```

2. **Update `wrangler.toml`** with the KV namespace IDs from the previous step

3. **Set production secrets:**

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put GOOGLE_GEMINI_API_KEY
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
npx wrangler secret put GOOGLE_SHEET_ID
npx wrangler secret put ALLOWED_GROUP_CHAT_IDS
npx wrangler secret put ALLOWED_USER_IDS
```

4. **Deploy:**

```bash
npm run deploy
```

5. **Set up the webhook** with your production URL:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.workers.dev/webhook&secret_token=your-webhook-secret"
```

---

## 📖 How to Use

### In Group Chats

1. Add the bot to your authorized Telegram group
2. Mention the bot with your query:
   ```
   @your_bot_name I need a React developer
   ```
3. Get instant expert recommendations with contact info

### In Direct Messages

1. Start a chat with the bot
2. Send your query directly:
   ```
   найди мне backend разработчика
   ```
3. Receive personalized expert matches

### Query Examples

**Simple searches:**
- `iOS developer`
- `marketing specialist`
- `Python programmer`

**With location:**
- `frontend developer in Moscow`
- `designer from Saint Petersburg`

**Detailed queries:**
- `I need someone who knows React Native and has iOS experience`
- `Looking for a data scientist with machine learning background`

**Show all matches:**
- `show all iOS developers`
- `покажи всех backend разработчиков`

---

## 🏗️ Architecture

PolzaGPT is built with a modern, serverless architecture:

```
┌──────────────┐
│   Telegram   │
│    Users     │
└──────┬───────┘
       │
       │ Webhook
       ▼
┌─────────────────────┐
│  Cloudflare Worker  │
│  (Edge Computing)   │
└──────┬──────────────┘
       │
       ├──────────► Google Sheets API
       │            (Expert Database)
       │
       ├──────────► Google Gemini AI
       │            (Query Processing)
       │
       └──────────► Cloudflare KV
                    (Response Cache)
```

### Tech Stack

- **Runtime:** Cloudflare Workers (TypeScript)
- **Bot Framework:** Grammy (optimized for serverless)
- **AI Engine:** Google Gemini 2.0 Flash (with fallbacks)
- **Data Source:** Google Sheets API v4
- **Caching:** Cloudflare Workers KV (1-hour TTL)
- **Type Safety:** TypeScript with strict mode

### Performance

- **Cold start:** ~1-2 seconds (first request)
- **Warm requests:** ~500ms - 1 second
- **Cache hit:** ~200-300ms
- **Concurrent requests:** Unlimited (edge-distributed)
- **Cost:** $0 on free tier for most communities

---

## 🔒 Security & Privacy

- **Authorization:** Only whitelisted groups and users can access the bot
- **Webhook validation:** Secret token prevents unauthorized requests
- **No data storage:** User queries are not logged or stored
- **Service account:** Read-only access to Google Sheets
- **Environment secrets:** Sensitive credentials stored securely in Cloudflare

---

## ⚙️ Configuration

### Authorization

Edit your `.dev.vars` or set production secrets:

**For group chats:**
1. Add the bot to your group
2. Send a test message
3. Check logs for the chat ID (negative number)
4. Add to `ALLOWED_GROUP_CHAT_IDS`

**For direct messages:**
1. Send a message to the bot
2. Check logs for your user ID (positive number)
3. Add to `ALLOWED_USER_IDS`

### Custom Bot Name

Update the bot mention pattern in `src/services/telegram.ts`:

```typescript
query = messageText.replace(/@your_bot_name/gi, '').trim();
```

### Response Language

The bot automatically responds in the same language as the query (Russian or English). To customize, edit the prompt in `src/services/gemini.ts`.

---

## 🧪 Testing

### Local Testing

1. Check health endpoint:
```bash
curl http://localhost:8787/health
```

2. View expert data:
```bash
curl http://localhost:8787/experts
```

### Production Testing

```bash
# Check health
curl https://your-worker.workers.dev/health

# View logs
npm run logs
```

---

## 📁 Project Structure

```
polza-gpt/
├── src/
│   ├── config/
│   │   └── env.ts           # Environment type definitions
│   ├── services/
│   │   ├── gemini.ts        # AI query processing
│   │   ├── sheets.ts        # Google Sheets integration
│   │   └── telegram.ts      # Telegram bot logic
│   └── index.ts             # Main worker entry point
├── context/
│   ├── product/             # Product specifications
│   └── spec/                # Feature specifications
├── .dev.vars.example        # Environment variables template
├── wrangler.toml            # Cloudflare Workers config
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs** - Open an issue with details and reproduction steps
2. **Suggest features** - Share your ideas for improvements
3. **Submit PRs** - Fork, create a feature branch, and submit a pull request
4. **Improve docs** - Help make this README even better

---

## 💼 Use Cases

PolzaGPT is perfect for:

- **Tech communities** finding developers and designers
- **Professional networks** connecting members with expertise
- **Startup ecosystems** discovering specialists for projects
- **Educational groups** matching students with mentors
- **Coworking spaces** helping members find collaboration partners

---

## 💬 Support

Need help? Have questions?

- Check the [context/](./context/) folder for detailed specifications
- Review the [.dev.vars.example](./.dev.vars.example) for configuration help
- Open an issue for bugs or feature requests

---

**Built with ❤️ for communities that value expertise and connection.**
