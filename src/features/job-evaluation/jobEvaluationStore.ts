import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_FACTORS,
  DEFAULT_TOTAL_POINTS,
  emptyLevels,
  type Factor,
  type FactorId,
} from "./lib/factors";
import { DEFAULT_POLICY, type EmployeeInput, type JobInput, type PayPolicy } from "./lib/payPolicy";
import type { OjaSummary } from "./lib/openJobAnalysis";
import { exampleEmployees, exampleJobs, examplePolicy } from "./example";

export interface EvaluatedJob extends JobInput {
  /** Evidence imported from an Open Job Analysis project, if any. */
  analysis: OjaSummary | null;
}

interface JobEvaluationState {
  factors: Factor[];
  totalPoints: number;
  policy: PayPolicy;
  jobs: EvaluatedJob[];
  employees: EmployeeInput[];

  addJob: (title?: string, analysis?: OjaSummary | null) => string;
  updateJob: (id: string, patch: Partial<EvaluatedJob>) => void;
  setLevel: (id: string, factor: FactorId, level: number) => void;
  removeJob: (id: string) => void;

  updatePolicy: (patch: Partial<PayPolicy>) => void;
  updateFactorWeight: (id: FactorId, weight: number) => void;

  addEmployee: () => void;
  updateEmployee: (id: string, patch: Partial<EmployeeInput>) => void;
  removeEmployee: (id: string) => void;

  loadExample: () => void;
  reset: () => void;
}

const newId = () => Math.random().toString(36).slice(2, 10);

const initial = () => ({
  factors: DEFAULT_FACTORS,
  totalPoints: DEFAULT_TOTAL_POINTS,
  policy: DEFAULT_POLICY,
  jobs: [] as EvaluatedJob[],
  employees: [] as EmployeeInput[],
});

export const useJobEvaluationStore = create<JobEvaluationState>()(
  persist(
    (set) => ({
      ...initial(),

      addJob: (title = "", analysis = null) => {
        const id = newId();
        set((s) => ({
          jobs: [
            ...s.jobs,
            {
              id,
              title,
              levels: emptyLevels(),
              marketMedian: null,
              dutyMatch: null,
              marketSource: "",
              notes: "",
              analysis,
            },
          ],
        }));
        return id;
      },
      updateJob: (id, patch) =>
        set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) })),
      setLevel: (id, factor, level) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id ? { ...j, levels: { ...j.levels, [factor]: level } } : j
          ),
        })),
      removeJob: (id) =>
        set((s) => ({
          jobs: s.jobs.filter((j) => j.id !== id),
          employees: s.employees.map((e) => (e.jobId === id ? { ...e, jobId: "" } : e)),
        })),

      updatePolicy: (patch) => set((s) => ({ policy: { ...s.policy, ...patch } })),
      updateFactorWeight: (id, weight) =>
        set((s) => ({ factors: s.factors.map((f) => (f.id === id ? { ...f, weight } : f)) })),

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

      loadExample: () =>
        set({
          ...initial(),
          policy: examplePolicy,
          jobs: exampleJobs(),
          employees: exampleEmployees(),
        }),
      reset: () => set(initial()),
    }),
    { name: "job-evaluation-storage", version: 1 }
  )
);
