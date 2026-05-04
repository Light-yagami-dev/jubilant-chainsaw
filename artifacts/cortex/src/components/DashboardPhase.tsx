import { motion, AnimatePresence } from "framer-motion";
import { useGetMasteryMap, useGetRevisionQueue, useCompleteRevision } from "@workspace/api-client-react";
import { useAppStore } from "@/store/appStore";

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score));
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-[hsl(var(--border-c))] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function MasteryPanel() {
  const { data, isLoading } = useGetMasteryMap();

  return (
    <div className="glass p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-mono text-muted uppercase tracking-widest">Mastery Scores</p>
        <span className="tag">{data?.length ?? 0} topics</span>
      </div>
      {isLoading ? (
        <p className="text-muted text-xs">Loading…</p>
      ) : !data?.length ? (
        <p className="text-muted text-xs italic">No mastery data yet — run a diagnostic to begin tracking.</p>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {data.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text truncate">{m.topic}</p>
                <p className="text-xs text-muted font-mono">{m.examType} · {m.attempts}×</p>
              </div>
              <ScoreBar score={m.score} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function RevisionPanel() {
  const { data, isLoading, refetch } = useGetRevisionQueue();
  const completeRevision = useCompleteRevision({ mutation: { onSuccess: () => refetch() } });

  const diffColor: Record<string, string> = {
    easy: "#10b981", medium: "#f59e0b", hard: "#ef4444",
  };

  return (
    <div className="glass p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-mono text-muted uppercase tracking-widest">Revision Queue</p>
        <span className="tag">{data?.length ?? 0} pending</span>
      </div>
      {isLoading ? (
        <p className="text-muted text-xs">Loading…</p>
      ) : !data?.length ? (
        <p className="text-muted text-xs italic">Queue is clear — topics flagged for revision will appear here.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <AnimatePresence>
            {data.map((item, i) => {
              const difficulty = item.score < 40 ? "hard" : item.score < 70 ? "medium" : "easy";
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="flex items-center justify-between gap-3 py-1.5 border-b border-[hsl(var(--border-c))] last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-text truncate">{item.topic}</p>
                    <p className="text-xs text-muted font-mono">{item.examType}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="tag" style={{ color: diffColor[difficulty], borderColor: diffColor[difficulty] }}>
                      {difficulty}
                    </span>
                    <button
                      onClick={() => completeRevision.mutate({ id: item.id, data: { passed: true, score: 80 } })}
                      className="text-muted hover:text-green-400 transition-colors text-xs"
                      title="Mark done"
                    >
                      ✓
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface HistoryPanelProps {
  onReplay: (query: string) => void;
}

function HistoryPanel({ onReplay }: HistoryPanelProps) {
  const { agentResult, lastQuery, params } = useAppStore();

  if (!agentResult && !lastQuery) {
    return (
      <div className="glass p-5">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Session History</p>
        <p className="text-muted text-xs italic">No sessions yet — your tutoring history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="glass p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-mono text-muted uppercase tracking-widest">Current Session</p>
        <span className="tag">1 session</span>
      </div>
      {lastQuery && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-white/4 border border-[hsl(var(--border-c))] hover:border-blue-500/30
                     transition-all cursor-pointer group"
          onClick={() => onReplay(lastQuery)}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="tag">{params.target_exam}</span>
            <span className="text-xs text-muted font-mono shrink-0">Just now</span>
          </div>
          <p className="text-xs text-text line-clamp-1 group-hover:text-accent transition-colors">{lastQuery}</p>
          {agentResult?.final_output && (
            <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
              {agentResult.final_output.slice(0, 120)}…
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function DashboardPhase({ onReplay }: { onReplay: (query: string) => void }) {
  const { setPhase } = useAppStore();

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto space-y-4 bg-[hsl(var(--void))]">
      <div className="mb-6">
        <p className="tag mb-2">PERSISTENCE LAYER</p>
        <h2 className="text-2xl font-bold text-text">Learning Dashboard</h2>
        <p className="text-muted text-sm mt-1">Session history · Mastery scores · Revision queue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MasteryPanel />
        <RevisionPanel />
      </div>

      <HistoryPanel onReplay={onReplay} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <p className="font-semibold text-text text-sm">Ready for another session?</p>
          <p className="text-xs text-muted mt-0.5">Ask the AI tutor any question with adversarial accuracy checking.</p>
        </div>
        <button onClick={() => setPhase("agent")} className="btn-primary whitespace-nowrap">
          New Query →
        </button>
      </motion.div>
    </div>
  );
}
