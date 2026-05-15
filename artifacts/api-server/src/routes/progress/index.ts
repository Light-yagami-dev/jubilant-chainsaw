import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { masteryMapTable, revisionQueueTable, quizSessionsTable, studyActivityTable } from "@workspace/db";
import { eq, and, lte, gt } from "drizzle-orm";

const router = Router();

const logActivitySchema = z.object({
  activityType: z.string(),
  subject: z.string().optional(),
  examType: z.string().optional(),
  durationMinutes: z.number().int().min(0).optional().default(0),
  notes: z.string().optional(),
});

async function getSummary(req: Request, res: Response) {
  try {
    const examType = typeof req.query.examType === "string" ? req.query.examType : undefined;
    const subject = typeof req.query.subject === "string" ? req.query.subject : undefined;

    const masteryConditions = [];
    if (examType) masteryConditions.push(eq(masteryMapTable.examType, examType));
    if (subject) masteryConditions.push(eq(masteryMapTable.subject, subject));

    const revisionConditions = [];
    if (examType) revisionConditions.push(eq(revisionQueueTable.examType, examType));
    if (subject) revisionConditions.push(eq(revisionQueueTable.subject, subject));

    const studyConditions = [];
    if (examType) studyConditions.push(eq(studyActivityTable.examType, examType));
    if (subject) studyConditions.push(eq(studyActivityTable.subject, subject));

    const masteryQuery = masteryConditions.length > 0
      ? db.select().from(masteryMapTable).where(and(...masteryConditions))
      : db.select().from(masteryMapTable);

    const revisionDueQuery = revisionConditions.length > 0
      ? db.select().from(revisionQueueTable).where(and(...revisionConditions, lte(revisionQueueTable.nextReviewAt, new Date())))
      : db.select().from(revisionQueueTable).where(lte(revisionQueueTable.nextReviewAt, new Date()));

    const revisionUpcomingQuery = revisionConditions.length > 0
      ? db.select().from(revisionQueueTable).where(and(...revisionConditions, gt(revisionQueueTable.nextReviewAt, new Date())))
      : db.select().from(revisionQueueTable).where(gt(revisionQueueTable.nextReviewAt, new Date()));

    const activityQuery = studyConditions.length > 0
      ? db.select().from(studyActivityTable).where(and(...studyConditions))
      : db.select().from(studyActivityTable);

    const [entries, dueEntries, upcomingEntries, activities] = await Promise.all([
      masteryQuery,
      revisionDueQuery,
      revisionUpcomingQuery,
      activityQuery,
    ]);

    const totalTopics = entries.length;
    const masteredTopics = entries.filter((entry) => entry.score >= 80).length;
    const weakTopics = entries.filter((entry) => entry.score < 50).length;
    const averageScore = totalTopics > 0
      ? Math.round(entries.reduce((sum, entry) => sum + entry.score, 0) / totalTopics)
      : 0;

    const totalStudyMinutes = activities.reduce((sum, activity) => sum + activity.durationMinutes, 0);
    const studyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
    const activeDays = new Set(
      activities.map((activity) => new Date(activity.createdAt).toISOString().slice(0, 10)),
    );

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

    const recentActivity = activities.length === 0
      ? "No logged study activity yet."
      : `Last activity ${Math.ceil((now.getTime() - new Date(activities[activities.length - 1].createdAt).getTime()) / (1000 * 60 * 60))}h ago`;

    const recommendedNextSteps: string[] = [];
    if (dueEntries.length > 0) {
      recommendedNextSteps.push("Complete your due revision sessions.");
    }
    if (weakTopics > 0) {
      recommendedNextSteps.push("Review weak topics with targeted practice.");
    }
    if (studyHours === 0) {
      recommendedNextSteps.push("Log your first study session to start tracking progress.");
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
      studyHours,
      activeDays: activeDays.size,
      recommendedNextSteps,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get progress summary");
    res.status(500).json({ error: "Failed to get progress summary" });
  }
}

router.get("/", getSummary);
router.get("/summary", getSummary);

router.get("/streaks", async (req, res) => {
  try {
    const activityRows = await db.select().from(studyActivityTable).orderBy(studyActivityTable.createdAt);
    const quizRows = await db.select().from(quizSessionsTable).orderBy(quizSessionsTable.startedAt);

    const allDates = new Set<string>();
    activityRows.forEach((item) => allDates.add(new Date(item.createdAt).toISOString().slice(0, 10)));
    quizRows.forEach((item) => allDates.add(new Date(item.startedAt).toISOString().slice(0, 10)));

    const today = new Date();
    let currentStreak = 0;
    for (let offset = 0; offset < 30; offset++) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      const dayKey = day.toISOString().slice(0, 10);
      if (!allDates.has(dayKey)) break;
      currentStreak += 1;
    }

    const sortedDates = Array.from(allDates).sort((a, b) => a.localeCompare(b));
    let longestStreak = 0;
    let streak = 0;
    let lastDate: string | null = null;

    for (const date of sortedDates) {
      if (!lastDate) {
        streak = 1;
      } else {
        const previous = new Date(lastDate);
        previous.setDate(previous.getDate() + 1);
        const expected = previous.toISOString().slice(0, 10);
        streak = date === expected ? streak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, streak);
      lastDate = date;
    }

    res.json({
      currentStreak,
      longestStreak,
      activityDays: sortedDates,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get progress streaks");
    res.status(500).json({ error: "Failed to get progress streaks" });
  }
});

router.post("/log", async (req, res) => {
  try {
    const parsed = logActivitySchema.parse(req.body);
    const [activity] = await db.insert(studyActivityTable).values(parsed).returning();
    res.status(201).json(activity);
  } catch (err) {
    req.log.error({ err }, "Failed to log study activity");
    res.status(500).json({ error: "Failed to log study activity" });
  }
});

export default router;
