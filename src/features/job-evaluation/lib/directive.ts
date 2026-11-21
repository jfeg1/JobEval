/**
 * Figures for the EU Pay Transparency Directive (Directive (EU) 2023/970).
 *
 * Pay is entered as full-time equivalent annual amounts, so differences
 * between women and men are the same as with hourly pay (Art. 3(1)(b): pay
 * level means gross annual pay and the corresponding gross hourly pay).
 * Base pay is the "ordinary basic wage or salary"; every other line
 * (location, market supplement, other pay) counts as "complementary or
 * variable components" (Art. 3(1)(a)).
 *
 * Only workers recorded as female or male enter the gap figures; the
 * Directive defines the gaps between female and male workers.
 */

export interface PayRecord {
  sex: "F" | "M" | "X" | "";
  /** Category of workers: the grade (work of equal value). Null if unknown. */
  category: number | null;
  base: number;
  /** Complementary or variable components, annual. */
  variable: number;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** (men − women) ÷ men. Positive means women are paid less. */
export function gap(women: number | null, men: number | null): number | null {
  return women !== null && men !== null && men > 0 ? (men - women) / men : null;
}

export interface QuartileRow {
  band: 1 | 2 | 3 | 4;
  women: number;
  men: number;
  shareWomen: number | null;
}

export interface GapReport {
  women: number;
  men: number;
  /** People excluded because their sex is not recorded as female or male. */
  excluded: number;
  /** (a) Gap in average total pay. */
  meanGap: number | null;
  /** (b) Gap in average complementary or variable pay, among those who receive it. */
  meanVariableGap: number | null;
  /** (c) Median gap in total pay. */
  medianGap: number | null;
  /** (d) Median gap in complementary or variable pay, among those who receive it. */
  medianVariableGap: number | null;
  /** (e) Share of women and of men receiving complementary or variable pay. */
  receivingVariableWomen: number | null;
  receivingVariableMen: number | null;
  /** (f) Women and men in each quartile pay band, lowest pay first. */
  quartiles: QuartileRow[];
  /** (g) By category of workers. */
  categories: CategoryRow[];
}

export interface CategoryRow {
  category: number;
  women: number;
  men: number;
  avgBaseWomen: number | null;
  avgBaseMen: number | null;
  avgVariableWomen: number | null;
  avgVariableMen: number | null;
  avgTotalWomen: number | null;
  avgTotalMen: number | null;
  baseGap: number | null;
  variableGap: number | null;
  totalGap: number | null;
  /** Art. 10(1)(a): a difference of 5% or more in average pay, either way. */
  needsJustification: boolean;
}

export const JOINT_ASSESSMENT_THRESHOLD = 0.05;

export function categoryRows(records: PayRecord[]): CategoryRow[] {
  const cats = [...new Set(records.map((r) => r.category).filter((c): c is number => c !== null))];
  return cats
    .sort((a, b) => a - b)
    .map((category) => {
      const inCat = records.filter((r) => r.category === category);
      const w = inCat.filter((r) => r.sex === "F");
      const m = inCat.filter((r) => r.sex === "M");
      const avgBaseWomen = mean(w.map((r) => r.base));
      const avgBaseMen = mean(m.map((r) => r.base));
      const avgVariableWomen = mean(w.map((r) => r.variable));
      const avgVariableMen = mean(m.map((r) => r.variable));
      const avgTotalWomen = mean(w.map((r) => r.base + r.variable));
      const avgTotalMen = mean(m.map((r) => r.base + r.variable));
      const totalGap = gap(avgTotalWomen, avgTotalMen);
      return {
        category,
        women: w.length,
        men: m.length,
        avgBaseWomen,
        avgBaseMen,
        avgVariableWomen,
        avgVariableMen,
        avgTotalWomen,
        avgTotalMen,
        baseGap: gap(avgBaseWomen, avgBaseMen),
        variableGap: gap(avgVariableWomen, avgVariableMen),
        totalGap,
        needsJustification: totalGap !== null && Math.abs(totalGap) >= JOINT_ASSESSMENT_THRESHOLD,
      };
    });
}

export function gapReport(records: PayRecord[]): GapReport {
  const fm = records.filter((r) => r.sex === "F" || r.sex === "M");
  const total = (r: PayRecord) => r.base + r.variable;
  const w = fm.filter((r) => r.sex === "F");
  const m = fm.filter((r) => r.sex === "M");
  const wv = w.filter((r) => r.variable > 0);
  const mv = m.filter((r) => r.variable > 0);

  // Quartile pay bands: everyone ranked by total pay, split into four equal groups.
  const ranked = [...fm].sort((a, b) => total(a) - total(b));
  const quartiles: QuartileRow[] = ([1, 2, 3, 4] as const).map((band) => {
    const inBand = ranked.filter((_, i) => Math.floor((i * 4) / ranked.length) + 1 === band);
    const women = inBand.filter((r) => r.sex === "F").length;
    const men = inBand.filter((r) => r.sex === "M").length;
    return { band, women, men, shareWomen: women + men ? women / (women + men) : null };
  });

  return {
    women: w.length,
    men: m.length,
    excluded: records.length - fm.length,
    meanGap: gap(mean(w.map(total)), mean(m.map(total))),
    meanVariableGap: gap(mean(wv.map((r) => r.variable)), mean(mv.map((r) => r.variable))),
    medianGap: gap(median(w.map(total)), median(m.map(total))),
    medianVariableGap: gap(median(wv.map((r) => r.variable)), median(mv.map((r) => r.variable))),
    receivingVariableWomen: w.length ? wv.length / w.length : null,
    receivingVariableMen: m.length ? mv.length / m.length : null,
    quartiles,
    categories: categoryRows(fm),
  };
}

/** Art. 9(2)–(4): when an employer of a given size must first report, and how often. */
export function reportingDuty(workers: number | null): string {
  if (workers === null) return "Enter the number of workers in Set up to see your reporting duty.";
  if (workers >= 250)
    return "250 or more workers: report by 7 June 2027 (for 2026) and every year after.";
  if (workers >= 150)
    return "150 to 249 workers: report by 7 June 2027 (for 2026) and every three years after.";
  if (workers >= 100)
    return "100 to 149 workers: report by 7 June 2031 (for 2030) and every three years after.";
  return "Fewer than 100 workers: no duty to report the gap, but you may report voluntarily (Art. 9(5)). The rights to pay information (Art. 5–7) still apply.";
}
