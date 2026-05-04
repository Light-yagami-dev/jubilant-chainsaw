# Cortex AI Tutor — Workspace

## Overview

Full-stack AI tutoring platform for Indian competitive exams (NEET/JEE). Built as a pnpm workspace monorepo with TypeScript. Features a multi-phase flow with dark void/space glassmorphism UI.

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
- **Frontend**: React + Vite + shadcn/ui + Tailwind CSS + Zustand + Framer Motion + Three.js

## Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| `artifacts/api-server` | `/api` | Express API server with all backend routes |
| `artifacts/cortex` | `/` | React frontend — Cortex AI Tutor |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/Zod from OpenAPI
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Frontend Architecture (artifacts/cortex/src/)

### Phase-Based Flow (Zustand `useAppStore`)
No wouter routes — all navigation is phase-based via `store/appStore.ts`:
```
auth → params → agent → tutor → dashboard
```

| Phase | Component | Description |
|-------|-----------|-------------|
| `auth` | `AuthGateway.tsx` | Role selection (Student/Educator/Parent), tier/plan picker, dev bypass |
| `params` | `ParameterMatrix.tsx` | Exam, pedagogy style, language, model selectors with tier gating |
| `agent` | `AgentInit.tsx` | Query input + PDF upload; shows PulsingSphere while loading |
| `tutor` | `TutorInterface.tsx` | Response display, practice questions, diagnostic engine, revision queue |
| `dashboard` | `DashboardPhase.tsx` | Mastery map, revision queue, session history |

### Zustand Store (`store/appStore.ts`)
Tiers: `free | pro | pro_plus | developer`
Roles: `student | educator | parent`
Dev bypass key: `cortex-dev-2025`

### Three.js Components (`three/`)
- `PulsingSphere.tsx` — animated distort sphere shown during AI loading
- `IsoNodeCluster.tsx` — interactive 3D role selector nodes
- `ErrorBoundary.tsx` — WebGL error boundary with CSS fallback
- Both components include `supportsWebGL()` check to skip canvas if WebGL unavailable

### CSS Theme (`index.css`)
Dark void/space glassmorphism via CSS variables:
- `--void`: deep background
- `--surface`, `--text`, `--muted-c`, `--accent-c`, `--glow-c`, `--border-c`
- Classes: `.glass`, `.glass-hover`, `.btn-primary`, `.btn-ghost`, `.tag`, `.shadow-glow`, `.backdrop-blur-glass`

### UpgradeModal (`components/UpgradeModal.tsx`)
Demo upgrade modal — activates Pro/Pro Plus for session via `setTierAndEntitlements`.

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
| `POST /api/tutor/practice` | tutor/ | Generate practice questions from context |
| `POST /api/tutor/diagnostic` | tutor/ | Evaluate student answer vs reference |
| `POST /api/ingest/pdf` | ingest/ | Multer PDF upload + text extraction |
| `POST /api/tts/synthesize` | tts/ | Returns voice config for Web Speech API |
| `GET/POST /api/mastery` | mastery/ | Mastery map CRUD |
| `GET /api/mastery/stats` | mastery/ | Aggregated mastery statistics |
| `GET/POST /api/revision` | revision/ | Revision queue CRUD |
| `POST /api/revision/:id/complete` | revision/ | Mark revision complete + reschedule |

## Tutor Workflow (adversarial LangGraph-style)

`artifacts/api-server/src/routes/tutor/workflow.ts`:
1. Hash query → check semantic cache
2. Solver (Gemini): generates a detailed explanation
3. Grader (Gemini): verifies factual accuracy
4. If grader fails, solver retries (up to 3 iterations)
5. Cache response + return with mnemonics + revision suggestions

## Orval Codegen Notes

- `lib/api-spec/orval.config.ts` — zod output uses `mode: "single"` targeting `generated/api` only (no separate schemas directory to avoid duplicate export conflicts)
- After codegen, `lib/api-zod/src/index.ts` must only export from `"./generated/api"` — orval may regenerate stale exports, fix manually if needed
- `UploadPdfBody.file` uses `zod.any()` (instead of `zod.instanceof(File)`) for Node.js compatibility

## Important Notes

- `@google/genai` is bundled by esbuild (NOT in the external list). Do not add it back to `artifacts/api-server/build.mjs` externals.
- TTS uses browser Web Speech API — backend `/api/tts/synthesize` only returns voice config (lang, rate, pitch).
- Gemini env vars: `AI_INTEGRATIONS_GEMINI_BASE_URL` and `AI_INTEGRATIONS_GEMINI_API_KEY` are provisioned automatically via Replit AI Integrations.
- Three.js components use `supportsWebGL()` guard and fall back to CSS/Framer Motion equivalents — no WebGL errors in sandboxed environments.
