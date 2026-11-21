/**
 * Turns job points into pay, following a pay philosophy the organisation
 * states explicitly:
 *
 * - The internal pay line is the organisation's own answer to "how much more
 *   should a bigger job pay?" (slope per 100 points), pegged at an anchor
 *   point either to the market line or to an amount set from the budget.
 * - The market line (ln pay = a + b × points) is fitted only to benchmark jobs
 *   (market figure present, duty match ≥ 70%). It is used to estimate a market
 *   rate for jobs without one, and to show the market's own slope; it is not
 *   the pay policy.
 * - Blended: target = position × (w × internal + (1 − w) × market).
 * - Layered: base = position × internal, plus a separate market supplement
 *   where the market pays more (the way U.S. federal pay separates basic pay
 *   from locality pay).
 */

export type Approach = "blended" | "layered";

export interface Band {
  from: number;
  to: number;
}

export interface PayPolicy {
  currency: string;
  /** 0 = pay what the market pays; 1 = pay what the job evaluation says. */
  internalWeight: number;
  /** 1 = market median; 0.95 = lag the market by 5%. */
  marketPosition: number;
  /** Extra pay for a job 100 points bigger, e.g. 0.2 = 20%. */
  slopePer100: number;
  anchorPoints: number;
  /** Set to peg the internal line to a budgeted amount; null pegs it to the market line. */
  anchorPayOverride: number | null;
  approach: Approach;
  /** Range minimum and maximum as a share of the midpoint. */
  rangeMin: number;
  rangeMax: number;
  bands: Band[];
  /** Minimum duty match for a job to count as a market benchmark. */
  benchmarkMatch: number;
}

export const DEFAULT_POLICY: PayPolicy = {
  currency: "USD",
  internalWeight: 0.5,
  marketPosition: 1,
  slopePer100: 0.2,
  anchorPoints: 500,
  anchorPayOverride: null,
  approach: "layered",
  rangeMin: 0.8,
  rangeMax: 1.2,
  bands: [
    { from: 200, to: 299 },
    { from: 300, to: 399 },
    { from: 400, to: 499 },
    { from: 500, to: 599 },
    { from: 600, to: 699 },
    { from: 700, to: 799 },
    { from: 800, to: 899 },
    { from: 900, to: 1000 },
  ],
  benchmarkMatch: 0.7,
};

export interface JobInput {
  id: string;
  title: string;
  /** Annual market median in the policy currency, if known. */
  marketMedian: number | null;
  /** Share of the survey job's duties this job matches, 0–1. */
  dutyMatch: number | null;
  marketSource: string;
  /** Evidence from the job analysis for each factor rating. */
  notes: string;
}

export interface MarketLine {
  a: number;
  b: number;
  n: number;
  r2: number | null;
  /** The market's own extra pay per 100 points. */
  slopePer100: number;
}

/** Least-squares fit of ln(pay) on points. Needs at least two distinct points. */
export function fitMarketLine(points: number[], pays: number[]): MarketLine | null {
  const pairs = points
    .map((x, i) => [x, pays[i]] as const)
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && y > 0);
  const n = pairs.length;
  if (n < 2) return null;
  const xs = pairs.map(([x]) => x);
  const ys = pairs.map(([, y]) => Math.log(y));
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
  }
  if (sxx === 0) return null;
  const b = sxy / sxx;
  const a = my - b * mx;
  const sst = ys.reduce((s, y) => s + (y - my) ** 2, 0);
  const sse = ys.reduce((s, y, i) => s + (y - (a + b * xs[i])) ** 2, 0);
  return { a, b, n, r2: sst > 0 ? 1 - sse / sst : null, slopePer100: Math.exp(100 * b) - 1 };
}

export const marketAt = (line: MarketLine, points: number): number =>
  Math.exp(line.a + line.b * points);

/** The amount the internal line passes through at the anchor point. */
export function anchorPay(policy: PayPolicy, line: MarketLine | null): number | null {
  if (policy.anchorPayOverride !== null && policy.anchorPayOverride > 0) {
    return policy.anchorPayOverride;
  }
  return line ? marketAt(line, policy.anchorPoints) : null;
}

export function internalAt(policy: PayPolicy, anchor: number, points: number): number {
  return anchor * (1 + policy.slopePer100) ** ((points - policy.anchorPoints) / 100);
}

export interface Grade {
  grade: number;
  /** Job group the grade was built from, when grades come from groups. */
  group?: number;
  from: number;
  to: number;
  midpoint: number;
  minimum: number;
  maximum: number;
}

const round100 = (x: number) => Math.round(x / 100) * 100;

export function buildGrades(
  policy: PayPolicy,
  line: MarketLine | null,
  anchor: number | null
): Grade[] {
  if (anchor === null) return [];
  return policy.bands.map((band, i) => {
    const centre = (band.from + band.to) / 2;
    const internal = internalAt(policy, anchor, centre);
    const market = line ? marketAt(line, centre) : internal;
    const mid =
      policy.approach === "layered"
        ? policy.marketPosition * internal
        : policy.marketPosition *
          (policy.internalWeight * internal + (1 - policy.internalWeight) * market);
    const midpoint = round100(mid);
    return {
      grade: i + 1,
      from: band.from,
      to: band.to,
      midpoint,
      minimum: round100(midpoint * policy.rangeMin),
      maximum: round100(midpoint * policy.rangeMax),
    };
  });
}

/** Grade by lower limits, so a score with decimals (e.g. 499.6) still finds its grade. */
export function gradeOf(points: number, grades: Grade[]): Grade | null {
  if (!grades.length || points < grades[0].from) return null;
  let found: Grade | null = null;
  for (const g of grades) if (points >= g.from) found = g;
  return found && points <= grades[grades.length - 1].to ? found : null;
}

