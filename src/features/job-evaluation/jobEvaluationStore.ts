import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  activeSubfactors,
  defaultSettings,
  PLANS,
  type CustomSubfactor,
  type FactorKey,
  type Method,
  type PlanId,
  type PlanSettings,
} from "./lib/plans";
import { equalBands } from "./lib/groups";
import { DEFAULT_POLICY, type EmployeeInput, type PayPolicy } from "./lib/payPolicy";
import type { OjaSummary } from "./lib/openJobAnalysis";
import type { PairDecision, PairMap } from "./lib/paired";
import { pairKey } from "./lib/paired";
import type { JobRecord, StructureSettings, SubRating } from "./lib/assemble";

export interface EvaluatedJob extends JobRecord {
  /** Evidence imported from an Open Job Analysis project, if any. */
  analysis: OjaSummary | null;
}

export interface Rater {
  id: string;
  name: string;
}

export interface Organisation {
  name: string;
  /** Number of workers; decides the suggested method and the reporting duty. */
  workers: number | null;
}

export interface JobEvaluationData {
  org: Organisation;
  settings: PlanSettings;
  raters: Rater[];
  /** Hide job titles and pay while rating (bias guard). */
  blind: boolean;
  jobs: EvaluatedJob[];
  pairs: PairMap;
  structure: StructureSettings;
  policy: PayPolicy;
  employees: EmployeeInput[];
  /** Objective, gender-neutral reason for a pay difference, by grade (Art. 10). */
  justifications: Record<string, string>;
  /** How pay progresses within and between grades, in plain words (Art. 6). */
  progressionCriteria: string;
}

interface Actions {
  setOrg: (patch: Partial<Organisation>) => void;
  setMethod: (m: Method) => void;
  setPlan: (p: PlanId) => void;
  setWeight: (subId: string, weight: number) => void;
  setTotalPoints: (n: number) => void;
  toggleShortlist: (subId: string, on: boolean) => void;
  addCustom: (factor: FactorKey) => void;
  updateCustom: (id: string, patch: Partial<CustomSubfactor>) => void;
  removeCustom: (id: string) => void;

  addRater: (name?: string) => void;
  updateRater: (id: string, name: string) => void;
  removeRater: (id: string) => void;
  setBlind: (on: boolean) => void;

  addJob: (title?: string) => string;
  importOja: (s: OjaSummary) => { id: string; updated: boolean };
  updateJob: (id: string, patch: Partial<EvaluatedJob>) => void;
  setRating: (jobId: string, subId: string, patch: Partial<SubRating>) => void;
  setRaterLevel: (jobId: string, subId: string, raterId: string, level: number | null) => void;
  removeJob: (id: string) => void;
  setPair: (a: string, b: string, patch: Partial<PairDecision>) => void;

  updateStructure: (patch: Partial<StructureSettings>) => void;
  updatePolicy: (patch: Partial<PayPolicy>) => void;

  addEmployee: () => void;
  updateEmployee: (id: string, patch: Partial<EmployeeInput>) => void;
  removeEmployee: (id: string) => void;

  setJustification: (grade: number, text: string) => void;
  setProgressionCriteria: (text: string) => void;

  replaceAll: (data: JobEvaluationData) => void;
  reset: () => void;
}

const newId = () => Math.random().toString(36).slice(2, 10);

export const DEFAULT_GROUPS: Record<Method, number> = { points: 10, graduated: 4, paired: 4 };

export function policyForPlan(planId: PlanId, base: PayPolicy = DEFAULT_POLICY): PayPolicy {
  if (planId === "simple") return { ...base, bands: DEFAULT_POLICY.bands, anchorPoints: 500 };
  const total = PLANS[planId].totalPoints;
  return {
    ...base,
    bands: equalBands(total, 10),
    anchorPoints: total / 2,
  };
}

export const initialData = (): JobEvaluationData => ({
  org: { name: "", workers: null },
  settings: defaultSettings("eige", "points"),
  raters: [],
  blind: false,
  jobs: [],
  pairs: {},
  structure: {
    basis: "table",
    groupCount: DEFAULT_GROUPS.points,
    minSalary: null,
    maxSalary: null,
    progression: 0.15,
  },
  policy: policyForPlan("eige", { ...DEFAULT_POLICY, currency: "EUR" }),
  employees: [],
  justifications: {},
  progressionCriteria: "",
});

