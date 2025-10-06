# System Architecture Overview: PolzaBot

---

## 1. Application & Technology Stack

- **Runtime Environment:** Cloudflare Workers (serverless edge computing platform)
- **Primary Language:** TypeScript
- **Telegram Bot Library:** grammy (modern, TypeScript-first framework optimized for serverless environments)

---

## 2. Data & Persistence

- **Primary Data Source:** Google Sheets API (accessing ~400 expert records with Name, Expertise, Contacts columns)
- **Caching Layer:** Cloudflare Workers KV (key-value storage for caching expert data to reduce API calls and improve response times)

---

## 3. External Services & APIs

- **AI/LLM Service:** Google Gemini API (free tier) for semantic understanding and expert matching
- **Data Source API:** Google Sheets API for fetching expert records
- **Messaging Platform API:** Telegram Bot API (handled via grammy)
- **Authentication:** Google Service Account credentials (JSON key file stored as Cloudflare Workers secret for server-to-server access)

---

## 4. Infrastructure & Deployment

- **Hosting Platform:** Cloudflare Workers (serverless edge platform, free tier)
- **Deployment Tool:** Wrangler CLI (Cloudflare's official deployment tool)
- **CI/CD:** GitHub Actions for automated deployment on push to main branch

---

## 5. Observability & Monitoring

- **Logging:** Cloudflare Workers built-in logs (console.log output accessible via Workers dashboard and Wrangler tail command)
- **Error Tracking:** Cloudflare Workers logs (no specialized error tracking service in initial version)
