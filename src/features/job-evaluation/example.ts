/**
 * Worked example from "From Job Analysis to Pay" (Part 6): six back-office
 * jobs. The HR Assistant is the job analysed in Part 2 with Open Job Analysis.
 *
 * Market medians: U.S. Bureau of Labor Statistics, Occupational Employment and
 * Wage Statistics, May 2025 national estimates (released 15 May 2026), annual
 * median wage, all industries. Employees are invented.
 */
import type { EvaluatedJob } from "./jobEvaluationStore";
import type { EmployeeInput, PayPolicy } from "./lib/payPolicy";
import { DEFAULT_POLICY } from "./lib/payPolicy";
import type { FactorLevels } from "./lib/factors";

const lv = (s: number, r: number, e: number, c: number): FactorLevels => ({
  skills: s,
  responsibility: r,
  effort: e,
  conditions: c,
});

const SOURCE = "BLS OEWS May 2025, national median";

export const examplePolicy: PayPolicy = { ...DEFAULT_POLICY, currency: "USD" };

export const exampleJobs = (): EvaluatedJob[] => [
  {
    id: "ex-office-clerk",
    title: "Office Clerk",
    levels: lv(2, 2, 2, 1),
    marketMedian: 45010,
    dutyMatch: 0.75,
    marketSource: `${SOURCE} (SOC 43-9061)`,
    notes: "Rated from the O*NET description as a stand-in for a job analysis.",
    analysis: null,
  },
  {
    id: "ex-bookkeeper",
    title: "Bookkeeper",
    levels: lv(3, 2, 2, 1),
    marketMedian: 50670,
    dutyMatch: 0.8,
    marketSource: `${SOURCE} (SOC 43-3031)`,
    notes: "Rated from the O*NET description as a stand-in for a job analysis.",
    analysis: null,
  },
  {
    id: "ex-hr-assistant",
    title: "HR Assistant",
    levels: lv(3, 2, 3, 1),
    marketMedian: 50610,
    dutyMatch: 0.85,
    marketSource: `${SOURCE} (SOC 43-4161)`,
    notes:
      "Skills 3: interprets laws, regulations and policies for specific issues (importance 5); writing, interpersonal skills, customer service, HR knowledge. Responsibility 2: primary contact for a subject area; prepares records for external audits (rare but important); works under the HR manager's direction. Effort 3: regular contact with employees about sensitive matters. Conditions 1: office.",
    analysis: null,
  },
  {
    id: "ex-payroll-clerk",
    title: "Payroll Clerk",
    levels: lv(3, 3, 2, 1),
    marketMedian: 58260,
    dutyMatch: 0.8,
    marketSource: `${SOURCE} (SOC 43-3051)`,
    notes: "Rated from the O*NET description as a stand-in for a job analysis.",
    analysis: null,
  },
  {
    id: "ex-hr-specialist",
    title: "HR Specialist",
    levels: lv(4, 3, 3, 1),
    marketMedian: 75940,
    dutyMatch: 0.75,
    marketSource: `${SOURCE} (SOC 13-1071)`,
    notes: "Rated from the O*NET description as a stand-in for a job analysis.",
    analysis: null,
  },
  {
    id: "ex-hr-manager",
    title: "HR Manager",
    levels: lv(5, 5, 3, 1),
    marketMedian: 149280,
    dutyMatch: 0.8,
    marketSource: `${SOURCE} (SOC 11-3121)`,
    notes: "Rated from the O*NET description as a stand-in for a job analysis.",
    analysis: null,
  },
];

const emp = (
  label: string,
  jobId: string,
  sex: "F" | "M",
  basePay: number,
  marketSupplement = 0
): EmployeeInput => ({
  id: `ex-${label}`,
  label,
  jobId,
  sex,
  basePay,
  locationPct: 0,
  marketSupplement,
  otherPay: 0,
});

export const exampleEmployees = (): EmployeeInput[] => [
  emp("E01", "ex-office-clerk", "F", 41000),
  emp("E02", "ex-bookkeeper", "F", 47500),
  emp("E03", "ex-hr-assistant", "F", 46500),
  emp("E04", "ex-hr-assistant", "M", 52000),
  emp("E05", "ex-payroll-clerk", "F", 55000),
  emp("E06", "ex-hr-specialist", "F", 68000, 3700),
  emp("E07", "ex-hr-specialist", "M", 74500, 3700),
  emp("E08", "ex-hr-manager", "M", 104000, 45300),
];
