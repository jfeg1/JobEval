/**
 * The toolkit's quick test for gender bias after the evaluation: does a job
 * that scores higher get paid less than a job that scores lower, and is the
 * lower-paid job the one mostly held by women?
 */
import type { JobOutcome } from "./assemble";
import type { EmployeeInput } from "./payPolicy";

export interface Inversion {
  higher: JobOutcome;
  lower: JobOutcome;
  /** Average base pay of each job. */
  payHigher: number;
  payLower: number;
  /** The higher-scoring, lower-paid job is women-dominated and the other is not. */
  genderPattern: boolean;
}

export function averageBase(employees: EmployeeInput[], jobId: string): number | null {
  const pays = employees
    .filter((e) => e.jobId === jobId && e.basePay !== null)
    .map((e) => e.basePay as number);
  return pays.length ? pays.reduce((a, b) => a + b, 0) / pays.length : null;
}

export function payInversions(outcomes: JobOutcome[], employees: EmployeeInput[]): Inversion[] {
  const rows = outcomes
    .map((o) => ({ o, pay: averageBase(employees, o.job.id) }))
    .filter((r): r is { o: JobOutcome; pay: number } => r.o.score !== null && r.pay !== null);
  const out: Inversion[] = [];
  for (const a of rows)
    for (const b of rows)
      if ((a.o.score as number) > (b.o.score as number) && a.pay < b.pay)
        out.push({
          higher: a.o,
          lower: b.o,
          payHigher: a.pay,
          payLower: b.pay,
          genderPattern:
            a.o.predominance === "women-dominated" && b.o.predominance !== "women-dominated",
        });
  return out.sort((x, y) => Number(y.genderPattern) - Number(x.genderPattern));
}
