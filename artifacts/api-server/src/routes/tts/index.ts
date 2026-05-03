import { Router } from "express";
import { SynthesizeSpeechBody } from "@workspace/api-zod";

const router = Router();

const VOICE_MAP = {
  english: { voice: "en-IN-NeerjaNeural", lang: "en-IN", name: "Neerja (English)" },
  hindi: { voice: "hi-IN-SwaraNeural", lang: "hi-IN", name: "Swara (Hindi)" },
  hinglish: { voice: "hi-IN-MadhurNeural", lang: "hi-IN", name: "Madhur (Hinglish)" },
};

router.post("/synthesize", async (req, res) => {
  try {
    const parsed = SynthesizeSpeechBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { language } = parsed.data;
    const voiceInfo = VOICE_MAP[language as keyof typeof VOICE_MAP] ?? VOICE_MAP.english;

    res.json({
      audioBase64: "",
      mimeType: "audio/mpeg",
      voice: voiceInfo.voice,
      lang: voiceInfo.lang,
      voiceName: voiceInfo.name,
    });
  } catch (err) {
    req.log.error({ err }, "TTS synthesis failed");
    res.status(500).json({ error: "TTS synthesis failed" });
  }
});

export default router;
