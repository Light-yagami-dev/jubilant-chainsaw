import { motion } from "framer-motion";
import { useAppStore, type TargetExam, type PedagogyStyle, type Language, type ModelId } from "@/store/appStore";

const EXAMS: TargetExam[] = ["JEE", "NEET", "UPSC", "CAT", "GATE", "SAT", "GRE", "GMAT", "IELTS", "Class 10", "Class 12"];
const MODELS: ModelId[] = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
const STYLES: PedagogyStyle[] = ["Simplified", "Standard", "Abstract"];
const LANGS: Language[] = ["English", "Hindi", "Hinglish"];

const MODEL_LOCK: Partial<Record<ModelId, keyof import("@/store/appStore").Entitlements>> = {
  "gemini-1.5-pro": "can_use_advanced_models",
};
const LANG_LOCK: Partial<Record<Language, keyof import("@/store/appStore").Entitlements>> = {
  Hindi: "can_use_hindi",
  Hinglish: "can_use_hindi",
};
const STYLE_LOCK: Partial<Record<PedagogyStyle, keyof import("@/store/appStore").Entitlements>> = {
  Abstract: "can_use_abstract",
};

const TIER_LABEL: Record<string, { text: string; cls: string }> = {
  free:      { text: "Free Plan",     cls: "text-muted border-[hsl(var(--border-c))]" },
  pro:       { text: "✦ Pro Active",  cls: "text-accent border-blue-500/40" },
  pro_plus:  { text: "★ Pro Plus",    cls: "text-purple-400 border-purple-400/40" },
  developer: { text: "⚡ Developer",  cls: "text-orange-400 border-orange-500/40 bg-orange-500/10" },
};

function ProBadge() {
  return (
    <span className="ml-1 text-xs font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-accent border border-blue-500/25">
      ✦ Pro
    </span>
  );
}

function GlassCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateY: -6 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 200 }}
      className="glass p-5 space-y-3"
    >
      <p className="text-xs font-mono text-muted uppercase tracking-widest">{title}</p>
      {children}
    </motion.div>
  );
}

function ChipSelector<T extends string>({
  options, value, onChange, lockMap = {}, entitlements, onLocked,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  lockMap?: Partial<Record<T, string>>;
  entitlements: Record<string, boolean | number>;
  onLocked?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const entKey = lockMap[opt] as string | undefined;
        const locked = entKey ? !entitlements[entKey] : false;
        return (
          <button
            key={opt}
            onClick={() => (locked ? onLocked?.() : onChange(opt))}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
              value === opt && !locked
                ? "bg-blue-500 border-blue-500 text-white shadow-glow"
                : locked
                ? "border-[hsl(var(--border-c))]/40 text-muted/40 cursor-pointer hover:border-blue-500/30"
                : "border-[hsl(var(--border-c))] text-muted hover:border-blue-500/50 hover:text-text glass"
            }`}
          >
            {opt}
            {locked && <ProBadge />}
          </button>
        );
      })}
    </div>
  );
}

function CylindricalSlider<T extends string>({
  value, options, onChange, lockMap = {}, entitlements, onLocked,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  lockMap?: Partial<Record<T, string>>;
  entitlements: Record<string, boolean | number>;
  onLocked?: () => void;
}) {
  const idx = options.indexOf(value);
  const pct = idx / (options.length - 1);

  return (
    <div className="space-y-2">
      <div
        className="relative h-2 rounded-full cursor-pointer"
        style={{ background: "hsl(var(--border-c))" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const i = Math.round(x * (options.length - 1));
          const target = options[Math.max(0, Math.min(options.length - 1, i))];
          const entKey = lockMap[target];
          if (entKey && !entitlements[entKey]) onLocked?.();
          else onChange(target);
        }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ background: "linear-gradient(to right, hsl(var(--accent-c)), hsl(var(--glow-c)))" }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-glow"
          animate={{ left: `calc(${pct * 100}% - 8px)` }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      </div>
      <div className="flex justify-between text-xs font-mono">
        {options.map((o) => {
          const locked = lockMap[o] ? !entitlements[lockMap[o] as string] : false;
          return (
            <span key={o} className={locked ? "text-muted/40" : "text-muted"}>
              {o}{locked ? " 🔒" : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function ParameterMatrix({ onProceed }: { onProceed: () => void }) {
  const { params, setParam, user, tier, entitlements, setUpgradeModal } = useAppStore();
  const ts = TIER_LABEL[tier] || TIER_LABEL.free;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[hsl(var(--void))]">
      <motion.div
        initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl space-y-4"
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="tag">PARAMETER MATRIX</p>
            <button
              onClick={tier === "free" || tier === "pro" ? () => setUpgradeModal(true) : undefined}
              className={`tag font-mono text-xs px-2 py-0.5 border rounded-full transition-all ${ts.cls} ${
                tier !== "developer" && tier !== "pro_plus" ? "cursor-pointer hover:opacity-80" : "cursor-default"
              }`}
            >
              {ts.text}
            </button>
          </div>
          <h2 className="text-2xl font-bold text-text">Configure Your Session</h2>
          <p className="text-muted text-sm mt-1">
            Welcome, {user?.name}
            {tier === "developer" && (
              <span className="ml-2 text-orange-400 font-mono text-xs">⚡ Owner Access · All limits bypassed</span>
            )}
          </p>
        </div>

        <GlassCard title="Target Examination" delay={0}>
          <ChipSelector
            options={EXAMS}
            value={params.target_exam}
            onChange={(v) => setParam("target_exam", v)}
            entitlements={entitlements as unknown as Record<string, boolean | number>}
          />
        </GlassCard>

        <GlassCard title="Pedagogy Style — Cognitive Depth" delay={0.08}>
          <CylindricalSlider
            options={STYLES}
            value={params.pedagogy_style}
            onChange={(v) => setParam("pedagogy_style", v)}
            lockMap={STYLE_LOCK as Partial<Record<PedagogyStyle, string>>}
            entitlements={entitlements as unknown as Record<string, boolean | number>}
            onLocked={() => setUpgradeModal(true)}
          />
        </GlassCard>

        <GlassCard title="Localization" delay={0.16}>
          <ChipSelector
            options={LANGS}
            value={params.language}
            onChange={(v) => setParam("language", v)}
            lockMap={LANG_LOCK as Partial<Record<Language, string>>}
            entitlements={entitlements as unknown as Record<string, boolean | number>}
            onLocked={() => setUpgradeModal(true)}
          />
        </GlassCard>

        <GlassCard title="Inference Model" delay={0.24}>
          <ChipSelector
            options={MODELS}
            value={params.model}
            onChange={(v) => setParam("model", v)}
            lockMap={MODEL_LOCK as Partial<Record<ModelId, string>>}
            entitlements={entitlements as unknown as Record<string, boolean | number>}
            onLocked={() => setUpgradeModal(true)}
          />
        </GlassCard>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button onClick={onProceed} className="btn-primary w-full py-4 text-lg" data-testid="btn-proceed">
            Initialize Agent →
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
