import { Router } from "express";
import { db } from "@workspace/db";
import { revisionQueueTable } from "@workspace/db";
import { eq, and, lte } from "drizzle-orm";
import { AddToRevisionQueueBody, CompleteRevisionBody, GetRevisionQueueQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const parsed = GetRevisionQueueQueryParams.safeParse(req.query);
    const examType = parsed.success ? parsed.data.examType : undefined;

    const now = new Date();
    const conditions = [lte(revisionQueueTable.nextReviewAt, now)];
    if (examType) conditions.push(eq(revisionQueueTable.examType, examType));

    const result = await db.select().from(revisionQueueTable)
      .where(and(...conditions))
      .orderBy(revisionQueueTable.nextReviewAt);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get revision queue");
    res.status(500).json({ error: "Failed to get revision queue" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = AddToRevisionQueueBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { topic, subject, examType, score } = parsed.data;
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + 3);

    const [result] = await db.insert(revisionQueueTable).values({
      topic,
      subject,
      examType,
      score,
      nextReviewAt,
      intervalDays: 3,
      failedCount: 0,
    }).returning();

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to add to revision queue");
    res.status(500).json({ error: "Failed to add to revision queue" });
  }
});

router.post("/:id/complete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = CompleteRevisionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { passed, score } = parsed.data;

    const [existing] = await db.select().from(revisionQueueTable).where(eq(revisionQueueTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Revision entry not found" });
      return;
    }

    const INTERVALS = [3, 7, 14, 30];

    let newInterval: number;
    let newFailedCount = existing.failedCount;

    if (passed) {
      const currentIndex = INTERVALS.indexOf(existing.intervalDays);
      const nextIndex = Math.min(currentIndex + 1, INTERVALS.length - 1);
      newInterval = INTERVALS[nextIndex] ?? 30;
    } else {
      newInterval = 3;
      newFailedCount = existing.failedCount + 1;
    }

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

    const [updated] = await db.update(revisionQueueTable)
      .set({ nextReviewAt, intervalDays: newInterval, failedCount: newFailedCount, score })
      .where(eq(revisionQueueTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to complete revision");
    res.status(500).json({ error: "Failed to complete revision" });
  }
});

export default router;
