/**
 * Gender representation, job groups and a grade table, following the EIGE
 * toolkit (Tool 5, sheets 3, 8 and 11; Tools 3 and 4, pay structure sheets).
 */

export type Predominance = "women-dominated" | "men-dominated" | "balanced";

/**
 * EIGE Tool 5, sheet 3: women-dominated if women are 60% or more of the job's
 * holders, men-dominated if 40% or less, otherwise balanced.
 */
export function predominance(women: number, men: number): Predominance | null {
  const n = women + men;
  if (n <= 0) return null;
  const share = women / n;
  if (share >= 0.6) return "women-dominated";
  if (share <= 0.4) return "men-dominated";
  return "balanced";
}

export interface Band {
  from: number;
  to: number;
}

/**
 * Equal-width score bands from 0 to the maximum score. With 1,200 points and
 * ten groups this gives the toolkit's ranges: 0–120, 121–240, … 1081–1200.
 */
export function equalBands(max: number, count: number, wholeScores = false): Band[] {
  if (wholeScores) {
    // Scores are whole numbers (paired comparison, sum of levels): bands of whole numbers.
    const n = Math.max(1, Math.min(Math.round(count), max + 1));
    return Array.from({ length: n }, (_, i) => ({
      from: Math.ceil((i * (max + 1)) / n),
      to: Math.ceil(((i + 1) * (max + 1)) / n) - 1,
    }));
  }
  const n = Math.max(1, Math.round(count));
  const width = max / n;
  const whole = Number.isInteger(width);
  return Array.from({ length: n }, (_, i) => ({
    from: i === 0 ? 0 : whole ? i * width + 1 : Math.round(i * width * 10) / 10,
    to: i === n - 1 ? max : Math.round((i + 1) * width * 10) / 10,
  }));
}

/**
 * Group of a score, by the lower limits of the bands (like the toolkit's
 * approximate VLOOKUP): 595.2 falls in 481–600. Returns the 1-based group.
 */
export function groupOf(score: number, bands: Band[]): number | null {
  if (!bands.length || !Number.isFinite(score)) return null;
  let g: number | null = null;
  bands.forEach((b, i) => {
    if (score >= b.from) g = i + 1;
  });
  return g ?? 1;
}

export interface GradeRow {
  grade: number;
  /** The job group(s) the grade covers, as score ranges. */
  from: number;
  to: number;
  minimum: number;
  midpoint: number;
  maximum: number;
}

export interface GradeTableInput {
  /** Minimum of the lowest grade. */
  minSalary: number | null;
  /** Maximum of the highest grade. */
  maxSalary: number | null;
  /** Increase from one grade midpoint to the next, e.g. 0.15. */
  progression: number;
}

/**
 * A simple grade table from the four inputs in the toolkit's pay structure
 * sheet (minimum salary, maximum salary, number of grades, progression factor).
 * Midpoints rise by the progression factor from grade to grade. Every grade
 * gets the same range around its midpoint (± s), with s set so that the lowest
 * minimum and the highest maximum land exactly on the inputs.
 *
 * Returns null when the inputs cannot fit: a progression too steep for the
 * gap between minimum and maximum.
 */
export function gradeTable(
  bands: Band[],
  input: GradeTableInput
): { rows: GradeRow[]; spread: number } | null {
  const { minSalary: lo, maxSalary: hi, progression: p } = input;
  const n = bands.length;
  if (!n || lo === null || hi === null || lo <= 0 || hi <= lo || p < 0) return null;
  const r = hi / (lo * (1 + p) ** (n - 1));
  if (r <= 1) return null;
  const s = (r - 1) / (r + 1);
  const mid1 = lo / (1 - s);
  const round100 = (x: number) => Math.round(x / 100) * 100;
  const rows = bands.map((b, i) => {
    const mid = mid1 * (1 + p) ** i;
    return {
      grade: i + 1,
      from: b.from,
      to: b.to,
      minimum: round100(mid * (1 - s)),
      midpoint: round100(mid),
      maximum: round100(mid * (1 + s)),
    };
  });
  return { rows, spread: s };
}
