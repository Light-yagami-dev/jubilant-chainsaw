# Cortex Omni — Missing Components Analysis & Copilot Prompts

**Repository**: https://github.com/Teresma/jubilant-chainsaw
**Analysis Date**: May 15, 2026
**Purpose**: Identify gaps between blueprint requirements and current implementation, with Copilot-ready prompts for each missing component

---

## Executive Summary

The repository has **239+ files** with substantial infrastructure:

| Layer | Status | Details |
|-------|--------|---------|
| Frontend (React) | ✅ Built | App, Components, Store, Hooks, shadcn/ui |
| Backend (Express) | ✅ Built | Routes, Workflows, AI Integration |
| Database (Drizzle) | ✅ Built | 8 Schema Tables |
| API Layer | ✅ Built | OpenAPI Spec, Zod, React Query Hooks |
| AI Tutor Workflow | ✅ Built | Adversarial Solver-Grader Pattern |
| **Domain Content** | ❌ **MISSING** | No B.Sc. Biotech syllabus data |
| **Study Features** | ⚠️ Partial | No topic explanations, study plans, quizzes |
| **Student Tracking** | ⚠️ Partial | No weak area analysis, progress tracking |
| **Auth/Payments** | ⚠️ Partial | Frontend exists, backend routes missing |

---

## Part 1: What's Already IMPLEMENTED

### Frontend Components ✅

```
artifacts/cortex/src/
├── App.tsx                          # Main app with phase routing
├── components/
│   ├── AuthGateway.tsx              # Login screen
│   ├── ParameterMatrix.tsx          # Exam/language/model settings
│   ├── AgentInit.tsx                # Query input interface
│   ├── TutorInterface.tsx           # Response display + practice + diagnostic
│   ├── DashboardPhase.tsx           # Mastery map, revision queue, stats
│   ├── UpgradeModal.tsx             # Tier upgrade modal
│   ├── layout/Sidebar.tsx           # Navigation sidebar
│   └── ui/                          # 30+ shadcn/ui components
├── store/appStore.ts               # Zustand state management
├── hooks/use-toast.ts              # Toast notifications
└── three/                          # Three.js 3D visuals
```

### Backend Routes ✅

```
artifacts/api-server/src/routes/
├── tutor/
│   ├── index.ts                    # Main /tutor/invoke endpoint
│   ├── workflow.ts                 # Adversarial AI tutor workflow
│   ├── practice.ts                 # Practice question generation
│   └── diagnostic.ts              # Trace-back diagnostic evaluation
├── mastery/index.ts               # Mastery tracking (get/update/stats)
├── revision/index.ts              # Spaced repetition queue
├── ingest/index.ts                # PDF upload and parsing
├── tts/index.ts                   # Text-to-speech synthesis
└── gemini/index.ts                # Gemini AI chat
```

### Database Schemas ✅

```
lib/db/src/schema/
├── conversations.ts               # Chat conversation storage
├── messages.ts                    # Message history
├── mastery.ts                     # Topic mastery scores
├── revision.ts                     # Spaced repetition entries
├── semantic-cache.ts              # Query response cache
├── syllabus.ts                     # Syllabus chunks (EMPTY - NO DATA)
├── document-context.ts            # Uploaded PDF context
└── index.ts                       # Schema exports
```

---

## Part 2: What's MISSING — Priority List

### 🔴 CRITICAL (Must Have for Study Assistant)

#### 1. B.Sc. Biotechnology Syllabus Database

**Problem**: The `syllabus_chunks` table exists but has no data. The tutor cannot explain specific Biotech topics.

