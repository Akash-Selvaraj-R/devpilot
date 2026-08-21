# 🚀 DevPilot — AI Software Engineer

> **From Task to Tested Code.**

DevPilot is an AI-powered software engineering workspace that closes the engineering loop — from understanding a repository to planning, implementing, testing, debugging, verifying, and evaluating software changes.

Instead of stopping at code generation, DevPilot treats software development as an **end-to-end engineering process**.

**Think → Plan → Build → Test → Debug → Verify → Ship**

---

## 🎯 The Problem

Modern AI coding assistants are excellent at generating code from prompts, but real software engineering involves much more than writing code.

Developers still need to:

- Understand unfamiliar repositories
- Identify relevant files and dependencies
- Plan implementation changes
- Modify existing code safely
- Run and interpret tests
- Diagnose failures
- Verify that changes did not break existing functionality
- Evaluate the overall engineering quality

This creates a gap between **"AI generated some code"** and **"the software actually works."**

---

## 💡 The Solution

**DevPilot turns AI-assisted coding into an observable engineering workflow.**

A developer provides a repository and an engineering task. DevPilot orchestrates specialized agents that work through the software lifecycle:

```text
Task
  ↓
Repository Analysis
  ↓
Planning
  ↓
Implementation
  ↓
Testing
  ↓
Debugging
  ↓
Verification
  ↓
Engineering Evaluation
  ↓
Ship
````

The goal is simple:

**Don't just generate code. Engineer the change.**

---

# ✨ Key Features

### 🔍 Repository Analysis

DevPilot analyzes a repository to understand:

* Project structure
* Programming languages
* Frameworks
* Dependencies
* Relevant files
* Existing architecture
* Potential implementation areas

### 🧠 AI Planning

Before modifying code, DevPilot creates an implementation strategy describing:

* What needs to change
* Which files are affected
* How components interact
* What implementation steps are required

### 💻 Intelligent Implementation

The implementation agent generates targeted code changes while respecting the existing project structure and conventions.

Changes are presented through explicit diffs instead of hidden modifications.

### 🧪 Automated Testing

DevPilot executes tests and captures:

* Passing tests
* Failed tests
* Test output
* Execution results
* Validation status

### 🐛 Failure Analysis & Debugging

When tests fail, the Debugging Agent analyzes the failure and identifies the likely root cause before proposing a corrective action.

This creates a recovery loop instead of simply stopping when code fails.

### 📊 Engineering Health

DevPilot evaluates the resulting project across multiple engineering dimensions:

* Code Quality
* Architecture
* Testing
* Security
* Documentation

Each dimension receives a score from **0–100**, producing an overall Engineering Health score.

### ⚡ Real-Time Agent Timeline

The frontend receives workflow updates through **Server-Sent Events (SSE)** so users can observe the engineering process as it happens.

### 🤖 Multi-Agent Workflow

DevPilot separates responsibilities across specialized agents rather than relying on one monolithic AI prompt.

### 🎮 Demo Mode

A built-in demo experience allows users and judges to explore the complete DevPilot workflow without configuring an AI provider.

### ⌨️ Command Palette

Quickly navigate the workspace and actions using **Ctrl + K**.

---

# 🏗️ Architecture

```text
                         ┌─────────────┐
                         │    USER     │
                         └──────┬──────┘
                                │
                                ▼
                     ┌────────────────────┐
                     │   React Frontend   │
                     │   TypeScript/Vite  │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │    FastAPI API     │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │ Agent Orchestrator │
                     └─────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐     ┌──────────┐    ┌─────────────┐
        │ Analyzer │     │ Planner  │    │ Implementer │
        └────┬─────┘     └────┬─────┘    └──────┬──────┘
             │                │                 │
             └────────────────┼─────────────────┘
                              │
                              ▼
                       ┌────────────┐
                       │ Test Agent │
                       └─────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ Debug Agent │
                      └──────┬──────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Evaluation Agent │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Engineering Report  │
                  └──────────────────────┘
