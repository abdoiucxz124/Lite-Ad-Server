
# AGENTS.md – Instructions for GPT‑powered coding agents (ChatGPT Plus / Codex / GPT‑Pilot)

This document describes **exactly** how an AI coding agent should operate on the
`lite‑ad‑server` repository to build, run, test, and deploy a **production‑ready**
lightweight Ad Server that integrates with **Google Ad Manager**.

---

## 1. Project Goals

| Goal | Description |
|------|-------------|
| **G‑01** | Serve Google Ad Manager tags for any given slot path via an API (`/api/ad?slot=…`). |
| **G‑02** | Track ad **impressions** and **clicks** in a local SQLite DB. |
| **G‑03** | Provide a minimal analytics dashboard (`/admin`). |
| **G‑04** | Be *container‑ready* (Dockerfile & `docker‑compose.yml`). |
| **G‑05** | Remain under **50 MB compressed image size**. |

---

## 2. Environment Setup Tasks

1. **Node LTS 20**  
   ```bash
   nvm install 20 && nvm use 20
   ```
2. **Install dependencies**  
   ```bash
   npm ci
   ```
3. **Local run (development)**  
   ```bash
   npm run dev
   ```
4. **Production build (Docker)**  
   ```bash
   docker compose up --build
   ```

---

## 3. Directory Structure

```
.
├── AGENTS.md          ← this file
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
├── README.md
├── src
│   ├── server.js
│   ├── config.js
│   ├── routes
│   │   ├── ad.js
│   │   ├── track.js
│   │   └── admin.js
│   └── public
│       ├── ad-loader.js
│       └── admin.html
└── data               ← SQLite DB (auto‑created)
```

---

## 4. Mandatory Agent Checks

| Check ID | Description | Command |
|----------|-------------|---------|
| **C‑01** | **Lint** JavaScript source (no warnings) | `npx eslint src --max-warnings=0` |
| **C‑02** | **Unit tests** must pass | `npm test` *(placeholder for future suite)* |
| **C‑03** | **Container size** under 50 MB | `docker images --format '{{.Size}}' lite-ad-server:latest` |

*If any check fails, the agent must stop and fix issues before continuing.*

---

## 5. Deployment Targets

| Target | Notes |
|--------|-------|
| **Render.com** | 1‑click deploy supported (provide `render.yaml` if requested). |
| **Fly.io** | For global edge deployment. |
| **Self‑host** | Works on any ARM/x86 server with Docker. |

---

## 6. Future Extensions (Backlog)

| ID | Idea | Priority |
|----|------|----------|
| **B‑01** | Add JWT‑based auth for `/admin` | Medium |
| **B‑02** | Support custom creative templates (HTML/VIDEO) | Medium |
| **B‑03** | REST + WebSocket real‑time analytics | Low |

---

## 7. Agent Workflow Summary

```
➊ Read AGENTS.md → confirm goals & checks
➋ Run env setup tasks
➌ Execute mandatory checks
➍ Write / modify code
➎ Re‑run checks
➏ Commit & push when all green
```

Agents **must never** introduce placeholders; all new features must be implementation‑complete.

---

## 8. Reference

* Codex overview: <https://platform.openai.com/docs/codex/overview>
* Google Ad Manager GPT: <https://developers.google.com/publisher‑tag>

---