export const emptyJob = (id: string, title: string): EvaluatedJob => ({
  id,
  title,
  department: "",
  reportsTo: "",
  purpose: "",
  ratings: {},
  women: null,
  men: null,
  groupOverride: null,
  marketMedian: null,
  dutyMatch: null,
  marketSource: "",
  notes: "",
  analysis: null,
});

const emptyRating = (): SubRating => ({ final: null, byRater: {}, rationale: "" });

/** Version 1 stored one level per factor under `levels` and four factor weights. */
interface V1State {
  factors?: { id: string; weight: number }[];
  totalPoints?: number;
  policy?: PayPolicy;
  jobs?: (Omit<EvaluatedJob, "ratings"> & { levels?: Record<string, number | null> })[];
  employees?: EmployeeInput[];
}

export function migrateV1(old: V1State): JobEvaluationData {
  const base = initialData();
  const settings = defaultSettings("simple", "points");
  for (const f of old.factors ?? []) settings.weights[f.id] = Math.round(f.weight * 100);
  settings.totalPoints = old.totalPoints ?? 1000;
  return {
    ...base,
    settings,
    structure: { ...base.structure, basis: "policy" },
    policy: { ...DEFAULT_POLICY, ...(old.policy ?? {}) },
    employees: old.employees ?? [],
    jobs: (old.jobs ?? []).map((j) => {
      const { levels, ...rest } = j;
      return {
        ...emptyJob(j.id, j.title),
        ...rest,
        ratings: Object.fromEntries(
          Object.entries(levels ?? {}).map(([k, v]) => [k, { ...emptyRating(), final: v }])
        ),
      };
    }),
  };
}

