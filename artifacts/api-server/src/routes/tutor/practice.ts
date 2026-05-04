import { ai } from "@workspace/integrations-gemini-ai";

const LANG_NOTE: Record<string, string> = {
  Hindi: "Write entirely in Hindi (Devanagari script).",
  Hinglish: "Write in Hinglish — a natural mix of Hindi and English in Roman script.",
  English: "Write in English.",
};

export async function generatePracticeQuestions(
  context: string,
  exam: string,
  language = "English",
  model = "gemini-2.5-flash",
): Promise<string> {
  const langNote = LANG_NOTE[language] ?? LANG_NOTE.English;
  const prompt = `You are a ${exam} practice question generator.
${langNote}

Based on the following tutoring content, generate 5 practice problems:
- 2 conceptual MCQs (with 4 options, mark correct answer)
- 2 numerical/application problems (with full solution)
- 1 higher-order thinking question

Content:
${context}

Format each question clearly with labels Q1, Q2… Use markdown.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 4096 },
  });

  return response.text ?? "";
}
