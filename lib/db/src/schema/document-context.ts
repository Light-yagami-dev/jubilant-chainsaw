import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const documentContextsTable = pgTable("document_contexts", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  examType: text("exam_type").notNull(),
  fileName: text("file_name").notNull(),
  extractedText: text("extracted_text").notNull(),
  pageCount: integer("page_count").notNull().default(0),
  charCount: integer("char_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export type DocumentContext = typeof documentContextsTable.$inferSelect;
