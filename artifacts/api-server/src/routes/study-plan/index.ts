import { Router } from "express";
import { z } from "zod";
import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import { syllabusChunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const StudyPlanRequestSchema = z.object({
  subject: z.string().optional(),
  examType: z.string().default("BSC_BIOTECH_PART1"),
  duration: z.number().min(1).max(365).default(30), // days
  dailyHours: z.number().min(1).max(12).default(4),
  currentLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  weakTopics: z.array(z.string()).optional(),
  examDate: z.string().optional(), // ISO date string
});

const StudyPlanResponseSchema = z.object({
  subject: z.string(),
  duration: z.number(),
  dailyHours: z.number(),
  totalTopics: z.number(),
  studyPlan: z.array(z.object({
    week: z.number(),
    day: z.number(),
    date: z.string(),
    topics: z.array(z.string()),
    estimatedHours: z.number(),
    focus: z.string(),
    objectives: z.array(z.string()),
  })),
  revisionSchedule: z.array(z.object({
    date: z.string(),
    topics: z.array(z.string()),
    type: z.enum(["quick", "comprehensive", "practice"]),
  })),
  tips: z.array(z.string()),
  milestones: z.array(z.string()),
});

type StudyPlanRequest = z.infer<typeof StudyPlanRequestSchema>;
type StudyPlanResponse = z.infer<typeof StudyPlanResponseSchema>;

router.post("/", async (req, res) => {
  try {
    const {
      subject = "Biotechnology",
      examType,
      duration,
      dailyHours,
      currentLevel,
      weakTopics = [],
      examDate
    } = StudyPlanRequestSchema.parse(req.body);

    // Get all syllabus topics for the exam type
    const syllabusData = await db
      .select({
        topic: syllabusChunksTable.topic,
        heading: syllabusChunksTable.heading,
        examType: syllabusChunksTable.examType,
      })
      .from(syllabusChunksTable)
      .where(eq(syllabusChunksTable.examType, examType));

    // If no syllabus data, use default topics
    const topics = syllabusData.length > 0
      ? syllabusData.map(s => s.topic)
      : [
          "Cell Biology", "Biochemistry", "Molecular Biology",
          "Genetics", "Microbiology", "Immunology",
          "Plant Biotechnology", "Animal Biotechnology",
          "Environmental Biotechnology", "Bioinformatics"
        ];

    // Generate personalized study plan using AI
    const prompt = `You are an expert B.Sc. Biotechnology study planner. Create a comprehensive ${duration}-day study plan for ${examType} exam.

Subject: ${subject}
Duration: ${duration} days
Daily study hours: ${dailyHours}
Current level: ${currentLevel}
${weakTopics.length > 0 ? `Weak topics to focus on: ${weakTopics.join(", ")}` : ""}
${examDate ? `Exam date: ${examDate}` : ""}

Available topics: ${topics.join(", ")}

Please structure your response as a JSON object with the following fields:
- subject: The subject name
- duration: Number of days
- dailyHours: Daily study hours
- totalTopics: Total number of topics to cover
- studyPlan: Array of daily study plans with:
  - week: Week number
  - day: Day number
  - date: ISO date string
  - topics: Array of topics for the day
  - estimatedHours: Hours for the day
  - focus: Main focus area
  - objectives: Array of learning objectives
- revisionSchedule: Array of revision sessions with date, topics, and type
- tips: Array of study tips
- milestones: Array of key milestones

Consider the student's current level and allocate time appropriately. Include regular revision, practice sessions, and breaks. Make it realistic and achievable.

Response must be valid JSON only.`;

    const response = await ai.generateContent({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      maxTokens: 3000,
    });

    if (!response.text) {
      throw new Error("Failed to generate study plan");
    }

    // Parse the JSON response
    let studyPlanData: StudyPlanResponse;
    try {
      studyPlanData = JSON.parse(response.text);
    } catch (parseError) {
      // If JSON parsing fails, create a basic structure
      const startDate = new Date();
      const plan = [];

      for (let day = 1; day <= duration; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + day - 1);

        plan.push({
          week: Math.ceil(day / 7),
          day,
          date: date.toISOString().split('T')[0],
          topics: topics.slice((day - 1) * 2, day * 2),
          estimatedHours: dailyHours,
          focus: `Day ${day} focus`,
          objectives: [`Complete topics for day ${day}`],
        });
      }

      studyPlanData = {
        subject,
        duration,
        dailyHours,
        totalTopics: topics.length,
        studyPlan: plan,
        revisionSchedule: [],
        tips: ["Study regularly", "Take breaks", "Practice problems"],
        milestones: ["Complete syllabus", "Finish revisions", "Take mock tests"],
      };
    }

    res.json(studyPlanData);
  } catch (error) {
    console.error("Error generating study plan:", error);
    res.status(500).json({
      error: "Failed to generate study plan",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;