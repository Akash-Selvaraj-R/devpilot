# DevPilot

## AI Software Engineer

**From Task to Tested Code.**

DevPilot is an AI-powered software engineering workspace that closes the engineering loop — from understanding your repository to shipping tested code.

---

## Problem

Developers can ask AI for code, but turning that answer into tested, working software still requires significant manual work — understanding the codebase, planning changes, writing code, running tests, debugging failures, and verifying everything works.

## Solution

DevPilot automates the entire software engineering workflow. Connect a repository, describe your task, and let DevPilot handle the rest — from analysis to passing tests.

**Think → Plan → Build → Verify → Recover → Ship**

---

## Features

- **Repository Analysis** — Automatically detect languages, frameworks, dependencies, and architecture
- **AI Planning** — Generate step-by-step implementation plans
- **Code Generation** — Produce production-quality code changes with full diffs
- **Test Execution** — Run tests and capture results
- **Failure Analysis** — Diagnose test failures and suggest fixes
- **Engineering Health** — Radar chart scoring code quality, architecture, testing, security, and documentation
- **Real-time Updates** — Stream progress via Server-Sent Events
- **Agent Timeline** — Watch six AI agents work through the engineering pipeline
- **Demo Mode** — Try it instantly with pre-generated sample data
- **Command Palette** — Quick access to all actions with Ctrl+K

---

## Architecture

```
                    USER
                     │
                     ▼
              React Frontend
                     │
                     ▼
                FastAPI API
                     │
                     ▼
             Agent Orchestrator
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
    Analyzer       Planner     Implementer
        │            │             │
        └────────────┼─────────────┘
                     ▼
                 Test Agent
                     │
                     ▼
                Debug Agent
                     │
                     ▼
             Evaluation Agent
                     │
                     ▼
            Engineering Report
```

---

## Agent Architecture

DevPilot uses six specialized AI agents that work together:

| Agent | Role | Method |
|-------|------|--------|
| **Repository Analyzer** | Scan repo, detect languages/frameworks | Local analysis |
| **Planning Agent** | Generate implementation strategy | AI-powered |
| **Implementation Agent** | Write code changes | AI-powered |
| **Test Agent** | Execute test suites | Local execution |
| **Debugging Agent** | Diagnose failures, suggest fixes | AI-powered |
| **Evaluation Agent** | Generate report and health score | AI-powered |

---

## Engineering Health

DevPilot evaluates code across five dimensions:

- **Code Quality** — Readability, patterns, best practices
- **Architecture** — Structure, separation of concerns, scalability
- **Testing** — Coverage, test quality, reliability
- **Security** — Vulnerability assessment, safe practices
- **Documentation** — Comments, README, API docs

Each category is scored 0-100. The overall health score provides a quick assessment of engineering quality.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy |
| Database | SQLite (async) |
| AI | OpenAI-compatible API |
| Deployment | Docker |

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Environment Variables

```bash
cp .env.example .env
# Edit .env with your AI API key
```

### Running the Application

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Docker

```bash
docker-compose up --build
```

---

## Demo Mode

DevPilot includes a built-in demo mode with pre-generated data. Click "Load Demo Data" in the workspace to see the full engineering workflow without configuring an AI provider.

The demo shows:
- Repository analysis of a Flask API
- JWT authentication implementation plan
- Code changes with diffs
- Test execution (9/9 passing)
- Engineering health score (89/100)

---

## Project Structure

```
devpilot/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   ├── data/             # Demo data
│   │   └── utils/            # Utility functions
│   └── package.json
│
├── backend/                  # Python + FastAPI
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── agents/           # AI agent implementations
│   │   ├── services/         # Business logic
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── core/             # Config, database, AI provider
│   ├── tests/                # Backend tests
│   └── requirements.txt
│
├── examples/
│   └── demo-repository/      # Sample project for demo
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Safety

- Explicit code diffs — no silent modifications
- Command allowlist for test execution
- Controlled repository access
- Test verification before shipping
- API keys never hardcoded

---

## License

MIT License — see [LICENSE](LICENSE)

---

**DevPilot — From task to tested code.**