export interface JobResult {
  job: JobInput;
  points: number | null;
  benchmark: boolean;
  /** Market median for benchmarks; market-line estimate otherwise. */
  marketReference: number | null;
  marketEstimated: boolean;
  internalValue: number | null;
  blendedTarget: number | null;
  layeredBase: number | null;
  layeredSupplement: number | null;
  grade: Grade | null;
}

export interface Evaluation {
  line: MarketLine | null;
  anchor: number | null;
  grades: Grade[];
  jobs: JobResult[];
}

export function isBenchmark(job: JobInput, policy: PayPolicy): boolean {
  return (
    job.marketMedian !== null &&
    job.marketMedian > 0 &&
    job.dutyMatch !== null &&
    job.dutyMatch >= policy.benchmarkMatch
  );
}

/** Pay targets for jobs whose points are known; `points[i]` belongs to `jobs[i]`. */
export function evaluate(
  jobs: JobInput[],
  points: (number | null)[],
  policy: PayPolicy
): Evaluation {
  const pts = points;
  const benchIdx = jobs
    .map((_, i) => i)
    .filter((i) => pts[i] !== null && isBenchmark(jobs[i], policy));
  const line = fitMarketLine(
    benchIdx.map((i) => pts[i] as number),
    benchIdx.map((i) => jobs[i].marketMedian as number)
  );
  const anchor = anchorPay(policy, line);
  const grades = buildGrades(policy, line, anchor);

  const results: JobResult[] = jobs.map((job, i) => {
    const p = pts[i];
    const benchmark = p !== null && isBenchmark(job, policy);
    let marketReference: number | null = null;
    let marketEstimated = false;
    if (benchmark) marketReference = job.marketMedian;
    else if (p !== null && line) {
      marketReference = marketAt(line, p);
      marketEstimated = true;
    }
    const internalValue = p !== null && anchor !== null ? internalAt(policy, anchor, p) : null;
    const blendedTarget =
      internalValue !== null && marketReference !== null
        ? policy.marketPosition *
          (policy.internalWeight * internalValue + (1 - policy.internalWeight) * marketReference)
        : null;
    const layeredBase = internalValue !== null ? policy.marketPosition * internalValue : null;
    const layeredSupplement =
      layeredBase !== null && marketReference !== null
        ? Math.max(0, policy.marketPosition * marketReference - layeredBase)
        : null;
    return {
      job,
      points: p,
      benchmark,
      marketReference,
      marketEstimated,
      internalValue,
      blendedTarget,
      layeredBase,
      layeredSupplement,
      grade: p !== null ? gradeOf(p, grades) : null,
    };
  });

  return { line, anchor, grades, jobs: results };
}

// ---------------------------------------------------------------- employees

export type Sex = "F" | "M" | "X" | "";

export interface EmployeeInput {
  id: string;
  label: string;
  jobId: string;
  sex: Sex;
  /** Annual base pay, full-time equivalent. Compa ratio uses base pay only. */
  basePay: number | null;
  /** Location differential as a share of base pay, e.g. 0.1706. */
  locationPct: number;
  marketSupplement: number;
  otherPay: number;
}

export type RangePosition = "below" | "within" | "above";

export interface EmployeeResult {
  employee: EmployeeInput;
  locationPay: number;
  totalPay: number | null;
  grade: Grade | null;
  compaRatio: number | null;
  rangePosition: RangePosition | null;
}

export function evaluateEmployee(
  e: EmployeeInput,
  gradeForJob: (jobId: string) => Grade | null
): EmployeeResult {
  const grade = gradeForJob(e.jobId);
  const base = e.basePay;
  const locationPay = base !== null ? base * (e.locationPct || 0) : 0;
  const totalPay =
    base !== null ? base + locationPay + (e.marketSupplement || 0) + (e.otherPay || 0) : null;
  const compaRatio = base !== null && grade ? base / grade.midpoint : null;
  const rangePosition: RangePosition | null =
    base !== null && grade
      ? base < grade.minimum
        ? "below"
        : base > grade.maximum
          ? "above"
          : "within"
      : null;
  return { employee: e, locationPay, totalPay, grade, compaRatio, rangePosition };
}

export interface EquityRow {
  grade: number;
  women: number;
  men: number;
  avgBaseWomen: number | null;
  avgBaseMen: number | null;
  /** (men − women) ÷ men, on average base pay. */
  gap: number | null;
  avgCompaWomen: number | null;
  avgCompaMen: number | null;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : null);

export function equityByGrade(results: EmployeeResult[], grades: Grade[]): EquityRow[] {
  return grades
    .map((g) => {
      const inGrade = results.filter(
        (r) => r.grade?.grade === g.grade && r.employee.basePay !== null
      );
      const w = inGrade.filter((r) => r.employee.sex === "F");
      const m = inGrade.filter((r) => r.employee.sex === "M");
      const avgBaseWomen = avg(w.map((r) => r.employee.basePay as number));
      const avgBaseMen = avg(m.map((r) => r.employee.basePay as number));
      return {
        grade: g.grade,
        women: w.length,
        men: m.length,
        avgBaseWomen,
        avgBaseMen,
        gap:
          avgBaseWomen !== null && avgBaseMen !== null && avgBaseMen > 0
            ? (avgBaseMen - avgBaseWomen) / avgBaseMen
            : null,
        avgCompaWomen: avg(w.map((r) => r.compaRatio).filter((x): x is number => x !== null)),
        avgCompaMen: avg(m.map((r) => r.compaRatio).filter((x): x is number => x !== null)),
      };
    })
    .filter((row) => row.women + row.men > 0);
}
