import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const semanticCacheTable = pgTable("semantic_cache", {
  id: serial("id").primaryKey(),
  queryHash: text("query_hash").notNull().unique(),
  queryText: text("query_text").notNull(),
  queryTokens: text("query_tokens").notNull().default(""),
  response: text("response").notNull(),
  hits: integer("hits").notNull().default(0),
  similarity: real("similarity").notNull().default(1.0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastHitAt: timestamp("last_hit_at"),
});

export const insertSemanticCacheSchema = createInsertSchema(semanticCacheTable).omit({ id: true, createdAt: true });
export type InsertSemanticCache = z.infer<typeof insertSemanticCacheSchema>;
export type SemanticCacheEntry = typeof semanticCacheTable.$inferSelect;