**Copilot Prompt**:
```
Create a seed script at lib/db/seeds/biotech-syllabus.ts that populates the syllabus_chunks table with B.Sc. Biotechnology Part I (Botany I + Chemistry I subsidiary) exam content.

Exam Type: BSC_BIOTECH_PART1
Date: June 4, 2026

Include these subjects with detailed topic chunks:

## BIOCHEMISTRY (Core Paper)
- Carbohydrates: Classification (mono, di, polysaccharides), Glucose structure (Fischer & Haworth), Glycosidic bond, Sucrose, Starch, Cellulose, Glycogen
- Proteins: Amino acids (20 standard), Peptide bond, Protein structure (1°-4°), Classification (globular/fibrous)
- Enzymes: Mechanism of action, Michaelis-Menten equation, Factors affecting enzyme activity, Coenzymes
- Lipids: Classification, Fatty acids (saturated/unsaturated), Triglycerides, Phospholipids, Steroids
- Nucleic Acids: DNA vs RNA structure, Nucleotides, Base pairing, Central dogma

## CELL BIOLOGY (Core Paper)
- Cell Theory & Types: Prokaryotic vs Eukaryotic, Plant vs Animal cells
- Cell Organelles: Nucleus, Mitochondria, ER (rough/smooth), Golgi, Lysosomes, Chloroplasts, Peroxisomes
- Cell Membrane: Fluid Mosaic Model, Transport mechanisms (diffusion, osmosis, active transport)
- Cell Division: Mitosis (stages, significance), Meiosis (stages, crossing over, significance)
- Chromosomes: Structure, Karyotyping, Chromosomal aberrations

## MICROBIOLOGY (Core Paper)
- History & Scope: Pasteur's experiments, Koch's postulates
- Microbial Diversity: Bacteria, Viruses, Fungi, Algae (brief)
- Bacterial Structure: Cell wall, flagella, capsules, endospores
- Growth & Nutrition: Nutritional types, Growth curve, Factors affecting growth
- Sterilization & Disinfection: Heat methods, Filtration, Chemical methods

## GENETICS (Core Paper)
- Mendelian Genetics: Laws of inheritance, Monohybrid/dihybrid crosses, Punnett square
- Extensions of Mendel: Incomplete dominance, Codominance, Multiple alleles, Pleiotropy
- Linkage & Crossing Over: Morgan's experiments, Recombination frequency
- Population Genetics: Gene pool, Hardy-Weinberg equilibrium, Factors affecting gene frequencies
- Human Genetics: Pedigree analysis, Sex-linked inheritance, Chromosomal disorders

## BOTANY I (Subsidiary Paper)
- Plant Kingdom: Classification, Algae, Bryophytes, Pteridophytes, Gymnosperms, Angiosperms
- Plant Morphology: Root, Stem, Leaf modifications
- Plant Anatomy: Tissue types, Secondary growth, Wood anatomy
- Plant Physiology: Photosynthesis (light/dark reactions), Respiration (glycolysis, Krebs cycle)
- Angiosperm Reproduction: Flower structure, Pollination, Fertilization, Seed formation

## CHEMISTRY I (Subsidiary Paper)
- Atomic Structure: Bohr model, Quantum numbers, Orbital shapes, Electronic configuration
- Chemical Bonding: Ionic, Covalent (valence bond theory), Metallic, Hydrogen bond, van der Waals
- Thermodynamics: First law, Enthalpy, Hess's law, Second law, Entropy, Gibbs free energy
- Chemical Equilibrium: Law of mass action, Kc/Kp, Le Chatelier's principle
- Electrochemistry: Redox reactions, Electrochemical cells, Nernst equation, Electrolysis

Each chunk should include: topic, heading, content (detailed explanation with examples), examType, createdAt.

Also create a script at lib/db/scripts/seed.ts that:
1. Connects to the database using DATABASE_URL
2. Calls the seed function
3. Logs progress and completion status
```

---

#### 2. Topic Explanation Endpoint

**Problem**: No endpoint to explain specific syllabus topics with detailed explanations.

**Copilot Prompt**:
```
Create a new backend route at artifacts/api-server/src/routes/explain/index.ts that provides detailed explanations for B.Sc. Biotechnology topics.

This route should:
1. Accept request body with: { topic: string, subtopic?: string, examType: string, depth: "basic" | "detailed" | "exam-focused" }
2. Query the syllabus_chunks table to find matching content
3. Use Gemini AI to enhance the explanation with:
   - Detailed breakdown of the topic
   - Key definitions and concepts
   - Examples and applications
   - Exam tips and common pitfalls
   - Related topics for revision
4. Return formatted response with markdown support

The endpoint should also:
- Cache explanations in semantic-cache table for reuse
- Support multiple pedagogy styles (english, hinglish, mnemonic)
- Include mnemonics for memorization where applicable
- Flag weak topics for mastery tracking

Add to OpenAPI spec in lib/api-spec/openapi.yaml:
```yaml
/explain/topic:
  post:
    operationId: explainTopic
    tags: [explain]
    summary: Get detailed explanation for a specific topic
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ExplainTopicBody"
    responses:
      "200":
        description: Topic explanation
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExplainTopicResponse"
```

Also create the Zod schemas in lib/api-zod/src/generated/api/api.ts and React Query hooks in lib/api-client-react/src/generated/api.ts.
```

