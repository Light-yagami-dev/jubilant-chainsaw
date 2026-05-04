import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/appStore";
import AuthGateway from "@/components/AuthGateway";
import ParameterMatrix from "@/components/ParameterMatrix";
import AgentInit from "@/components/AgentInit";
import TutorInterface from "@/components/TutorInterface";
import UpgradeModal from "@/components/UpgradeModal";
import DashboardPhase from "@/components/DashboardPhase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.35 },
};

const TIER_STYLE: Record<string, { label: string; cls: string }> = {
  free:      { label: "Free",       cls: "text-muted border-[hsl(var(--border-c))]" },
  pro:       { label: "✦ Pro",      cls: "text-accent border-blue-500/40" },
  pro_plus:  { label: "★ Pro Plus", cls: "text-purple-400 border-purple-400/40" },
  developer: { label: "⚡ DEV",     cls: "text-orange-400 border-orange-400/50 bg-orange-400/10" },
};

function TopBar() {
  const { user, params, phase, tier, setPhase, setUpgradeModal } = useAppStore();
  if (!user || phase === "auth") return null;

  const STEPS = [
    { id: "params",    label: "Parameters" },
    { id: "agent",     label: "Query" },
    { id: "tutor",     label: "Response" },
    { id: "dashboard", label: "Dashboard" },
  ] as const;

  const phaseOrder: Record<string, number> = { params: 0, agent: 1, tutor: 2, dashboard: 3 };
  const current = phaseOrder[phase] ?? 0;
  const ts = TIER_STYLE[tier] || TIER_STYLE.free;

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3
                 border-b border-[hsl(var(--border-c))] bg-[hsl(var(--void))]/85 backdrop-blur-glass"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono font-bold text-accent tracking-wide text-sm">CORTEX OMNI</span>
        <button
          onClick={() => tier === "free" ? setUpgradeModal(true) : undefined}
          className={`tag text-xs px-2 py-0.5 border rounded-full font-mono transition-all ${ts.cls} ${
            tier === "free" ? "cursor-pointer hover:opacity-80" : "cursor-default"
          }`}
        >
          {ts.label}
        </button>
        {tier === "developer" && (
          <span className="text-xs font-mono text-orange-400/60">{user?.name} · owner</span>
        )}
      </div>

      <nav className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isDone   = phaseOrder[step.id] < current;
          const isActive = step.id === phase;
          const canNav   = phaseOrder[step.id] <= current || step.id === "dashboard";
          return (
            <button
              key={step.id}
              onClick={() => canNav && setPhase(step.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                isActive   ? "bg-blue-500 text-white"
                : isDone   ? "text-text hover:text-accent cursor-pointer"
                : step.id === "dashboard" ? "text-muted hover:text-accent cursor-pointer"
                : "text-muted cursor-default opacity-40"
              }`}
            >
              {step.id === "dashboard" ? "📊" : `${i + 1}.`} {step.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted hidden sm:block font-mono">{params.model}</span>
        <button onClick={() => setPhase("params")} className="btn-ghost text-xs px-2 py-1" title="Settings">
          ⚙
        </button>
      </div>
    </motion.header>
  );
}

function PhaseContent() {
  const { phase, setPhase, reset } = useAppStore();

  function handleReplay(query: string) {
    reset();
    setPhase("agent");
    useAppStore.setState({ lastQuery: query });
  }

  return (
    <div className={phase !== "auth" ? "pt-14" : ""}>
      <AnimatePresence mode="wait">
        {phase === "auth" && (
          <motion.div key="auth" {...FADE}>
            <AuthGateway />
          </motion.div>
        )}
        {phase === "params" && (
          <motion.div key="params" {...FADE}>
            <ParameterMatrix onProceed={() => setPhase("agent")} />
          </motion.div>
        )}
        {phase === "agent" && (
          <motion.div key="agent" {...FADE}>
            <AgentInit />
          </motion.div>
        )}
        {phase === "tutor" && (
          <motion.div key="tutor" {...FADE}>
            <TutorInterface />
          </motion.div>
        )}
        {phase === "dashboard" && (
          <motion.div key="dashboard" {...FADE}>
            <DashboardPhase onReplay={handleReplay} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-[hsl(var(--void))]">
          <UpgradeModal />
          <TopBar />
          <PhaseContent />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
