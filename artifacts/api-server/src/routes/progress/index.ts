import { Router } from "express";
import { db } from "@workspace/db";
import { masteryMapTable, revisionQueueTable } from "@workspace/db";
import { eq, and, lte, gt } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const examType = typeof req.query.examType === "string" ? req.query.examType : undefined;
    const subject = typeof req.query.subject === "string" ? req.query.subject : undefined;

    const masteryConditions = [];
    if (examType) masteryConditions.push(eq(masteryMapTable.examType, examType));
    if (subject) masteryConditions.push(eq(masteryMapTable.subject, subject));

    const revisionConditions = [];
    if (examType) revisionConditions.push(eq(revisionQueueTable.examType, examType));
    if (subject) revisionConditions.push(eq(revisionQueueTable.subject, subject));

    const masteryQuery = masteryConditions.length > 0
      ? db.select().from(masteryMapTable).where(and(...masteryConditions))
      : db.select().from(masteryMapTable);

    const revisionDueQuery = revisionConditions.length > 0
      ? db.select().from(revisionQueueTable).where(and(...revisionConditions, lte(revisionQueueTable.nextReviewAt, new Date())))
      : db.select().from(revisionQueueTable).where(lte(revisionQueueTable.nextReviewAt, new Date()));

    const revisionUpcomingQuery = revisionConditions.length > 0
      ? db.select().from(revisionQueueTable).where(and(...revisionConditions, gt(revisionQueueTable.nextReviewAt, new Date())))
      : db.select().from(revisionQueueTable).where(gt(revisionQueueTable.nextReviewAt, new Date()));

    const [entries, dueEntries, upcomingEntries] = await Promise.all([
      masteryQuery,
      revisionDueQuery,
      revisionUpcomingQuery,
    ]);

    const totalTopics = entries.length;
    const masteredTopics = entries.filter((entry) => entry.score >= 80).length;
    const weakTopics = entries.filter((entry) => entry.score < 50).length;
    const averageScore = totalTopics > 0
      ? Math.round(entries.reduce((sum, entry) => sum + entry.score, 0) / totalTopics)
      : 0;

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const lastAttemptedDates = entries
      .map((entry) => entry.lastAttempted ? new Date(entry.lastAttempted) : null)
      .filter((date): date is Date => date !== null)
      .sort((a, b) => b.getTime() - a.getTime());

    const recentDays = new Set(
      lastAttemptedDates
        .filter((date) => date >= oneWeekAgo)
        .map((date) => date.toISOString().slice(0, 10)),
    );

    const recentActivity = lastAttemptedDates.length === 0
      ? "No progress recorded yet."
      : `Last activity ${Math.ceil((now.getTime() - lastAttemptedDates[0].getTime()) / (1000 * 60 * 60))}h ago`;

    const recommendedNextSteps: string[] = [];
    if (dueEntries.length > 0) {
      recommendedNextSteps.push("Complete your due revision sessions.");
    }
    if (weakTopics > 0) {
      recommendedNextSteps.push("Review weak topics with targeted practice.");
    }
    if (totalTopics === 0) {
      recommendedNextSteps.push("Start tracking mastery with a diagnostics run.");
    }
    if (recommendedNextSteps.length === 0) {
      recommendedNextSteps.push("Keep the momentum going with your study plan.");
    }

    res.json({
      totalTopics,
      masteredTopics,
      weakTopics,
      averageScore,
      revisionDue: dueEntries.length,
      revisionUpcoming: upcomingEntries.length,
      streakDays: recentDays.size,
      recentActivity,
      recommendedNextSteps,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get progress summary");
    res.status(500).json({ error: "Failed to get progress summary" });
  }
});

export default router;
