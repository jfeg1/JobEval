/**
 * Two worked examples.
 *
 * 1. "From Job Analysis to Pay" (Part 6, draft v2): seven back-office jobs on
 *    the simple four-factor plan (35/35/20/10, 1,000 points). The HR Assistant
 *    is the job analysed in Part 2 with Open Job Analysis. Market medians: U.S.
 *    Bureau of Labor Statistics, Occupational Employment and Wage Statistics,
 *    May 2025 national estimates, annual median wage, all industries.
 *    Employees are invented.
 *
 * 2. The EIGE toolkit's own example for the standard approach (Tool 5 Excel
 *    file): a catering company with three roles. The toolkit says its jobs
 *    "do not reflect real information". Levels, head counts and annual pay are
 *    the toolkit's; one employee record is created per head, each paid the
 *    role's figure.
 */
import {
  emptyJob,
  initialData,
  policyForPlan,
  type EvaluatedJob,
  type JobEvaluationData,
} from "./jobEvaluationStore";
import type { EmployeeInput } from "./lib/payPolicy";
import { DEFAULT_POLICY } from "./lib/payPolicy";
import { defaultSettings } from "./lib/plans";
import type { SubRating } from "./lib/assemble";

const r = (final: number): SubRating => ({ final, byRater: {}, rationale: "" });

// ------------------------------------------------------------------ Part 6

const simple = (s: number, rs: number, e: number, c: number) => ({
  skills: r(s),
  responsibility: r(rs),
  effort: r(e),
  conditions: r(c),
});

const SOURCE = "BLS OEWS May 2025, national median";
const ONET = "Rated from the O*NET description as a stand-in for a job analysis.";

const part6Job = (
  id: string,
  title: string,
  levels: [number, number, number, number],
  median: number,
  match: number,
  soc: string,
  notes = ONET
): EvaluatedJob => ({
  ...emptyJob(id, title),
  ratings: simple(...levels),
  marketMedian: median,
  dutyMatch: match,
  marketSource: `${SOURCE} (SOC ${soc})`,
  notes,
});

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

export function part6Example(): JobEvaluationData {
  const base = initialData();
  return {
    ...base,
    org: { name: "Worked example: Part 6", workers: 9 },
    settings: defaultSettings("simple", "points"),
    structure: { ...base.structure, basis: "policy" },
    policy: { ...DEFAULT_POLICY, currency: "USD" },
    jobs: [
      part6Job("ex-office-clerk", "Office Clerk", [2, 2, 2, 1], 45010, 0.75, "43-9061"),
      part6Job("ex-bookkeeper", "Bookkeeper", [3, 2, 2, 1], 50670, 0.8, "43-3031"),
      part6Job(
        "ex-hr-assistant",
        "HR Assistant",
        [3, 2, 3, 1],
        50610,
        0.8,
        "43-4161",
        "Skills 3: interprets laws, rules and policies for specific cases (4.7); gives technical advice (4.0). Responsibility 2: works under the HR manager's direction; the audit task is rare and the 'main contact' task did not make the critical list. Effort 3: reading and computer work constantly (frequency 5); people skills and customer service critical from day one. Conditions 1: office."
      ),
      part6Job(
        "ex-it-support",
        "IT Support Technician",
        [3, 2, 3, 2],
        61860,
        0.75,
        "15-1232",
        "Rated from the O*NET description as a stand-in for a job analysis. Conditions 2: occasional after-hours work and moving equipment."
      ),
      part6Job("ex-payroll-clerk", "Payroll Clerk", [3, 3, 2, 1], 58260, 0.8, "43-3051"),
      part6Job("ex-hr-specialist", "HR Specialist", [4, 3, 3, 1], 75940, 0.75, "13-1071"),
      part6Job("ex-hr-manager", "HR Manager", [5, 5, 3, 1], 149280, 0.8, "11-3121"),
    ],
    employees: [
      emp("E01", "ex-office-clerk", "F", 41000),
      emp("E02", "ex-bookkeeper", "F", 47500),
      emp("E03", "ex-hr-assistant", "F", 46500),
      emp("E04", "ex-hr-assistant", "M", 52000),
      emp("E05", "ex-it-support", "M", 58300, 3600),
      emp("E06", "ex-payroll-clerk", "F", 55000),
      emp("E07", "ex-hr-specialist", "F", 68000, 3700),
      emp("E08", "ex-hr-specialist", "M", 74500, 3700),
      emp("E09", "ex-hr-manager", "M", 104000, 45300),
    ],
    progressionCriteria:
      "New hires start between the minimum and the midpoint, depending on how many of the skills learned on the job they already have. People move toward the midpoint as they master the job; merit increases are larger low in the range.",
  };
}

