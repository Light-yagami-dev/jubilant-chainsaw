import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studyActivityTable = pgTable("study_activity", {
  id: serial("id").primaryKey(),
  activityType: text("activity_type").notNull(),
  subject: text("subject"),
  examType: text("exam_type"),
  durationMinutes: integer("duration_minutes").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStudyActivitySchema = createInsertSchema(studyActivityTable).omit({ id: true, createdAt: true });
export type InsertStudyActivity = z.infer<typeof insertStudyActivitySchema>;
export type StudyActivity = typeof studyActivityTable.$inferSelect;
