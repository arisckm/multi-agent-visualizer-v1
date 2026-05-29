# Multi-Agent Workflow Visualizer

[![GitHub](https://img.shields.io/badge/GitHub-arisckm%2Fmulti--agent--visualizer--v1-181717?logo=github)](https://github.com/arisckm/multi-agent-visualizer-v1)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

A visual workspace for designing, simulating, and inspecting **multi-agent AI workflows**. Build agent graphs on a canvas, connect them into pipelines, run simulated execution, and export workflows as JSON.

**Author:** [Arisha Manzoor](https://github.com/arisckm)

---

## Live demo

| Service | URL |
|--------|-----|
| **Frontend (Vercel)** | [multi-agent-visualizer-v1.vercel.app](https://multi-agent-visualizer-v1.vercel.app) |
| **Repository** | [github.com/arisckm/multi-agent-visualizer-v1](https://github.com/arisckm/multi-agent-visualizer-v1) |

> After deploying, replace the Vercel URL above if your project uses a different name.

---

## Screenshots

<!-- Add your images to docs/screenshots/ and uncomment the lines below -->

| Canvas & agent palette | Properties & simulation |
|------------------------|------------------------|
| ![Workflow canvas](docs/screenshots/canvas.png) | ![Run timeline](docs/screenshots/timeline.png) |

*Placeholder: add `docs/screenshots/canvas.png` and `docs/screenshots/timeline.png` from your running app.*

---

## Features

- **Visual DAG editor** — drag-and-drop agents on a React Flow canvas
- **Agent palette** — add Planner, Researcher, Builder, Coder, Reviewer, or Custom agents in one click
- **Properties panel** — edit display name, role, and system prompt per node
- **Live simulation** — watch nodes move through `idle` → `running` → `done`
- **Run timeline** — bar chart of each agent’s start/end times
- **Save / load JSON** — export and import workflow definitions
- **Template API** — load a starter multi-agent flow from the backend
- **Deployment-ready** — Vite env var `VITE_API_URL` for production API

---

## Tech stack

| Layer | Tools |
|-------|--------|
| Frontend | React 19, TypeScript, Vite, React Flow, Zustand |
| Backend | Node.js, Express, Zod |
| Hosting | Vercel (frontend) + Render or similar (API) |

---

## Project structure

```
multi-agent-visualizer-v1/
├── frontend/          # React + Vite UI
│   ├── src/
│   │   ├── components/   # AgentNode, NodePalette, PropertiesPanel, RunTimeline
│   │   └── constants/    # Agent type definitions
│   └── vercel.json
├── backend/           # Express API (validate, simulate, templates)
└── README.md
```

---

## Quick start (local)

### Prerequisites

- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

API runs at `http://localhost:4000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

Optional: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` if your API is not on port 4000.

---

## How to use

1. **Add agents** — click a type in the left **Agent Palette**
2. **Connect** — drag from a node’s right handle to another node’s left handle
3. **Configure** — select a node and edit name / prompt in **Properties**
4. **Simulate** — click **▶ Simulate** to run a timed mock execution
5. **Save** — **Save JSON** downloads your workflow; **Load JSON** restores it

---

## Deploy (all on Vercel — recommended)

1. Import [arisckm/multi-agent-visualizer-v1](https://github.com/arisckm/multi-agent-visualizer-v1) on [Vercel](https://vercel.com/new)
2. Leave **Root Directory** empty (repo root)
3. Set **Framework Preset** to **Services** (Vercel detects `frontend` + `backend` from `vercel.json`)
4. Click **Deploy** — no Render or credit card needed
5. **Do not** set `VITE_API_URL` unless you use a separate API host (production defaults to `/api` on the same domain)

After deploy, test: `https://YOUR-APP.vercel.app/api/health` → `{"ok":true}`

### Alternative: Frontend on Vercel + Backend on Render

1. Vercel: Root Directory = `frontend`, env `VITE_API_URL=https://your-api.onrender.com/api`
2. Render: Root Directory = `backend`, env `FRONTEND_URL=https://your-app.vercel.app`

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/templates/workflow` | Sample workflow |
| `POST` | `/api/workflows/validate` | Validate nodes & edges |
| `POST` | `/api/runs/simulate` | Return timed run events |

---

## Roadmap

- [ ] Real LLM agent adapters (OpenAI, Anthropic, etc.)
- [ ] Conditional / parallel branch types
- [ ] Run history and replay
- [ ] Persist workflows in a database
- [ ] Per-agent logs and token/cost stats

---

## License

MIT — feel free to use and modify for learning and portfolio projects.

---

## Connect

- **GitHub:** [@arisckm](https://github.com/arisckm)
- **LinkedIn:** [arisha-manzoor](https://www.linkedin.com/in/arisha-manzoor-14b494311)
