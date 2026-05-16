# ⚖️ Regle: The Agentic RAG Ecosystem

Regle is a next-generation, high-structure RAG (Retrieval-Augmented Generation) ecosystem designed for professional-grade search and intelligence. It combines a high-performance **FastAPI backend** (rag-engine) with a stunning **Next.js frontend** to deliver deep, multi-source research capabilities.

![Regle Hero](https://via.placeholder.com/1200x400/1a1a1a/ffffff?text=Regle:+Agentic+RAG+Ecosystem)

## 🚀 Overview

Regle is built to move beyond simple vector search. It implements an **Agentic Workflow** where multiple AI agents collaborate to plan, retrieve, grade, and synthesize information from diverse sources:

- 🎓 **Academic Search**: Deep integration with Semantic Scholar and ArXiv.
- 📹 **YouTube Intelligence**: Video search and content processing.
- 💻 **GitHub Insights**: Codebase and repository analysis.
- 🌐 **Web Intelligence**: Real-time search via Serper and SearXNG.
- 👁️ **Vision Services**: Processing of visual information.

## 🏗️ Architecture

The project is split into two main components:

### 1. `rag-engine/` (The Brain)
A Python-based backend powered by FastAPI that handles the heavy lifting:
- **Agents**: Orchestrator, Planner, Grader, and Synthesizer nodes.
- **Services**: Specialized connectors for Redis (Upstash), LLMs (OpenRouter/OpenAI), and external APIs.
- **DB**: Supabase integration for persistent storage and user management.
- **Cache**: Sub-millisecond performance with Redis caching.

### 2. `frontend/` (The Interface)
A modern Next.js 15 application:
- **App Router**: Leveraging the latest React features for performance.
- **Dynamic UI**: Responsive components for search, sources, and analytics.
- **Tailwind CSS**: Sleek, modern design with custom animations.

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, LangGraph (for agents), Pydantic.
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Lucide Icons.
- **Infrastructure**: Upstash Redis, Supabase (PostgreSQL), Serper.dev, OpenRouter.
- **AI Models**: Support for OpenAI, NVIDIA Nemotron, and Llama 3.1 via OpenRouter.

## ⚙️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- API keys for Upstash, Serper, OpenRouter, and Supabase.

### Backend Setup
```bash
cd rag-engine
pip install -r requirements.txt
# Configure your .env file
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
# Configure your .env.local file
npm run dev
```

## 🔐 Environment Variables

Key variables required in `rag-engine/.env`:
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`
- `SERPER_API_KEY`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GITHUB_TOKEN`

## 📊 Features & Roadmap

- [x] **Agentic RAG**: Multi-step planning and grading.
- [x] **Multi-Source Ingestion**: Web, Academic, YouTube, GitHub.
- [x] **Credits & Analytics**: Built-in monitoring and usage tracking.
- [x] **LaTeX Support**: Professional rendering for scientific content.
- [ ] **Real-time Collaboration**: Shared research workspaces (Coming Soon).
- [ ] **Offline Models**: Local LLM support via Ollama.

---

Built with ❤️ by the **Regle Team**. Pushed to [EMP0RI0M/regle](https://github.com/EMP0RI0M/regle).
