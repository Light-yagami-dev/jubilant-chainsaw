import { Router } from "express";
import { db } from "@workspace/db";
import { masteryMapTable, revisionQueueTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { UpdateMasteryBody, GetMasteryMapQueryParams, GetMasteryStatsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const parsed = GetMasteryMapQueryParams.safeParse(req.query);
    const examType = parsed.success ? parsed.data.examType : undefined;
    const subject = parsed.success ? parsed.data.subject : undefined;

    const conditions = [];
    if (examType) conditions.push(eq(masteryMapTable.examType, examType));
    if (subject) conditions.push(eq(masteryMapTable.subject, subject));

    const result = conditions.length > 0
      ? await db.select().from(masteryMapTable).where(and(...conditions)).orderBy(masteryMapTable.score)
      : await db.select().from(masteryMapTable).orderBy(masteryMapTable.score);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get mastery map");
    res.status(500).json({ error: "Failed to get mastery map" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = UpdateMasteryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { topic, subject, examType, score, passed } = parsed.data;

    const [existing] = await db.select().from(masteryMapTable)
      .where(and(
        eq(masteryMapTable.topic, topic),
        eq(masteryMapTable.examType, examType),
      ));

    let result;
    if (existing) {
      const [updated] = await db.update(masteryMapTable)
        .set({
          score,
          attempts: existing.attempts + 1,
          lastAttempted: new Date(),
        })
        .where(eq(masteryMapTable.id, existing.id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db.insert(masteryMapTable).values({
        topic,
        subject,
        examType,
        score,
        attempts: 1,
        lastAttempted: new Date(),
      }).returning();
      result = inserted;
    }

    if (!passed && score < 70) {
      const nextReviewAt = new Date();
      nextReviewAt.setDate(nextReviewAt.getDate() + 3);

      const [existingRevision] = await db.select().from(revisionQueueTable)
        .where(and(
          eq(revisionQueueTable.topic, topic),
          eq(revisionQueueTable.examType, examType),
        ));

      if (!existingRevision) {
        await db.insert(revisionQueueTable).values({
          topic,
          subject,
          examType,
          score,
          nextReviewAt,
          intervalDays: 3,
          failedCount: 1,
        });
      }
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to update mastery");
    res.status(500).json({ error: "Failed to update mastery" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const parsed = GetMasteryStatsQueryParams.safeParse(req.query);
    const examType = parsed.success ? parsed.data.examType : undefined;

    const conditions = examType ? [eq(masteryMapTable.examType, examType)] : [];

    const entries = conditions.length > 0
      ? await db.select().from(masteryMapTable).where(and(...conditions))
      : await db.select().from(masteryMapTable);

    const statsMap = new Map<string, { subject: string; examType: string; scores: number[] }>();

    for (const entry of entries) {
      const key = `${entry.subject}::${entry.examType}`;
      if (!statsMap.has(key)) {
        statsMap.set(key, { subject: entry.subject, examType: entry.examType, scores: [] });
      }
      statsMap.get(key)!.scores.push(entry.score);
    }

    const stats = Array.from(statsMap.values()).map(({ subject, examType: et, scores }) => ({
      subject,
      examType: et,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      totalTopics: scores.length,
      masteredTopics: scores.filter(s => s >= 80).length,
      weakTopics: scores.filter(s => s < 50).length,
    }));

    res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to get mastery stats");
    res.status(500).json({ error: "Failed to get mastery stats" });
  }
});

export default router;
