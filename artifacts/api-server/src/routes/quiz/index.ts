import { Router } from "express";
import { z } from "zod";
import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import { quizzesTable, quizQuestionsTable, quizSessionsTable, syllabusChunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const generateQuizSchema = z.object({
  title: z.string().optional(),
  subject: z.string().optional(),
  examType: z.string().default("BSC_BIOTECH_PART1"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  questionCount: z.number().int().min(3).max(20).default(6),
  questionTypes: z.array(z.enum(["mcq", "true_false", "fill_blank", "short_answer"]))
    .optional(),
  topics: z.array(z.string()).optional(),
});

const answerQuestionSchema = z.object({
  questionId: z.number().int(),
  answer: z.string(),
});

const startSessionSchema = z.object({
  timeLimitMinutes: z.number().int().min(1).max(120).optional(),
  userName: z.string().optional(),
});

const completeSessionSchema = z.object({
  timeSpentMinutes: z.number().int().min(0).optional(),
});

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
}

function buildFallbackQuestions(
  topics: string[],
  questionCount: number,
  difficulty: string,
) {
  const questionTypes = ["mcq", "true_false", "fill_blank", "short_answer"];
  return Array.from({ length: questionCount }, (_, index) => {
    const topic = topics[index % topics.length] || "General science";
    const questionType = questionTypes[index % questionTypes.length] as "mcq" | "true_false" | "fill_blank" | "short_answer";
    if (questionType === "mcq") {
      return {
        questionType,
        question: `Which statement about ${topic} is most accurate?`,
        options: [
          `The main concept in ${topic} is clearly defined.`,
          `The idea behind ${topic} is generally false.`,
          `The basic principle of ${topic} is unrelated to the exam.`,
          `The key point of ${topic} is not important.`,
        ],
        correctAnswer: `The main concept in ${topic} is clearly defined.`,
        explanation: `Focus on the core concept of ${topic} and eliminate distractors.`,
        topic,
      };
    }

    if (questionType === "true_false") {
      return {
        questionType,
        question: `True or false: ${topic} is a critical topic for the exam.`,
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: `For most exam syllabi, ${topic} is an important topic worth mastering.`,
        topic,
      };
    }

    if (questionType === "fill_blank") {
      return {
        questionType,
        question: `Fill in the blank: The primary focus of ${topic} is _____.`,
        options: [],
        correctAnswer: `the primary concept`,
        explanation: `Identify the main concept behind ${topic}.`,
        topic,
      };
    }

    return {
      questionType,
      question: `Briefly explain why ${topic} matters for this exam.`,
      options: [],
      correctAnswer: `It helps build foundational understanding for ${topic}.`,
      explanation: `Short answers should emphasize importance to exam preparation.`,
      topic,
    };
  });
}

router.get("/", async (req, res) => {
  try {
    const quizzes = await db.select().from(quizzesTable).orderBy(quizzesTable.createdAt);
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list quizzes" });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const parsed = generateQuizSchema.parse(req.body);
    const { title, subject = "Biotechnology", examType, difficulty, questionCount, questionTypes, topics } = parsed;

    const syllabusData = await db.select({ topic: syllabusChunksTable.topic, examType: syllabusChunksTable.examType })
      .from(syllabusChunksTable)
      .where(eq(syllabusChunksTable.examType, examType));

    const sourceTopics = topics?.length
      ? topics
      : syllabusData.length > 0
      ? Array.from(new Set(syllabusData.map((item) => item.topic))).slice(0, questionCount)
      : ["Cell Biology", "Genetics", "Biochemistry", "Microbiology", "Immunology", "Molecular Biology"];

    const prompt = `Create ${questionCount} exam-style questions for ${examType} with ${difficulty} difficulty.` +
      ` Use a mix of multiple choice, true/false, fill-in-the-blank, and short answer format.` +
      ` Include question, options, correctAnswer, explanation, topic, and questionType.` +
      ` Topics: ${sourceTopics.join(", ")}.`;

    const response = await ai.generateContent({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      maxTokens: 1500,
    });

    let questions: Array<{
      questionType: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      topic: string;
    }> = [];
    if (response.text) {
      try {
        const candidate = JSON.parse(response.text);
        if (Array.isArray(candidate)) {
          questions = candidate.map((item) => ({
            questionType: item.questionType || item.type || "short_answer",
            question: item.question || item.prompt || "Review the topic.",
            options: item.options ?? [],
            correctAnswer: item.correctAnswer || item.answer || "",
            explanation: item.explanation || "",
            topic: item.topic || sourceTopics[0],
          }));
        }
      } catch {
        questions = [];
      }
    }

    if (questions.length === 0) {
      questions = buildFallbackQuestions(sourceTopics, questionCount, difficulty);
    }

    const [quiz] = await db.insert(quizzesTable).values({
      title: title ?? `${examType} ${difficulty} quiz`,
      subject,
      examType,
      difficulty,
      questionCount: questions.length,
      metadata: { questionTypes: questionTypes ?? ["mcq", "true_false", "fill_blank", "short_answer"] },
    }).returning();

    const insertedQuestions = await db.insert(quizQuestionsTable).values(
      questions.map((question) => ({
        quizId: quiz.id,
        questionType: question.questionType,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        topic: question.topic,
      })),
    ).returning();

    res.status(201).json({ quiz, questions: insertedQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const quizId = Number(req.params.id);
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, quizId));
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, quizId));
    res.json({ quiz, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load quiz" });
  }
});

router.post("/:id/start", async (req, res) => {
  try {
    const quizId = Number(req.params.id);
    const parsed = startSessionSchema.parse(req.body);
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, quizId));

    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    const [session] = await db.insert(quizSessionsTable).values({
      quizId,
      score: 0,
      maxScore: quiz.questionCount,
      answers: [],
      completed: false,
      timeSpentMinutes: 0,
    }).returning();

    res.status(201).json({
      sessionId: session.id,
      quizId,
      startedAt: session.startedAt,
      maxScore: session.maxScore,
      timeLimitMinutes: parsed.timeLimitMinutes ?? 30,
      userName: parsed.userName ?? "student",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start quiz session" });
  }
});

router.post("/session/:id/answer", async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const parsed = answerQuestionSchema.parse(req.body);

    const [session] = await db.select().from(quizSessionsTable).where(eq(quizSessionsTable.id, sessionId));
    if (!session) {
      res.status(404).json({ error: "Quiz session not found" });
      return;
    }

    const [question] = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.id, parsed.questionId));
    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const normalized = normalizeAnswer(parsed.answer);
    const correct = normalizeAnswer(question.correctAnswer) === normalized;
    const answers = Array.isArray(session.answers) ? session.answers : [];
    const existingIndex = answers.findIndex((item: any) => item.questionId === parsed.questionId);

    if (existingIndex >= 0) {
      answers[existingIndex] = { questionId: parsed.questionId, answer: parsed.answer, correct };
    } else {
      answers.push({ questionId: parsed.questionId, answer: parsed.answer, correct });
    }

    const score = answers.filter((item: any) => item.correct).length;
    const [updated] = await db.update(quizSessionsTable)
      .set({ answers, score })
      .where(eq(quizSessionsTable.id, sessionId))
      .returning();

    res.json({
      questionId: parsed.questionId,
      correct,
      score: updated.score,
      maxScore: updated.maxScore,
      answer: parsed.answer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

router.post("/session/:id/complete", async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const parsed = completeSessionSchema.parse(req.body);
    const [session] = await db.select().from(quizSessionsTable).where(eq(quizSessionsTable.id, sessionId));

    if (!session) {
      res.status(404).json({ error: "Quiz session not found" });
      return;
    }

    const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, session.quizId!));
    const answers = Array.isArray(session.answers) ? session.answers : [];
    const correctCount = answers.filter((item: any) => item.correct).length;
    const maxScore = session.maxScore || questions.length;
    const score = correctCount;

    const [updated] = await db.update(quizSessionsTable)
      .set({
        completed: "true",
        completedAt: new Date(),
        timeSpentMinutes: parsed.timeSpentMinutes ?? session.timeSpentMinutes,
        score,
        maxScore,
      })
      .where(eq(quizSessionsTable.id, sessionId))
      .returning();

    res.json({
      sessionId: updated.id,
      quizId: updated.quizId,
      score: updated.score,
      maxScore: updated.maxScore,
      correctCount,
      totalQuestions: maxScore,
      completedAt: updated.completedAt,
      answers,
      questions: questions.map((question) => ({
        id: question.id,
        question: question.question,
        explanation: question.explanation,
        topic: question.topic,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to complete quiz session" });
  }
});

export default router;
