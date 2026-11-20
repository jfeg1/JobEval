import { describe, expect, it } from "vitest";
import { DEFAULT_FACTORS, DEFAULT_TOTAL_POINTS, jobPoints, type FactorLevels } from "./factors";
import {
  DEFAULT_POLICY,
  evaluate,
  evaluateEmployee,
  equityByGrade,
  fitMarketLine,
  type JobInput,
  type PayPolicy,
} from "./payPolicy";

const lv = (s: number, r: number, e: number, c: number): FactorLevels => ({
  skills: s,
  responsibility: r,
  effort: e,
  conditions: c,
});

// Worked example from Part 6: BLS OEWS May 2025 national medians (USD).
const job = (id: string, levels: FactorLevels, median: number | null, match: number): JobInput => ({
  id,
  title: id,
  levels,
  marketMedian: median,
  dutyMatch: match,
  marketSource: "BLS OEWS May 2025",
  notes: "",
});
const JOBS: JobInput[] = [
  job("Office Clerk", lv(2, 2, 2, 1), 45010, 0.75),
  job("Bookkeeper", lv(3, 2, 2, 1), 50670, 0.8),
  job("HR Assistant", lv(3, 2, 3, 1), 50610, 0.85),
  job("Payroll Clerk", lv(3, 3, 2, 1), 58260, 0.8),
  job("HR Specialist", lv(4, 3, 3, 1), 75940, 0.75),
  job("HR Manager", lv(5, 5, 3, 1), 149280, 0.8),
];
const POLICY: PayPolicy = {
  ...DEFAULT_POLICY,
  bands: [
    { from: 300, to: 399 },
    { from: 400, to: 499 },
    { from: 500, to: 599 },
    { from: 600, to: 699 },
    { from: 700, to: 799 },
    { from: 800, to: 899 },
    { from: 900, to: 1000 },
  ],
};

describe("point plan", () => {
  it("scores the HR Assistant from Part 2 at 480 points", () => {
    expect(jobPoints(lv(3, 2, 3, 1), DEFAULT_FACTORS, DEFAULT_TOTAL_POINTS)).toBe(480);
  });
  it("returns null until every factor is rated", () => {
    expect(
      jobPoints({ ...lv(3, 2, 3, 1), effort: null }, DEFAULT_FACTORS, DEFAULT_TOTAL_POINTS)
    ).toBeNull();
  });
});

describe("market line", () => {
  it("needs two points", () => {
    expect(fitMarketLine([500], [50000])).toBeNull();
  });
  it("matches the spreadsheet template for the US data", () => {
    const ev = evaluate(JOBS, DEFAULT_FACTORS, DEFAULT_TOTAL_POINTS, POLICY);
    expect(ev.line?.n).toBe(6);
    expect(ev.line?.a).toBeCloseTo(9.58946, 4);
    expect(ev.line?.b).toBeCloseTo(0.002759, 6);
    expect(ev.line?.slopePer100).toBeCloseTo(0.3177, 3);
    expect(ev.anchor).toBeCloseTo(58044.86, 1);
  });
});

describe("pay targets", () => {
  const ev = evaluate(JOBS, DEFAULT_FACTORS, DEFAULT_TOTAL_POINTS, POLICY);
  const get = (id: string) => ev.jobs.find((j) => j.job.id === id)!;

  it("values the HR Assistant above its market median", () => {
    expect(get("HR Assistant").internalValue).toBeCloseTo(55966.42, 1);
    expect(get("HR Assistant").blendedTarget).toBeCloseTo(53288.21, 1);
    expect(get("HR Assistant").layeredSupplement).toBe(0);
  });
  it("separates the HR Manager's market premium as a supplement", () => {
    expect(get("HR Manager").layeredBase).toBeCloseTo(104026.45, 1);
    expect(get("HR Manager").layeredSupplement).toBeCloseTo(45253.55, 1);
  });
  it("estimates a market rate for a job that is not a benchmark", () => {
    const jobs = JOBS.map((j) => (j.id === "Payroll Clerk" ? { ...j, dutyMatch: 0.5 } : j));
    const r = evaluate(jobs, DEFAULT_FACTORS, DEFAULT_TOTAL_POINTS, POLICY).jobs.find(
      (j) => j.job.id === "Payroll Clerk"
    )!;
    expect(r.benchmark).toBe(false);
    expect(r.marketEstimated).toBe(true);
  });
  it("builds layered grade midpoints from the internal line", () => {
    expect(ev.grades.map((g) => g.midpoint)).toEqual([
      44100, 52900, 63500, 76200, 91500, 109800, 131800,
    ]);
    expect(ev.grades[0].minimum).toBe(35300);
    expect(ev.grades[0].maximum).toBe(52900);
    expect(get("HR Manager").grade?.grade).toBe(6);
  });
  it("uses a budgeted anchor when one is set", () => {
    const r = evaluate(JOBS, DEFAULT_FACTORS, DEFAULT_TOTAL_POINTS, {
      ...POLICY,
      anchorPayOverride: 50000,
    });
    expect(r.anchor).toBe(50000);
    expect(r.jobs.find((j) => j.job.id === "Payroll Clerk")!.internalValue).toBeCloseTo(
      50000 * 1.2 ** 0.1,
      4
    );
  });
});

describe("employees", () => {
  const ev = evaluate(JOBS, DEFAULT_FACTORS, DEFAULT_TOTAL_POINTS, POLICY);
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
    const r = evaluateEmployee(emp("E08", "HR Manager", "M", 104000, 45300), ev);
    expect(r.totalPay).toBe(149300);
    expect(r.compaRatio).toBeCloseTo(104000 / 109800, 6);
    expect(r.rangePosition).toBe("within");
  });
  it("adds a location differential the way an SF-50 does", () => {
    // 2026 GS-7 step 1 base pay with the Rest of U.S. locality payment of 17.06%.
    const r = evaluateEmployee(
      { ...emp("F1", "HR Assistant", "F", 43106), locationPct: 0.1706 },
      ev
    );
    expect(Math.round(r.totalPay as number)).toBe(50460);
  });
  it("reports gaps by grade", () => {
    const rs = [
      emp("E03", "HR Assistant", "F", 46500),
      emp("E04", "HR Assistant", "M", 52000),
      emp("E02", "Bookkeeper", "F", 47500),
    ].map((e) => evaluateEmployee(e, ev));
    const row = equityByGrade(rs, ev.grades).find((r) => r.grade === 2)!;
    expect(row.women).toBe(2);
    expect(row.men).toBe(1);
    expect(row.gap).toBeCloseTo((52000 - 47000) / 52000, 6);
  });
});
