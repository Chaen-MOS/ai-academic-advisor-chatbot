# AI Academic Advisor — Backend & AI Chatbot

This is the **Node.js backend and AI chatbot service** for my Final Year Project (FYP), *AI Chatbot for Academic Advising Using Large Language Models*, developed at Universiti Tunku Abdul Rahman (UTAR).

The project aims to help university students get basic academic information without having to wait for an in-person consultation. Students can ask about university policies, elective courses, academic progress, CGPA and study planning through a React Native mobile app.

I wanted the chatbot to do more than simply send every question to a large language model. The backend therefore combines **Google Gemini, Retrieval-Augmented Generation (RAG), intent classification, multi-turn clarification, student-specific context and rule-based CGPA calculations**. Different questions can be handled in different ways depending on what information is needed.

This repository contains the **backend and AI logic**. The separate mobile application is available here: [ai-academic-advisor-frontend](https://github.com/Chaen-MOS/ai-academic-advisor-frontend).

## Main Features

### AI academic advising
- Uses Google Gemini to generate conversational responses to student questions.
- Identifies the purpose of a question through intent classification.
- Retrieves relevant academic content from the knowledge base using RAG.
- Includes student profile details and relevant timetable or event information when needed.
- Uses recent conversation history and conversation summaries to support follow-up questions.

### Retrieval-Augmented Generation (RAG)
The RAG component helps the chatbot use information from uploaded university documents instead of relying only on a model's general knowledge.

The general process is:

1. An administrator uploads an academic document in PDF format.
2. The backend extracts and splits the document text into smaller chunks.
3. Embeddings are generated and the knowledge chunks are stored for retrieval.
4. When a relevant question is asked, the system searches for related chunks.
5. Retrieved content is added to the context sent to Gemini.

The knowledge management API also provides administrator-only operations for listing, enabling, controlling access to and removing documents.

### Multi-turn clarification and CGPA calculations
Some questions cannot be answered accurately without additional information. For example, a student asking whether they can reach a target CGPA may need to provide their current CGPA or credit information.

Instead of making up those values, the backend can ask follow-up questions and keep track of the missing information. For CGPA-related questions, calculations are performed using JavaScript functions; the calculated result is then supplied to Gemini for explanation. This keeps the numerical calculation separate from the language model.

### Student data and academic support
- Supabase Authentication and authenticated API access
- Student profile and academic information management
- Persistent conversations and messages
- Timetable and personal event management
- Support tickets for questions requiring lecturer assistance
- Role-based access controls for lecturer and administrator functions

## Technology Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js (ES modules) |
| API framework | Express.js |
| Large language model | Google Gemini (`@google/genai`) |
| Authentication and data | Supabase Auth, PostgreSQL |
| RAG | Document parsing, text chunking, embeddings and retrieval |
| File uploads | Multer, pdf-parse |
| Testing | Node.js built-in test runner |

## System Architecture

```text
React Native Mobile App
           |
           | HTTP REST API + Supabase access token
           v
     Express Backend
           |
     Authentication
           |
     Chat Processing
           |
     Intent Classification
           |
     +-------------------------------+
     | Clarification (if needed)     |
     | Student profile context       |
     | Timetable / event context     |
     | RAG knowledge retrieval       |
     | Deterministic CGPA calculator |
     | Conversation context          |
     +-------------------------------+
           |
     Prompt Construction
           |
       Gemini API
           |
     Response + Persistence
           |
           v
    React Native Mobile App

Supabase stores application data and the knowledge-base records.
```

Not every request uses every component. For example, a timetable question needs schedule context, while a CGPA question may require additional academic values and a calculation.

## Project Structure

The backend is organised into separate modules to make the API, AI logic and database operations easier to maintain.

```text
ai-academic-advisor-chatbot/
├── data/                  # Project data
├── script/                # Supporting scripts
├── src/
│   ├── ai/               # Intent, clarification, calculators and context
│   ├── config/           # Service configuration
│   ├── controllers/      # HTTP request handlers
│   ├── middleware/       # Authentication, roles and uploads
│   ├── prompts/          # LLM prompt construction
│   ├── rag/              # Knowledge retrieval logic
│   ├── routes/           # REST API routes
│   ├── services/         # Chat orchestration and related services
│   └── server.js         # Express entry point
├── tests/                 # Automated tests
├── .env.example
└── package.json
```

## Getting Started

### 1. Prerequisites

- A current Node.js installation and npm
- A Supabase project with the required authentication and PostgreSQL tables
- A Gemini API key

The provided repository does not automatically create an entire Supabase project. You will need a database schema and permissions compatible with the application's profile, conversation, timetable, event, support and knowledge-base features.

### 2. Clone and install dependencies

```bash
git clone https://github.com/Chaen-MOS/ai-academic-advisor-chatbot.git
cd ai-academic-advisor-chatbot
npm install
```

### 3. Configure environment variables

Copy the provided example file:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Update `.env` with the values for your own services:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
MIGRATION_ADMIN_USER_ID=
```

`MIGRATION_ADMIN_USER_ID` is included in the repository's example configuration; provide a value only when using the corresponding administrator migration/setup workflow. The service-role key is sensitive and **must remain on the backend**. Never commit a populated `.env` file to GitHub.

### 4. Start the server

```bash
npm start
```

The server uses port `3000` by default, unless `PORT` is set in the environment. To check whether it is running, visit:

```text
http://localhost:3000/api/health
```

The health endpoint returns a JSON status message. It checks that the Express server is responding; it does not by itself verify the Gemini or Supabase connections.

### 5. Connect the mobile application

Run the [React Native frontend](https://github.com/Chaen-MOS/ai-academic-advisor-frontend) separately. Its `src/config/api.ts` file uses `http://10.0.2.2:3000` for the Android Emulator. If you change the backend port or use a physical device, update the frontend address as needed.

## API Overview

Some of the main API routes are listed below:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check whether the API server is running |
| POST | `/api/chat` | Send a chat message for processing |
| GET | `/api/conversations` | Get a user's conversations |
| GET | `/api/conversations/:conversationId/messages` | Get messages from a conversation |
| DELETE | `/api/conversations/:conversationId` | Delete a conversation |
| GET / PATCH | `/api/profile` | View or update student profile |
| GET | `/api/auth/me` | Get the authenticated user's information |
| GET | `/api/timetable` | Get timetable entries |
| POST | `/api/timetable/preview` | Preview an imported timetable |
| POST | `/api/timetable/import` | Import timetable entries |
| GET / POST | `/api/events` | List or create events |
| POST | `/api/support/tickets` | Submit a support request |
| GET | `/api/support/tickets/mine` | View a user's support requests |
| POST | `/api/knowledge/upload` | Upload a knowledge PDF (admin only) |
| GET | `/api/knowledge` | List knowledge documents (admin only) |

Most routes require a valid Supabase access token in the `Authorization: Bearer <token>` header. Some also require the `ADMIN` or `LECTURER` role.

For example, the chat endpoint accepts a JSON body with `message`, `clientMessageId` and an optional `conversationId`:

```json
{
  "message": "Can I achieve a final CGPA of 3.50?",
  "clientMessageId": "unique-message-id",
  "conversationId": null
}
```

## Testing and Evaluation

To run the automated backend tests:

```bash
npm test
```

In the completed FYP evaluation, the **overall system** achieved the following results:

| Evaluation | Result |
| --- | --- |
| Automated unit tests | 40 passed |
| API test cases | 15 completed |
| Integration scenarios | 6 passed |
| RAG grounding test cases | 10 passed |
| System Usability Scale (SUS) | Average score of 96.0 |
| User Acceptance Testing (UAT) | 97.5% task success rate (39/40) |

These results were recorded for the FYP report using a limited evaluation sample. They should not be interpreted as production-level reliability guarantees. The report also included targeted hallucination and prompt-injection test cases.

## Limitations and Future Improvements

This is an academic prototype rather than an official university service. The main limitations identified during the project include:

- Knowledge documents require manual updates; automatic syncing and version management could improve this.
- The system is not connected to official university academic records or administrative APIs.
- AI-generated responses can still be incorrect; clearer citations and additional verification would be useful.
- The usability study involved a small number of participants and should be expanded for broader evaluation.

Students should verify important academic rules and requirements with the university's official sources or academic advisors.

## Related Repository

The mobile app provides authentication screens, chatbot UI, conversation history, student profiles, timetable and event management, reminders and lecturer support interfaces:

**[AI Academic Advisor — Mobile Frontend](https://github.com/Chaen-MOS/ai-academic-advisor-frontend)**

## About This Project

**Final Year Project (2026)**  
**Project title:** *AI Chatbot for Academic Advising Using Large Language Models*  
**Developer:** Chong Zi Chaen  
**University:** Universiti Tunku Abdul Rahman (UTAR)  
**Programme:** Bachelor of Software Engineering with Honours

My main learning experience in this part of the project was building a backend that combines traditional application logic with LLM-based responses. I also learned how to connect AI services with a database, retrieve relevant documents, manage conversation context, and test different academic advising workflows.
