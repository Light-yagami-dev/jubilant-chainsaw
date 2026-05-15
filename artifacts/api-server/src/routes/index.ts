import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini";
import tutorRouter from "./tutor";
import masteryRouter from "./mastery";
import revisionRouter from "./revision";
import ttsRouter from "./tts";
import ingestRouter from "./ingest";
import explainRouter from "./explain";
import studyPlanRouter from "./study-plan";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gemini", geminiRouter);
router.use("/tutor", tutorRouter);
router.use("/mastery", masteryRouter);
router.use("/revision", revisionRouter);
router.use("/tts", ttsRouter);
router.use("/ingest", ingestRouter);
router.use("/explain", explainRouter);
router.use("/study-plan", studyPlanRouter);

export default router;
