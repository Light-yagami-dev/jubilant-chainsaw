# Cortex AI Tutor — Workspace

## Overview

Full-stack AI tutoring platform for Indian competitive exams (NEET/JEE). Built as a pnpm workspace monorepo with TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (bundles `@google/genai` directly; `@google-cloud/*` externalized)
- **AI**: Gemini via Replit AI Integrations proxy (`@workspace/integrations-gemini-ai`)
- **Frontend**: React + Vite + shadcn/ui + Tailwind CSS + wouter routing

## Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| `artifacts/api-server` | `/api` | Express API server with all backend routes |
| `artifacts/cortex` | `/` | React frontend — Cortex AI Tutor |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/Zod from OpenAPI
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## DB Schema (lib/db/src/schema/)

| Table | File | Purpose |
|-------|------|---------|
| `conversations` | conversations.ts | Gemini chat conversations |
| `messages` | messages.ts | Individual messages per conversation |
| `mastery_map` | mastery.ts | Topic-level mastery scores per student |
| `revision_queue` | revision.ts | Spaced repetition schedule |
| `syllabus_chunks` | syllabus.ts | Ingested PDF topic chunks |
| `semantic_cache` | semantic-cache.ts | Hash-based query response cache |

## API Routes (artifacts/api-server/src/routes/)

| Route | File | Description |
|-------|------|-------------|
| `GET /api/healthz` | health.ts | Health check |
| `GET/POST /api/gemini/conversations` | gemini/ | Manage conversations |
| `POST /api/gemini/conversations/:id/messages` | gemini/ | Send/receive AI messages |
| `POST /api/gemini/image` | gemini/ | Generate image from prompt |
| `POST /api/tutor/invoke` | tutor/ | Adversarial solver→grader workflow |
| `POST /api/ingest/pdf` | ingest/ | Multer PDF upload + text extraction |
| `POST /api/tts/synthesize` | tts/ | Returns voice config for Web Speech API |
| `GET/POST /api/mastery` | mastery/ | Mastery map CRUD |
| `GET /api/mastery/stats` | mastery/ | Aggregated mastery statistics |
| `GET/POST /api/revision` | revision/ | Revision queue CRUD |
| `POST /api/revision/:id/complete` | revision/ | Mark revision complete + reschedule |

## Frontend Pages (artifacts/cortex/src/pages/)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Stats overview + due revisions + weak topics |
| AI Tutor | `/tutor` | Chat interface with TTS, exam/subject/style selector |
| Mastery Map | `/mastery` | Topic grid color-coded by score |
| Revision Queue | `/revision` | Spaced repetition due/upcoming tabs |
| Upload PDF | `/upload` | PDF ingestion with exam type selector |

## Tutor Workflow (adversarial LangGraph-style)

`artifacts/api-server/src/routes/tutor/workflow.ts`:
1. Hash query → check semantic cache
2. Solver (Gemini): generates a detailed explanation
3. Grader (Gemini): verifies factual accuracy
4. If grader fails, solver retries (up to 3 iterations)
5. Cache response + return with mnemonics + revision suggestions

## Important Notes

- `@google/genai` is bundled by esbuild (NOT in the external list). Do not add it back to `artifacts/api-server/build.mjs` externals.
- TTS uses browser Web Speech API — backend `/api/tts/synthesize` only returns voice config (lang, rate, pitch).
- Gemini env vars: `AI_INTEGRATIONS_GEMINI_BASE_URL` and `AI_INTEGRATIONS_GEMINI_API_KEY` are provisioned automatically via Replit AI Integrations.
