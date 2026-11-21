import { describe, expect, it } from "vitest";
import {
  activeSubfactors,
  defaultSettings,
  levelScore,
  maxScore,
  pointsFor,
  suggestMethod,
} from "./plans";
import { EIGE_SUBFACTORS } from "./eigePlan";
import { equalBands, gradeTable, groupOf, predominance } from "./groups";
import { inconsistentTriads, pairedScores, pairKey, pairsDecided, type PairMap } from "./paired";
import { evaluateAll, payRecords } from "./assemble";
import { gapReport, reportingDuty } from "./directive";
import { dataOf, migrateV1 } from "../jobEvaluationStore";
import { eigeExample, part6Example } from "../example";

const EIGE = defaultSettings("eige", "points");

describe("EIGE factor and subfactor plan", () => {
  it("has 14 subfactors weighted 40/35/15/10", () => {
    expect(EIGE_SUBFACTORS).toHaveLength(14);
    const by = (f: string) =>
      EIGE_SUBFACTORS.filter((s) => s.factor === f).reduce((t, s) => t + s.weight, 0);
    expect([by("skills"), by("responsibility"), by("effort"), by("conditions")]).toEqual([
      40, 35, 15, 10,
    ]);
  });
  it("runs knowledge from 0 to 8 and the others from 0 to 5", () => {
    const subs = activeSubfactors(EIGE);
    expect(subs.find((s) => s.id === "knowledge")).toMatchObject({ minLevel: 0, maxLevel: 8 });
    expect(
      subs.filter((s) => s.id !== "knowledge").every((s) => s.minLevel === 0 && s.maxLevel === 5)
    ).toBe(true);
  });
  it("gives the same points per level as Tool 5 (sheet 4)", () => {
    const subs = activeSubfactors(EIGE);
    const p = (id: string, lv: number) => pointsFor(subs.find((s) => s.id === id)!, lv, 1200);
    expect(p("knowledge", 1)).toBeCloseTo(18, 6);
    expect(p("knowledge", 8)).toBeCloseTo(144, 6);
    expect(p("communication", 3)).toBeCloseTo(57.6, 6);
    expect(p("people", 5)).toBeCloseTo(144, 6);
    expect(p("organisational", 4)).toBeCloseTo(28.8, 6);
  });
  it("scores the toolkit's three example roles as Tool 5 does (sheet 7)", () => {
    const ev = evaluateAll(dataOf(eigeExample()));
    const score = (t: string) => ev.outcomes.find((o) => o.job.title === t)!;
    expect(score("Sous Chef").score).toBe(595.2);
    expect(score("Lead Event Coordinator").score).toBe(642);
    expect(score("Kitchen Assistant").score).toBe(366);
    expect([
      score("Sous Chef").group,
      score("Lead Event Coordinator").group,
      score("Kitchen Assistant").group,
    ]).toEqual([5, 6, 4]);
  });
  it("classifies the toolkit's head counts with the 60/40 rule (sheet 3)", () => {
    expect(predominance(3, 6)).toBe("men-dominated");
    expect(predominance(7, 3)).toBe("women-dominated");
    expect(predominance(10, 11)).toBe("balanced");
    expect(predominance(0, 0)).toBeNull();
  });
});

describe("job groups", () => {
  it("draws the toolkit's ten ranges for 1,200 points (sheet 4)", () => {
    const b = equalBands(1200, 10);
    expect(b[0]).toEqual({ from: 0, to: 120 });
    expect(b[1]).toEqual({ from: 121, to: 240 });
    expect(b[9]).toEqual({ from: 1081, to: 1200 });
  });
  it("finds a group by lower limit, like the toolkit's lookup", () => {
    const b = equalBands(1200, 10);
    expect(groupOf(595.2, b)).toBe(5);
    expect(groupOf(600.5, b)).toBe(5);
    expect(groupOf(601, b)).toBe(6);
    expect(groupOf(0, b)).toBe(1);
  });
  it("builds a grade table whose ends meet the minimum and maximum", () => {
    const t = gradeTable(equalBands(9, 3), {
      minSalary: 20000,
      maxSalary: 45000,
      progression: 0.15,
    })!;
    expect(t.rows[0].minimum).toBe(20000);
    expect(t.rows[2].maximum).toBe(45000);
    expect(t.rows[1].midpoint / t.rows[0].midpoint).toBeCloseTo(1.15, 2);
  });
  it("uses whole-number bands for whole-number scores", () => {
    expect(equalBands(2, 4, true)).toEqual([
      { from: 0, to: 0 },
      { from: 1, to: 1 },
      { from: 2, to: 2 },
    ]);
    expect(equalBands(68, 4, true).map((b) => [b.from, b.to])).toEqual([
      [0, 17],
      [18, 34],
      [35, 51],
      [52, 68],
    ]);
  });
  it("refuses a progression too steep for the salary span", () => {
    expect(
      gradeTable(equalBands(9, 3), { minSalary: 20000, maxSalary: 25000, progression: 0.2 })
    ).toBeNull();
  });
});

