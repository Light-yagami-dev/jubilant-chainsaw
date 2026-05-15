import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { syllabusChunksTable, documentContextsTable } from "@workspace/db";
import { ai } from "@workspace/integrations-gemini-ai";
import { eq } from "drizzle-orm";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const DOC_EXTRACTOR_URL = process.env.DOC_EXTRACTOR_URL ?? "http://localhost:8083";

async function callExtractor(buffer: Buffer, filename: string, mimetype: string): Promise<{
  text: string;
  page_count: number;
  file_name: string;
  file_size: number;
  char_count: number;
}> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimetype });
  form.append("file", blob, filename);

  const res = await fetch(`${DOC_EXTRACTOR_URL}/extract`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Doc extractor returned ${res.status}: ${body}`);
  }

  return res.json() as Promise<{
    text: string;
    page_count: number;
    file_name: string;
    file_size: number;
    char_count: number;
  }>;
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

    req.log.info({ filename: req.file.originalname, size: req.file.size }, "Starting document extraction");

    let extracted: Awaited<ReturnType<typeof callExtractor>>;
    try {
      extracted = await callExtractor(req.file.buffer, req.file.originalname, req.file.mimetype);
    } catch (extractErr) {
      req.log.error({ err: extractErr }, "Doc extractor call failed");
      res.status(502).json({
        error: "Document extraction service unavailable. Ensure the Doc Extractor workflow is running.",
      });
      return;
    }

    if (!extracted.text || extracted.char_count === 0) {
      res.status(422).json({ error: "No readable text found in document" });
      return;
    }

    req.log.info(
      { pages: extracted.page_count, chars: extracted.char_count },
      "Extraction complete"
    );

    const sessionToken = randomUUID();

    await db.insert(documentContextsTable).values({
      sessionToken,
      examType,
      fileName: req.file.originalname,
      extractedText: extracted.text,
      pageCount: extracted.page_count,
      charCount: extracted.char_count,
    });

    const truncated = extracted.text.slice(0, 20_000);

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

Use emojis like ✅, 💡, or 🔥 only when they help make the topic labels more engaging.
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
      chunks = [];
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

    req.log.info({ chunks: chunks.length, sessionToken }, "Ingest complete");

    res.json({
      chunks: chunks.length,
      topics: chunks.map(c => c.topic),
      message: `Extracted ${extracted.char_count.toLocaleString()} characters across ${extracted.page_count} page(s). Indexed ${chunks.length} topics.`,
      sessionToken,
      charCount: extracted.char_count,
      pageCount: extracted.page_count,
    });
  } catch (err) {
    req.log.error({ err }, "PDF ingestion failed");
    res.status(500).json({ error: "PDF ingestion failed" });
  }
});

router.get("/context/:sessionToken", async (req, res) => {
  try {
    const [ctx] = await db
      .select()
      .from(documentContextsTable)
      .where(eq(documentContextsTable.sessionToken, req.params.sessionToken))
      .limit(1);

    if (!ctx) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({
      fileName: ctx.fileName,
      examType: ctx.examType,
      pageCount: ctx.pageCount,
      charCount: ctx.charCount,
      createdAt: ctx.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Context lookup failed");
    res.status(500).json({ error: "Context lookup failed" });
  }
});

export default router;