---

#### 3. Study Plan Generation Endpoint

**Problem**: No way to generate personalized study plans based on exam date and weak areas.

**Copilot Prompt**:
```
Create a new backend route at artifacts/api-server/src/routes/study-plan/index.ts for generating personalized study plans.

The route should:
1. Accept request body:
```typescript
{
  examDate: string;          // ISO date string
  examType: string;          // "BSC_BIOTECH_PART1"
  subjects: string[];        // ["Biochemistry", "Cell Biology", ...]
  dailyStudyHours: number;   // e.g., 6
  weakAreas?: string[];      // Topics student struggles with
  strongAreas?: string[];    // Topics student masters
}
```

2. Calculate:
   - Days remaining until exam
   - Total topics across all subjects
   - Daily topic targets
   - Priority queue based on weak areas

3. Generate a study plan with:
   - Weekly breakdown (Week 1, Week 2, etc.)
   - Daily study targets
   - Subject rotation strategy
   - Revision slots
   - Practice question sessions
   - Rest and buffer days

4. Use spaced repetition principles:
   - High-priority topics: Review every 3 days
   - Medium-priority: Review every 7 days
   - Low-priority: Review every 14 days

5. Return structured response:
```typescript
{
  planId: string;
  examDate: string;
  daysRemaining: number;
  totalTopics: number;
  dailyTarget: number;
  weeks: WeekPlan[];
  summary: string;
}

interface WeekPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  focus: string;
  topics: DailyTopic[];
  revisionDays: string[];
}

interface DailyTopic {
  date: string;
  subject: string;
  topics: TopicDetail[];
  practiceTarget: number;
  revisionTopics: string[];
}
```

Add to OpenAPI spec and create corresponding frontend component in artifacts/cortex/src/components/StudyPlan.tsx that displays the plan in a calendar-like view with progress tracking.
```

---

#### 4. Quiz System

**Problem**: Practice questions are generated but there's no formal quiz/assessment system.

**Copilot Prompt**:
```
Create a complete quiz system in artifacts/api-server/src/routes/quiz/index.ts

Features:
1. Quiz Generation:
   - Generate quizzes from syllabus topics
   - Multiple question types: MCQ, True/False, Fill-in-blank, Short answer
   - Difficulty levels: Easy, Medium, Hard
   - Number of questions configurable
   - Subject-specific or mixed quizzes

2. Quiz Session Management:
   - Create quiz session with timer
   - Store student answers
   - Calculate scores in real-time
   - Support pause/resume

3. Database Schema (lib/db/src/schema/quiz.ts):
```typescript
export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  examType: text("exam_type").notNull(),
  difficulty: text("difficulty").notNull(),
  questionCount: integer("question_count").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizSessionsTable = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(quizzesTable.id),
  score: integer("score"),
  maxScore: integer("max_score"),
  completed: boolean("completed").default(false),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(quizzesTable.id),
  question: text("question").notNull(),
  options: json("options").$type<string[]>(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  topic: text("topic"),
});
```

4. API Endpoints:
   - POST /quiz/generate - Generate new quiz
   - GET /quiz/:id - Get quiz with questions
   - POST /quiz/:id/start - Start quiz session
   - POST /quiz/session/:id/answer - Submit answer
   - POST /quiz/session/:id/complete - Complete and score

5. Create frontend components:
   - QuizList.tsx - Browse available quizzes
   - QuizPlayer.tsx - Take quiz with timer
   - QuizResults.tsx - View scores and explanations
   - QuizHistory.tsx - Past quiz attempts

Add to OpenAPI spec with proper schemas.
```

---

#### 5. Progress Tracking Dashboard

**Problem**: Dashboard shows mastery data but doesn't show overall study progress.

