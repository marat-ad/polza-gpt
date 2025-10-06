# Functional Specification: Google Sheets Integration

- **Roadmap Item:** Google Sheets Integration - Connect to the Google Sheets database containing ~400 expert records and implement data fetching functionality
- **Status:** Draft
- **Author:** Claude

---

## 1. Overview and Rationale (The "Why")

The Google Sheets integration is the foundational data layer for PolzaGPT. The expert database (~400 records) is manually maintained in a Google Sheets document by community administrators. Without access to this data, the bot cannot perform expert search or matching. This integration must reliably fetch expert data, cache it for performance, and handle errors gracefully so users understand when the data source is unavailable.

**Success Criteria:**
- The bot can successfully authenticate and fetch expert data from Google Sheets
- Expert data is cached for 1 hour to minimize API calls and improve response times
- Users receive clear error messages when the data source is unavailable

---

## 2. Functional Requirements (The "What")

### 2.1 Google Sheet Structure

- The Google Sheet contains 5 columns with Russian labels:
  - **"Фамилия Имя"** (Name/Surname)
  - **"Год выпуска"** (Year of high school graduation)
  - **"Город"** (City)
  - **"Род деятельности"** (Expertise/field of work)
  - **"Телефон"** (Phone/Telegram contact)

**Acceptance Criteria:**
- [ ] The system reads all 5 columns from the Google Sheet
- [ ] Column names are matched exactly as specified above
- [ ] Each row represents one expert record

### 2.2 Data Parsing and Handling

- All fields are intended to be required, but missing data should not prevent a record from being included
- Expertise field ("Род деятельности") contains free-form text with no specific delimiters for multiple expertises
- Empty rows should not exist, but if encountered, should be skipped

**Acceptance Criteria:**
- [ ] Records with missing fields are included in the dataset (not filtered out)
- [ ] Empty rows (all cells empty) are skipped during parsing
- [ ] Expertise field is treated as a single text string regardless of content format
- [ ] All text data is preserved as-is without transformation

### 2.3 Authentication and Connection

- The bot authenticates using a Google Service Account with read-only access
- Service account credentials (JSON key file) are stored as a Cloudflare Workers secret
- The Google Sheet ID/URL is configurable via environment variable

**Acceptance Criteria:**
- [ ] Bot successfully authenticates to Google Sheets API using service account credentials
- [ ] Credentials are retrieved from Cloudflare Workers secrets (not hardcoded)
- [ ] Google Sheet ID is configured via environment variable
- [ ] Service account has read-only permissions to the target sheet

### 2.4 Data Caching

- Expert data is cached in Cloudflare Workers KV storage
- Cache duration is 1 hour from the time of fetch
- After cache expiration, data is refetched from Google Sheets on the next query

**Acceptance Criteria:**
- [ ] Successfully fetched data is stored in Cloudflare Workers KV
- [ ] Cache is valid for 1 hour from the fetch timestamp
- [ ] Expired cache triggers a fresh fetch from Google Sheets API
- [ ] Multiple queries within the 1-hour window use cached data (no redundant API calls)

### 2.5 Error Handling

- Any Google Sheets API error (authentication failure, sheet not found, network timeout, API quota exceeded, etc.) results in a generic error message
- Error message is displayed in the Telegram chat where the bot was mentioned
- Error message text: "⚠️ Unable to access the expert database. Please try again later."

**Acceptance Criteria:**
- [ ] When Google Sheets API returns an error, the bot responds with the specified error message
- [ ] Error message is sent to the same Telegram chat where the bot was mentioned
- [ ] The following error scenarios are handled: authentication failure, sheet not found, network timeout, empty/invalid sheet data, API quota exceeded
- [ ] Error messages do not expose technical details or credentials

---

## 3. Scope and Boundaries

### In-Scope

- Fetching expert data from a single Google Sheet
- Reading 5 columns: "Фамилия Имя", "Год выпуска", "Город", "Род деятельности", "Телефон"
- Authentication via Google Service Account
- Caching in Cloudflare Workers KV with 1-hour duration
- Generic error handling and user-facing error messages
- Configurable Google Sheet ID via environment variable

### Out-of-Scope

- Writing or updating data in Google Sheets
- Data validation or quality checks on expert records
- Multi-sheet support (only one sheet is accessed)
- Manual cache invalidation or refresh functionality
- Detailed error reporting or admin notifications
- Support for different column names or sheet structures
- Data transformation or normalization beyond basic parsing
