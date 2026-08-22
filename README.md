# DevPilot

## AI Coding Buddy with Personality

**Your AI coding companion that understands your code — and learns how you work.**

DevPilot reviews, explains, debugs, and improves your code while adapting to the way you learn and work. Choose a personality, build memory, and get personalized coding assistance powered by repository context.

---

## Problem

Generic coding assistants provide useful answers but often lack persistent understanding of the developer's preferences, recurring issues, and working style. Every conversation starts from zero.

## Solution

DevPilot combines:

- **Codebase context** — understands your files, languages, and frameworks
- **Developer memory** — remembers your preferences and recurring issues
- **Personality system** — adapts communication style to how you learn
- **Agentic workflow** — analyze, plan, implement, test, debug, and evaluate

**Personality + Memory + Code Context + Agentic Execution**

---

## Core Innovation

> **Most coding assistants understand the code. DevPilot understands the developer too.**

While personality and memory personalize the conversation, DevPilot's agentic engineering workflow can actually analyze, implement, test, and debug changes across a codebase.

---

## Features

### Coding Buddy

- **Personality System** — Choose from Mentor, Senior Engineer, Strict Reviewer, or Interview Coach
- **Developer Memory** — Persistent preferences, recurring issues, and technology stack
- **Coding Actions** — Explain, Review, Debug, Improve, and Ask with personality-aware responses
- **Context Indicator** — See exactly what context influenced the response
- **Session History** — Persistent coding sessions with conversation history

### Engineering Workflow

- **Repository Analysis** — Detect languages, frameworks, dependencies, and architecture
- **AI Planning** — Generate step-by-step implementation plans
- **Code Generation** — Produce production-quality code with full diffs
- **Test Execution** — Run tests and capture results
- **Failure Analysis** — Diagnose test failures and suggest fixes
- **Engineering Health** — Radar chart scoring code quality, architecture, testing, security, documentation

### Experience

- **Demo Mode** — Try it instantly with pre-generated sample data
- **Command Palette** — Quick access to all actions with Ctrl+K
- **Real-time Updates** — Stream progress via Server-Sent Events
- **Agent Timeline** — Watch six AI agents work through the engineering pipeline

---

## Personalities

| Personality | Style | Best For |
|-------------|-------|----------|
| **Mentor** | Patient, educational, step-by-step | Learning new concepts |
| **Senior Engineer** | Concise, direct, production-focused | Getting things done |
| **Strict Reviewer** | Zero-compromise, severity-rated | Code quality |
| **Interview Coach** | Guiding questions, progressive reveal | Problem-solving skills |

Each personality modifies the AI system prompt, response style, verbosity, and whether solutions are revealed immediately.

---

## Architecture

```
Developer
    |
    v
Code / Repository
    |
    v
Context Analysis
    |
    v
Developer Memory
    |
    v
Selected Personality
    |
    v
AI Reasoning
    |
    v
Personalized Coding Assistance
    |
    v
Memory Update
```

### Agent Pipeline

```
Repository Analyzer -> Planning Agent -> Implementation Agent
                                                  |
                                            Test Agent
                                                  |
                                           Debug Agent
                                                  |
                                         Evaluation Agent
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy |
| Database | SQLite (async) |
| AI | OpenAI-compatible API (with demo fallback) |
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
# Edit .env with your AI API key (optional — demo mode works without it)
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

## Demo Flow

1. Open DevPilot
2. Select a personality (e.g., Senior Engineer)
3. Open a project or load demo data
4. Click Debug to see personality-aware analysis
5. Switch to Mentor — ask the same question
6. Observe how the response changes
7. View Developer Memory panel
8. Check Context Indicator
9. Run the full Analyze -> Plan -> Implement -> Test -> Debug workflow

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
│   │   ├── api/              # API routes (projects + coding)
│   │   ├── agents/           # AI agent implementations
│   │   ├── services/         # Business logic
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── core/             # Config, database, AI provider, personalities
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
- No passwords, tokens, or secrets stored in developer memory

---

## License

MIT License — see [LICENSE](LICENSE)

---

**DevPilot — Your AI coding companion that understands your code and learns how you work.**
