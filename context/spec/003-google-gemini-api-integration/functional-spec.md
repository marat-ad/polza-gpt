# Functional Specification: Google Gemini API Integration

- **Roadmap Item:** Google Gemini API Integration - Connect to Google Gemini API (free tier) for natural language processing of user queries
- **Status:** Draft
- **Author:** Product Team

---

## 1. Overview and Rationale (The "Why")

Users need to find experts by describing their needs in natural, flexible language without being constrained by specific keywords or rigid search formats. The current bot implementation lacks the ability to interpret varied query phrasings, understand intent, and match experts based on semantic meaning rather than exact keyword matches.

**Problem:** Users express their needs in many different ways ("find me an iOS developer" vs "I need an iOS dev" vs "tell me who can build mobile apps"), and a simple keyword search would miss relevant experts or require users to know exact terms used in the expert database.

**Desired Outcome:** Users can ask for experts using any natural phrasing in any language, and the AI will understand their intent, analyze the expert database, and return relevant matches with appropriate explanations.

**Success Measurement:** Manual testing will validate that the system correctly interprets diverse query formats and returns relevant expert matches.

---

## 2. Functional Requirements (The "What")

### 2.1. Query Processing

- **As a** community member, **I want to** ask for experts using natural language in any format, **so that** I don't have to guess the right keywords or structure.
  - **Acceptance Criteria:**
    - [ ] The system accepts queries in varied formats (examples: "find me an iOS developer", "I need an iOS dev", "tell me who can build mobile apps", "give me a list of people I can ask about mobile development")
    - [ ] The system accepts queries in any language (Russian, English, or mixed)
    - [ ] The system handles single-word queries (e.g., "iOS")
    - [ ] The system handles paragraph-long descriptions
    - [ ] The LLM analyzes message length and responds appropriately

- **As a** user, **I want to** receive responses in the same language I used, **so that** communication feels natural.
  - **Acceptance Criteria:**
    - [ ] If the user writes in Russian, the response is in Russian
    - [ ] If the user writes in English, the response is in English
    - [ ] If the user writes in mixed language, the response uses the dominant language

### 2.2. AI Processing & Matching

- **As a** user, **I want to** the AI to analyze my query against all experts, **so that** I get relevant matches.
  - **Acceptance Criteria:**
    - [ ] The AI receives the complete expert list (~400 records with Name, Graduation Year, City, Expertise, Contacts columns)
    - [ ] The AI analyzes only the current user message (no conversation history)
    - [ ] The AI identifies relevant experts based on semantic understanding, not just keyword matching
    - [ ] The system uses Google Gemini API (gemini-2.0-flash model, free tier)

### 2.3. Results Display

- **As a** user, **I want to** see up to 5 relevant experts with their contact information, **so that** I can reach out to them directly.
  - **Acceptance Criteria:**
    - [ ] By default, the system returns up to 5 relevant experts (may be fewer if matches are limited)
    - [ ] Each expert result includes structured information: **Name**, **Year of Graduation**, **City**, **Contacts**
    - [ ] Each expert result includes **Expertise** in natural sentence format
    - [ ] Each expert result includes a brief explanation of why they match the request, **only when the match is not obvious**
    - [ ] Obvious matches (e.g., "iOS developer" expertise for "iOS developer" request) do not require explanation
    - [ ] Non-obvious matches (e.g., specific developer type matching broad "software developer" request) include explanation

**Example response format:**
```
**Name:** Maria Ivanova
**Graduated:** 2018
**City:** Moscow
**Contacts:** @maria_dev, maria@example.com
**Expertise:** Specializes in iOS development with 5 years of experience in SwiftUI and reactive programming.
```

### 2.4. "Show All" Functionality

- **As a** user, **I want to** request all matching experts when needed, **so that** I can see the complete list of options.
  - **Acceptance Criteria:**
    - [ ] When user explicitly requests all results (phrases: "show me all", "give me everyone", "list all matches", or similar natural variations), the system returns all matching experts
    - [ ] The system never returns more than 20 experts, even when "show all" is requested
    - [ ] If more than 20 matches exist, the system returns the top 20 most relevant

### 2.5. Edge Cases

- **As a** user, **I want to** receive helpful feedback when no matches are found, **so that** I can refine my search.
  - **Acceptance Criteria:**
    - [ ] When no relevant matches exist, the system responds with: "No matches found. You can try rephrasing your request."
    - [ ] If possible, the system returns the closest matches with a disclaimer

- **As a** user, **I want to** be informed when many matches exist, **so that** I understand I'm seeing filtered results.
  - **Acceptance Criteria:**
    - [ ] When more than 5 matches exist and user didn't request "show all", the system responds with: "Many matches found, here are top 5"

- **As a** user, **I want to** receive clear communication when the service is unavailable, **so that** I know to try again later.
  - **Acceptance Criteria:**
    - [ ] When the Gemini API is unavailable or returns an error, the system responds with: "The service is temporarily unavailable. Please try again later."

### 2.6. Response Timing

- **As a** user, **I want to** receive a response when it's ready, **so that** I can continue my work without waiting actively.
  - **Acceptance Criteria:**
    - [ ] The bot replies to the user's message when processing is complete
    - [ ] No loading states or "typing..." indicators are shown
    - [ ] The user understands the bot is processing (implicit: they receive a reply to their message)

---

## 3. Scope and Boundaries

### In-Scope

- Accepting natural language queries in any language
- Processing queries through Google Gemini API (gemini-2.0-flash, free tier)
- Semantic matching against ~400 expert records from Google Sheets
- Returning up to 5 experts by default, or up to 20 when "show all" is requested
- Structured display of Name, Graduation Year, City, and Contacts
- Natural language display of Expertise
- Brief match explanations when not obvious
- Handling edge cases: no matches, many matches, API failures
- Responding in the same language as the query

### Out-of-Scope

- Learning from user feedback to improve matches over time
- Storing query history
- Personalized results based on who is asking
- Conversation context (analyzing previous messages in thread)
- Loading states or typing indicators
- Specific performance optimizations beyond free tier constraints
- Custom AI model training or fine-tuning
