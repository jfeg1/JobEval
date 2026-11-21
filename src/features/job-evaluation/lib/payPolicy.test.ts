import { describe, expect, it } from "vitest";
import { defaultSettings, levelScore } from "./plans";
import {
  DEFAULT_POLICY,
  evaluate,
  evaluateEmployee,
  equityByGrade,
  fitMarketLine,
  type JobInput,
} from "./payPolicy";

// Worked example from Part 6, draft v2: simple plan at 35/35/20/10, BLS OEWS
// May 2025 national medians (USD). Every figure tested here appears in the article.
const SIMPLE = defaultSettings("simple", "points");
const pts = (s: number, r: number, e: number, c: number) =>
  levelScore({ skills: s, responsibility: r, effort: e, conditions: c }, SIMPLE);

const job = (id: string, median: number, match = 0.8): JobInput => ({
  id,
  title: id,
  marketMedian: median,
  dutyMatch: match,
  marketSource: "BLS OEWS May 2025",
  notes: "",
});
const JOBS: JobInput[] = [
  job("Office Clerk", 45010),
  job("Bookkeeper", 50670),
  job("HR Assistant", 50610),
  job("IT Support Technician", 61860),
  job("Payroll Clerk", 58260),
  job("HR Specialist", 75940),
  job("HR Manager", 149280),
];
const POINTS = [
  pts(2, 2, 2, 1),
  pts(3, 2, 2, 1),
  pts(3, 2, 3, 1),
  pts(3, 2, 3, 2),
  pts(3, 3, 2, 1),
  pts(4, 3, 3, 1),
  pts(5, 5, 3, 1),
];

describe("simple plan (Part 6)", () => {
  it("scores the seven jobs as in the article", () => {
    expect(POINTS).toEqual([380, 450, 490, 510, 520, 630, 840]);
  });
  it("returns null until every factor is rated", () => {
    expect(
      levelScore({ skills: 3, responsibility: 2, effort: null, conditions: 1 }, SIMPLE)
    ).toBeNull();
  });
});

describe("market line", () => {
  it("needs two points", () => {
    expect(fitMarketLine([500], [50000])).toBeNull();
  });
  it("finds the U.S. market paying about 31% more per 100 points", () => {
    const ev = evaluate(JOBS, POINTS, DEFAULT_POLICY);
    expect(ev.line?.n).toBe(7);
    expect(ev.line?.slopePer100).toBeCloseTo(0.3057, 3);
    expect(ev.anchor).toBeCloseTo(57220.94, 1);
  });
});

describe("pay in layers (article, Step 5)", () => {
  const ev = evaluate(JOBS, POINTS, DEFAULT_POLICY);
  const get = (id: string) => ev.jobs.find((j) => j.job.id === id)!;

  it("gives the HR Assistant $56,187 base pay and no supplement", () => {
    expect(Math.round(get("HR Assistant").layeredBase!)).toBe(56187);
    expect(get("HR Assistant").layeredSupplement).toBe(0);
  });
  it("separates the HR Manager's market premium", () => {
    expect(Math.round(get("HR Manager").layeredBase!)).toBe(106358);
    expect(Math.round(get("HR Manager").layeredSupplement!)).toBe(42922);
  });
  it("gives the IT Support Technician $58,274 plus a $3,586 supplement", () => {
    expect(Math.round(get("IT Support Technician").layeredBase!)).toBe(58274);
    expect(Math.round(get("IT Support Technician").layeredSupplement!)).toBe(3586);
  });
  it("costs $500,825 against $491,630 at market medians", () => {
    const total = ev.jobs.reduce((s, j) => s + j.layeredBase! + j.layeredSupplement!, 0);
    expect(Math.round(total)).toBe(500825);
    expect(JOBS.reduce((s, j) => s + (j.marketMedian ?? 0), 0)).toBe(491630);
  });
  it("puts the 400–499 grade at $41,800 – $52,200 – $62,600", () => {
    const g = ev.grades.find((x) => x.from === 400)!;
    expect([g.minimum, g.midpoint, g.maximum]).toEqual([41800, 52200, 62600]);
    expect(get("Bookkeeper").grade?.grade).toBe(g.grade);
    expect(get("HR Assistant").grade?.grade).toBe(g.grade);
  });
  it("estimates a market rate for a job that is not a benchmark", () => {
    const jobs = JOBS.map((j) => (j.id === "Payroll Clerk" ? { ...j, dutyMatch: 0.5 } : j));
    const r = evaluate(jobs, POINTS, DEFAULT_POLICY).jobs.find(
      (j) => j.job.id === "Payroll Clerk"
    )!;
    expect(r.benchmark).toBe(false);
    expect(r.marketEstimated).toBe(true);
  });
  it("uses a budgeted anchor when one is set", () => {
    const r = evaluate(JOBS, POINTS, { ...DEFAULT_POLICY, anchorPayOverride: 50000 });
    expect(r.anchor).toBe(50000);
    expect(r.jobs.find((j) => j.job.id === "Payroll Clerk")!.internalValue).toBeCloseTo(
      50000 * 1.2 ** 0.2,
      4
    );
  });
});

describe("employees", () => {
  const ev = evaluate(JOBS, POINTS, DEFAULT_POLICY);
  const gradeFor = (jobId: string) => ev.jobs.find((j) => j.job.id === jobId)?.grade ?? null;
  const emp = (id: string, jobId: string, sex: "F" | "M", base: number, supp = 0) => ({
    id,
    label: id,
    jobId,
    sex,
    basePay: base,
    locationPct: 0,
    marketSupplement: supp,
    otherPay: 0,
  });

  it("computes compa ratio on base pay only", () => {
    const r = evaluateEmployee(emp("E03", "HR Assistant", "F", 46500), gradeFor);
    expect(r.compaRatio).toBeCloseTo(46500 / 52200, 6);
    expect(r.rangePosition).toBe("within");
  });
  it("adds a location differential the way an SF-50 does", () => {
    // 2026 GS-7 step 1 base pay with the Rest of U.S. locality payment of 17.06%.
    const r = evaluateEmployee(
      { ...emp("F1", "HR Assistant", "F", 43106), locationPct: 0.1706 },
      gradeFor
    );
    expect(Math.round(r.totalPay as number)).toBe(50460);
  });
  it("reports gaps by grade", () => {
    const rs = [
      emp("E03", "HR Assistant", "F", 46500),
      emp("E04", "HR Assistant", "M", 52000),
      emp("E02", "Bookkeeper", "F", 47500),
    ].map((e) => evaluateEmployee(e, gradeFor));
    const row = equityByGrade(rs, ev.grades).find(
      (r) => r.grade === gradeFor("HR Assistant")!.grade
    )!;
    expect(row.women).toBe(2);
    expect(row.men).toBe(1);
    expect(row.gap).toBeCloseTo((52000 - 47000) / 52000, 6);
  });
});
