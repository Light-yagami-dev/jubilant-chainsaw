import { pgTable, serial, text, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  examType: text("exam_type").notNull(),
  difficulty: text("difficulty").notNull(),
  questionCount: integer("question_count").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzesTable.id),
  questionType: text("question_type").notNull(),
  question: text("question").notNull(),
  options: json("options").$type<string[]>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  topic: text("topic"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizSessionsTable = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzesTable.id),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(0),
  answers: json("answers").$type<Array<{ questionId: number; answer: string; correct: boolean }>>().notNull(),
  completed: boolean("completed").notNull().default(false),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpentMinutes: integer("time_spent_minutes").notNull().default(0),
});

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({ id: true, createdAt: true });
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzesTable.$inferSelect;

export const insertQuizQuestionSchema = createInsertSchema(quizQuestionsTable).omit({ id: true, createdAt: true });
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;

export const insertQuizSessionSchema = createInsertSchema(quizSessionsTable).omit({ id: true });
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type QuizSession = typeof quizSessionsTable.$inferSelect;
