# Technical Specification: Google Sheets Integration

- **Functional Specification:** `context/spec/001-google-sheets-integration/functional-spec.md`
- **Status:** Draft
- **Author(s):** Claude

---

## 1. High-Level Technical Approach

This implementation will create a TypeScript service running on Cloudflare Workers that:
1. Authenticates to Google Sheets API using a Service Account
2. Fetches raw expert data from the configured Google Sheet
3. Caches the raw API response in Cloudflare Workers KV with 1-hour TTL
4. Returns the cached or fresh data to be used in LLM prompts

The data will remain in its raw Google Sheets API format - no parsing or transformation into structured types. The raw data will be passed directly to the Gemini API for semantic search.

---

## 2. Proposed Solution & Implementation Plan (The "How")

### 2.1 Project Structure

```
src/
  services/
    sheets.ts          # Google Sheets service with getExpertData() function
  config/
    env.ts             # Environment variable type definitions and validation
wrangler.toml          # Cloudflare Workers configuration (KV binding, vars)
.dev.vars              # Local development secrets (gitignored)
package.json           # Dependencies
```

### 2.2 Dependencies

**Required npm packages:**
- `googleapis` - Official Google APIs Node.js client for Google Sheets API v4
- `grammy` - Telegram bot framework (already specified in architecture)

### 2.3 Google Sheets Service Implementation

**File:** `src/services/sheets.ts`

**Main Function:**
```typescript
async function getExpertData(env: Env, kv: KVNamespace): Promise<any>
```

**Logic:**
1. Check KV cache for key `"experts_data"`
2. If cache exists and is less than 1 hour old, return cached data
3. If cache is expired or missing:
   - Authenticate using Service Account credentials from `env.GOOGLE_SERVICE_ACCOUNT_KEY`
   - Call Google Sheets API: `spreadsheets.values.get()` with the configured `GOOGLE_SHEET_ID`
   - Store raw API response in KV with current timestamp
   - Return the fresh data
4. On any Google Sheets API error, throw a custom error to be handled by the caller

**Authentication:**
- Use `google.auth.GoogleAuth` with service account JSON credentials
- Scope: `https://www.googleapis.com/auth/spreadsheets.readonly`

**API Call:**
- Endpoint: `spreadsheets.values.get()`
- Parameters:
  - `spreadsheetId`: from `env.GOOGLE_SHEET_ID`
  - `range`: First sheet, all data (e.g., `"Sheet1"` or leave unspecified to get the first sheet)

### 2.4 Cloudflare Workers Configuration

**File:** `wrangler.toml`

**KV Namespace Binding:**
```toml
[[kv_namespaces]]
binding = "EXPERTS_KV"
id = "<production-kv-id>"
preview_id = "<preview-kv-id>"
```

**Environment Variables (non-secret):**
```toml
[vars]
GOOGLE_SHEET_ID = "<sheet-id-here>"
```

**Secrets (set via CLI):**
- `GOOGLE_SERVICE_ACCOUNT_KEY` - JSON string of service account credentials

### 2.5 Cache Strategy

**KV Storage:**
- **Key:** `"experts_data"`
- **Value:** JSON stringified object containing:
  ```typescript
  {
    timestamp: number,  // Unix timestamp of fetch
    data: any          // Raw Google Sheets API response
  }
  ```

**TTL Logic:**
- Compare current timestamp with stored timestamp
- If difference > 3600000ms (1 hour), fetch fresh data
- No automatic expiration - manual check on each request

### 2.6 Error Handling

**Service Layer:**
- Catch all Google Sheets API errors
- Throw a standardized error (e.g., `SheetsUnavailableError`)
- Include error logging via `console.error()` for Cloudflare Workers logs

**Caller/Bot Layer:**
- Catch `SheetsUnavailableError`
- Send Telegram message: "⚠️ Unable to access the expert database. Please try again later."
- Do not expose technical details in user-facing messages

---

## 3. Impact and Risk Analysis

### System Dependencies

- **Google Sheets API:** Core dependency - system cannot function without it
- **Cloudflare Workers KV:** Required for caching; impacts performance but not critical functionality
- **Service Account Credentials:** Must be properly configured in Cloudflare secrets

### Potential Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Google Sheets API quota exceeded | Bot becomes unavailable | 1-hour cache reduces API calls; Monitor usage in Google Cloud Console |
| Service account credentials expire/revoked | Complete service failure | Document credential rotation process; Add monitoring alerts |
| KV write failures | Increased API calls, slower responses | Log KV errors; Degrade gracefully by fetching fresh data each time |
| Large sheet size (>400 rows grows significantly) | Increased latency and KV storage costs | Monitor sheet size; Consider pagination if it exceeds 1000 rows |
| Cold start latency | First request after idle is slow | Expected behavior on free tier; Acceptable per product requirements |

---

## 4. Testing Strategy

### Unit Testing
- Mock Google Sheets API responses
- Test cache hit/miss logic
- Test timestamp-based TTL validation
- Test error handling for various API failures

### Integration Testing
- Test actual Google Sheets API connection with test service account
- Test KV read/write operations in Wrangler dev environment
- Test full flow: fetch → cache → retrieve from cache

### Manual Testing Checklist
- [ ] Successfully authenticate with service account
- [ ] Fetch data from real Google Sheet
- [ ] Verify data is cached in KV
- [ ] Verify cache is used within 1-hour window
- [ ] Verify fresh fetch after cache expiration
- [ ] Test error message appears in Telegram when Sheet ID is invalid
- [ ] Test error message appears when service account lacks permissions
- [ ] Verify secrets are not exposed in logs or error messages
