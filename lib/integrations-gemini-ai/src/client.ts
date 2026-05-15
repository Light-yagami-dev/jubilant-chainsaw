import { GoogleGenAI } from "@google/genai";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL?.trim() ?? "https://openrouter.ai";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL?.trim() ?? "gpt-4o-mini";
const GEMINI_BASE_URL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL?.trim();
const GEMINI_API_KEY = process.env.AI_INTEGRATIONS_GEMINI_API_KEY?.trim();

function joinParts(parts: Array<{ text?: string }>): string {
  return parts
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();
}

function normalizeRole(role: string): "system" | "user" | "assistant" {
  if (role === "assistant" || role === "model") return "assistant";
  if (role === "system") return "system";
  return "user";
}

function buildMessages(contents: Array<{ role: string; parts: Array<{ text?: string }> }>) {
  return contents.map((content) => ({
    role: normalizeRole(content.role),
    content: joinParts(content.parts),
  }));
}

function getOpenRouterModel(model?: string) {
  if (!model) return OPENROUTER_MODEL;
  return model.startsWith("gemini-") ? OPENROUTER_MODEL : model;
}

async function openRouterGenerateContent(props: any): Promise<{ text: string }> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY must be set to use OpenRouter.");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL.replace(/\/+$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenRouterModel(props.model),
      messages: buildMessages(props.contents),
      max_tokens: props.config?.maxOutputTokens,
      temperature: props.config?.temperature,
      top_p: props.config?.topP,
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenRouter request failed ${response.status}: ${body}`);
  }

  const json = (await response.json()) as any;
  const text = json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? "";
  return { text };
}

async function* openRouterGenerateContentStream(props: any): AsyncGenerator<{ text?: string }> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY must be set to use OpenRouter.");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL.replace(/\/+$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenRouterModel(props.model),
      messages: buildMessages(props.contents),
      max_tokens: props.config?.maxOutputTokens,
      temperature: props.config?.temperature,
      top_p: props.config?.topP,
      stream: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenRouter stream request failed ${response.status}: ${body}`);
  }

  if (!response.body) {
    throw new Error("OpenRouter stream response has no body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  let hasYielded = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const chunk = JSON.parse(payload);
        const delta = chunk?.choices?.[0]?.delta;
        const text = delta?.content ?? chunk?.choices?.[0]?.message?.content ?? chunk?.choices?.[0]?.text;
        if (text) {
          hasYielded = true;
          yield { text };
        }
      } catch {
        continue;
      }
    }
  }

  if (buffer.trim().startsWith("data:")) {
    const payload = buffer.trim().slice(5).trim();
    if (payload !== "[DONE]") {
      try {
        const chunk = JSON.parse(payload);
        const delta = chunk?.choices?.[0]?.delta;
        const text = delta?.content ?? chunk?.choices?.[0]?.message?.content ?? chunk?.choices?.[0]?.text;
        if (text) {
          hasYielded = true;
          yield { text };
        }
      } catch {
      }
    }
  }

  if (!hasYielded) {
    const fallback = await openRouterGenerateContent(props);
    if (fallback.text) {
      yield { text: fallback.text };
    }
  }
}

function assertGeminiConfigured(): void {
  if (!GEMINI_BASE_URL) {
    throw new Error(
      "AI_INTEGRATIONS_GEMINI_BASE_URL must be set. Did you forget to provision the Gemini AI integration?",
    );
  }

  if (!GEMINI_API_KEY) {
    throw new Error(
      "AI_INTEGRATIONS_GEMINI_API_KEY must be set. Did you forget to provision the Gemini AI integration?",
    );
  }
}

let ai: any;
if (OPENROUTER_API_KEY) {
  ai = {
    models: {
      generateContent: openRouterGenerateContent,
      generateContentStream: openRouterGenerateContentStream,
    },
  };
} else {
  assertGeminiConfigured();
  ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      apiVersion: "",
      baseUrl: GEMINI_BASE_URL,
    },
  });
}

export { ai };
