import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IsoNodeCluster from "@/three/IsoNodeCluster";
import { useAppStore, TIER_ENTITLEMENTS, type Role, type Tier } from "@/store/appStore";

const ROLE_META: Record<Role, { emoji: string; desc: string }> = {
  student:  { emoji: "🎓", desc: "Adaptive tutoring, practice & diagnostics" },
  educator: { emoji: "📚", desc: "Full access — create, diagnose, monitor" },
  parent:   { emoji: "👨‍👩‍👧", desc: "Progress tracking & insights dashboard" },
};

const TIER_DATA: Record<string, {
  label: string; price: string; color: string; activeColor: string; tag: string;
  features: { text: string; ok: boolean }[];
}> = {
  free: {
    label: "Free", price: "₹0",
    color: "border-[hsl(var(--border-c))]", activeColor: "border-[hsl(var(--border-c))] bg-white/5",
    tag: "text-muted",
    features: [
      { text: "5 queries / day",          ok: true  },
      { text: "Practice questions",        ok: true  },
      { text: "English only",              ok: true  },
      { text: "PDF / image upload",        ok: false },
      { text: "Diagnostic engine",         ok: false },
      { text: "Hindi & Hinglish",          ok: false },
      { text: "Advanced AI models",        ok: false },
      { text: "Session dashboard",         ok: false },
    ],
  },
  pro: {
    label: "Pro", price: "₹299",
    color: "border-blue-500/30", activeColor: "border-blue-500 bg-blue-500/10 shadow-glow",
    tag: "text-accent",
    features: [
      { text: "Unlimited queries",         ok: true  },
      { text: "Practice questions",        ok: true  },
      { text: "PDF & image upload",        ok: true  },
      { text: "Diagnostic + mastery",      ok: true  },
      { text: "Hindi & Hinglish",          ok: true  },
      { text: "Gemini 1.5 Pro model",      ok: true  },
      { text: "Abstract pedagogy",         ok: true  },
      { text: "Session dashboard",         ok: true  },
    ],
  },
  pro_plus: {
    label: "Pro Plus", price: "₹599",
    color: "border-purple-500/30", activeColor: "border-purple-400 bg-purple-500/10 shadow-[0_0_24px_rgba(168,85,247,0.25)]",
    tag: "text-purple-400",
    features: [
      { text: "Everything in Pro",         ok: true  },
      { text: "Multi-model comparison",    ok: true  },
      { text: "Export session history",    ok: true  },
      { text: "Custom system prompt",      ok: true  },
      { text: "Bulk PDF (5 files)",        ok: true  },
      { text: "Priority inference",        ok: true  },
    ],
  },
};

function TierCard({ tier, selected, onSelect }: { tier: Tier; selected: boolean; onSelect: () => void }) {
  const d = TIER_DATA[tier];
  if (!d) return null;
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      data-testid={`tier-${tier}`}
      className={`flex-1 min-w-[130px] rounded-xl p-3 text-left border transition-all duration-200 ${
        selected ? d.activeColor : `${d.color} glass hover:brightness-110`
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className={`text-xs font-mono font-bold uppercase tracking-widest ${d.tag}`}>
            {tier === "pro_plus" ? "★ " : tier === "pro" ? "✦ " : ""}{d.label}
          </span>
          <p className="text-base font-bold text-text mt-0.5">
            {d.price}<span className="text-muted text-xs font-normal">/mo</span>
          </p>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              tier === "pro_plus" ? "bg-purple-500" : tier === "pro" ? "bg-blue-500" : "bg-border"
            }`}
          >✓</motion.div>
        )}
      </div>
      <ul className="space-y-0.5">
        {d.features.map((f, i) => (
          <li key={i} className={`text-xs font-mono ${f.ok ? "text-text/80" : "text-muted/35 line-through"}`}>
            {f.ok ? "✓" : "✗"} {f.text}
          </li>
        ))}
      </ul>
    </motion.button>
  );
}

export default function AuthGateway() {
  const { login } = useAppStore();
  const [selected, setSelected] = useState<Role | null>(null);
  const [tier, setTier] = useState<Tier>("free");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [devKey, setDevKey] = useState("");
  const [showDev, setShowDev] = useState(false);
  const [devError, setDevError] = useState("");

  async function handleEnter() {
    if (!selected) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login({
      name: name.trim() || "Learner",
      role: selected,
      tier,
      entitlements: TIER_ENTITLEMENTS[tier],
    });
    setLoading(false);
  }

  function handleDevLogin() {
    if (devKey.trim() === "cortex-dev-2025") {
      login({
        name: name.trim() || "Developer",
        role: "educator",
        tier: "developer",
        entitlements: TIER_ENTITLEMENTS["developer"],
      });
    } else {
      setDevError("Invalid bypass key. Access denied.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[hsl(var(--void))]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, hsl(var(--accent-c) / 0.06) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-4 z-10"
      >
        <p className="tag mb-3">BUILD 2.2.0 · SPATIAL AI</p>
        <h1 className="text-5xl font-bold text-text tracking-tight">
          CORTEX <span className="text-accent">OMNI</span>
        </h1>
        <p className="text-muted text-sm font-mono mt-2">
          Adaptive · Multi-Modal · Exam-Native Learning Engine
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-xl h-56 z-10"
      >
        <IsoNodeCluster onSelect={setSelected} selected={selected} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-muted text-sm font-mono mb-4 z-10"
      >
        Select your role node to continue
      </motion.p>

      <AnimatePresence>
        {selected && !loading && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="glass p-6 w-full max-w-2xl z-10 space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{ROLE_META[selected]?.emoji}</span>
              <div>
                <p className="font-semibold capitalize text-text">{selected}</p>
                <p className="text-xs text-muted">{ROLE_META[selected]?.desc}</p>
              </div>
            </div>

            <input
              className="w-full glass border border-[hsl(var(--border-c))] rounded-xl px-4 py-2.5
                         text-sm text-text placeholder:text-muted outline-none focus:border-blue-500/60 transition-colors"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-name"
            />

            <div>
              <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Select Plan</p>
              <div className="flex gap-2 flex-wrap">
                {(["free", "pro", "pro_plus"] as Tier[]).map((t) => (
                  <TierCard key={t} tier={t} selected={tier === t} onSelect={() => setTier(t)} />
                ))}
              </div>
            </div>

            <button
              onClick={handleEnter}
              className="btn-primary w-full py-3.5 text-base"
              data-testid="btn-enter"
            >
              Enter Cortex →
            </button>
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="z-10 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"
            />
            <p className="text-accent font-mono text-sm">Initializing session…</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 z-10">
        {!showDev ? (
          <button
            onClick={() => setShowDev(true)}
            className="text-xs text-muted/30 hover:text-muted/60 transition-colors font-mono"
          >
            dev access
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-center"
          >
            <input
              type="password"
              placeholder="bypass key"
              value={devKey}
              onChange={(e) => { setDevKey(e.target.value); setDevError(""); }}
              className="glass border border-[hsl(var(--border-c))] rounded-lg px-3 py-1.5 text-xs text-text placeholder:text-muted outline-none w-40"
              data-testid="input-dev-key"
            />
            <button onClick={handleDevLogin} className="btn-ghost text-xs px-3 py-1.5">→</button>
            {devError && <span className="text-xs text-red-400 font-mono">{devError}</span>}
          </motion.div>
        )}
      </div>
    </div>
  );
}
