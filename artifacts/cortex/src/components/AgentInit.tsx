import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PulsingSphere from "@/three/PulsingSphere";
import { useAppStore } from "@/store/appStore";
import { useInvokeTutor, useUploadPdf } from "@workspace/api-client-react";

const PROMPT_SUGGESTIONS: Record<string, string[]> = {
  NEET: [
    "Explain the mechanism of action potentials in neurons",
    "What is the difference between meiosis and mitosis?",
    "Describe Bohr's model of hydrogen atom",
    "Explain osmosis and its role in plant cells",
  ],
  JEE: [
    "Derive the equation for projectile motion",
    "Explain Faraday's laws of electromagnetic induction",
    "What is the concept of chemical equilibrium?",
    "Solve: integration of sin²x dx",
  ],
  UPSC: [
    "Explain the federal structure of Indian Constitution",
    "What are the causes of soil erosion in India?",
    "Describe the Green Revolution and its impact",
    "Explain the working of the Indian Parliament",
  ],
  DEFAULT: [
    "Explain this topic with an example",
    "What are the key formulas I need to remember?",
    "Give me a step-by-step derivation",
    "What are common mistakes students make here?",
  ],
};

function ProBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-accent border border-blue-500/25">
      ✦ {label}
    </span>
  );
}

export default function AgentInit() {
  const {
    params, loading, error, entitlements, tier, setUpgradeModal,
    setLoading, setError, setAgentResult, setLastQuery, setContext,
  } = useAppStore();
  const [query, setQuery] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const suggestions = PROMPT_SUGGESTIONS[params.target_exam] ?? PROMPT_SUGGESTIONS.DEFAULT;

  const invokeTutor = useInvokeTutor({
    mutation: {
      onSuccess: (data) => {
        setAgentResult({
          final_output: data.response,
          session_id: data.conversationId,
          cache_hit: data.cacheHit,
          grading_passed: data.gradingPassed,
          mnemonics: data.mnemonics,
          weak_topics: data.weakTopics,
          revision_suggestions: data.revisionSuggestions,
        });
        setLocalLoading(false);
        setLoading(false);
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Tutor invocation failed. Please try again.";
        setError(msg);
        setLocalLoading(false);
        setLoading(false);
      },
    },
  });

  const uploadPdf = useUploadPdf({
    mutation: {
      onSuccess: (data) => {
        setContext(`[PDF: ${fileName} — ${data.topics.length} topics, ${data.chunks} chunks indexed]`);
      },
    },
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    uploadPdf.mutate({ data: { file: f, examType: params.target_exam } });
  }

  function handleInvoke() {
    const q = query.trim();
    if (!q) return;
    setLocalLoading(true);
    setLoading(true);
    setError(null);
    setLastQuery(q);
    invokeTutor.mutate({
      data: {
        userInput: q,
        targetExam: params.target_exam,
        subject: undefined,
        pedagogyStyle: params.pedagogy_style.toLowerCase() as "simplified" | "standard" | "abstract",
      },
    });
  }

  const isLoading = loading || localLoading;
  const canPDF = entitlements?.can_use_pdf;
  const queryLimit = entitlements?.query_limit;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[hsl(var(--void))]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="sphere"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-48 h-48">
              <PulsingSphere />
            </div>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <p className="text-accent font-mono text-sm">Compiling Agentic Graph…</p>
              <p className="text-muted text-xs mt-1">Routing through adversarial workflow · {params.model}</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl space-y-4"
          >
            <div className="text-center mb-6">
              <p className="tag mb-2">AGENT INITIALIZATION</p>
              <h2 className="text-2xl font-bold text-text">What would you like to learn?</h2>
              <div className="flex gap-2 justify-center mt-2 flex-wrap">
                <span className="tag">{params.target_exam}</span>
                <span className="tag">{params.pedagogy_style}</span>
                <span className="tag">{params.language}</span>
                <span className={`tag ${tier === "pro" ? "text-accent border-blue-500/40" : ""}`}>
                  {tier === "pro" || tier === "developer" ? "✦ " : ""}{params.model}
                </span>
                {queryLimit !== undefined && queryLimit > 0 && (
                  <span className="tag text-yellow-500 border-yellow-800">{queryLimit} queries/day</span>
                )}
              </div>
            </div>

            <div className="glass p-5 space-y-4">
              <textarea
                rows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && handleInvoke()}
                placeholder="Ask anything related to your exam or subject…"
                className="w-full bg-transparent text-text placeholder:text-muted text-sm outline-none resize-none font-sans leading-relaxed"
                data-testid="input-query"
              />
              <div className="flex items-center gap-3 pt-2 border-t border-[hsl(var(--border-c))]">
                {canPDF ? (
                  <>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.txt,.png"
                      onChange={handleFile}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="btn-ghost flex items-center gap-2 text-sm"
                    >
                      <span>📎</span>
                      <span>{fileName ? fileName.slice(0, 20) + "…" : "Attach context"}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setUpgradeModal(true)}
                    className="flex items-center gap-2 text-muted text-sm px-3 py-1.5 rounded-lg
                               border border-dashed border-[hsl(var(--border-c))] hover:border-blue-500/40
                               hover:text-accent transition-all group"
                  >
                    <span>📎</span>
                    <span>Attach context</span>
                    <ProBadge label="Pro" />
                  </button>
                )}
                <button
                  onClick={handleInvoke}
                  disabled={!query.trim()}
                  className="btn-primary ml-auto px-8 disabled:opacity-40"
                  data-testid="btn-launch"
                >
                  Launch →
                </button>
              </div>
            </div>

            {!query && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <p className="text-xs text-muted font-mono text-center">— or try a suggestion —</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      onClick={() => setQuery(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[hsl(var(--border-c))]
                                 text-muted hover:border-blue-500/40 hover:text-accent transition-all"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-3 text-red-400 text-sm border border-red-500/20"
              >
                {error}
              </motion.div>
            )}

            {tier === "free" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass p-3 flex items-center justify-between"
              >
                <p className="text-xs text-muted">Free plan · PDF upload, diagnostics & more locked</p>
                <button
                  onClick={() => setUpgradeModal(true)}
                  className="text-xs font-mono text-accent hover:text-glow-c transition-colors whitespace-nowrap"
                >
                  View Pro →
                </button>
              </motion.div>
            )}

            <p className="text-center text-xs text-muted font-mono">
              Ctrl+Enter to submit · Powered by {params.model}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
