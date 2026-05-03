import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const masteryMapTable = pgTable("mastery_map", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  subject: text("subject").notNull(),
  examType: text("exam_type").notNull(),
  score: integer("score").notNull().default(0),
  lastAttempted: timestamp("last_attempted"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMasterySchema = createInsertSchema(masteryMapTable).omit({ id: true, createdAt: true });
export type InsertMastery = z.infer<typeof insertMasterySchema>;
export type MasteryEntry = typeof masteryMapTable.$inferSelect;
