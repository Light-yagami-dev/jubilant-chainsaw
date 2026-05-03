import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const revisionQueueTable = pgTable("revision_queue", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  subject: text("subject").notNull(),
  examType: text("exam_type").notNull(),
  score: integer("score").notNull().default(0),
  nextReviewAt: timestamp("next_review_at").notNull(),
  intervalDays: integer("interval_days").notNull().default(3),
  failedCount: integer("failed_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRevisionSchema = createInsertSchema(revisionQueueTable).omit({ id: true, createdAt: true });
export type InsertRevision = z.infer<typeof insertRevisionSchema>;
export type RevisionEntry = typeof revisionQueueTable.$inferSelect;
