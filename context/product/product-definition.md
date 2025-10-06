# Product Definition: PolzaGPT

- **Version:** 1.0
- **Status:** Proposed

---

## 1. The Big Picture (The "Why")

### 1.1. Project Vision & Purpose

To help community members instantly discover the right experts for their needs through natural language search, eliminating the friction of manual directories and scattered knowledge.

### 1.2. Target Audience

Community members in Telegram groups who need to find specialists, small to medium-sized teams (up to 50 people) looking for internal expertise, and startup communities, tech hubs, or professional networks managing expert directories.

### 1.3. User Personas

- **Persona: "Alex the Community Member"**
  - **Role:** Active member of a tech startup community on Telegram
  - **Goal:** Quickly find an iOS developer with SwiftUI experience for a new project without asking around in multiple chats
  - **Frustration:** Doesn't know all 400+ experts in the community, wastes time scrolling through outdated spreadsheets, and misses great matches due to keyword mismatches

### 1.4. Success Metrics

- Users find relevant experts in **under 30 seconds** from query to results
- **High match relevance**: 70%+ of users contact at least one suggested expert
- **Zero infrastructure costs** while handling dozens of queries per day
- **Reduced search friction**: 80%+ of users find what they need without asking in community chats

---

## 2. The Product Experience (The "What")

### 2.1. Core Features

- **Natural language search via Telegram** — users ask questions in plain language
- **AI-powered semantic matching** — understands intent and context, not just keywords
- **Ranked expert recommendations** — returns 3-5 most relevant matches with explanations
- **Google Sheets integration** — syncs with curated database of ~400 experts
- **Contact information display** — shows how to reach each suggested expert

### 2.2. User Journey

Alex is in their tech community Telegram chat and needs help. They type: "@polza_bot I need an iOS developer with SwiftUI experience" directly in the group conversation. The bot processes the request (may take a few seconds due to cold start), then returns 3-5 ranked experts with brief explanations like "Maria – 5 years iOS, specializes in SwiftUI and reactive programming" along with contact info. Alex reviews the matches, picks the most relevant one, and reaches out directly via the provided contact.

---

## 3. Project Boundaries

### 3.1. What's In-Scope for this Version

- Telegram bot responding to @mentions in group chats
- Natural language query processing via Google Gemini API
- Semantic search across ~400 expert records
- Integration with Google Sheets as the data source (Name, Expertise, Contacts columns)
- Returning 3-5 ranked expert matches with match explanations
- Displaying expert contact information
- Running on Cloudflare Workers free tier

### 3.2. What's Out-of-Scope (Non-Goals)

- Direct message (DM) support with the bot
- Multi-language support beyond Russian
- User feedback or rating system for match quality
- Expert availability or booking status
- Advanced filters or faceted search UI
- Analytics dashboard for admins
- Expert profile pages or portfolios
- Payment or scheduling features
