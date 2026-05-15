import { Router } from "express";
import { z } from "zod";
import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import { syllabusChunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const ExplainTopicRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  subject: z.string().optional(),
  examType: z.string().default("BSC_BIOTECH_PART1"),
  depth: z.enum(["basic", "detailed", "exam-focused"]).default("detailed"),
});

const ExplainTopicResponseSchema = z.object({
  topic: z.string(),
  explanation: z.string(),
  keyPoints: z.array(z.string()),
  relatedTopics: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

type ExplainTopicRequest = z.infer<typeof ExplainTopicRequestSchema>;
type ExplainTopicResponse = z.infer<typeof ExplainTopicResponseSchema>;

router.post("/topic", async (req, res) => {
  try {
    const { topic, subject, examType, depth } = ExplainTopicRequestSchema.parse(req.body);

    // First, try to find existing syllabus data
    const syllabusData = await db
      .select()
      .from(syllabusChunksTable)
      .where(eq(syllabusChunksTable.topic, topic))
      .limit(1);

    let context = "";
    if (syllabusData.length > 0) {
      context = syllabusData[0].content;
    }

    // Generate detailed explanation using AI
    const prompt = `You are an expert B.Sc. Biotechnology tutor. Provide a comprehensive explanation for the topic "${topic}" for ${examType} exam.

Depth: ${depth}
${subject ? `Subject: ${subject}\n` : ""}
${context ? `Use this syllabus context as reference:\n${context}\n\n` : ""}

Please structure your response as a JSON object with the following fields:
- topic: The topic name
- explanation: A detailed, engaging explanation (300-500 words) with examples and diagram descriptions
- keyPoints: Array of 5-8 key learning points
- relatedTopics: Array of 3-5 related topics to study next
- difficulty: "beginner", "intermediate", or "advanced"

Make the explanation engaging and easy to understand, suitable for undergraduate students. Include real-world applications and practical examples where relevant.

Response must be valid JSON only.`;

    const response = await ai.generateContent({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 2000,
    });

    if (!response.text) {
      throw new Error("Failed to generate explanation");
    }

    // Parse the JSON response
    let explanationData: ExplainTopicResponse;
    try {
      explanationData = JSON.parse(response.text);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      explanationData = {
        topic,
        explanation: response.text,
        keyPoints: ["Key concepts covered in the explanation"],
        relatedTopics: ["Related biotechnology topics"],
        difficulty: "intermediate" as const,
      };
    }

    res.json(explanationData);
  } catch (error) {
    console.error("Error explaining topic:", error);
    res.status(500).json({
      error: "Failed to generate topic explanation",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;