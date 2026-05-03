import { Router } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { syllabusChunksTable } from "@workspace/db";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function extractTextFromBuffer(buffer: Buffer): string {
  const text = buffer.toString("latin1");
  const cleaned = text
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
}

router.post("/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const examType = req.body.examType as string;
    if (!examType) {
      res.status(400).json({ error: "examType is required" });
      return;
    }

    const rawText = extractTextFromBuffer(req.file.buffer);
    const truncated = rawText.slice(0, 20000);

    const chunkingPrompt = `You are a ${examType} exam syllabus parser. 

Extract educational content from this text and chunk it into topic-based learning units.

Text: ${truncated}

Return as JSON array of chunks:
[
  {
    "topic": "specific topic name",
    "heading": "chapter or section heading",
    "content": "educational content for this topic (2-4 sentences)",
    "examType": "${examType}"
  }
]

Extract up to 15 meaningful topics. Focus on key exam topics.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: chunkingPrompt }] }],
      config: {
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    let chunks: Array<{ topic: string; heading: string; content: string; examType: string }> = [];
    try {
      chunks = JSON.parse(response.text ?? "[]");
    } catch {
      res.status(500).json({ error: "Failed to parse PDF content" });
      return;
    }

    if (chunks.length > 0) {
      await db.insert(syllabusChunksTable).values(
        chunks.map(c => ({
          topic: c.topic,
          heading: c.heading,
          content: c.content,
          examType,
        }))
      );
    }

    res.json({
      chunks: chunks.length,
      topics: chunks.map(c => c.topic),
      message: `Successfully parsed ${chunks.length} topics from PDF`,
    });
  } catch (err) {
    req.log.error({ err }, "PDF ingestion failed");
    res.status(500).json({ error: "PDF ingestion failed" });
  }
});

export default router;
