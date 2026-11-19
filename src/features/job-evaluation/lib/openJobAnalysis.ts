/**
 * Reads a project file saved by Open Job Analysis
 * (https://github.com/jfeg1/work-analyzer.app) and returns the evidence a
 * rater needs: the critical tasks and competencies, with their averages.
 *
 * The rules mirror the app's core (OPM Delegated Examining Operations
 * Handbook, Appendix D): ratings of 0 are left out of averages; a task is
 * removed when at least half of raters scored it 0; critical tasks meet the
 * importance and frequency cutoffs; rare-but-important tasks count only if the
 * analyst chose to keep them; critical competencies meet the importance cutoff
 * and are needed at entry.
 */

export interface OjaTaskEvidence {
  text: string;
  importance: number | null;
  frequency: number | null;
  rareButImportant: boolean;
}

export interface OjaCompetencyEvidence {
  name: string;
  definition: string;
  importance: number | null;
  distinguishing: boolean;
}

export interface OjaSummary {
  title: string;
  organisation: string;
  family: string;
  sources: string;
  raterCount: number;
  criticalTasks: OjaTaskEvidence[];
  criticalCompetencies: OjaCompetencyEvidence[];
}

interface Cutoffs {
  taskImp: number;
  taskFreq: number;
  rareImp: number;
  compImp: number;
  compEntry: number;
  compDV: number;
}

const DEFAULT_CUTOFFS: Cutoffs = {
  taskImp: 3,
  taskFreq: 3,
  rareImp: 4,
  compImp: 3,
  compEntry: 2,
  compDV: 3,
};

type Dict = Record<string, unknown>;

const isNum = (x: unknown): x is number => typeof x === "number" && !Number.isNaN(x);

function mean(vals: unknown[]): number | null {
  const v = vals.filter((x): x is number => isNum(x) && x > 0);
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

const asDict = (x: unknown): Dict => (x && typeof x === "object" ? (x as Dict) : {});
const asArr = (x: unknown): Dict[] => (Array.isArray(x) ? (x as Dict[]) : []);
const asStr = (x: unknown): string => (typeof x === "string" ? x : "");

export class OjaParseError extends Error {}

export function parseOjaProject(raw: unknown): OjaSummary {
  const p = asDict(raw);
  if (p.kind === "oja-response") {
    throw new OjaParseError(
      "This is a rater's response file. Open the main project file saved from Open Job Analysis instead."
    );
  }
  if (p.kind !== "oja-project") {
    throw new OjaParseError("This file was not saved by Open Job Analysis.");
  }
  if (p.raterMode) {
    throw new OjaParseError(
      "This is a rater's file for one person. Open the main project file that combines all ratings."
    );
  }

  const job = asDict(p.job);
  const c: Cutoffs = { ...DEFAULT_CUTOFFS, ...(asDict(p.cutoffs) as Partial<Cutoffs>) };
  const keep = asDict(p.keepTasks);
  const raters = asArr(p.raters);

  const criticalTasks: OjaTaskEvidence[] = [];
  for (const t of asArr(p.tasks)) {
    const id = asStr(t.id);
    const rs = raters
      .map((r) => asDict(asDict(r.t)[id]))
      .filter((x) => isNum(x.imp) && isNum(x.freq));
    const n = rs.length;
    if (!n) continue;
    const notPerformed = rs.filter((x) => x.imp === 0 || x.freq === 0).length;
    if (notPerformed >= n / 2) continue;
    const imp = mean(rs.map((x) => x.imp));
    const freq = mean(rs.map((x) => x.freq));
    if (imp === null || freq === null) continue;
    const byRule = imp >= c.taskImp && freq >= c.taskFreq;
    const rare = !byRule && imp >= c.rareImp && freq < c.taskFreq;
    if (byRule || (rare && keep[id] === true)) {
      criticalTasks.push({
        text: asStr(t.text),
        importance: imp,
        frequency: freq,
        rareButImportant: rare,
      });
    }
  }

  const criticalCompetencies: OjaCompetencyEvidence[] = [];
  for (const k of asArr(p.competencies)) {
    const id = asStr(k.id);
    const rs = raters
      .map((r) => asDict(asDict(r.c)[id]))
      .filter((x) => isNum(x.imp) && isNum(x.entry) && isNum(x.dv));
    if (!rs.length) continue;
    const imp = mean(rs.map((x) => x.imp));
    const entry = mean(rs.map((x) => x.entry));
    const dv = mean(rs.map((x) => x.dv));
    if (imp === null || entry === null) continue;
    if (imp >= c.compImp && entry <= c.compEntry) {
      criticalCompetencies.push({
        name: asStr(k.name),
        definition: asStr(k.definition),
        importance: imp,
        distinguishing: dv !== null && dv >= c.compDV,
      });
    }
  }

  criticalTasks.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
  criticalCompetencies.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));

  return {
    title: asStr(job.title),
    organisation: asStr(job.org),
    family: asStr(job.family),
    sources: asStr(job.sources),
    raterCount: raters.length,
    criticalTasks,
    criticalCompetencies,
  };
}
