/**
 * Evaluation plans and scoring.
 *
 * A plan is a list of subfactors grouped under the four criteria in Article 4
 * of the EU Pay Transparency Directive (Directive (EU) 2023/970): skills,
 * responsibility, effort and working conditions. Two plans ship with JobEval:
 *
 * - "eige": the EIGE toolkit's 14 subfactors (default), 1,200 points.
 * - "simple": one subfactor per criterion with five levels, 1,000 points
 *   (the plan used in "From Job Analysis to Pay", Part 6).
 *
 * Three methods, following the EIGE toolkit's pathways by organisation size:
 *
 * - "points" (factor-point, Tool 5): points = weight × total × level ÷ top level.
 * - "graduated" (graduated factor comparison, Tool 3, micro-organisations):
 *   score = sum of levels on the shortlisted subfactors, unweighted.
 * - "paired" (paired comparison, Tool 4, small and medium organisations with
 *   up to 15 roles): score = number of comparisons a job wins.
 */
import { EIGE_SUBFACTORS, EIGE_TOTAL_POINTS } from "./eigePlan";

export type FactorKey = "skills" | "responsibility" | "effort" | "conditions";
export type PlanId = "eige" | "simple";
export type Method = "points" | "graduated" | "paired";

export const FACTOR_KEYS: FactorKey[] = ["skills", "responsibility", "effort", "conditions"];
export const FACTOR_NAMES: Record<FactorKey, string> = {
  skills: "Skills",
  responsibility: "Responsibility",
  effort: "Effort",
  conditions: "Working conditions",
};

export interface SubfactorDef {
  id: string;
  /** Toolkit number, e.g. "1.3". Custom subfactors use "1.+". */
  code: string;
  factor: FactorKey;
  name: string;
  /** Default share of total points, in percent. */
  weight: number;
  definition: string;
  questions: { topic: string; question: string }[];
  /** Level descriptions; the index is the level. A null entry is not offered. */
  levels: (string | null)[];
  mistakes: string[];
  howToAct: string[];
  example: string;
}

export interface PlanDef {
  id: PlanId;
  name: string;
  totalPoints: number;
  subfactors: SubfactorDef[];
}

const SIMPLE: SubfactorDef[] = [
  {
    id: "skills",
    code: "1",
    factor: "skills",
    name: "Skills (including soft skills)",
    weight: 35,
    definition:
      "The knowledge, abilities and attitudes the job requires, including communication, coaching and de-escalation.",
    questions: [],
    levels: [
      null,
      "Routine tasks learned on the job in days or weeks; simple instructions.",
      "Established procedures; some judgement within clear rules; courteous, accurate communication.",
      "Applies a body of practical or technical knowledge; interprets policies or rules for specific cases; explains, advises or de-escalates.",
      "Professional or specialist knowledge across a field; analyses non-routine problems; coaches, negotiates or persuades.",
      "Recognised expertise integrating several disciplines; shapes policy; leads change and resolves contested issues.",
    ],
    mistakes: [],
    howToAct: [],
    example: "",
  },
  {
    id: "responsibility",
    code: "2",
    factor: "responsibility",
    name: "Responsibility",
    weight: 35,
    definition:
      "Responsibility for people, goods, information and money, and the effect of errors.",
    questions: [],
    levels: [
      null,
      "Own tasks under close direction; errors are caught quickly.",
      "Own work with general direction; errors affect co-workers or customers.",
      "Accountable for a process, records or service where errors carry legal, financial or confidentiality consequences.",
      "Accountable for a function or programme; may supervise; decisions affect the wider organisation.",
      "Accountable for a whole function, its people, budget and outcomes.",
    ],
    mistakes: [],
    howToAct: [],
    example: "",
  },
  {
    id: "effort",
    code: "3",
    factor: "effort",
    name: "Effort (physical, mental, emotional)",
    weight: 20,
    definition: "The physical, mental and emotional demands of the job.",
    questions: [],
    levels: [
      null,
      "Light, occasional demands.",
      "Moderate concentration or physical demand for parts of the day.",
      "Sustained concentration, or regular emotional demand (for example, upset or distressed people).",
      "High sustained mental or emotional load, or heavy physical work.",
      "Extreme or continuous physical, mental or emotional demand.",
    ],
    mistakes: [],
    howToAct: [],
    example: "",
  },
  {
    id: "conditions",
    code: "4",
    factor: "conditions",
    name: "Working conditions",
    weight: 10,
    definition: "The physical, psychological and organisational environment of the job.",
    questions: [],
    levels: [
      null,
      "Office or similar; regular hours.",
      "Occasional discomfort, travel or irregular hours.",
      "Regular exposure to noise, weather, travel or shifts.",
      "Frequent hazards or unsocial hours.",
      "Hazardous or very demanding conditions most of the time.",
    ],
    mistakes: [],
    howToAct: [],
    example: "",
  },
];

export const PLANS: Record<PlanId, PlanDef> = {
  eige: {
    id: "eige",
    name: "EU toolkit plan (EIGE): 14 subfactors",
    totalPoints: EIGE_TOTAL_POINTS,
    subfactors: EIGE_SUBFACTORS,
  },
  simple: {
    id: "simple",
    name: "Simple plan: four factors, five levels",
    totalPoints: 1000,
    subfactors: SIMPLE,
  },
};

