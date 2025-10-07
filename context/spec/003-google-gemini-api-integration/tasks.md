# Task List: Google Gemini API Integration

## Overview
This task list breaks down the Google Gemini API integration into small, vertical slices. After completing each slice, the application remains in a working, runnable state with incrementally added functionality.

---

## Tasks

- [x] **Slice 1: Setup Gemini API integration (dependency + environment configuration)**
  - [x] Install `@google/generative-ai` package via `npm install @google/generative-ai`
  - [x] Add `GOOGLE_GEMINI_API_KEY: string` field to `Env` interface in `src/config/env.ts`
  - [x] Run `npm run typecheck` to ensure no type errors
  - [x] Verify application still builds and runs with `wrangler dev`

- [x] **Slice 2: Create basic Gemini service with minimal functionality**
  - [x] Create new file `src/services/gemini.ts`
  - [x] Implement basic `findExpertsWithAI(query: string, experts: any, env: Env): Promise<string>` function
  - [x] Initialize Gemini client with `env.GOOGLE_GEMINI_API_KEY` using `gemini-2.0-flash` model
  - [x] Create a minimal prompt that echoes the user query (e.g., "User asked: {query}")
  - [x] Add error handling that catches API errors and returns "The service is temporarily unavailable. Please try again later."
  - [x] Add console.log for debugging
  - [x] Test manually with a simple prompt to verify Gemini API connection works

- [x] **Slice 3: Integrate Gemini service with Telegram bot**
  - [x] Import `getExpertData` from `./sheets` and `findExpertsWithAI` from `./gemini` in `src/services/telegram.ts`
  - [x] Replace placeholder response (lines 83-87) with call to `getExpertData(env)` to fetch experts
  - [x] Pass `query` and `expertData` to `findExpertsWithAI()`
  - [x] Send the AI response to Telegram via `ctx.reply()`
  - [x] Add try-catch error handling with fallback message
  - [x] Test with Telegram bot to verify end-to-end flow works (even with minimal prompt)
  - [x] Run `npm run typecheck` to ensure no type errors

- [x] **Slice 4: Implement complete expert matching prompt**
  - [x] Update `findExpertsWithAI()` prompt to include:
    - System instructions (expert matcher role for diverse community)
    - User query
    - Expert data as JSON array (name, graduationYear, city, expertise, contacts)
    - Detailed formatting instructions: Structured fields (**Name**, **Graduated**, **City**, **Contacts**) + natural sentence for **Expertise**
    - Match explanation rules (only when not obvious)
    - Language matching rules (respond in same language as query)
    - Result limit rules: 5 default, up to 20 for "show all" phrases, prefix "Many matches found, here are top 5" when applicable
    - Edge case handling: No matches message, handle varying query lengths
  - [x] Test with varied query formats (e.g., "iOS developer", "I need a designer", "who knows marketing")
  - [x] Test with queries in Russian and English to verify formatting and language matching
  - [x] Test with broad query (e.g., "developer") to verify "many matches" message
  - [x] Test with "show me all developers" to verify up to 20 results returned
  - [x] Test with non-existent expertise to verify "no matches" message
  - [x] Test with single-word and paragraph queries to verify handling
  - [x] Run full manual test suite from technical spec (Test Cases 1-7)
  - [x] Verify all acceptance criteria from functional spec are met
