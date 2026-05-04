# Cortex Omni — Setup Guide

## What's in this zip

All source code for the full-stack Cortex AI Tutor platform:
- `artifacts/cortex/` — React + Vite frontend
- `artifacts/api-server/` — Express + TypeScript API backend
- `lib/api-spec/` — OpenAPI contract (source of truth)
- `lib/api-zod/` — Auto-generated Zod validators
- `lib/api-client-react/` — Auto-generated React Query hooks
- `lib/db/` — PostgreSQL schema (Drizzle ORM)
- `lib/integrations-gemini-ai/` — Gemini AI client

---

## Requirements

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9+ | `npm install -g pnpm` |
| PostgreSQL | 14+ | https://www.postgresql.org |

---

## Step-by-step Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set environment variables
Create a `.env` file in the project root (or set them in your shell):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cortex
SESSION_SECRET=your-random-secret-here
AI_INTEGRATIONS_GEMINI_BASE_URL=https://generativelanguage.googleapis.com
AI_INTEGRATIONS_GEMINI_API_KEY=your-gemini-api-key-here
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

### 3. Push the database schema
```bash
pnpm --filter @workspace/db run push
```

### 4. Regenerate API code (optional — already generated in zip)
```bash
pnpm --filter @workspace/api-spec run codegen
```

### 5. Run the project

**API server** (terminal 1):
```bash
pnpm --filter @workspace/api-server run dev
```
Runs on: http://localhost:8080

**Frontend** (terminal 2):
```bash
pnpm --filter @workspace/cortex run dev
```
Runs on: http://localhost:5173

---

## On Replit (easiest)

1. Create a new Replit with "Import from ZIP"
2. Install the **Gemini AI** integration (Replit handles API keys automatically)
3. Add `SESSION_SECRET` in Replit Secrets
4. The `DATABASE_URL` is auto-provisioned by Replit PostgreSQL
5. Click Run — both workflows start automatically

---

## Developer Login

On the auth screen, click **"dev access"** at the bottom and enter:
```
cortex-dev-2025
```
This gives full developer tier with all 12 entitlements unlocked.

---

## Tech Stack

- **Frontend**: React 18 + Vite + Zustand + Framer Motion + Three.js + Tailwind CSS
- **Backend**: Express 5 + TypeScript + Drizzle ORM + PostgreSQL
- **AI**: Google Gemini (2.5 Flash default)
- **API Layer**: OpenAPI spec → Orval → React Query hooks + Zod validators

---

## Key Features

- 5-phase adaptive flow: Auth → Parameters → Query → Tutor Response → Dashboard
- Adversarial solver-grader AI workflow (LangGraph-style)
- Practice question generation & diagnostic engine
- Mastery tracking with spaced repetition revision queue
- 16 exam types: NEET, JEE, UPSC, CAT, GATE, SSC, GRE, GMAT, IELTS, BCECE, B.Sc. streams
- TTS (Text-to-Speech) in English and Hindi
- Free / Pro / Pro Plus tier system with entitlement gating
- Dark void glassmorphism UI with optional Three.js 3D visuals
