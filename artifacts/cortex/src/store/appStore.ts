import { create } from "zustand";

export type Phase = "auth" | "params" | "agent" | "tutor" | "dashboard";
export type Tier = "free" | "pro" | "pro_plus" | "developer";
export type Role = "student" | "educator" | "parent";
export type PedagogyStyle = "Simplified" | "Standard" | "Abstract";
export type Language = "English" | "Hindi" | "Hinglish";
export type ModelId = "gemini-2.5-flash" | "gemini-2.0-flash" | "gemini-1.5-pro";
export type TargetExam = string;

export interface Entitlements {
  can_use_pdf: boolean;
  can_view_diagnostics: boolean;
  can_use_practice: boolean;
  can_use_advanced_models: boolean;
  can_use_hindi: boolean;
  can_use_abstract: boolean;
  can_access_dashboard: boolean;
  can_multi_model: boolean;
  can_export_sessions: boolean;
  can_custom_prompt: boolean;
  can_bulk_pdf: boolean;
  can_dev_panel: boolean;
  query_limit: number;
}

export interface User {
  name: string;
  role: Role;
  tier: Tier;
  entitlements: Entitlements;
}

export interface TutorParams {
  target_exam: TargetExam;
  pedagogy_style: PedagogyStyle;
  language: Language;
  model: ModelId;
}

export interface AgentResult {
  final_output: string;
  session_id?: number;
  cache_hit?: boolean;
  grading_passed?: boolean;
  mnemonics?: string[];
  weak_topics?: string[];
  revision_suggestions?: string[];
}

const FREE_ENTITLEMENTS: Entitlements = {
  can_use_pdf: false, can_view_diagnostics: false, can_use_practice: true,
  can_use_advanced_models: false, can_use_hindi: false, can_use_abstract: false,
  can_access_dashboard: true, can_multi_model: false, can_export_sessions: false,
  can_custom_prompt: false, can_bulk_pdf: false, can_dev_panel: false,
  query_limit: 5,
};

const PRO_ENTITLEMENTS: Entitlements = {
  can_use_pdf: true, can_view_diagnostics: true, can_use_practice: true,
  can_use_advanced_models: true, can_use_hindi: true, can_use_abstract: true,
  can_access_dashboard: true, can_multi_model: false, can_export_sessions: false,
  can_custom_prompt: false, can_bulk_pdf: false, can_dev_panel: false,
  query_limit: -1,
};

const PRO_PLUS_ENTITLEMENTS: Entitlements = {
  can_use_pdf: true, can_view_diagnostics: true, can_use_practice: true,
  can_use_advanced_models: true, can_use_hindi: true, can_use_abstract: true,
  can_access_dashboard: true, can_multi_model: true, can_export_sessions: true,
  can_custom_prompt: true, can_bulk_pdf: true, can_dev_panel: false,
  query_limit: -1,
};

const DEV_ENTITLEMENTS: Entitlements = {
  can_use_pdf: true, can_view_diagnostics: true, can_use_practice: true,
  can_use_advanced_models: true, can_use_hindi: true, can_use_abstract: true,
  can_access_dashboard: true, can_multi_model: true, can_export_sessions: true,
  can_custom_prompt: true, can_bulk_pdf: true, can_dev_panel: true,
  query_limit: -1,
};

export const TIER_ENTITLEMENTS: Record<Tier, Entitlements> = {
  free: FREE_ENTITLEMENTS,
  pro: PRO_ENTITLEMENTS,
  pro_plus: PRO_PLUS_ENTITLEMENTS,
  developer: DEV_ENTITLEMENTS,
};

interface AppState {
  phase: Phase;
  user: User | null;
  role: Role | null;
  tier: Tier;
  entitlements: Entitlements;
  upgradeModal: boolean;
  params: TutorParams;
  context: string;
  documentSessionToken: string | null;
  lastQuery: string;
  agentResult: AgentResult | null;
  practiceOutput: string | null;
  diagnosticOutput: string | null;
  loading: boolean;
  error: string | null;

  setPhase: (phase: Phase) => void;
  login: (user: User) => void;
  setParam: <K extends keyof TutorParams>(key: K, value: TutorParams[K]) => void;
  setContext: (ctx: string) => void;
  setDocumentSessionToken: (token: string | null) => void;
  setLastQuery: (q: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUpgradeModal: (open: boolean) => void;
  setAgentResult: (result: AgentResult) => void;
  setPractice: (output: string) => void;
  setDiagnostic: (output: string | null) => void;
  setTierAndEntitlements: (tier: Tier) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  phase: "auth",
  user: null,
  role: null,
  tier: "free",
  entitlements: FREE_ENTITLEMENTS,
  upgradeModal: false,
  params: {
    target_exam: "NEET",
    pedagogy_style: "Standard",
    language: "English",
    model: "gemini-2.5-flash",
  },
  context: "",
  documentSessionToken: null,
  lastQuery: "",
  agentResult: null,
  practiceOutput: null,
  diagnosticOutput: null,
  loading: false,
  error: null,

  setPhase: (phase) => set({ phase }),

  login: (user) =>
    set({
      user,
      role: user.role,
      tier: user.tier,
      entitlements: user.entitlements,
      phase: "params",
    }),

  setParam: (key, value) =>
    set((s) => ({ params: { ...s.params, [key]: value } })),

  setContext: (ctx) => set({ context: ctx }),
  setDocumentSessionToken: (token) => set({ documentSessionToken: token }),
  setLastQuery: (q) => set({ lastQuery: q }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setUpgradeModal: (open) => set({ upgradeModal: open }),

  setAgentResult: (result) =>
    set({
      agentResult: result,
      practiceOutput: null,
      diagnosticOutput: null,
      phase: "tutor",
      loading: false,
    }),

  setPractice: (output) => set({ practiceOutput: output }),
  setDiagnostic: (output) => set({ diagnosticOutput: output }),

  setTierAndEntitlements: (tier) =>
    set({ tier, entitlements: TIER_ENTITLEMENTS[tier], upgradeModal: false }),

  reset: () =>
    set({
      agentResult: null,
      practiceOutput: null,
      diagnosticOutput: null,
      context: "",
      documentSessionToken: null,
      error: null,
      phase: "agent",
    }),
}));
