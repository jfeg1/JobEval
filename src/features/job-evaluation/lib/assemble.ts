/**
 * Puts the pieces together: scores by method, job groups, grades, gender
 * representation and pay records. Pure functions over the saved state, so the
 * screens and the tests use the same numbers.
 */
import { levelScore, maxScore, type Levels, type Method, type PlanSettings } from "./plans";
import { pairedScores, type PairMap } from "./paired";
import {
  equalBands,
  gradeTable,
  groupOf,
  predominance,
  type Band,
  type Predominance,
} from "./groups";
import {
  evaluate,
  evaluateEmployee,
  gradeOf,
  type EmployeeInput,
  type Evaluation,
  type Grade,
  type JobInput,
  type PayPolicy,
} from "./payPolicy";
import type { PayRecord } from "./directive";

export interface SubRating {
  /** The level the committee agreed. */
  final: number | null;
  /** Each committee member's own level, by rater id. */
  byRater: Record<string, number | null>;
  rationale: string;
}

export interface JobRecord extends JobInput {
  department: string;
  reportsTo: string;
  purpose: string;
  ratings: Record<string, SubRating>;
  /** Head counts entered by hand; used when no employees are recorded for the job. */
  women: number | null;
  men: number | null;
  /** Group chosen by the committee instead of the score band, if any. */
  groupOverride: number | null;
}

export type StructureBasis = "table" | "policy";

export interface StructureSettings {
  basis: StructureBasis;
  groupCount: number;
  minSalary: number | null;
  maxSalary: number | null;
  progression: number;
}

export interface EvaluationInput {
  settings: PlanSettings;
  jobs: JobRecord[];
  pairs: PairMap;
  structure: StructureSettings;
  policy: PayPolicy;
  employees: EmployeeInput[];
}

export interface JobOutcome {
  job: JobRecord;
  score: number | null;
  group: number | null;
  grade: Grade | null;
  women: number;
  men: number;
  /** Where the counts came from. */
  countsFrom: "employees" | "entered" | "none";
  predominance: Predominance | null;
}

export interface FullEvaluation {
  method: Method;
  maxScore: number;
  bands: Band[];
  outcomes: JobOutcome[];
  grades: Grade[];
  /** Range either side of the midpoint in the grade table (table basis). */
  tableSpread: number | null;
  /** Set when the structure comes from the pay policy (point method only). */
  policyEvaluation: Evaluation | null;
  gradeForJob: (jobId: string) => Grade | null;
}

export const levelsOf = (job: JobRecord): Levels =>
  Object.fromEntries(Object.entries(job.ratings).map(([k, r]) => [k, r.final]));

export function scores(input: EvaluationInput): (number | null)[] {
  const { settings, jobs, pairs } = input;
  if (settings.method === "paired") {
    const ps = pairedScores(
      jobs.map((j) => j.id),
      pairs
    );
    return jobs.map((j) => ps[j.id]);
  }
  return jobs.map((j) => levelScore(levelsOf(j), settings));
}

export function evaluateAll(input: EvaluationInput): FullEvaluation {
  const { settings, jobs, structure, policy, employees } = input;
  const method = settings.method;
  const sc = scores(input);
  const max = maxScore(settings, jobs.length);
  const usePolicy = structure.basis === "policy" && method === "points";

  // Head counts: from employees when any are recorded for the job, otherwise as entered.
  const counts = jobs.map((j) => {
    const staff = employees.filter((e) => e.jobId === j.id);
    if (staff.length)
      return {
        women: staff.filter((e) => e.sex === "F").length,
        men: staff.filter((e) => e.sex === "M").length,
        from: "employees" as const,
      };
    if (j.women !== null || j.men !== null)
      return { women: j.women ?? 0, men: j.men ?? 0, from: "entered" as const };
    return { women: 0, men: 0, from: "none" as const };
  });

  let bands: Band[];
  let grades: Grade[] = [];
  let tableSpread: number | null = null;
  let policyEvaluation: Evaluation | null = null;
  const groups: (number | null)[] = [];

  if (usePolicy) {
    bands = policy.bands;
    policyEvaluation = evaluate(jobs, sc, policy);
    grades = policyEvaluation.grades;
    jobs.forEach((_, i) => groups.push(policyEvaluation!.jobs[i].grade?.grade ?? null));
  } else {
    bands = equalBands(max, structure.groupCount, method !== "points");
    jobs.forEach((j, i) =>
      groups.push(j.groupOverride ?? (sc[i] !== null ? groupOf(sc[i] as number, bands) : null))
    );
    // Pay grades are the groups that hold at least one job, lowest first.
    const used = [...new Set(groups.filter((g): g is number => g !== null))].sort((a, b) => a - b);
    const table = gradeTable(
      used.map((g) => bands[g - 1]),
      {
        minSalary: structure.minSalary,
        maxSalary: structure.maxSalary,
        progression: structure.progression,
      }
    );
    if (table) {
      tableSpread = table.spread;
      grades = table.rows.map((r, i) => ({ ...r, group: used[i] }));
    }
  }

  const outcomes: JobOutcome[] = jobs.map((job, i) => {
    const group = groups[i];
    const grade = usePolicy
      ? (policyEvaluation!.jobs[i].grade ?? null)
      : (grades.find((g) => g.group === group) ?? null);
    return {
      job,
      score: sc[i],
      group,
      grade,
      women: counts[i].women,
      men: counts[i].men,
      countsFrom: counts[i].from,
      predominance: predominance(counts[i].women, counts[i].men),
    };
  });

  const byJob = new Map(outcomes.map((o) => [o.job.id, o.grade]));
  return {
    method,
    maxScore: max,
    bands,
    outcomes,
    grades,
    tableSpread,
    policyEvaluation,
    gradeForJob: (id) => byJob.get(id) ?? null,
  };
}

/** Pay records for the Directive reports; the category of workers is the grade. */
export function payRecords(employees: EmployeeInput[], ev: FullEvaluation): PayRecord[] {
  return employees
    .map((e) => evaluateEmployee(e, ev.gradeForJob))
    .filter((r) => r.employee.basePay !== null)
    .map((r) => ({
      sex: r.employee.sex,
      category: r.grade?.grade ?? null,
      base: r.employee.basePay as number,
      variable: (r.totalPay as number) - (r.employee.basePay as number),
    }));
}

export { gradeOf };
