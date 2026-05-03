import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { eq } from "drizzle-orm";
import { InvokeTutorBody } from "@workspace/api-zod";
import { runTutorWorkflow } from "./workflow";

const router = Router();

router.post("/invoke", async (req, res) => {
  try {
    const parsed = InvokeTutorBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { userInput, targetExam, subject, pedagogyStyle, studentAnswer, questionMode, conversationId } = parsed.data;

    const result = await runTutorWorkflow({
      userInput,
      targetExam,
      subject,
      pedagogyStyle: (pedagogyStyle as "hinglish" | "english" | "mnemonic") ?? "english",
      studentAnswer,
      questionMode,
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

export default router;
