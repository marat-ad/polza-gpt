# Product Roadmap: PolzaGPT

_This roadmap outlines our strategic direction based on customer needs and business goals. It focuses on the "what" and "why," not the technical "how."_

---

### Phase 1

_The highest priority features that form the core foundation of the product._

- [x] **Data Foundation**
  - [x] **Google Sheets Integration:** Connect to the Google Sheets database containing ~400 expert records (Name, Expertise, Contacts columns) and implement data fetching functionality.
  - [x] **Data Parsing & Validation:** Ensure expert data is properly parsed and validated for use in search and matching operations.

- [x] **Telegram Bot Core**
  - [x] **Bot Registration & Setup:** Register the bot with Telegram and configure it to respond to @mentions in group chats.
  - [x] **Message Processing:** Implement basic message handling to capture user queries when the bot is mentioned in group conversations.
  - [x] **Response Formatting:** Create a clear, readable format for displaying expert results with contact information in Telegram messages.

---

### Phase 2

_Once the foundational features are complete, we will move on to these high-value additions._

- [ ] **AI-Powered Semantic Search**
  - [ ] **Google Gemini API Integration:** Connect to Google Gemini API (free tier) for natural language processing of user queries.
  - [ ] **Semantic Matching Engine:** Implement AI-powered matching that understands intent and context beyond simple keyword matching.
  - [ ] **Match Ranking Algorithm:** Create logic to rank experts by relevance and return the top 3-5 matches for each query.

- [ ] **Enhanced User Experience**
  - [ ] **Match Explanations:** Generate and display brief explanations for why each expert was matched to the user's query.
  - [ ] **Query Understanding:** Handle various query formats and rephrasings to improve search flexibility and accuracy.

---

### Phase 3

_Features planned for future consideration. Their priority and scope may be refined based on user feedback from earlier phases._

- [ ] **Infrastructure & Performance**
  - [ ] **Cloudflare Workers Deployment:** Deploy the bot to Cloudflare Workers free tier for zero-cost hosting.
  - [ ] **Cold Start Optimization:** Improve response times where possible while maintaining free tier constraints.
  - [ ] **Error Handling & Resilience:** Add robust error handling and graceful degradation for API failures.

- [ ] **Data Management**
  - [ ] **Automatic Sheet Sync:** Implement periodic syncing or caching of the expert database to improve performance.
  - [ ] **Data Quality Monitoring:** Add basic checks to ensure the Google Sheet data remains valid and accessible.