**Copilot Prompt**:
```
Enhance the DashboardPhase component at artifacts/cortex/src/components/DashboardPhase.tsx to include a comprehensive study progress panel.

Add new features:

1. Exam Countdown Timer:
   - Days remaining until June 4, 2026
   - Visual countdown with progress ring
   - Daily study reminder

2. Study Streak Tracker:
   - Track consecutive days of study
   - Visual streak calendar
   - Weekly/monthly streak goals

3. Topic Coverage Map:
   - Visual grid showing covered vs uncovered topics
   - Color-coded by mastery level
   - Filter by subject

4. Study Statistics:
   - Total study time (estimated from quiz sessions)
   - Topics mastered this week
   - Weak areas identified
   - Performance trend chart

5. Upcoming Deadlines:
   - Revision queue due items
   - Quiz deadlines
   - Study plan milestones

Create new components:
- StudyProgress.tsx - Main progress panel
- ExamCountdown.tsx - Countdown timer
- StreakTracker.tsx - Study streak display
- TopicCoverage.tsx - Coverage map grid

Add backend endpoint at artifacts/api-server/src/routes/progress/index.ts:
- GET /progress/summary - Overall progress stats
- GET /progress/streaks - Study streak data
- POST /progress/log - Log study activity
```

---

### 🟡 IMPORTANT (Should Have)

#### 6. Weak Area Detection & Analysis

**Copilot Prompt**:
```
Create a weak area detection system that analyzes student performance to identify knowledge gaps.

Backend route at artifacts/api-server/src/routes/weakness/index.ts:

1. Analyze data sources:
   - Quiz scores by topic
   - Diagnostic evaluation results
   - Tutor interaction feedback
   - Revision queue failure patterns

2. Generate weakness report:
```typescript
{
  overallWeakness: number;  // 0-100
  weakTopics: WeakTopic[];
  recommendations: string[];
  priorityOrder: string[];
}

interface WeakTopic {
  topic: string;
  subject: string;
  weaknessScore: number;
  attempts: number;
  averageScore: number;
  lastAttempted: string;
  suggestedAction: string;
}
```

3. Auto-generate revision items for weak topics
4. Provide study recommendations based on patterns

Frontend component: WeaknessAnalysis.tsx displaying radar chart of subject strengths/weaknesses.
```

---

#### 7. Exam-Specific Topic Prioritization

**Copilot Prompt**:
```
Create a topic prioritization engine for B.Sc. Biotechnology exam preparation.

Backend route at artifacts/api-server/src/routes/priority/index.ts:

1. Weight topics by:
   - Past exam frequency (weight: 30%)
   - Difficulty level (weight: 25%)
   - Student mastery (weight: 25%)
   - Time sensitivity (weight: 20%)

2. Return prioritized list:
```typescript
{
  prioritizedTopics: PriorityTopic[];
  studyAdvice: string;
  examTips: string[];
}

interface PriorityTopic {
  topic: string;
  subject: string;
  priority: number;
  priorityScore: number;
  reason: string;
  estimatedStudyTime: number;  // minutes
  examFrequency: number;      // times appeared in past exams
  difficulty: "easy" | "medium" | "hard";
  mustKnow: boolean;
}
```

Frontend: PriorityMatrix.tsx showing topics sorted by priority with visual indicators.
```

---

#### 8. Notification System

**Copilot Prompt**:
```
Create a notification system for revision reminders and study alerts.

Database schema (lib/db/src/schema/notifications.ts):
```typescript
export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),  // revision_due, quiz_reminder, study_goal
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

Backend routes:
- GET /notifications - List notifications
- POST /notifications/mark-read - Mark as read
- POST /notifications/create - Create notification
- GET /notifications/due - Get due revision notifications

Frontend component: NotificationBell.tsx with dropdown showing notifications.
```

---

### 🟢 NICE TO HAVE

#### 9. Study Timer / Pomodoro

**Copilot Prompt**:
```
Create a study timer system with Pomodoro technique support.

Frontend component: StudyTimer.tsx with:
- Pomodoro timer (25 min work, 5 min break)
- Customizable study/break durations
- Session tracking
- Break reminders
- Study streak integration

Backend endpoint to log study sessions.
```

---

#### 10. Flashcard System

**Copilot Prompt**:
```
Create a flashcard system for quick revision.

