import { describe, expect, it } from "vitest";
import example from "./__fixtures__/oja-hr-assistant.json";
import { normalizeSummary, parseOjaProject } from "./openJobAnalysis";
import {
  DEFAULT_EVIDENCE_RULES as R,
  evidenceCheck,
  openEvidenceCheck,
  skillEvidence,
} from "./competencyEvidence";

// Example: all five final competencies (Reading, Writing, Interpersonal Skills,
// Oral Communication, Customer Service) are placed under communication.
// No final competency is placed under knowledge, problem-solving or planning.
describe("Competency evidence for the skills subfactors", () => {
  const s = parseOjaProject(example);

  it("reads the skills subfactor of each competency", () => {
    expect(s.criticalCompetencies.map((k) => k.subfactor)).toEqual([
      "communication",
      "communication",
      "communication",
      "communication",
      "communication",
    ]);
    const bad = {
      ...example,
      competencies: example.competencies.map((c) => ({ ...c, subfactor: "people" })),
    };
    expect(parseOjaProject(bad).criticalCompetencies.every((k) => k.subfactor === "")).toBe(true);
  });

  it("rates the strength of the evidence", () => {
    expect(skillEvidence(s, "communication", R)?.strength).toBe("strong");
    expect(skillEvidence(s, "communication", R)?.competencies).toHaveLength(5);
    expect(skillEvidence(s, "knowledge", R)).toEqual({ competencies: [], strength: "none" });
    // no competency is linked to nine critical tasks
    expect(
      skillEvidence(s, "communication", { strongImportance: 4, strongLinks: 9 })?.strength
    ).toBe("some");
    // only skills subfactors, and only when the analyst placed competencies at all
    expect(skillEvidence(s, "people", R)).toBeNull();
    const unplaced = parseOjaProject({
      ...example,
      competencies: example.competencies.map((c) => ({ ...c, subfactor: "" })),
    });
    expect(skillEvidence(unplaced, "communication", R)).toBeNull();
    expect(skillEvidence(normalizeSummary({ title: "Old" }), "communication", R)).toBeNull();
  });

  it("does not need links before linkage is rated", () => {
    const raw = example as unknown as { raters: { l: unknown }[] };
    const noLink = parseOjaProject({ ...raw, raters: raw.raters.map((r) => ({ ...r, l: {} })) });
    expect(noLink.stage).toBe("noLinkage");
    expect(skillEvidence(noLink, "communication", R)?.strength).toBe("strong");
  });

  it("asks for a rationale when the level goes against the evidence", () => {
    const strong = skillEvidence(s, "communication", R);
    const none = skillEvidence(s, "knowledge", R);
    const median = s.expertLevels.communication.median; // 3
    expect(evidenceCheck(strong, median - 1, median, 5)).toBe("belowEvidence");
    expect(evidenceCheck(strong, median, median, 5)).toBeNull();
    expect(evidenceCheck(strong, median + 1, median, 5)).toBeNull();
    expect(evidenceCheck(none, 5, 4, 8)).toBe("aboveEvidence");
    expect(evidenceCheck(none, 4, 4, 8)).toBeNull();
    expect(evidenceCheck(none, 2, 4, 8)).toBeNull();
    expect(evidenceCheck(strong, null, median, 5)).toBeNull();
    // a written rationale settles it
    expect(openEvidenceCheck(strong, 1, median, 5, "  ")).toBe("belowEvidence");
    expect(openEvidenceCheck(strong, 1, median, 5, "Only routine replies")).toBeNull();
  });

  it("uses the middle of the scale without a job evaluation profile", () => {
    const strong = skillEvidence(s, "communication", R);
    const none = skillEvidence(s, "knowledge", R);
    expect(evidenceCheck(strong, 2, null, 5)).toBe("belowEvidence");
    expect(evidenceCheck(strong, 3, null, 5)).toBeNull();
    expect(evidenceCheck(none, 5, null, 8)).toBe("aboveEvidence");
    expect(evidenceCheck(none, 4, null, 8)).toBeNull();
  });
});