```

---

# 🤖 Agent Architecture

DevPilot uses six specialized agents, each responsible for a different stage of the engineering lifecycle.

| Agent                   | Responsibility                                           | Approach                  |
| ----------------------- | -------------------------------------------------------- | ------------------------- |
| 🔍 Repository Analyzer  | Understand repository structure and technologies         | Local repository analysis |
| 🧠 Planning Agent       | Create an implementation strategy                        | AI-powered reasoning      |
| 💻 Implementation Agent | Generate targeted code changes                           | AI-powered implementation |
| 🧪 Test Agent           | Execute and capture test results                         | Local test execution      |
| 🐛 Debugging Agent      | Diagnose failures and determine root causes              | AI-powered analysis       |
| 📊 Evaluation Agent     | Assess engineering quality and generate the final report | AI-powered evaluation     |

This separation allows DevPilot to make the workflow **observable, modular, and easier to reason about**.

---

# 📈 Engineering Health

DevPilot evaluates software across five engineering dimensions:

| Dimension         | What it evaluates                                          |
| ----------------- | ---------------------------------------------------------- |
| **Code Quality**  | Readability, maintainability, patterns, and best practices |
| **Architecture**  | Structure, separation of concerns, and scalability         |
| **Testing**       | Test coverage, reliability, and validation quality         |
| **Security**      | Security risks and safe engineering practices              |
| **Documentation** | README quality, comments, and API documentation            |

The result is an overall engineering health score that gives developers a quick view of the quality of the resulting software.

---

# 🛡️ Safety by Design

Autonomous software engineering should not mean uncontrolled software modification.

DevPilot is designed around controlled and observable changes:

* ✅ Explicit code diffs
* ✅ No silent modifications
* ✅ Controlled repository access
* ✅ Command allowlisting
* ✅ Test verification
* ✅ Sandboxed execution where supported
* ✅ API keys are never hardcoded

The user should be able to understand **what changed, why it changed, and whether it was verified.**

---

# 🧰 Tech Stack

| Layer               | Technology                    |
| ------------------- | ----------------------------- |
| Frontend            | React, TypeScript, Vite       |
| Styling             | Tailwind CSS                  |
| Backend             | Python, FastAPI               |
| Validation          | Pydantic                      |
| ORM                 | SQLAlchemy                    |
| Database            | SQLite / Async SQLite         |
| AI                  | OpenAI-compatible API         |
| Communication       | REST API + Server-Sent Events |
| Testing             | Pytest                        |
| Version Control     | Git / GitHub                  |
| Frontend Deployment | Vercel                        |
| Backend Deployment  | Render                        |
| Containerization    | Docker                        |

---

# 📁 Project Structure

```text
devpilot/
│
├── frontend/                     # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Application pages
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API and service clients
│   │   ├── types/                # TypeScript types
│   │   ├── data/                 # Demo data
│   │   └── utils/                # Utility functions
│   │
│   └── package.json
│
├── backend/                      # Python + FastAPI
│   ├── app/
│   │   ├── api/                  # API routes
│   │   ├── agents/               # Agent implementations
│   │   ├── services/             # Business logic
│   │   ├── models/               # Database models
│   │   ├── schemas/              # Pydantic schemas
│   │   └── core/                 # Configuration and infrastructure
│   │
│   ├── tests/                    # Backend tests
│   └── requirements.txt
│
├── examples/
│   └── demo-repository/          # Sample repository
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Python 3.11+
* Node.js 18+
* npm
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/Akash-Selvaraj-R/devpilot.git
cd devpilot
```

---

## 2. Configure Environment Variables

Create the required environment files from the provided examples.

```bash
cp .env.example .env
```

For the frontend, configure the API endpoint using:

```env
VITE_API_URL=http://localhost:8000
```

For production deployments, `VITE_API_URL` should point to the deployed FastAPI backend.

> ⚠️ Variables beginning with `VITE_` are bundled into the frontend and are publicly accessible. Never place private API keys or secrets in them.

---

# 🖥️ Run the Backend

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://localhost:8000
```