export const useJobEvaluationStore = create<JobEvaluationData & Actions>()(
  persist(
    (set, get) => ({
      ...initialData(),

      setOrg: (patch) => set((s) => ({ org: { ...s.org, ...patch } })),
      setMethod: (method) =>
        set((s) => ({
          settings: { ...s.settings, method },
          structure: {
            ...s.structure,
            groupCount: DEFAULT_GROUPS[method],
            basis: method === "points" ? s.structure.basis : "table",
          },
        })),
      setPlan: (planId) =>
        set((s) => ({
          settings: { ...defaultSettings(planId, s.settings.method), custom: s.settings.custom },
          policy: policyForPlan(planId, s.policy),
        })),
      setWeight: (subId, weight) =>
        set((s) => {
          const custom = s.settings.custom.map((c) => (c.id === subId ? { ...c, weight } : c));
          return {
            settings: {
              ...s.settings,
              custom,
              weights: { ...s.settings.weights, [subId]: weight },
            },
          };
        }),
      setTotalPoints: (n) => set((s) => ({ settings: { ...s.settings, totalPoints: n } })),
      toggleShortlist: (subId, on) =>
        set((s) => ({
          settings: { ...s.settings, shortlist: { ...s.settings.shortlist, [subId]: on } },
        })),
      addCustom: (factor) =>
        set((s) => {
          if (s.settings.custom.some((c) => c.factor === factor)) return {};
          const c: CustomSubfactor = {
            id: `custom-${factor}`,
            factor,
            name: "",
            definition: "",
            levels: ["Does not apply.", "", "", "", "", ""],
            weight: 0,
          };
          return { settings: { ...s.settings, custom: [...s.settings.custom, c] } };
        }),
      updateCustom: (id, patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            custom: s.settings.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          },
        })),
      removeCustom: (id) =>
        set((s) => ({
          settings: { ...s.settings, custom: s.settings.custom.filter((c) => c.id !== id) },
        })),

      addRater: (name = "") =>
        set((s) => ({
          raters: [...s.raters, { id: newId(), name: name || `Member ${s.raters.length + 1}` }],
        })),
      updateRater: (id, name) =>
        set((s) => ({ raters: s.raters.map((r) => (r.id === id ? { ...r, name } : r)) })),
      removeRater: (id) => set((s) => ({ raters: s.raters.filter((r) => r.id !== id) })),
      setBlind: (blind) => set({ blind }),

      addJob: (title = "") => {
        const id = newId();
        set((s) => ({ jobs: [...s.jobs, emptyJob(id, title)] }));
        return id;
      },
      importOja: (summary) => {
        const existing = summary.projectId
          ? get().jobs.find((j) => j.analysis?.projectId === summary.projectId)
          : undefined;
        if (existing) {
          set((s) => ({
            jobs: s.jobs.map((j) =>
              j.id === existing.id
                ? {
                    ...j,
                    analysis: summary,
                    department: j.department || summary.department,
                    reportsTo: j.reportsTo || summary.reportsTo,
                    purpose: j.purpose || summary.purpose,
                  }
                : j
            ),
          }));
          return { id: existing.id, updated: true };
        }
        const id = newId();
        const title = summary.title.replace(/\s*\((example|exemple)\)\s*$/i, "") || "Imported job";
        set((s) => ({
          jobs: [
            ...s.jobs,
            {
              ...emptyJob(id, title),
              department: summary.department,
              reportsTo: summary.reportsTo,
              purpose: summary.purpose,
              analysis: summary,
            },
          ],
        }));
        return { id, updated: false };
      },
      updateJob: (id, patch) =>
        set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) })),
      setRating: (jobId, subId, patch) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  ratings: {
                    ...j.ratings,
                    [subId]: { ...emptyRating(), ...j.ratings[subId], ...patch },
                  },
                }
              : j
          ),
        })),
      setRaterLevel: (jobId, subId, raterId, level) =>
        set((s) => ({
          jobs: s.jobs.map((j) => {
            if (j.id !== jobId) return j;
            const r = { ...emptyRating(), ...j.ratings[subId] };
            return {
              ...j,
              ratings: {
                ...j.ratings,
                [subId]: { ...r, byRater: { ...r.byRater, [raterId]: level } },
              },
            };
          }),
        })),
      removeJob: (id) =>
        set((s) => ({
          jobs: s.jobs.filter((j) => j.id !== id),
          employees: s.employees.map((e) => (e.jobId === id ? { ...e, jobId: "" } : e)),
          pairs: Object.fromEntries(
            Object.entries(s.pairs).filter(([k]) => !k.split("|").includes(id))
          ),
        })),
      setPair: (a, b, patch) =>
        set((s) => {
          const k = pairKey(a, b);
          return {
            pairs: {
              ...s.pairs,
              [k]: { ...{ winner: null, rationale: "" }, ...s.pairs[k], ...patch },
            },
          };
        }),

      updateStructure: (patch) => set((s) => ({ structure: { ...s.structure, ...patch } })),
      updatePolicy: (patch) => set((s) => ({ policy: { ...s.policy, ...patch } })),

      addEmployee: () =>
        set((s) => ({
          employees: [
            ...s.employees,
            {
              id: newId(),
              label: `E${String(s.employees.length + 1).padStart(2, "0")}`,
              jobId: s.jobs[0]?.id ?? "",
              sex: "",
              basePay: null,
              locationPct: 0,
              marketSupplement: 0,
              otherPay: 0,
            },
          ],
        })),
      updateEmployee: (id, patch) =>
        set((s) => ({
          employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeEmployee: (id) => set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),

      setJustification: (grade, text) =>
        set((s) => ({ justifications: { ...s.justifications, [grade]: text } })),
      setProgressionCriteria: (progressionCriteria) => set({ progressionCriteria }),

      replaceAll: (data) => set({ ...initialData(), ...data }),
      reset: () => set(initialData()),
    }),
    {
      name: "job-evaluation-storage",
      version: 2,
      migrate: (persisted, version) => {
        if (version < 2) return migrateV1(persisted as V1State) as never;
        return persisted as never;
      },
      partialize: (s) => {
        // Persist data only, not the action functions.
        const out: Partial<JobEvaluationData> = {};
        for (const k of Object.keys(initialData()) as (keyof JobEvaluationData)[])
          (out as Record<string, unknown>)[k] = s[k];
        return out as JobEvaluationData;
      },
    }
  )
);

/** The saved data without the actions, for the evaluation file and the calculations. */
export function dataOf(s: JobEvaluationData): JobEvaluationData {
  const out: Partial<JobEvaluationData> = {};
  for (const k of Object.keys(initialData()) as (keyof JobEvaluationData)[])
    (out as Record<string, unknown>)[k] = s[k];
  return out as JobEvaluationData;
}

export { activeSubfactors };