/** A subfactor the organisation defines itself (EIGE Tool 5, sheet 5). One per factor. */
export interface CustomSubfactor {
  id: string;
  factor: FactorKey;
  name: string;
  definition: string;
  /** Levels 0–5. */
  levels: string[];
  weight: number;
}

export function customToDef(c: CustomSubfactor): SubfactorDef {
  const no = FACTOR_KEYS.indexOf(c.factor) + 1;
  return {
    id: c.id,
    code: `${no}.+`,
    factor: c.factor,
    name: c.name || `Additional ${FACTOR_NAMES[c.factor].toLowerCase()} subfactor`,
    weight: c.weight,
    definition: c.definition,
    questions: [],
    levels: c.levels.map((t, i) => t || `Level ${i}`),
    mistakes: [],
    howToAct: [],
    example: "",
  };
}

export interface PlanSettings {
  planId: PlanId;
  method: Method;
  totalPoints: number;
  /** Weight per subfactor id, in percent of total points. */
  weights: Record<string, number>;
  /** Subfactors kept for the graduated factor comparison (micro-organisations). */
  shortlist: Record<string, boolean>;
  custom: CustomSubfactor[];
}

export function defaultSettings(planId: PlanId = "eige", method: Method = "points"): PlanSettings {
  const plan = PLANS[planId];
  return {
    planId,
    method,
    totalPoints: plan.totalPoints,
    weights: Object.fromEntries(plan.subfactors.map((s) => [s.id, s.weight])),
    shortlist: Object.fromEntries(plan.subfactors.map((s) => [s.id, true])),
    custom: [],
  };
}

export interface ActiveSubfactor extends SubfactorDef {
  /** Weight in use, percent. */
  weight: number;
  minLevel: number;
  maxLevel: number;
  custom: boolean;
}

/** The subfactors in use, in plan order, with custom subfactors after their factor. */
export function activeSubfactors(s: PlanSettings): ActiveSubfactor[] {
  const plan = PLANS[s.planId];
  const out: ActiveSubfactor[] = [];
  const withRange = (d: SubfactorDef, custom: boolean): ActiveSubfactor => {
    const offered = d.levels.map((t, i) => (t === null ? -1 : i)).filter((i) => i >= 0);
    return {
      ...d,
      weight: s.weights[d.id] ?? d.weight,
      minLevel: Math.min(...offered),
      maxLevel: Math.max(...offered),
      custom,
    };
  };
  for (const f of FACTOR_KEYS) {
    for (const d of plan.subfactors.filter((x) => x.factor === f)) out.push(withRange(d, false));
    for (const c of s.custom.filter((x) => x.factor === f))
      out.push(withRange(customToDef(c), true));
  }
  if (s.method === "graduated") return out.filter((d) => d.custom || s.shortlist[d.id] !== false);
  return out;
}

export function weightsTotal(s: PlanSettings): number {
  return activeSubfactors(s).reduce((t, d) => t + d.weight, 0);
}

export function factorWeight(s: PlanSettings, f: FactorKey): number {
  return activeSubfactors(s)
    .filter((d) => d.factor === f)
    .reduce((t, d) => t + d.weight, 0);
}

/** Points for one level of one subfactor (unrounded, as in EIGE Tool 5). */
export function pointsFor(d: ActiveSubfactor, level: number, totalPoints: number): number {
  return ((d.weight / 100) * totalPoints * level) / d.maxLevel;
}

/** Rounds to one decimal place for display and totals. */
export const round1 = (x: number) => Math.round(x * 10) / 10;

export type Levels = Record<string, number | null | undefined>;

/**
 * Score of one job under the points or graduated method, or null until every
 * subfactor in use has a level.
 */
export function levelScore(levels: Levels, s: PlanSettings): number | null {
  const subs = activeSubfactors(s);
  if (!subs.length) return null;
  let sum = 0;
  for (const d of subs) {
    const lv = levels[d.id];
    if (lv === null || lv === undefined) return null;
    sum += s.method === "graduated" ? lv : pointsFor(d, lv, s.totalPoints);
  }
  return round1(sum);
}

/** The highest score the method allows; used to draw equal-width groups. */
export function maxScore(s: PlanSettings, jobCount: number): number {
  if (s.method === "paired") return Math.max(1, jobCount - 1);
  if (s.method === "graduated") return activeSubfactors(s).reduce((t, d) => t + d.maxLevel, 0);
  return s.totalPoints;
}

export const METHOD_INFO: Record<Method, { name: string; who: string; how: string }> = {
  graduated: {
    name: "Graduated factor comparison",
    who: "Micro-organisations (fewer than 10 workers)",
    how: "Pick the subfactors that matter for your jobs, give each job a level on each, and add the levels up. No weights.",
  },
  paired: {
    name: "Paired comparison",
    who: "Small and medium organisations with 15 job roles or fewer",
    how: "Compare every pair of jobs and decide which is more demanding across the subfactors. A job's score is the number of comparisons it wins.",
  },
  points: {
    name: "Point-factor",
    who: "Organisations with more than 15 job roles, or any organisation that wants the most detail",
    how: "Give each job a level on every subfactor. Each level earns points according to the subfactor's weight.",
  },
};

/** The EIGE pathway suggested for an organisation's size and number of job roles. */
export function suggestMethod(workers: number | null, roles: number): Method {
  if (workers !== null && workers > 0 && workers < 10) return "graduated";
  if (roles <= 15 && (workers === null || workers < 250)) return "paired";
  return "points";
}