---

# 🌐 Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🐳 Docker

DevPilot can also be run using Docker:

```bash
docker-compose up --build
```

---

# 🎮 Demo Mode

DevPilot includes a demo workflow designed for quickly exploring the product.

The demo provides pre-generated engineering data so the complete experience can be viewed without configuring an external AI provider.

The demonstration covers:

```text
Repository Analysis
       ↓
Implementation Plan
       ↓
Code Changes
       ↓
Test Results
       ↓
Failure Analysis
       ↓
Debugging
       ↓
Engineering Evaluation
```

Example engineering metrics shown by the demo include:

```text
Files analyzed
42

Planned changes
7

Tests
10 passed / 2 failed

Debugging
Root cause identified

Engineering Health
89 / 100
```

---

# 🌍 Deployment

DevPilot can be deployed as two services:

```text
                    Internet
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Vercel Frontend    Render Backend
              │                 │
              └─────── API ────┘
```

### Frontend

The React/Vite application can be deployed to **Vercel**.

Configure:

```env
VITE_API_URL=<DEPLOYED_BACKEND_URL>
```

Because Vite embeds `VITE_*` variables during the build, the frontend must be redeployed after changing production environment variables.

### Backend

The FastAPI application can be deployed to **Render**.

The backend should listen on the port supplied by the deployment environment.

Example:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Production CORS should allow the deployed frontend origin.

---

# 🔄 Engineering Workflow

A typical DevPilot workflow looks like this:

```text
1. Developer defines a task
              ↓
2. Repository is analyzed
              ↓
3. Relevant files are identified
              ↓
4. Implementation plan is generated
              ↓
5. Code changes are produced
              ↓
6. Tests are executed
              ↓
7. Failures are analyzed
              ↓
8. Debugging actions are proposed
              ↓
9. Changes are verified
              ↓
10. Engineering health is evaluated
              ↓
11. Final engineering report
```

This turns a traditional:

```text
Prompt → Code
```

workflow into:

```text
Understand → Plan → Implement → Test → Debug → Verify → Evaluate
```

---

# 🏆 Why DevPilot?

Traditional AI coding:

```text
Developer
    ↓
Prompt
    ↓
AI
    ↓
Generated Code
    ↓
Developer decides what happens next
```

DevPilot:

```text
Developer
    ↓
Engineering Task
    ↓
Understand
    ↓
Plan
    ↓
Implement
    ↓
Test
    ↓
Debug
    ↓
Verify
    ↓
Evaluate
    ↓
Ship
```

The difference is not simply **better code generation**.

The difference is treating AI as part of an **engineering system**.

---

# 🔮 Future Roadmap

Potential future improvements include:

* 🔹 Deeper GitHub repository integration
* 🔹 Pull request generation
* 🔹 Automated CI/CD integration
* 🔹 More specialized engineering agents
* 🔹 Persistent project memory
* 🔹 Multi-repository workflows
* 🔹 Advanced security scanning
* 🔹 Code coverage visualization
* 🔹 Cloud sandbox execution
* 🔹 Human approval checkpoints
* 🔹 Team collaboration and review workflows

---

# 🎥 Hackathon Demo

DevPilot demonstrates the complete concept through an interactive engineering workspace:

**Analyze → Plan → Build → Test → Debug → Ship**

The demo focuses on making the AI engineering process **visible, measurable, and explainable** rather than hiding everything behind a single "Generate Code" button.

---

# 📜 License

This project is licensed under the **MIT License**.

See [LICENSE](LICENSE) for details.

---

# 👨‍💻 Built for the Hackathon

**DevPilot**

### AI Software Engineer

> **From task to tested code.**

Built with React, TypeScript, FastAPI, AI agents, and a focus on making autonomous software engineering observable and trustworthy.

**Think. Plan. Build. Verify. Recover. Ship. 🚀**
