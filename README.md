# Biomarkers 

Used: 
- Cursor with Claude Sonnet 4.5
- OpenAI GPT-4
- MCP SDK `@modelcontextprotocol/sdk`


### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Patients     │  │   Patient    │  │  Chat Widget   │  │
│  │     List       │  │   Details    │  │  (Controlled)  │  │
│  └────────────────┘  └──────────────┘  └────────────────┘  │
│                              │                               │
│                              ▼                               │
│                    HTTP REST API Calls                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express + TypeScript)            │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   REST API     │  │  AI Service  │  │  MCP Service   │  │
│  │   Endpoints    │  │  (GPT-4)     │  │  (Tools)       │  │
│  └────────────────┘  └──────────────┘  └────────────────┘  │
│           │                   │                  │           │
│           └───────────────────┴──────────────────┘           │
│                              ▼                               │
│                    Patient & Biomarker Data                  │
│                      (JSON Seeder Files)                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19.2.0 with TypeScript
- React Router for navigation
- Bootstrap 5 for UI components
- Vite for build tooling
- React Markdown for rendering AI responses

**Backend:**
- Node.js with Express 5
- TypeScript for type safety
- OpenAI SDK for GPT-4 integration
- MCP SDK for protocol implementation

## 📁 Project Structure

```
biomarkers/
├── server/                      # Backend application
│   ├── src/
│   │   ├── index.ts            # Express server setup
│   │   └── services/
│   │       ├── ai-service.ts   # OpenAI GPT-4 integration
│   │       └── mcp-service.ts  # MCP protocol implementation
│   ├── data/
│   │   ├── seeder_patients.json
│   │   └── seeder_biomarkers.json
│   └── package.json
│
├── web/                         # Frontend application
│   ├── src/
│   │   ├── main.tsx            # App entry point
│   │   ├── App.tsx             # Root component
│   │   ├── components/
│   │   │   ├── ChatWidget.tsx  # AI chat interface
│   │   │   └── LineChart.tsx   # Biomarker visualization
│   │   └── pages/
│   │       ├── Patients.tsx    # Patient list
│   │       └── PatientDetails.tsx  # Patient details + chat
│   └── package.json
│
├── types/
│   └── index.ts                # Shared TypeScript types
│
└── README.md                   # This file
```
