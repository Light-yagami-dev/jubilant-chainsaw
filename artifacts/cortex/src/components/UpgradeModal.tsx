import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/appStore";

const TIERS = [
  {
    key: "pro" as const,
    label: "Pro",
    price: "₹299/mo",
    badge: "✦",
    badgeColor: "text-blue-400",
    borderActive: "border-blue-500/50 bg-blue-500/8",
    btnClass: "btn-primary w-full",
    features: [
      "✓ Unlimited queries",
      "✓ PDF & image upload",
      "✓ Diagnostic engine + mastery",
      "✓ Hindi & Hinglish",
      "✓ Gemini 1.5 Pro model",
      "✓ Abstract pedagogy",
      "✓ Session dashboard",
      "✗ Multi-model comparison",
      "✗ Export & custom prompts",
    ],
  },
  {
    key: "pro_plus" as const,
    label: "Pro Plus",
    price: "₹599/mo",
    badge: "★",
    badgeColor: "text-purple-400",
    borderActive: "border-purple-400/50 bg-purple-500/8",
    btnClass: "w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-3 px-4 rounded-xl text-sm cursor-pointer",
    features: [
      "✓ Everything in Pro",
      "✓ Multi-model comparison",
      "✓ Bulk PDF upload (5 files)",
      "✓ Export session history",
      "✓ Custom system prompt",
      "✓ Priority inference",
    ],
  },
];

export default function UpgradeModal() {
  const { upgradeModal, setUpgradeModal, tier: currentTier, setTierAndEntitlements } = useAppStore();
  const [tab, setTab] = useState<"pro" | "pro_plus">("pro_plus");

  return (
    <AnimatePresence>
      {upgradeModal && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUpgradeModal(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass w-full max-w-lg pointer-events-auto shadow-glow">
              <div className="p-5 border-b border-[hsl(var(--border-c))] flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Feature locked</p>
                  <h3 className="text-lg font-bold text-text">Unlock Cortex Premium</h3>
                  <p className="text-xs text-muted mt-0.5">Choose a plan that matches your learning goals</p>
                </div>
                <button onClick={() => setUpgradeModal(false)} className="text-muted hover:text-text transition-colors text-2xl leading-none mt-1">×</button>
              </div>

              <div className="flex gap-2 p-4 border-b border-[hsl(var(--border-c))]">
                {TIERS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-1 py-2 rounded-lg text-sm font-mono font-bold border transition-all ${
                      tab === t.key ? t.borderActive + " border-opacity-100" : "border-[hsl(var(--border-c))] text-muted hover:text-text"
                    }`}
                  >
                    <span className={t.badgeColor}>{t.badge}</span> {t.label}
                    <span className="block text-xs font-normal opacity-70">{t.price}</span>
                  </button>
                ))}
              </div>

              <div className="p-5">
                {TIERS.filter((t) => t.key === tab).map((t) => (
                  <div key={t.key} className="space-y-1.5">
                    {t.features.map((f, i) => (
                      <motion.div
                        key={f}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`text-sm font-mono ${f.startsWith("✓") ? "text-text" : "text-muted/40"}`}
                      >
                        {f}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-[hsl(var(--border-c))] space-y-2">
                {TIERS.filter((t) => t.key === tab).map((t) => (
                  <button key={t.key} onClick={() => setTierAndEntitlements(t.key)} className={t.btnClass}>
                    {t.badge} Activate {t.label} (Demo)
                  </button>
                ))}
                <p className="text-center text-xs text-muted">Demo: unlocks all features for this session</p>
                <button onClick={() => setUpgradeModal(false)} className="btn-ghost w-full text-sm">
                  Continue with {currentTier === "free" ? "Free" : "current plan"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
