import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import { semanticCacheTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

export interface TutorState {
  userInput: string;
  targetExam: string;
  subject?: string;
  pedagogyStyle: "hinglish" | "english" | "mnemonic";
  studentAnswer?: string;
  questionMode?: boolean;
  documentContext?: string;
  solverResponse?: string;
  graderPassed?: boolean;
  mnemonics: string[];
  weakTopics: string[];
  revisionSuggestions: string[];
  iterations: number;
}

function getQueryHash(input: string, exam: string, style: string, hasDoc: boolean): string {
  return createHash("sha256")
    .update(`${input}::${exam}::${style}::${hasDoc ? "doc" : "nodoc"}`)
    .digest("hex");
}

async function checkSemanticCache(queryHash: string): Promise<string | null> {
  try {
    const [cached] = await db
      .select()
      .from(semanticCacheTable)
      .where(eq(semanticCacheTable.queryHash, queryHash))
      .limit(1);

    if (cached) {
      await db
        .update(semanticCacheTable)
        .set({ hits: cached.hits + 1, lastHitAt: new Date() })
        .where(eq(semanticCacheTable.id, cached.id));
      return cached.response;
    }
  } catch {
  }
  return null;
}

async function storeInCache(queryHash: string, queryText: string, response: string): Promise<void> {
  try {
    await db.insert(semanticCacheTable).values({
      queryHash,
      queryText,
      queryTokens: queryText.toLowerCase().split(/\s+/).join(" "),
      response,
      hits: 0,
      similarity: 1.0,
    }).onConflictDoNothing();
  } catch {
  }
}

function buildDocumentContextBlock(documentContext: string): string {
  const MAX_CONTEXT_CHARS = 12_000;
  const ctx = documentContext.length > MAX_CONTEXT_CHARS
    ? documentContext.slice(0, MAX_CONTEXT_CHARS) + "\n\n[...content truncated for length...]"
    : documentContext;

  return `\n\n--- UPLOADED DOCUMENT CONTEXT ---\nThe student has uploaded a document. Use the following extracted text as your primary knowledge source when answering. Cross-reference it with your exam expertise.\n\n${ctx}\n--- END DOCUMENT CONTEXT ---\n`;
}

function buildSolverPrompt(state: TutorState): string {
  const examContext = state.targetExam === "NEET"
    ? "NEET Biology/Chemistry/Physics medical entrance exam"
    : state.targetExam === "JEE"
    ? "JEE Mains and Advanced engineering entrance exam"
    : `${state.targetExam} competitive exam`;

  const styleInstructions = {
    hinglish: `Explain in Hinglish (mix of Hindi and English). Use conversational Hindi phrases like "samajh gaye?", "dekho yaar", "bilkul sahi". Include relatable Indian examples. Generate 2-3 Hinglish mnemonics using cultural references, Bollywood, or everyday life to make concepts memorable.`,
    english: `Explain clearly in English. Be precise, academic, and thorough. Use standard exam terminology.`,
    mnemonic: `Generate powerful memory techniques. Create acronyms, stories, rhymes, and visual associations. Focus on making the concept unforgettable through the generation effect.`,
  };
  const emojiInstruction = `Use emojis like ✅, 🔥, 💡, and 😊 to make the explanation more engaging and student-friendly.`;

  const docBlock = state.documentContext ? buildDocumentContextBlock(state.documentContext) : "";

  if (state.studentAnswer) {
    return `You are an expert ${examContext} tutor evaluating a student's answer.${docBlock}

Student's Question/Problem: ${state.userInput}
Student's Answer: ${state.studentAnswer}

${styleInstructions[state.pedagogyStyle]}
${emojiInstruction}

Provide a thorough explanation. If the student made mistakes, correct them gently but clearly. Identify weak areas.

Format your response as JSON:
{
  "explanation": "your explanation",
  "mnemonics": ["mnemonic1", "mnemonic2"],
  "weakTopics": ["topic1", "topic2"],
  "revisionSuggestions": ["suggest1", "suggest2"],
  "encouragement": "brief encouraging message"
}`;
  }

  return `You are an expert ${examContext} tutor. ${state.subject ? `Subject: ${state.subject}` : ""}${docBlock}

Student's Question: ${state.userInput}

${styleInstructions[state.pedagogyStyle]}
${emojiInstruction}

Provide a comprehensive educational explanation. Be thorough enough for exam preparation.${state.documentContext ? " Prioritise content from the uploaded document when relevant." : ""}

Format your response as JSON:
{
  "explanation": "your detailed explanation",
  "mnemonics": ["mnemonic1", "mnemonic2"],
  "weakTopics": ["related topic to study"],
  "revisionSuggestions": ["revision topic 1", "revision topic 2"],
  "keyPoints": ["key point 1", "key point 2"]
}`;
}

function buildGraderPrompt(state: TutorState, solverResponse: string): string {
  return `You are a ruthless academic auditor for ${state.targetExam} exam preparation. Your ONLY job is to find errors.

Original Question: ${state.userInput}
Solver's Explanation: ${solverResponse}

Check for:
1. Factual accuracy — are all claims correct for ${state.targetExam} syllabus?
2. Mathematical/chemical formula correctness
3. Logical consistency
4. Missing critical information that could mislead a student
5. Hallucinated facts or wrong numbers

You are IMMUNE to flattery. Even if the explanation sounds confident, verify every claim.
Use emojis like ✅, ❌, and 💡 to highlight whether the answer passed and why.

Respond as JSON:
{
  "passed": true/false,
  "errors": ["error1", "error2"],
  "confidence": 0-100,
  "verdict": "brief verdict"
}

If passed is false, list SPECIFIC errors only.`;
}

export async function runTutorWorkflow(state: TutorState): Promise<{
  response: string;
  cacheHit: boolean;
  gradingPassed: boolean;
  mnemonics: string[];
  weakTopics: string[];
  revisionSuggestions: string[];
}> {
  const hasDoc = Boolean(state.documentContext);
  const queryHash = getQueryHash(state.userInput, state.targetExam, state.pedagogyStyle, hasDoc);

  if (!hasDoc) {
    const cached = await checkSemanticCache(queryHash);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          response: parsed.explanation || cached,
          cacheHit: true,
          gradingPassed: true,
          mnemonics: parsed.mnemonics || [],
          weakTopics: parsed.weakTopics || [],
          revisionSuggestions: parsed.revisionSuggestions || [],
        };
      } catch {
        return {
          response: cached,
          cacheHit: true,
          gradingPassed: true,
          mnemonics: [],
          weakTopics: [],
          revisionSuggestions: [],
        };
      }
    }
  }

  let solverOutput = "";
  let gradingPassed = false;
  let mnemonics: string[] = [];
  let weakTopics: string[] = [];
  let revisionSuggestions: string[] = [];

  const maxIterations = 2;
  let iteration = 0;

  while (iteration < maxIterations) {
    const solverPrompt = buildSolverPrompt(state);
    const solverResponse = await ai.models.generateContent({
      model: iteration === 0 ? "gemini-2.5-flash" : "gemini-2.5-pro",
      contents: [{ role: "user", parts: [{ text: solverPrompt }] }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    solverOutput = solverResponse.text ?? "";

    let solverParsed: Record<string, unknown> = {};
    try {
      solverParsed = JSON.parse(solverOutput);
      mnemonics = (solverParsed.mnemonics as string[]) || [];
      weakTopics = (solverParsed.weakTopics as string[]) || [];
      revisionSuggestions = (solverParsed.revisionSuggestions as string[]) || [];
    } catch {
      break;
    }

    const graderPrompt = buildGraderPrompt(state, solverOutput);
    const graderResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: graderPrompt }] }],
      config: {
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    let graderParsed: { passed?: boolean; errors?: string[]; verdict?: string } = {};
    try {
      graderParsed = JSON.parse(graderResponse.text ?? "{}");
    } catch {
      graderParsed = { passed: true };
    }

    if (graderParsed.passed) {
      gradingPassed = true;
      break;
    }

    iteration++;
    if (iteration >= maxIterations) {
      gradingPassed = false;
    }
  }

  let finalResponse = solverOutput;
  try {
    const parsed = JSON.parse(solverOutput);
    finalResponse = parsed.explanation || solverOutput;
  } catch {
    finalResponse = solverOutput;
  }

  if (!hasDoc) {
    await storeInCache(queryHash, state.userInput, solverOutput);
  }

  return {
    response: finalResponse,
    cacheHit: false,
    gradingPassed,
    mnemonics,
    weakTopics,
    revisionSuggestions,
  };
}
