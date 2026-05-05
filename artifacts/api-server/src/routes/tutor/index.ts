import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, documentContextsTable } from "@workspace/db";
import { InvokeTutorBody } from "@workspace/api-zod";
import { runTutorWorkflow } from "./workflow";
import { generatePracticeQuestions } from "./practice";
import { traceBackEvaluation } from "./diagnostic";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/invoke", async (req, res) => {
  try {
    const parsed = InvokeTutorBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { userInput, targetExam, subject, pedagogyStyle, studentAnswer, questionMode, conversationId, sessionToken } = parsed.data;

    let documentContext: string | undefined;
    if (sessionToken) {
      try {
        const [docCtx] = await db
          .select()
          .from(documentContextsTable)
          .where(eq(documentContextsTable.sessionToken, sessionToken))
          .limit(1);
        if (docCtx) {
          documentContext = docCtx.extractedText;
          req.log.info(
            { sessionToken, chars: docCtx.charCount, pages: docCtx.pageCount },
            "Injecting document context into tutor prompt"
          );
        }
      } catch (ctxErr) {
        req.log.warn({ err: ctxErr, sessionToken }, "Failed to load document context — continuing without it");
      }
    }

    const result = await runTutorWorkflow({
      userInput,
      targetExam,
      subject,
      pedagogyStyle: (pedagogyStyle as "hinglish" | "english" | "mnemonic") ?? "english",
      studentAnswer,
      questionMode,
      documentContext,
      mnemonics: [],
      weakTopics: [],
      revisionSuggestions: [],
      iterations: 0,
    });

    let savedConvId = conversationId;
    let savedMsgId: number | undefined;

    if (savedConvId) {
      const [msg] = await db.insert(messages).values({
        conversationId: savedConvId,
        role: "assistant",
        content: result.response,
      }).returning();
      savedMsgId = msg?.id;
    } else {
      const title = userInput.slice(0, 60) + (userInput.length > 60 ? "..." : "");
      const [conv] = await db.insert(conversations).values({ title }).returning();
      savedConvId = conv?.id;
      if (savedConvId) {
        await db.insert(messages).values({ conversationId: savedConvId, role: "user", content: userInput });
        const [msg] = await db.insert(messages).values({
          conversationId: savedConvId,
          role: "assistant",
          content: result.response,
        }).returning();
        savedMsgId = msg?.id;
      }
    }

    res.json({
      response: result.response,
      cacheHit: result.cacheHit,
      gradingPassed: result.gradingPassed,
      mnemonics: result.mnemonics,
      weakTopics: result.weakTopics,
      revisionSuggestions: result.revisionSuggestions,
      conversationId: savedConvId,
      messageId: savedMsgId,
    });
  } catch (err) {
    req.log.error({ err }, "Tutor invoke failed");
    res.status(500).json({ error: "Tutor workflow failed" });
  }
});

router.post("/practice", async (req, res) => {
  try {
    const { context, targetExam, language = "English", model = "gemini-2.5-flash" } = req.body as {
      context: string; targetExam: string; language?: string; model?: string;
    };
    if (!context || !targetExam) {
      res.status(400).json({ error: "context and targetExam are required" });
      return;
    }
    const questions = await generatePracticeQuestions(context, targetExam, language, model);
    res.json({ questions });
  } catch (err) {
    req.log.error({ err }, "Practice generation failed");
    res.status(500).json({ error: "Practice generation failed" });
  }
});

router.post("/diagnostic", async (req, res) => {
  try {
    const { studentAnswer, reference, targetExam, language = "English", model = "gemini-2.5-flash" } = req.body as {
      studentAnswer: string; reference: string; targetExam: string; language?: string; model?: string;
    };
    if (!studentAnswer || !reference || !targetExam) {
      res.status(400).json({ error: "studentAnswer, reference, and targetExam are required" });
      return;
    }
    const result = await traceBackEvaluation(studentAnswer, reference, targetExam, language, model);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Diagnostic evaluation failed");
    res.status(500).json({ error: "Diagnostic evaluation failed" });
  }
});

export default router;
