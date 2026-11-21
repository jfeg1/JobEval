/**
 * Reads a project file saved by Open Job Analysis
 * (https://github.com/jfeg1/work-analyzer.app) and returns the evidence a
 * rater needs: the final lists of the job analysis report, with their averages.
 *
 * The rules mirror the app's core (OPM Delegated Examining Operations
 * Handbook, Appendix D): ratings of 0 are left out of averages; a task is
 * removed when at least half of raters scored it 0; critical tasks meet the
 * importance and frequency cutoffs; rare-but-important tasks count only if the
 * analyst chose to keep them; critical competencies meet the importance cutoff
 * and are needed at entry. Once linkage ratings exist, the final lists keep
 * only the critical tasks and competencies linked to each other (average
 * linkage rating at or above the cutoff), as the report does; before that,
 * the report has no final lists and JobEval shows the critical items so far.
 *
 * Projects saved with the job evaluation profile switched on also carry each
 * job expert's level for the EIGE subfactors (rater.e), and the job profile
 * fields the toolkit asks for (department, reports to, purpose). JobEval shows
 * the experts' median and range beside each subfactor. The committee still
 * decides the level.
 */
import { SKILL_SUBFACTORS } from "./competencyEvidence";

export interface OjaTaskEvidence {
  /** Task number in the job analysis (T1, T2 …). */
  no?: number;
  text: string;
  importance: number | null;
  frequency: number | null;
  rareButImportant: boolean;
  /** Names of the competencies this task is linked to. */
  linked?: string[];
}

export interface OjaCompetencyEvidence {
  name: string;
  definition: string;
  importance: number | null;
  distinguishing: boolean;
  /** Numbers of the tasks this competency is linked to. */
  linked?: number[];
  /** The skills subfactor the analyst placed it under (EIGE subfactor id), or "". */
  subfactor?: string;
}

/**
 * Which lists the summary holds:
 * - "final": the report's final lists (critical and linked);
 * - "noLinkage": linkage not rated yet, so the critical items so far;
 * - "legacy": imported by an earlier JobEval that did not apply linkage.
 */
export type OjaStage = "final" | "noLinkage" | "legacy";

export interface ExpertLevel {
  median: number;
  min: number;
  max: number;
  /** Number of job experts who gave a level. */
  n: number;
}

export interface OjaSummary {
  /** The project's id, used to update the same job when the file is imported again. */
  projectId: string;
  title: string;
  department: string;
  reportsTo: string;
  purpose: string;
  lang: string;
  /** Job experts' levels per EIGE subfactor id. Empty if the profile was not collected. */
  expertLevels: Record<string, ExpertLevel>;
  organisation: string;
  family: string;
  sources: string;
  raterCount: number;
  stage: OjaStage;
  /** The report's final tasks (or the critical tasks so far; see stage). */
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
  link: number;
}

const DEFAULT_CUTOFFS: Cutoffs = {
  taskImp: 3,
  taskFreq: 3,
  rareImp: 4,
  compImp: 3,
  compEntry: 2,
  compDV: 3,
  link: 3,
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

/**
 * Fills in fields added after a summary was first saved. Jobs imported before
 * the job evaluation profile existed have no projectId or expertLevels.
 */
export function normalizeSummary(s: unknown): OjaSummary | null {
  if (!s || typeof s !== "object") return null;
  const o = s as Partial<OjaSummary>;
  return {
    projectId: "",
    title: "",
    department: "",
    reportsTo: "",
    purpose: "",
    lang: "en",
    organisation: "",
    family: "",
    sources: "",
    raterCount: 0,
    stage: "legacy",
    ...o,
    expertLevels: o.expertLevels && typeof o.expertLevels === "object" ? o.expertLevels : {},
    criticalTasks: Array.isArray(o.criticalTasks) ? o.criticalTasks : [],
    criticalCompetencies: Array.isArray(o.criticalCompetencies) ? o.criticalCompetencies : [],
  };
}

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

  type Task = OjaTaskEvidence & { id: string };
  type Comp = OjaCompetencyEvidence & { id: string };

  const tasks: Task[] = [];
  asArr(p.tasks).forEach((t, i) => {
    const id = asStr(t.id);
    const rs = raters
      .map((r) => asDict(asDict(r.t)[id]))
      .filter((x) => isNum(x.imp) && isNum(x.freq));
    const n = rs.length;
    if (!n) return;
    const notPerformed = rs.filter((x) => x.imp === 0 || x.freq === 0).length;
    if (notPerformed >= n / 2) return;
    const imp = mean(rs.map((x) => x.imp));
    const freq = mean(rs.map((x) => x.freq));
    if (imp === null || freq === null) return;
    const byRule = imp >= c.taskImp && freq >= c.taskFreq;
    const rare = !byRule && imp >= c.rareImp && freq < c.taskFreq;
    if (byRule || (rare && keep[id] === true)) {
      tasks.push({
        id,
        no: i + 1,
        text: asStr(t.text),
        importance: imp,
        frequency: freq,
        rareButImportant: rare,
        linked: [],
      });
    }
  });

  const comps: Comp[] = [];
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
      comps.push({
        id,
        name: asStr(k.name),
        definition: asStr(k.definition),
        importance: imp,
        distinguishing: dv !== null && dv >= c.compDV,
        linked: [],
        subfactor: (SKILL_SUBFACTORS as readonly string[]).includes(asStr(k.subfactor))
          ? asStr(k.subfactor)
          : "",
      });
    }
  }

  // Linkage: every critical task against every critical competency.
  let rated = 0;
  for (const t of tasks) {
    for (const k of comps) {
      const key = `${t.id}|${k.id}`;
      const vals = raters.map((r) => asDict(r.l)[key]).filter(isNum);
      if (vals.length) rated++;
      const avg = mean(vals);
      if (avg !== null && avg >= c.link) {
        t.linked!.push(k.name);
        k.linked!.push(t.no!);
      }
    }
  }
  const final = rated > 0;
  const strip = <T extends { id: string }>({ id: _id, ...rest }: T) => rest; // eslint-disable-line @typescript-eslint/no-unused-vars
  const criticalTasks = (final ? tasks.filter((t) => t.linked!.length) : tasks).map(strip);
  const criticalCompetencies = (final ? comps.filter((k) => k.linked!.length) : comps).map(strip);

  // Only when the profile is switched on: unticking it in Open Job Analysis
  // hides the levels there but keeps any already given in the file.
  const expertLevels: Record<string, ExpertLevel> = {};
  const subIds = new Set(p.eige ? raters.flatMap((r) => Object.keys(asDict(r.e))) : []);
  for (const id of subIds) {
    const vals = raters.map((r) => asDict(r.e)[id]).filter((x): x is number => isNum(x) && x >= 0);
    if (!vals.length) continue;
    const sorted = [...vals].sort((a, b) => a - b);
    const m = Math.floor(sorted.length / 2);
    expertLevels[id] = {
      median: sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      n: sorted.length,
    };
  }

  return {
    projectId: asStr(p.id),
    title: asStr(job.title),
    department: asStr(job.dept),
    reportsTo: asStr(job.reportsTo),
    purpose: asStr(job.purpose),
    lang: asStr(p.lang) || "en",
    expertLevels,
    organisation: asStr(job.org),
    family: asStr(job.family),
    sources: asStr(job.sources),
    raterCount: raters.length,
    stage: final ? "final" : "noLinkage",
    criticalTasks,
    criticalCompetencies,
  };
}
