import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useAppStore } from "@/store/appStore";
import { useGeneratePractice, useRunDiagnostic, useAddToRevisionQueue } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetRevisionQueueQueryKey } from "@workspace/api-client-react";

function useTTS() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text: string, lang = "en-IN") => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 2000));
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, speak, stop };
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <div className="prose-dark text-sm leading-relaxed">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

function Panel({
  title, children, defaultOpen = false,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-sm text-text">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-muted text-xs">▼</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-[hsl(var(--border-c))]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TutorInterface() {
  const {
    agentResult, practiceOutput, diagnosticOutput,
    entitlements, reset, lastQuery, params, setPractice, setDiagnostic, setPhase,
  } = useAppStore();

  const [diagAnswer, setDiagAnswer] = useState("");
  const [diagScore, setDiagScore] = useState<number | null>(null);
  const [revisionAdded, setRevisionAdded] = useState(false);
  const [revisionBadges, setRevisionBadges] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const { speaking, speak, stop } = useTTS();

  const ttsLang = params.language === "Hindi" ? "hi-IN"
    : params.language === "Hinglish" ? "hi-IN"
    : "en-IN";

  const practiceMutation = useGeneratePractice({
    mutation: {
      onSuccess: (data) => setPractice(data.questions),
    },
  });

  const diagnosticMutation = useRunDiagnostic({
    mutation: {
      onSuccess: (data) => {
        setDiagnostic(data.evaluation);
        if (data.score !== undefined && data.score >= 0) {
          setDiagScore(data.score);
        }
        if (data.score !== undefined && data.score < 5) {
          addRevisionAuto.mutate({
            data: {
              topic: lastQuery.slice(0, 80) || params.target_exam,
              subject: "General",
              examType: params.target_exam,
              score: Math.round(data.score * 10),
            },
          });
        }
      },
    },
  });

  const addRevision = useAddToRevisionQueue({
    mutation: {
      onSuccess: () => {
        setRevisionAdded(true);
        queryClient.invalidateQueries({ queryKey: getGetRevisionQueueQueryKey() });
      },
    },
  });

  const addRevisionAuto = useAddToRevisionQueue({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRevisionQueueQueryKey() });
      },
    },
  });

  const addRevisionSuggestion = useAddToRevisionQueue({
    mutation: {
      onSuccess: (_data, variables) => {
        setRevisionBadges((prev) => ({ ...prev, [variables.data.topic]: true }));
        queryClient.invalidateQueries({ queryKey: getGetRevisionQueueQueryKey() });
      },
    },
  });

  function handlePractice() {
    if (!agentResult?.final_output) return;
    practiceMutation.mutate({
      data: {
        context: agentResult.final_output,
        targetExam: params.target_exam,
        language: params.language,
        model: params.model,
      },
    });
  }

  function handleDiagnose() {
    if (!diagAnswer.trim() || !agentResult?.final_output) return;
    diagnosticMutation.mutate({
      data: {
        studentAnswer: diagAnswer,
        reference: agentResult.final_output,
        targetExam: params.target_exam,
        language: params.language,
        model: params.model,
      },
    });
  }

  function handleAddRevision() {
    const topic = lastQuery.slice(0, 80) || params.target_exam;
    addRevision.mutate({
      data: {
        topic,
        subject: "General",
        examType: params.target_exam,
        score: diagScore !== null && diagScore < 3 ? 20 : 50,
      },
    });
  }

  function handleSpeakToggle() {
    if (speaking) {
      stop();
    } else if (agentResult?.final_output) {
      speak(agentResult.final_output, ttsLang);
    }
  }

  if (!agentResult) return null;

  const canDiagnose = entitlements?.can_view_diagnostics !== false;

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto space-y-4 bg-[hsl(var(--void))]">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-2 flex-wrap gap-2"
      >
        <div>
          <p className="tag mb-1">TUTOR RESPONSE</p>
          <h2 className="text-xl font-bold text-text">Cortex Omni · Analysis</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {agentResult.session_id && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="tag text-green-400 border-green-800"
            >
              ✓ Saved
            </motion.span>
          )}
          {agentResult.cache_hit && (
            <span className="tag text-blue-400 border-blue-800">⚡ Cache</span>
          )}
          {!agentResult.grading_passed && (
            <span className="tag text-yellow-400 border-yellow-800">⚠ Unverified</span>
          )}
          <button
            onClick={handleSpeakToggle}
            className={`btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5 ${speaking ? "text-accent" : ""}`}
            title={speaking ? "Stop speaking" : "Listen"}
          >
            {speaking ? "🔊 Stop" : "🔈 Listen"}
          </button>
          <button onClick={() => setPhase("dashboard")} className="btn-ghost text-xs px-2 py-1">📊</button>
          <button onClick={reset} className="btn-ghost">← New Query</button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6"
      >
        <MarkdownBlock content={agentResult.final_output} />
      </motion.div>

      {agentResult.mnemonics && agentResult.mnemonics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Panel title="💡 Mnemonics & Memory Anchors" defaultOpen>
            <ul className="space-y-2 mt-2">
              {agentResult.mnemonics.map((m, i) => (
                <li key={i} className="text-sm text-text/80 pl-3 border-l-2 border-blue-500/40">{m}</li>
              ))}
            </ul>
          </Panel>
        </motion.div>
      )}

      {agentResult.weak_topics && agentResult.weak_topics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Panel title="⚠ Identified Weak Areas">
            <div className="flex flex-wrap gap-2 mt-2">
              {agentResult.weak_topics.map((t, i) => (
                <span key={i} className="tag text-yellow-400 border-yellow-800">{t}</span>
              ))}
            </div>
          </Panel>
        </motion.div>
      )}

      {agentResult.revision_suggestions && agentResult.revision_suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <Panel title="📌 Revision Suggestions" defaultOpen>
            <p className="text-xs text-muted mb-3 mt-1">Click any topic to queue it for spaced repetition</p>
            <div className="flex flex-wrap gap-2">
              {agentResult.revision_suggestions.map((topic, i) => {
                const queued = revisionBadges[topic];
                return (
                  <button
                    key={i}
                    onClick={() =>
                      !queued && addRevisionSuggestion.mutate({
                        data: {
                          topic,
                          subject: "General",
                          examType: params.target_exam,
                          score: 50,
                        },
                      })
                    }
                    className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border transition-all ${
                      queued
                        ? "border-green-500/40 text-green-400 bg-green-500/10 cursor-default"
                        : "border-[hsl(var(--border-c))] text-muted hover:border-blue-500/40 hover:text-accent cursor-pointer"
                    }`}
                  >
                    {queued ? "✓" : "+"} {topic}
                  </button>
                );
              })}
            </div>
          </Panel>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <button
          onClick={handlePractice}
          disabled={practiceMutation.isPending}
          className="glass glass-hover px-4 py-4 text-left disabled:opacity-50 transition-all"
        >
          <p className="text-accent text-lg mb-1">🎯</p>
          <p className="font-semibold text-sm text-text">Practice Questions</p>
          <p className="text-xs text-muted mt-1">
            {practiceMutation.isPending ? "Generating…" : "Generate exam-style problems"}
          </p>
        </button>

        {canDiagnose ? (
          <button
            onClick={() => diagnosticOutput === null && setDiagnostic("")}
            className="glass glass-hover px-4 py-4 text-left transition-all"
          >
            <p className="text-accent text-lg mb-1">🔍</p>
            <p className="font-semibold text-sm text-text">Diagnose My Answer</p>
            <p className="text-xs text-muted mt-1">Trace-back error analysis</p>
          </button>
        ) : (
          <button
            onClick={() => useAppStore.getState().setUpgradeModal(true)}
            className="glass px-4 py-4 text-left opacity-50 cursor-pointer hover:opacity-70 transition-all"
          >
            <p className="text-lg mb-1">🔒</p>
            <p className="font-semibold text-sm text-text">Diagnostics</p>
            <p className="text-xs text-muted mt-1">Pro plan required</p>
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {practiceOutput && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Panel title="🎯 Practice Questions" defaultOpen>
              <MarkdownBlock content={practiceOutput} />
            </Panel>
          </motion.div>
        )}

        {diagnosticOutput !== null && (
          <motion.div
            key="diagnostic"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Panel title="🔍 Diagnostic Engine — Trace-Back" defaultOpen>
              <textarea
                rows={4}
                value={diagAnswer}
                onChange={(e) => setDiagAnswer(e.target.value)}
                placeholder="Write your answer or solution process here…"
                className="w-full glass border border-[hsl(var(--border-c))] rounded-xl px-4 py-3
                           text-sm text-text placeholder:text-muted outline-none
                           focus:border-blue-500/60 transition-colors resize-none mb-3 font-sans"
              />
              <button
                onClick={handleDiagnose}
                disabled={diagnosticMutation.isPending || !diagAnswer.trim()}
                className="btn-primary disabled:opacity-40"
              >
                {diagnosticMutation.isPending ? "Analyzing…" : "▶ Execute Diagnostic"}
              </button>

              {diagnosticOutput && (
                <div className="mt-4 pt-4 border-t border-[hsl(var(--border-c))] space-y-4">
                  <MarkdownBlock content={diagnosticOutput} />

                  {diagScore !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between glass p-4 mt-2"
                    >
                      <div>
                        <p className="text-xs text-muted font-mono mb-1">MASTERY SCORE</p>
                        <p className={`text-2xl font-bold font-mono ${
                          diagScore >= 7 ? "text-green-400" : diagScore >= 4 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {diagScore.toFixed(1)}<span className="text-sm text-muted">/10</span>
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {diagScore >= 7
                            ? "Strong understanding"
                            : diagScore >= 4
                            ? "Needs reinforcement"
                            : "⚠ Auto-queued for revision"}
                        </p>
                      </div>
                      {!revisionAdded ? (
                        <button onClick={handleAddRevision} className="btn-ghost text-xs flex items-center gap-1.5">
                          📌 Add to Revision Queue
                        </button>
                      ) : (
                        <span className="tag text-green-400 border-green-800">✓ Queued</span>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
