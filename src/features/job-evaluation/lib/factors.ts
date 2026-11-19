/**
 * Point plan: the four factors named in Article 4 of the EU Pay Transparency
 * Directive (Directive (EU) 2023/970): skills, effort, responsibility and
 * working conditions. Each factor has five levels; points per level rise in
 * equal steps up to the factor's maximum.
 */

export type FactorId = "skills" | "responsibility" | "effort" | "conditions";

export interface Factor {
  id: FactorId;
  name: string;
  /** Share of total points, 0–1. Weights should total 1. */
  weight: number;
  /** Plain-language definition of levels 1–5 (index 0 = level 1). */
  levels: [string, string, string, string, string];
}

export type FactorLevels = Record<FactorId, number | null>;

export const FACTOR_IDS: FactorId[] = ["skills", "responsibility", "effort", "conditions"];

export const DEFAULT_TOTAL_POINTS = 1000;

export const DEFAULT_FACTORS: Factor[] = [
  {
    id: "skills",
    name: "Skills (including soft skills)",
    weight: 0.4,
    levels: [
      "Routine tasks learned on the job in days or weeks; simple instructions.",
      "Established procedures; some judgement within clear rules; courteous, accurate communication.",
      "Applies a body of practical or technical knowledge; interprets policies or rules for specific cases; explains, advises or de-escalates.",
      "Professional or specialist knowledge across a field; analyses non-routine problems; coaches, negotiates or persuades.",
      "Recognised expertise integrating several disciplines; shapes policy; leads change and resolves contested issues.",
    ],
  },
  {
    id: "responsibility",
    name: "Responsibility",
    weight: 0.3,
    levels: [
      "Own tasks under close direction; errors are caught quickly.",
      "Own work with general direction; errors affect co-workers or customers.",
      "Accountable for a process, records or service where errors carry legal, financial or confidentiality consequences.",
      "Accountable for a function or programme; may supervise; decisions affect the wider organisation.",
      "Accountable for a whole function, its people, budget and outcomes.",
    ],
  },
  {
    id: "effort",
    name: "Effort (physical, mental, emotional)",
    weight: 0.15,
    levels: [
      "Light, occasional demands.",
      "Moderate concentration or physical demand for parts of the day.",
      "Sustained concentration, or regular emotional demand (for example, upset or distressed people).",
      "High sustained mental or emotional load, or heavy physical work.",
      "Extreme or continuous physical, mental or emotional demand.",
    ],
  },
  {
    id: "conditions",
    name: "Working conditions",
    weight: 0.15,
    levels: [
      "Office or similar; regular hours.",
      "Occasional discomfort, travel or irregular hours.",
      "Regular exposure to noise, weather, travel or shifts.",
      "Frequent hazards or unsocial hours.",
      "Hazardous or very demanding conditions most of the time.",
    ],
  },
];

export function emptyLevels(): FactorLevels {
  return { skills: null, responsibility: null, effort: null, conditions: null };
}

/** Points awarded for a level (1–5) of a factor. */
export function pointsForLevel(factor: Factor, level: number, totalPoints: number): number {
  return Math.round((factor.weight * totalPoints * level) / 5);
}

/** Total points for a job, or null until every factor has been rated. */
export function jobPoints(
  levels: FactorLevels,
  factors: Factor[],
  totalPoints: number
): number | null {
  let sum = 0;
  for (const f of factors) {
    const lv = levels[f.id];
    if (lv === null || lv === undefined) return null;
    sum += pointsForLevel(f, lv, totalPoints);
  }
  return sum;
}

export function weightsTotal(factors: Factor[]): number {
  return factors.reduce((s, f) => s + f.weight, 0);
}
