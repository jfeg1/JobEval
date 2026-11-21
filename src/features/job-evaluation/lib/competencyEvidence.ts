/**
 * Competency evidence for the skills subfactors.
 *
 * In Open Job Analysis the analyst may place each competency under one of the
 * five skills subfactors of the EU toolkit. JobEval shows the report's final
 * competencies under their subfactor, and compares the level the committee
 * agrees with how strong that evidence is:
 *
 * - strong evidence (a competency rated important and linked to several
 *   critical tasks) with a level below the anchor needs a rationale;
 * - no competency at all with a level above the anchor needs a rationale.
 *
 * The anchor is the job experts' median level when the job evaluation profile
 * was collected, and the middle of the scale otherwise. Importance says how
 * much a competency matters, not how demanding it is, so it never sets the
 * level: it only asks the committee to explain a level that goes against it.
 */
import type { OjaCompetencyEvidence, OjaSummary } from "./openJobAnalysis";

/** The skills subfactors of the EU toolkit plan a competency can be placed under. */
export const SKILL_SUBFACTORS = [
  "knowledge",
  "communication",
  "problemSolving",
  "planning",
  "physicalSkills",
] as const;

export interface EvidenceRules {
  /** Average importance (1–5) at or above which a competency counts as strong evidence. */
  strongImportance: number;
  /** Number of critical tasks it must be linked to (final lists only). */
  strongLinks: number;
}

export const DEFAULT_EVIDENCE_RULES: EvidenceRules = { strongImportance: 4, strongLinks: 2 };

export type EvidenceStrength = "none" | "some" | "strong";

export interface SkillEvidence {
  competencies: OjaCompetencyEvidence[];
  strength: EvidenceStrength;
}

const isSkill = (id: string) => (SKILL_SUBFACTORS as readonly string[]).includes(id);

/** Whether this competency is strong evidence. Links count only once linkage is rated. */
export function isStrong(k: OjaCompetencyEvidence, rules: EvidenceRules, final: boolean): boolean {
  if ((k.importance ?? 0) < rules.strongImportance) return false;
  return !final || (k.linked?.length ?? 0) >= rules.strongLinks;
}

/**
 * The evidence for one skills subfactor, or null when there is nothing to
 * compare: not a skills subfactor, no analysis, or an analysis whose
 * competencies were never placed under a subfactor.
 */
export function skillEvidence(
  analysis: OjaSummary | null | undefined,
  subId: string,
  rules: EvidenceRules
): SkillEvidence | null {
  if (!analysis || !isSkill(subId) || analysis.stage === "legacy") return null;
  if (!analysis.criticalCompetencies.some((k) => k.subfactor)) return null;
  const competencies = analysis.criticalCompetencies.filter((k) => k.subfactor === subId);
  const final = analysis.stage === "final";
  const strength: EvidenceStrength = !competencies.length
    ? "none"
    : competencies.some((k) => isStrong(k, rules, final))
      ? "strong"
      : "some";
  return { competencies, strength };
}

export type EvidenceCheck = "belowEvidence" | "aboveEvidence";

/**
 * Whether the agreed level goes against the evidence, so that the committee
 * should write down why. anchor: the experts' median, or null to use the
 * middle of the scale.
 */
export function evidenceCheck(
  ev: SkillEvidence | null,
  level: number | null | undefined,
  anchor: number | null | undefined,
  maxLevel: number
): EvidenceCheck | null {
  if (!ev || level === null || level === undefined) return null;
  const a = anchor ?? maxLevel / 2;
  if (ev.strength === "strong" && level < a) return "belowEvidence";
  if (ev.strength === "none" && level > a) return "aboveEvidence";
  return null;
}

/** The check, if it still needs a rationale (none written yet). */
export function openEvidenceCheck(
  ev: SkillEvidence | null,
  level: number | null | undefined,
  anchor: number | null | undefined,
  maxLevel: number,
  rationale: string | undefined
): EvidenceCheck | null {
  const c = evidenceCheck(ev, level, anchor, maxLevel);
  return c && !(rationale ?? "").trim() ? c : null;
}

export const EVIDENCE_CHECK_TEXT: Record<EvidenceCheck, string> = {
  belowEvidence:
    "The job analysis has strong competency evidence for this subfactor, but the agreed level is below the job experts' level. Write down why.",
  aboveEvidence:
    "No critical competency in the job analysis is placed under this subfactor, but the agreed level is above the job experts' level. Write down the evidence for it.",
};

export const EVIDENCE_CHECK_TEXT_NO_PROFILE: Record<EvidenceCheck, string> = {
  belowEvidence:
    "The job analysis has strong competency evidence for this subfactor, but the agreed level is in the lower half of the scale. Write down why.",
  aboveEvidence:
    "No critical competency in the job analysis is placed under this subfactor, but the agreed level is in the upper half of the scale. Write down the evidence for it.",
};