describe("graduated factor comparison (micro-organisations)", () => {
  const s = {
    ...defaultSettings("eige", "graduated"),
    shortlist: { ...EIGE.shortlist, physicalSkills: false },
  };
  it("adds up levels on the shortlist only, without weights", () => {
    const levels = Object.fromEntries(activeSubfactors(s).map((d) => [d.id, 2]));
    expect(activeSubfactors(s)).toHaveLength(13);
    expect(levelScore(levels, s)).toBe(26);
    expect(maxScore(s, 3)).toBe(8 + 12 * 5);
  });
});

describe("paired comparison (small and medium organisations)", () => {
  const ids = ["a", "b", "c"];
  const pairs: PairMap = {
    [pairKey("a", "b")]: { winner: "a", rationale: "" },
    [pairKey("a", "c")]: { winner: "a", rationale: "" },
    [pairKey("b", "c")]: { winner: "c", rationale: "" },
  };
  it("scores each job by the comparisons it wins", () => {
    expect(pairedScores(ids, pairs)).toEqual({ a: 2, b: 0, c: 1 });
    expect(pairsDecided(ids, pairs)).toBe(3);
  });
  it("flags circular decisions", () => {
    const loop: PairMap = {
      ...pairs,
      [pairKey("a", "c")]: { winner: "c", rationale: "" },
      [pairKey("b", "c")]: { winner: "b", rationale: "" },
    };
    expect(inconsistentTriads(ids, loop)).toHaveLength(1);
  });
});

describe("method by organisation size", () => {
  it("follows the toolkit's pathways", () => {
    expect(suggestMethod(6, 3)).toBe("graduated");
    expect(suggestMethod(40, 12)).toBe("paired");
    expect(suggestMethod(40, 20)).toBe("points");
    expect(suggestMethod(400, 12)).toBe("points");
  });
});

describe("Directive figures", () => {
  it("computes the Article 9 indicators", () => {
    const rec = (sex: "F" | "M", base: number, variable: number, category = 1) => ({
      sex,
      base,
      variable,
      category,
    });
    const r = gapReport([
      rec("F", 30000, 0),
      rec("F", 40000, 2000),
      rec("M", 40000, 4000),
      rec("M", 50000, 0),
      { sex: "X", base: 1, variable: 0, category: 1 },
    ]);
    expect(r.excluded).toBe(1);
    expect(r.meanGap).toBeCloseTo((47000 - 36000) / 47000, 6);
    expect(r.medianGap).toBeCloseTo((47000 - 36000) / 47000, 6);
    expect(r.meanVariableGap).toBeCloseTo(0.5, 6);
    expect(r.receivingVariableWomen).toBe(0.5);
    expect(r.quartiles.map((q) => [q.women, q.men])).toEqual([
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1],
    ]);
    expect(r.categories[0].needsJustification).toBe(true);
  });
  it("states the reporting duty by size", () => {
    expect(reportingDuty(300)).toMatch(/every year/);
    expect(reportingDuty(120)).toMatch(/2031/);
    expect(reportingDuty(40)).toMatch(/voluntarily/);
  });
  it("finds no gap inside the toolkit example's grades, where everyone in a role is paid the same", () => {
    const d = dataOf(eigeExample());
    const ev = evaluateAll(d);
    const rep = gapReport(payRecords(d.employees, ev));
    expect(rep.women + rep.men).toBe(40);
    expect(rep.categories.every((c) => !c.needsJustification)).toBe(true);
  });
  it("builds a grade table for the toolkit example from its occupied groups", () => {
    const ev = evaluateAll(dataOf(eigeExample()));
    expect(ev.grades.map((g) => g.group)).toEqual([4, 5, 6]);
    expect(ev.grades[0].minimum).toBe(20000);
    expect(ev.grades[2].maximum).toBe(45000);
  });
  it("keeps the Part 6 example on its pay policy", () => {
    const ev = evaluateAll(dataOf(part6Example()));
    expect(ev.policyEvaluation).not.toBeNull();
    expect(ev.outcomes.map((o) => o.score)).toEqual([380, 450, 490, 510, 520, 630, 840]);
  });
});

describe("saved work from the earlier version", () => {
  it("keeps four-factor ratings on the simple plan with their weights", () => {
    const d = migrateV1({
      factors: [
        { id: "skills", weight: 0.4 },
        { id: "responsibility", weight: 0.3 },
        { id: "effort", weight: 0.15 },
        { id: "conditions", weight: 0.15 },
      ],
      totalPoints: 1000,
      jobs: [
        {
          id: "j1",
          title: "HR Assistant",
          levels: { skills: 3, responsibility: 2, effort: 3, conditions: 1 },
          marketMedian: null,
          dutyMatch: null,
          marketSource: "",
          notes: "",
          analysis: null,
        } as never,
      ],
    });
    expect(d.settings.planId).toBe("simple");
    expect(d.structure.basis).toBe("policy");
    expect(evaluateAll(d).outcomes[0].score).toBe(480);
  });
});
