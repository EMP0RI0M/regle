# ⚖️ Regle: The Enterprise-Grade Agentic RAG Ecosystem

Regle is a state-of-the-art, high-structure RAG (Retrieval-Augmented Generation) platform designed to bridge the gap between simple semantic search and complex, multi-source research intelligence. It combines an autonomous agentic backbone with a stunning, high-performance web interface.

![Regle Hero](https://via.placeholder.com/1200x400/1a1a1a/ffffff?text=Regle:+Enterprise+Agentic+RAG)

## 📖 Table of Contents
- [Project Vision](#project-vision)
- [System Architecture](#system-architecture)
- [The Full Stack](#the-full-stack)
  - [Frontend: Next.js 15 Console](#frontend-nextjs-15-console)
  - [Backend: FastAPI RAG Engine](#backend-fastapi-rag-engine)
  - [AI Layer: Agentic Workflow](#ai-layer-agentic-workflow)
- [Key Features](#key-features)
- [External Integrations](#external-integrations)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Project Roadmap](#project-roadmap)

---

## 🎯 Project Vision

Regle isn't just a search tool; it's a **Research Orchestrator**. While traditional RAG systems simply retrieve and summarize, Regle thinks before it acts. It utilizes a multi-agent system to:
1.  **Analyze** the intent of the user's query.
2.  **Plan** a multi-step research strategy across disparate data sources.
3.  **Retrieve** information from academic, public, and private stores.
4.  **Grade** and filter findings for strict relevance and accuracy.
5.  **Synthesize** professional-grade answers with full citations and LaTeX support.

---

## 🏗️ System Architecture

Regle follows a decoupled, micro-service-inspired architecture:

### 1. The Core Infrastructure
- **Persistence**: Powered by **Supabase (PostgreSQL)** for user data, document metadata, and project management.
- **Speed**: **Upstash Redis** provides sub-millisecond caching for LLM responses and frequent search results.
- **Search**: Hybrid search combining **Supabase Vector** (PGVector) for local knowledge and **SearXNG/Serper** for real-time web intelligence.

### 2. The Agentic Backbone (LangGraph)
The system uses **LangGraph** to manage a stateful, cyclic workflow of AI agents:
- **Planner Node**: The "Architect" that breaks down questions into research steps.
- **Tool Nodes**: Parallel executors that fetch data from ArXiv, GitHub, YouTube, and Web.
- **Grader Node**: The "Quality Control" agent that discards irrelevant or hallucinated content.
- **Synthesizer Node**: The "Editor" that writes the final report based on graded facts.

---

## 💻 The Full Stack

### 🎨 Frontend: Next.js 15 Console
Located in `frontend/`, this is a premium React application built with TypeScript and Tailwind CSS.

#### 📍 Core Pages & Routes
- **`/search`**: The primary research portal. Features a dynamic search bar, real-time source citations, and a clean, focused reading experience.
- **`/console/v3.0`**: An advanced analytics dashboard for monitoring search performance, token usage, and credit consumption.
- **`/sources`**: A central hub for managing connected data sources, including repository syncs and document uploads.
- **`/auth/callback`**: Secure authentication flow integrated with Supabase Auth for seamless user onboarding.
- **`/settings`**: Customizable user preferences, API key management, and theme toggling (Dark/Light mode).

#### 🧩 Key Components
- **`SourcesPanel.tsx`**: A real-time sidebar displaying verified sources used in the current generation.
- **`ChatInterface.tsx`**: A sophisticated streaming interface with support for Markdown and LaTeX rendering.
- **`UsageGraph.tsx`**: Interactive charts (Recharts) showing credit and token trends.

---

### ⚙️ Backend: FastAPI RAG Engine
Located in `rag-engine/`, this is a high-performance Python 3.10+ service.

#### 🛠️ Internal Services
- **`academic_scholar_service.py`**: Interacts with Semantic Scholar API for deep academic retrieval.
- **`youtube_service.py`**: Extracts transcripts and metadata from YouTube videos using high-reliability scrapers.
- **`github_service.py`**: Scans repositories, files, and issues to provide technical context.
- **`vision_service.py`**: Processes visual data stored in Supabase for multi-modal intelligence.
- **`credit_service.py`**: Manages the internal economy, tracking user credits and preventing API abuse.
- **`ingestion_service.py`**: The pipeline for vectorizing and storing new documents into PGVector.

#### 🔌 API Endpoints (v1)
- `POST /api/v1/chat/query`: The main entry point for agentic search.
- `POST /api/v1/ingest/upload`: Uploads and vectorizes documents.
- `GET /api/v1/analytics/usage`: Retrieves historical usage data for the console.

---

### 🤖 AI Layer: Agentic Workflow
Regle's "intelligence" comes from a carefully orchestrated set of nodes in `src/agents/nodes.py`.

#### 1. Planning (`planner_node`)
Uses models like **NVIDIA Nemotron** or **GPT-4o** to generate a research plan. It identifies if the query needs "Academic", "Code", "Video", or "General Web" routing.

#### 2. Grading (`grade_and_filter`)
This is a critical innovation. Instead of trusting all retrieved documents, a "Grader" model assesses each piece of text.
- **Internal Docs**: Graded for strict alignment with private knowledge.
- **External Docs**: Filtered using **JIT (Just-In-Time) Filtering** to ensure only the highest quality web snippets are used.

#### 3. Synthesis (`generate`)
The final synthesis uses a **Reranker** to prioritize internal data over public data, ensuring that "private knowledge" always takes precedence in professional contexts.

---

## 🚀 Key Features

- **Multi-Source Hybrid RAG**: Search across private docs, web, ArXiv, and GitHub simultaneously.
- **LaTeX & Markdown Support**: Beautiful rendering of mathematical formulas and structured data.
- **Credit-Based System**: Enterprise-ready usage tracking and limits.
- **JIT Vector Filtering**: Semantic pre-filtering of web results before they reach the LLM to save tokens.
- **Cross-Platform Compatibility**: Optimized for Windows (SelectorEventLoop) and Linux (Proactor/UVLoop).

---

## 📦 Installation & Setup

### 1. Clone & Root Dependencies
```bash
git clone https://github.com/EMP0RI0M/regle.git
cd regle
```

### 2. Backend Setup (`rag-engine`)
```bash
cd rag-engine
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env # Add your keys here
python main.py
```

### 3. Frontend Setup (`frontend`)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

The system requires several keys to function at 100% capacity:

| Variable | Description | Source |
| :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | Access to 100+ LLMs (Llama, GPT, Claude) | [OpenRouter](https://openrouter.ai/) |
| `UPSTASH_REDIS_REST_URL` | Fast caching and rate limiting | [Upstash](https://upstash.com/) |
| `NEXT_PUBLIC_SUPABASE_URL` | Database and Auth endpoint | [Supabase](https://supabase.com/) |
| `SERPER_API_KEY` | High-speed Google Search access | [Serper](https://serper.dev/) |
| `GITHUB_TOKEN` | Accessing private/public repo data | [GitHub Settings](https://github.com/settings/tokens) |

---

## 🗺️ Project Roadmap

- [x] **Phase 1: Foundation**: FastAPI + Next.js integration.
- [x] **Phase 2: Agentic Flow**: Implementation of LangGraph planning.
- [x] **Phase 3: Multi-Source**: Adding ArXiv, YouTube, and GitHub.
- [ ] **Phase 4: Optimization**: Fine-tuned reranker for domain-specific tasks.
- [ ] **Phase 5: Collaborative**: Multi-user shared research sessions.
- [ ] **Phase 6: Deployment**: One-click Docker and Vercel templates.

---

Built with precision by the **Nitroplux Engineering Team**. 
Managed by [EMP0RI0M](https://github.com/EMP0RI0M).
