import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetMasteryMap,
  useGetMasteryStats,
  useGetRevisionQueue,
  useCompleteRevision,
  useGenerateStudyPlan,
  useGetProgressSummary,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetRevisionQueueQueryKey } from "@workspace/api-client-react";
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

function scoreColorClass(score: number) {
  if (score >= 80) return "border-green-500/30 text-green-400";
  if (score >= 50) return "border-yellow-500/30 text-yellow-400";
  return "border-red-500/30 text-red-400";
}

function StatCards() {
  const { data: statsArr, isLoading } = useGetMasteryStats();

  const totals = (statsArr ?? []).reduce(
    (acc, s) => ({
      totalTopics: acc.totalTopics + s.totalTopics,
      masteredTopics: acc.masteredTopics + s.masteredTopics,
      avgScore: acc.avgScore + s.averageScore,
      count: acc.count + 1,
    }),
    { totalTopics: 0, masteredTopics: 0, avgScore: 0, count: 0 }
  );
  const avgScore = totals.count > 0 ? Math.round(totals.avgScore / totals.count) : 0;

  const cards = [
    { label: "Total Topics", value: isLoading ? "—" : totals.totalTopics, icon: "📚", color: "text-blue-400" },
    { label: "Mastered", value: isLoading ? "—" : totals.masteredTopics, icon: "✅", color: "text-green-400" },
    { label: "Avg Score", value: isLoading ? "—" : `${avgScore}%`, icon: "📊", color: "text-accent" },
    { label: "Subjects", value: isLoading ? "—" : (statsArr?.length ?? 0), icon: "🎯", color: "text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="glass p-4 text-center"
        >
          <div className="text-2xl mb-1">{card.icon}</div>
          <div className={`text-xl font-bold font-mono ${card.color}`}>{card.value}</div>
          <div className="text-xs text-muted mt-0.5">{card.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

type MasteryTab = "map" | "stats";

function MasteryPanel() {
  const [tab, setTab] = useState<MasteryTab>("map");
  const [examFilter, setExamFilter] = useState("all");
  const { data: entries, isLoading: mapLoading } = useGetMasteryMap(
    examFilter !== "all" ? { examType: examFilter } : {}
  );
  const { data: statsArr, isLoading: statsLoading } = useGetMasteryStats();

  const grouped = (entries ?? []).reduce<Record<string, typeof entries>>((acc, entry) => {
    const key = entry.subject ?? "Other";
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(entry);
    return acc;
  }, {});

  const EXAMS = ["all", "NEET", "JEE", "UPSC", "CAT", "GATE"];

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-mono text-muted uppercase tracking-widest">Mastery Map</p>
        <div className="flex gap-1">
          {(["map", "stats"] as MasteryTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                tab === t ? "bg-blue-500 text-white" : "text-muted hover:text-text"
              }`}
            >
              {t === "map" ? "Topic Map" : "By Subject"}
            </button>
          ))}
        </div>
      </div>

      {tab === "map" && (
        <>
          <div className="flex gap-1 flex-wrap">
            {EXAMS.map((ex) => (
              <button
                key={ex}
                onClick={() => setExamFilter(ex)}
                className={`px-2 py-0.5 rounded text-xs font-mono border transition-all ${
                  examFilter === ex
                    ? "bg-blue-500/20 border-blue-500/50 text-accent"
                    : "border-[hsl(var(--border-c))] text-muted hover:text-text"
                }`}
              >
                {ex === "all" ? "All" : ex}
              </button>
            ))}
          </div>
          {mapLoading ? (
            <p className="text-muted text-xs">Loading…</p>
          ) : !entries?.length ? (
            <p className="text-muted text-xs italic">No mastery data yet — run a diagnostic to begin tracking.</p>
          ) : (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([subj, items]) => (
                <div key={subj}>
                  <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">{subj}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {items?.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-lg border px-3 py-2 text-xs flex flex-col gap-0.5 ${scoreColorClass(entry.score)}`}
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono">{entry.score}%</span>
                          <span className="text-[10px] opacity-60">{entry.attempts}×</span>
                        </div>
                        <span className="text-[11px] leading-tight opacity-80 line-clamp-2">{entry.topic}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "stats" && (
        <>
          {statsLoading ? (
            <p className="text-muted text-xs">Loading…</p>
          ) : !statsArr?.length ? (
            <p className="text-muted text-xs italic">No subject stats yet.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {statsArr.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text font-medium">{s.subject} · <span className="text-muted">{s.examType}</span></p>
                    <span className="text-xs text-muted font-mono">{s.masteredTopics}/{s.totalTopics} mastered</span>
                  </div>
                  <ScoreBar score={Math.round(s.averageScore)} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatDue(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Due now";
  if (diff === 1) return "Tomorrow";
  return `In ${diff}d`;
}

function RevisionPanel() {
  const [tab, setTab] = useState<"due" | "upcoming">("due");
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useGetRevisionQueue();
  const completeRevision = useCompleteRevision({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRevisionQueueQueryKey() });
        refetch();
      },
    },
  });

  const now = new Date();
  const dueItems = (data ?? []).filter((i) => new Date(i.nextReviewAt) <= now);
  const upcomingItems = (data ?? []).filter((i) => new Date(i.nextReviewAt) > now);
  const items = tab === "due" ? dueItems : upcomingItems;

  return (
    <div className="glass p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-mono text-muted uppercase tracking-widest">Revision Queue</p>
        <div className="flex gap-1">
          {(["due", "upcoming"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                tab === t ? "bg-blue-500 text-white" : "text-muted hover:text-text"
              }`}
            >
              {t === "due" ? `Due (${dueItems.length})` : `Soon (${upcomingItems.length})`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted text-xs">Loading…</p>
      ) : !items.length ? (
        <p className="text-muted text-xs italic">
          {tab === "due" ? "No revisions due — great work!" : "No upcoming revisions queued."}
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <AnimatePresence>
            {items.map((item, i) => {
              const isDue = new Date(item.nextReviewAt) <= now;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="flex items-center justify-between gap-3 py-2 border-b border-[hsl(var(--border-c))] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text truncate">{item.topic}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted font-mono">{item.examType}</span>
                      <span className="text-[10px] text-muted">·</span>
                      <span className={`text-[10px] font-mono ${isDue ? "text-red-400" : "text-muted"}`}>
                        {formatDue(item.nextReviewAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs font-mono ${item.score < 50 ? "text-red-400" : "text-yellow-400"}`}>
                      {item.score}%
                    </span>
                    {isDue && (
                      <>
                        <button
                          onClick={() => completeRevision.mutate({ id: item.id, data: { passed: false, score: 20 } })}
                          disabled={completeRevision.isPending}
                          className="text-red-400/60 hover:text-red-400 transition-colors text-xs px-1.5 py-0.5 rounded border border-red-500/20 hover:border-red-500/40"
                          title="Missed"
                        >
                          ✗
                        </button>
                        <button
                          onClick={() => completeRevision.mutate({ id: item.id, data: { passed: true, score: 80 } })}
                          disabled={completeRevision.isPending}
                          className="text-green-400/60 hover:text-green-400 transition-colors text-xs px-1.5 py-0.5 rounded border border-green-500/20 hover:border-green-500/40"
                          title="Got it"
                        >
                          ✓
                        </button>
                      </>
                    )}
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

function ProgressPanel() {
  const { data, isLoading } = useGetProgressSummary();

  const cards = [
    { label: "Total Topics", value: isLoading ? "—" : data?.totalTopics ?? 0, icon: "📚" },
    { label: "Mastered", value: isLoading ? "—" : data?.masteredTopics ?? 0, icon: "✅" },
    { label: "Weak", value: isLoading ? "—" : data?.weakTopics ?? 0, icon: "⚠️" },
    { label: "Revision Due", value: isLoading ? "—" : data?.revisionDue ?? 0, icon: "⏰" },
    { label: "Streak", value: isLoading ? "—" : `${data?.streakDays ?? 0}d`, icon: "🔥" },
  ];

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest">Progress Summary</p>
          <p className="text-sm font-semibold text-text">Current study momentum</p>
        </div>
        <span className="tag">Progress</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[hsl(var(--border-c))] p-3 text-center text-xs">
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="font-semibold text-text">{card.value}</div>
            <div className="text-muted mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border-c))] p-4 bg-white/5">
        <p className="text-xs text-muted uppercase tracking-widest mb-3">Insights</p>
        <p className="text-sm text-text mb-3">
          {isLoading ? "Loading progress insights…" : data?.recentActivity}
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs text-muted">
          {data?.recommendedNextSteps?.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StudyPlanPanel() {
  const { params } = useAppStore();
  const [duration, setDuration] = useState(30);
  const [dailyHours, setDailyHours] = useState(4);
  const [currentLevel, setCurrentLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [weakTopics, setWeakTopics] = useState("");
  const [examDate, setExamDate] = useState("2026-06-04");

  const studyPlanMutation = useGenerateStudyPlan({
    mutation: {
      onError: () => {
        // handled by mutation state
      },
    },
  });

  const plan = studyPlanMutation.data;

  function handleCreatePlan() {
    studyPlanMutation.mutate({
      data: {
        subject: "B.Sc. Biotechnology",
        examType: "BSC_BIOTECH_PART1",
        duration,
        dailyHours,
        currentLevel,
        weakTopics: weakTopics
          .split(",")
          .map((topic) => topic.trim())
          .filter(Boolean),
        examDate,
      },
    });
  }

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest">Study Plan Generator</p>
          <h3 className="text-lg font-semibold text-text">B.Sc. Biotechnology Prep</h3>
          <p className="text-xs text-muted mt-1">Generate a personalized plan for the upcoming exam.</p>
        </div>
        <span className="tag">Exam: BSC_BIOTECH_PART1</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="space-y-1 text-xs text-muted">
          Duration (days)
          <input
            type="number"
            value={duration}
            min={7}
            max={120}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="input w-full"
          />
        </label>
        <label className="space-y-1 text-xs text-muted">
          Daily hours
          <input
            type="number"
            value={dailyHours}
            min={1}
            max={12}
            onChange={(e) => setDailyHours(Number(e.target.value))}
            className="input w-full"
          />
        </label>
        <label className="space-y-1 text-xs text-muted">
          Current level
          <select
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value as any)}
            className="input w-full"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-1 text-xs text-muted">
          Weak topics (comma-separated)
          <input
            type="text"
            value={weakTopics}
            placeholder="e.g. Enzymes, Cell Division"
            onChange={(e) => setWeakTopics(e.target.value)}
            className="input w-full"
          />
        </label>
        <label className="space-y-1 text-xs text-muted">
          Exam date
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="input w-full"
          />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-muted">Current exam selection: {params.target_exam}</p>
        <button
          onClick={handleCreatePlan}
          disabled={studyPlanMutation.status === "pending"}
          className="btn-primary"
        >
          {studyPlanMutation.status === "pending" ? "Generating…" : "Create Study Plan"}
        </button>
      </div>

      {studyPlanMutation.isError && (
        <p className="text-xs text-red-400">Unable to generate study plan — please try again.</p>
      )}

      {plan && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[hsl(var(--border-c))] p-4 bg-white/5">
            <p className="text-xs font-mono text-muted uppercase tracking-widest">Plan Summary</p>
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <div className="space-y-1">
                <p className="text-muted text-[11px]">Subject</p>
                <p className="font-semibold">{plan.subject}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted text-[11px]">Duration</p>
                <p className="font-semibold">{plan.duration} days</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted text-[11px]">Daily target</p>
                <p className="font-semibold">{Math.ceil(plan.totalTopics / plan.duration)} topics/day</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted text-[11px]">Revision sessions</p>
                <p className="font-semibold">{plan.revisionSchedule.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {plan.studyPlan.slice(0, 3).map((day) => (
              <div key={`${day.week}-${day.day}`} className="rounded-2xl border border-[hsl(var(--border-c))] p-4 bg-white/5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold">Week {day.week} · Day {day.day}</p>
                  <span className="text-[11px] text-muted">{day.date}</span>
                </div>
                <p className="text-xs text-muted mb-2">Focus: {day.focus}</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <p className="font-semibold">Topics</p>
                  <ul className="list-disc list-inside space-y-1">
                    {day.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {plan.studyPlan.length > 3 && (
              <p className="text-xs text-muted">Showing first 3 days of the plan. Scroll for more in the response object.</p>
            )}
          </div>
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
      <div className="mb-4">
        <p className="tag mb-2">PERSISTENCE LAYER</p>
        <h2 className="text-2xl font-bold text-text">Learning Dashboard</h2>
        <p className="text-muted text-sm mt-1">Session history · Mastery scores · Revision queue</p>
      </div>

      <StatCards />
      <ProgressPanel />

      <MasteryPanel />
      <RevisionPanel />
      <StudyPlanPanel />

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
