import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const syllabusChunksTable = pgTable("syllabus_chunks", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  heading: text("heading").notNull(),
  content: text("content").notNull(),
  examType: text("exam_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSyllabusChunkSchema = createInsertSchema(syllabusChunksTable).omit({ id: true, createdAt: true });
export type InsertSyllabusChunk = z.infer<typeof insertSyllabusChunkSchema>;
export type SyllabusChunk = typeof syllabusChunksTable.$inferSelect;
