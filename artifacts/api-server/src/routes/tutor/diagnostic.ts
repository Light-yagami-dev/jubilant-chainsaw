import { ai } from "@workspace/integrations-gemini-ai";

const LANG_NOTE: Record<string, string> = {
  Hindi: "Respond entirely in Hindi (Devanagari script).",
  Hinglish: "Respond in Hinglish — a natural mix of Hindi and English in Roman script.",
  English: "Respond in English.",
};

function extractScore(text: string): number {
  const m = text.match(/\bscore[:\s]+(\d+(?:\.\d+)?)\s*\/\s*10/i)
    ?? text.match(/(\d+(?:\.\d+)?)\s*\/\s*10/)
    ?? text.match(/\*\*Score\*\*[:\s]+(\d+(?:\.\d+)?)/i);
  if (m) return parseFloat(m[1]);
  return -1;
}

export async function traceBackEvaluation(
  studentAnswer: string,
  reference: string,
  exam: string,
  language = "English",
  model = "gemini-2.5-flash",
): Promise<{ evaluation: string; score: number }> {
  const langNote = LANG_NOTE[language] ?? LANG_NOTE.English;

  const prompt = `You are a diagnostic AI tutor for ${exam}.
${langNote}

**Reference Explanation:**
${reference}

**Student's Answer / Reasoning:**
${studentAnswer}

Perform a trace-back evaluation:
1. **Conceptual Accuracy** — Identify correct vs incorrect reasoning steps.
2. **Error Taxonomy** — Classify each mistake (conceptual gap, calculation error, incomplete reasoning, etc.).
3. **Root Cause** — Pinpoint the underlying knowledge gap.
4. **Corrective Guidance** — Provide targeted corrections with examples.
5. **Score** — Give a score out of 10 with justification.

Use markdown formatting. Always end with a line like: **Score: X/10**`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 4096 },
  });

  const text = response.text ?? "";
  const score = extractScore(text);

  return { evaluation: text, score };
}