Database schema for flashcards with:
- Front (question)
- Back (answer)
- Topic tag
- Difficulty
- Review count
- Last reviewed

Frontend: FlashcardViewer.tsx with flip animation, spaced repetition for reviews.
```

---

## Part 3: Quick Start Copilot Prompts

### Priority 1: Seed Syllabus Data
```
@workspace/jubilant-chainsaw Create a seed script that populates the B.Sc. Biotechnology Part I syllabus. Exam is on June 4, 2026. Subjects: Biochemistry, Cell Biology, Microbiology, Genetics (core papers), Botany I, Chemistry I (subsidiary papers). Populate detailed topic chunks with explanations in lib/db/seeds/biotech-syllabus.ts
```

### Priority 2: Topic Explanation
```
@workspace/jubilant-chainsaw Create a topic explanation endpoint that retrieves syllabus chunks and enhances them with AI explanations. Use Gemini. Include mnemonics. Endpoint at artifacts/api-server/src/routes/explain/index.ts with /explain/topic POST route.
```

### Priority 3: Study Plan Generator
```
@workspace/jubilant-chainsaw Create study plan generation for B.Sc. Biotechnology exam on June 4, 2026. Calculate days remaining, generate weekly breakdown with daily topics, include revision slots. Endpoint at artifacts/api-server/src/routes/study-plan/index.ts
```

### Priority 4: Quiz System
```
@workspace/jubilant-chainsaw Create complete quiz system with MCQ generation, session management, scoring. Database schema at lib/db/src/schema/quiz.ts. Endpoints for generate/start/submit/complete. Frontend QuizPlayer component.
```

### Priority 5: Progress Dashboard
```
@workspace/jubilant-chainsaw Enhance dashboard with exam countdown (June 4, 2026), study streak tracker, topic coverage map. New components in artifacts/cortex/src/components/
```

---

## Part 4: File Structure After Implementation

```
artifacts/api-server/src/routes/
├── tutor/                         ✅ Exists
├── mastery/                       ✅ Exists
├── revision/                      ✅ Exists
├── explain/                       🆕 New - Topic explanations
├── study-plan/                   🆕 New - Study plan generation
├── quiz/                          🆕 New - Quiz system
├── progress/                      🆕 New - Progress tracking
├── weakness/                      🆕 New - Weakness analysis
├── priority/                      🆕 New - Topic prioritization
├── notifications/                 🆕 New - Notifications
└── flashcards/                   🆕 New - Flashcards

lib/db/
├── src/schema/
│   ├── syllabus.ts               ✅ Exists (empty)
│   ├── quiz.ts                   🆕 New
│   ├── notifications.ts         🆕 New
│   └── flashcards.ts            🆕 New
└── seeds/
    └── biotech-syllabus.ts      🆕 New

artifacts/cortex/src/components/
├── TutorInterface.tsx           ✅ Exists
├── DashboardPhase.tsx           ✅ Exists
├── StudyPlan.tsx                 🆕 New
├── QuizList.tsx                  🆕 New
├── QuizPlayer.tsx                🆕 New
├── WeaknessAnalysis.tsx          🆕 New
├── StudyTimer.tsx                 🆕 New
└── FlashcardViewer.tsx            🆕 New
```

---

## Summary

| Priority | Component | Files to Create | Effort |
|----------|-----------|-----------------|--------|
| 🔴 Critical | Syllabus Data | 1 seed script | Low |
| 🔴 Critical | Topic Explanation | 1 route + API spec | Medium |
| 🔴 Critical | Study Plan | 1 route + frontend | Medium |
| 🔴 Critical | Quiz System | 3 routes + schema + UI | High |
| 🔴 Critical | Progress Dashboard | 1 route + 3 components | Medium |
| 🟡 Important | Weakness Analysis | 1 route + component | Medium |
| 🟡 Important | Topic Prioritization | 1 route + component | Low |
| 🟡 Important | Notifications | 1 route + component | Low |
| 🟢 Nice | Study Timer | 1 component | Low |
| 🟢 Nice | Flashcards | schema + component | Medium |

**Total**: ~15 new files across backend, frontend, and database layers.

---

*Document generated by MiniMax Agent on May 15, 2026*