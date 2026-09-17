# 🤖 Interviewer Buddy AI

> **Your AI Interview Partner. Practice Smarter. Get Hired.**

A production-ready, full-stack AI SaaS platform for intelligent interview preparation.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎙 **AI Mock Interviews** | Adaptive AI interviewer with voice/text/video modes |
| 📄 **Resume Intelligence** | ATS score, skill gap analysis, AI improvement tips |
| 💼 **Job Match Analyzer** | Paste any JD and get match score + prep strategy |
| 🧠 **Agentic AI System** | 6 specialized agents (Interview Manager, Resume, Job, Question, Evaluation, Career Coach) |
| 🔍 **RAG Knowledge Base** | Upload documents for grounded AI answers |
| 📊 **Analytics Dashboard** | Performance charts, skill radar, progress heatmap |
| 🗺 **Career Roadmap** | Personalized 30-day preparation plan |
| 🎯 **Practice Center** | 16+ categories with AI evaluation |
| 📋 **PDF Reports** | Downloadable interview reports |
| 🌙 **Dark Theme** | Premium dark UI with Aurora Intelligence design system |
| ⌨ **Command Palette** | Ctrl+K for instant navigation |
| 📱 **Responsive** | Works at all screen sizes from 320px to 4K |

---

## 🚀 Quick Start (Demo Mode — No API Keys Needed)

### Option 1: Frontend Only (fastest)

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
# Click "Try Demo" on the landing page
```

### Option 2: Full Stack (Python + SQLite)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

### Option 3: Docker Compose

```bash
docker-compose up --build
# Open http://localhost
```

---

## 🔑 Environment Variables

Copy .env.example to .env in the ackend/ directory:

```env
DEMO_MODE=true          # true = no API key needed
OPENAI_API_KEY=sk-...   # Optional: for real AI responses
DATABASE_URL=sqlite+aiosqlite:///./interviewer_buddy.db
SECRET_KEY=your-secret-key
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                │
│  Landing → Auth → Dashboard → Interview → Results       │
└─────────────────┬───────────────────────────────────────┘
                  │ REST API + WebSocket
┌─────────────────▼───────────────────────────────────────┐
│                  BACKEND (FastAPI)                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Auth JWT │  │Interview │  │  Resume  │  │  RAG   │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Agentic AI System                      │ │
│  │  InterviewManager · ResumeAgent · JobAgent         │ │
│  │  EvaluationAgent · CareerCoach · QuestionGen       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────┐    ┌─────────────────────────┐   │
│  │  LLM Provider    │    │  SQLite / PostgreSQL     │   │
│  │  OpenAI / Demo   │    │  (via SQLAlchemy)        │   │
│  └──────────────────┘    └─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
interviewer-buddy-ai/
├── frontend/                   React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         CommandPalette, etc.
│   │   ├── pages/              All application pages
│   │   ├── layouts/            AppLayout, AuthLayout
│   │   ├── store/              Zustand stores
│   │   ├── services/           Mock data + API services
│   │   └── lib/                Utils
│   └── package.json
│
├── backend/                    Python FastAPI
│   ├── app/
│   │   ├── main.py             FastAPI app + WebSocket
│   │   ├── config.py           Settings
│   │   ├── database.py         SQLAlchemy + SQLite
│   │   ├── models/             User, Interview, Resume, Document
│   │   ├── schemas/            Pydantic schemas
│   │   ├── routes/             auth, interviews, resume, jobs, practice, rag
│   │   ├── agents/             AI agent system
│   │   ├── ai/provider.py      OpenAI / Demo LLM abstraction
│   │   ├── auth/               JWT handler
│   │   └── utils/              File upload, text extraction
│   ├── tests/                  pytest test suite
│   └── requirements.txt
│
├── docker-compose.yml          Full stack deployment
├── .env.example
└── README.md
```

---

## 🧪 Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Framer Motion |
| Styling | Tailwind CSS, Custom CSS Variables (Aurora Intelligence) |
| State | Zustand, TanStack Query |
| Charts | Recharts |
| Backend | FastAPI, Python 3.12 |
| Database | SQLite (dev) / PostgreSQL (production) |
| ORM | SQLAlchemy 2.0 (async) |
| Auth | JWT (python-jose) + bcrypt |
| AI | OpenAI GPT-4o / Demo Mode |
| RAG | FAISS / Simple keyword search (demo) |
| Deployment | Docker Compose, Nginx |

---

## 📝 License

MIT License — Build on top of this for your hackathon, college project, or portfolio!

---

**Interviewer Buddy AI** — *Practice Smarter. Get Hired.*
