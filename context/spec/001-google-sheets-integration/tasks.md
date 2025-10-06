# Task List: Google Sheets Integration

This task list is organized into vertical slices. Each main task represents a complete, runnable increment of functionality. After completing each task, the application should be in a working state.

---

## Slice 1: Basic Cloudflare Workers Project Setup

**Goal:** Create a minimal Cloudflare Workers project that can be deployed and responds to requests.

- [x] **Slice 1: Set up basic Cloudflare Workers project**
  - [x] Initialize npm project with `package.json`
  - [x] Install dependencies: `wrangler`, `typescript`, `@cloudflare/workers-types`
  - [x] Create `wrangler.toml` with basic worker configuration
  - [x] Create `tsconfig.json` for TypeScript configuration
  - [x] Create `src/index.ts` with a basic "Hello World" worker handler
  - [x] Add `.dev.vars.example` file with placeholder environment variables
  - [x] Add `.gitignore` to exclude `node_modules`, `.dev.vars`, and Wrangler cache
  - [x] Test locally with `wrangler dev` and verify the worker responds

---

## Slice 2: Google Sheets API Connection (No Cache)

**Goal:** Connect to Google Sheets API, authenticate with service account, and fetch raw data. The worker should successfully fetch and return expert data.

- [x] **Slice 2: Implement Google Sheets API data fetching**
  - [x] Install `googleapis` dependency
  - [x] Create `src/config/env.ts` with environment variable type definitions (`GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_KEY`)
  - [x] Create `src/services/sheets.ts` with `fetchFromGoogleSheets()` function
  - [x] Implement Google Service Account authentication using `google.auth.GoogleAuth`
  - [x] Implement `spreadsheets.values.get()` call to fetch raw sheet data
  - [x] Update `src/index.ts` to call the sheets service and return raw data as JSON response
  - [x] Set up `.dev.vars` with actual `GOOGLE_SHEET_ID` and `GOOGLE_SERVICE_ACCOUNT_KEY` for local testing
  - [x] Test locally: verify the worker fetches and returns Google Sheets data

---

## Slice 3: Add KV Caching Layer

**Goal:** Add Cloudflare Workers KV caching with 1-hour TTL. The worker should use cached data when available and only fetch from Google Sheets when cache is expired or missing.

- [x] **Slice 3: Implement KV caching with 1-hour TTL**
  - [x] Create KV namespace using `wrangler kv:namespace create EXPERTS_KV`
  - [x] Update `wrangler.toml` to add KV namespace binding (`EXPERTS_KV`)
  - [x] Update `src/services/sheets.ts` to add `getExpertData(env, kv)` function
  - [x] Implement cache check logic: read from KV with key `"experts_data"`
  - [x] Implement TTL validation: compare current timestamp with cached timestamp (3600000ms = 1 hour)
  - [x] Implement cache write logic: store fetched data with timestamp in KV as JSON
  - [x] Update `src/index.ts` to use `getExpertData()` instead of direct fetch
  - [x] Add console.log statements to indicate cache hit vs cache miss
  - [x] Test locally: verify first request fetches from API and subsequent requests use cache
  - [x] Test locally: verify cache expires after 1 hour (or manually clear KV to simulate expiration)

---

## Slice 4: Error Handling and User-Facing Messages

**Goal:** Handle all Google Sheets API errors gracefully and return the specified error message. The worker should never crash and should always return a meaningful response.

- [x] **Slice 4: Implement comprehensive error handling**
  - [x] Create custom error class `SheetsUnavailableError` in `src/services/sheets.ts`
  - [x] Wrap Google Sheets API calls in try-catch blocks
  - [x] Catch authentication errors, sheet not found, network timeouts, and API quota errors
  - [x] Log errors using `console.error()` with technical details for debugging
  - [x] Throw `SheetsUnavailableError` with generic message for all Google Sheets failures
  - [x] Update `src/index.ts` to catch `SheetsUnavailableError` and return user-friendly JSON response: `{"error": "⚠️ Unable to access the expert database. Please try again later."}`
  - [x] Handle KV write failures gracefully: log error but continue with fresh data from API
  - [x] Test locally: simulate various error scenarios (invalid Sheet ID, invalid credentials, network failure)
  - [x] Verify error messages do not expose sensitive information (credentials, internal paths)

---

## Slice 5: Production Deployment Preparation

**Goal:** Ensure the worker is ready for production deployment with proper secrets and configuration.

- [x] **Slice 5: Configure for production deployment**
  - [x] Create production KV namespace using `wrangler kv:namespace create EXPERTS_KV --env production`
  - [x] Update `wrangler.toml` with production KV namespace ID
  - [x] Set production secret: `wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY --env production`
  - [x] Verify `GOOGLE_SHEET_ID` is set correctly in `wrangler.toml` vars section
  - [x] Add deployment script to `package.json`: `"deploy": "wrangler deploy"`
  - [x] Deploy to production: `npm run deploy`
  - [x] Test production endpoint: verify it fetches data correctly
  - [x] Test production caching: verify subsequent requests use cached data
  - [x] Test production error handling: simulate error by temporarily using invalid Sheet ID