// -------------------------------------------------------------- EIGE Tool 5

/** Levels in toolkit order: knowledge … organisational environment. */
const EIGE_ORDER = [
  "knowledge",
  "communication",
  "problemSolving",
  "planning",
  "physicalSkills",
  "people",
  "goods",
  "information",
  "financial",
  "mentalEffort",
  "emotionalEffort",
  "physicalEffort",
  "environment",
  "organisational",
];
const eige = (lv: number[]) => Object.fromEntries(EIGE_ORDER.map((id, i) => [id, r(lv[i])]));

const TOOL5 = [
  {
    id: "eige-sous-chef",
    title: "Sous Chef",
    department: "Kitchen Operations",
    reportsTo: "Head Chef",
    purpose:
      "To support the Head Chef in all kitchen operations, manage daily food preparation, ensure quality standards, and supervise junior kitchen staff to deliver exceptional culinary offerings.",
    levels: [0, 0, 0, 3, 4, 3, 5, 4, 3, 3, 2, 3, 4, 4],
    women: 3,
    men: 6,
    pay: 38800,
  },
  {
    id: "eige-event-coordinator",
    title: "Lead Event Coordinator",
    department: "Events and Operations",
    reportsTo: "CEO",
    purpose:
      "To lead the planning and delivery of events that meet client objectives, manage logistics and suppliers, coordinate staff, and ensure seamless execution from planning to post-event follow-up.",
    levels: [5, 5, 5, 5, 0, 0, 0, 5, 4, 4, 0, 2, 2, 2],
    women: 7,
    men: 3,
    pay: 36100,
  },
  {
    id: "eige-kitchen-assistant",
    title: "Kitchen Assistant",
    department: "Kitchen Operations",
    reportsTo: "Sous Chef",
    purpose:
      "To support the kitchen team in preparing and serving meals, maintaining hygiene standards, and ensuring smooth daily kitchen operations.",
    levels: [1, 1, 1, 1, 3, 1, 2, 1, 1, 1, 1, 3, 4, 4],
    women: 10,
    men: 11,
    pay: 21700,
  },
];

export function eigeExample(): JobEvaluationData {
  const base = initialData();
  let n = 0;
  const employees: EmployeeInput[] = TOOL5.flatMap((j) =>
    [...Array(j.women).fill("F"), ...Array(j.men).fill("M")].map((sex) => {
      n += 1;
      return {
        id: `eige-e${n}`,
        label: `E${String(n).padStart(2, "0")}`,
        jobId: j.id,
        sex,
        basePay: j.pay,
        locationPct: 0,
        marketSupplement: 0,
        otherPay: 0,
      } as EmployeeInput;
    })
  );
  return {
    ...base,
    org: { name: "EIGE toolkit example: catering company", workers: employees.length },
    settings: defaultSettings("eige", "points"),
    policy: policyForPlan("eige", { ...DEFAULT_POLICY, currency: "EUR" }),
    structure: { ...base.structure, minSalary: 20000, maxSalary: 45000, progression: 0.15 },
    jobs: TOOL5.map((j) => ({
      ...emptyJob(j.id, j.title),
      department: j.department,
      reportsTo: j.reportsTo,
      purpose: j.purpose,
      ratings: eige(j.levels),
      notes: "Levels from the EIGE toolkit's example (Tool 5, sheet 6).",
    })),
    employees,
  };
}
