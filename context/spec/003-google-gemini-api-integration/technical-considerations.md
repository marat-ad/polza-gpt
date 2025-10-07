# Technical Specification: Google Gemini API Integration

- **Functional Specification:** `context/spec/003-google-gemini-api-integration/functional-spec.md`
- **Status:** Draft
- **Author(s):** Engineering Team

---

## 1. High-Level Technical Approach

We will integrate Google Gemini API (gemini-2.0-flash, free tier) to enable natural language processing of user queries and intelligent expert matching. The implementation will:

1. Create a new service (`src/services/gemini.ts`) to handle Gemini API calls
2. Modify the Telegram bot message handler to replace placeholder responses with AI-powered matching
3. Leverage the existing Google Sheets service (with KV caching) to fetch expert data
4. Pass the user query and all expert data to Gemini, which generates a complete, formatted response message
5. Send the AI-generated message directly to Telegram without additional parsing

**Data Flow:**
User Query → Telegram Bot → Fetch Experts (Sheets + KV Cache) → Gemini API (Query + Experts + Instructions) → Formatted Message → Telegram Response

---

## 2. Proposed Solution & Implementation Plan (The "How")

### 2.1. New Dependencies

- **Package:** `@google/generative-ai` (official Google Generative AI SDK)
- **Installation:** `npm install @google/generative-ai`

### 2.2. Environment Configuration Changes

**File:** `src/config/env.ts`

Add new environment variable to the `Env` interface:

```typescript
export interface Env {
  // ... existing fields ...
  
  /**
   * Google Gemini API Key
   * API key for accessing Google Gemini API (free tier)
   * Obtained from Google AI Studio
   */
  GOOGLE_GEMINI_API_KEY: string;
}
```

**Deployment Configuration:** Add `GOOGLE_GEMINI_API_KEY` to Cloudflare Workers secrets via `wrangler secret put`.

### 2.3. New Service: Gemini API Integration

**File:** `src/services/gemini.ts`

Create a new service with the following responsibilities:

**Function: `findExpertsWithAI(query: string, experts: any, env: Env): Promise<string>`**

- Initialize Gemini client with `env.GOOGLE_GEMINI_API_KEY`
- Use model: `gemini-2.0-flash`
- No special parameters (default temperature, token limits)
- Construct prompt with:
  - System instructions: Bot role as expert matcher for a diverse community
  - User query
  - Expert data formatted as JSON array
  - Formatting instructions for structured output (Name, Graduated, City, Contacts + natural Expertise)
  - Match explanation rules (only when not obvious)
  - Result limit rules (5 default, 20 max for "show all")
  - Language matching rules (respond in user's language)
  - Edge case instructions (no matches, many matches)
- Return the complete formatted message string from Gemini

**Error Handling:**
- Catch all Gemini API errors
- Return user-friendly message: "The service is temporarily unavailable. Please try again later."
- Log technical error details to console

### 2.4. Modified Service: Telegram Bot

**File:** `src/services/telegram.ts`

**Changes to `bot.on('message:text')` handler:**

Current placeholder code (lines 83-87):
```typescript
await ctx.reply(
  '✅ Бот активен. Функция поиска экспертов скоро будет доступна!',
  { reply_to_message_id: ctx.message.message_id }
);
```

Replace with:
```typescript
// Import services
import { getExpertData } from './sheets';
import { findExpertsWithAI } from './gemini';

// In the message handler after validation:
try {
  // Fetch expert data (uses existing KV cache)
  const expertData = await getExpertData(env);
  
  // Get AI-generated response
  const responseMessage = await findExpertsWithAI(query, expertData, env);
  
  // Send response to user
  await ctx.reply(responseMessage, { reply_to_message_id: ctx.message.message_id });
} catch (error) {
  console.error('Error processing query:', error);
  await ctx.reply(
    'Не удалось обработать ваш запрос. Пожалуйста, попробуйте позже.',
    { reply_to_message_id: ctx.message.message_id }
  );
}
```

### 2.5. Prompt Engineering Details

The prompt to Gemini will include:

**System Instructions:**
- Role: Expert matching assistant for a community with diverse interests
- Task: Analyze user query and find relevant experts from provided database
- Output: Complete formatted Telegram message (Markdown)

**Input Data:**
- User query (raw text after mention removal)
- Expert data as JSON array with fields: name, graduationYear, city, expertise, contacts

**Output Formatting Rules:**
- Structured fields: **Name**, **Graduated**, **City**, **Contacts**
- Natural sentence for: **Expertise**
- Brief explanation only when match is not obvious
- Respond in the same language as the query

**Result Limits:**
- Default: Up to 5 experts
- If query contains "show all" / "give me everyone" / "list all matches" or similar: Up to 20 experts
- If more than 5 matches exist (default mode): Prefix with "Many matches found, here are top 5"

**Edge Cases:**
- No matches: "No matches found. You can try rephrasing your request." + closest matches if possible
- API errors: Handled by service layer (not in prompt)

---

## 3. Impact and Risk Analysis

### System Dependencies

- **Depends on:** 
  - Existing Google Sheets service (`src/services/sheets.ts`) - no changes needed
  - Existing KV caching layer - already implemented
  - Telegram bot service (`src/services/telegram.ts`) - requires modification
  
- **Affects:**
  - Telegram message handler behavior (replaces placeholder)
  - Response time (adds Gemini API call latency)

### Potential Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Gemini API rate limits** | Service becomes unavailable on free tier | Implement graceful error messages, monitor usage, consider caching common queries in future |
| **Slow API response times** | Users wait longer for results | Set appropriate timeout, inform users via functional spec ("take your time" approach), log slow requests |
| **AI generates incorrect/inappropriate responses** | Poor user experience, potential harm | Manual testing phase, prompt engineering with clear constraints, consider adding response validation in future |
| **Large payload size (~400 experts)** | Token limits, cost concerns | Monitor token usage, optimize data format (minimal JSON), free tier has generous limits |
| **Cloudflare Workers CPU time limits** | Worker timeout before response | Monitor execution time, optimize prompt size, leverage existing KV caching |
| **API key exposure** | Security breach | Store as Cloudflare Workers secret (already planned), never log key |

---

## 4. Testing Strategy

### Manual Testing (Primary)

- **Test Case 1:** Varied query formats
  - Input: "find me an iOS developer", "I need an iOS dev", "who can build mobile apps"
  - Expected: Relevant iOS/mobile experts returned
  
- **Test Case 2:** Language matching
  - Input queries in Russian, English, mixed
  - Expected: Response in same language as query
  
- **Test Case 3:** "Show all" functionality
  - Input: "show me all iOS developers"
  - Expected: Up to 20 results (or fewer if less exist)
  
- **Test Case 4:** No matches
  - Input: Query for non-existent expertise
  - Expected: "No matches found" message
  
- **Test Case 5:** Broad query (many matches)
  - Input: "find me a developer"
  - Expected: "Many matches found, here are top 5"
  
- **Test Case 6:** Edge cases
  - Single-word queries, paragraph descriptions, obvious vs non-obvious matches
  
- **Test Case 7:** Error handling
  - Simulate API failure (invalid key)
  - Expected: "Service temporarily unavailable" message

### Development Testing

- Test locally with `wrangler dev`
- Verify all console.log statements for debugging
- Check Cloudflare Workers logs for errors
- Validate prompt generates expected format

### Deployment Testing

- Deploy to production environment
- Test with real Telegram group
- Monitor Cloudflare Workers dashboard for errors
- Verify response times are acceptable
