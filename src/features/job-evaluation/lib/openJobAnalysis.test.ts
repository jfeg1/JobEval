import { describe, expect, it } from "vitest";
import { normalizeSummary, OjaParseError, parseOjaProject } from "./openJobAnalysis";
import { migrateV1 } from "../jobEvaluationStore";
import { fromFile } from "./evaluationFile";
import example from "./__fixtures__/oja-hr-assistant.json";

// The fixture is the "Load example" project from Open Job Analysis
// (HR Assistant, three raters), generated from the app's own code.
describe("Open Job Analysis import", () => {
  const s = parseOjaProject(example);

  it("reads the job and raters", () => {
    expect(s.title).toBe("HR Assistant (example)");
    expect(s.raterCount).toBe(3);
  });
  it("takes the final lists of the job analysis report", () => {
    // 8 critical tasks, of which T11 is linked to no critical competency.
    expect(s.stage).toBe("final");
    expect(s.criticalTasks.map((t) => t.no)).toEqual([1, 2, 4, 6, 7, 8, 12]);
    expect(s.criticalCompetencies.length).toBe(5);
    expect(s.criticalTasks.every((t) => t.linked?.length)).toBe(true);
    expect(s.criticalCompetencies.every((k) => k.linked?.length)).toBe(true);
  });
  it("shows the critical items so far when linkage is not rated", () => {
    const raw = example as unknown as { raters: { l: unknown }[] };
    const noLink = parseOjaProject({ ...raw, raters: raw.raters.map((r) => ({ ...r, l: {} })) });
    expect(noLink.stage).toBe("noLinkage");
    expect(noLink.criticalTasks).toHaveLength(8);
    expect(noLink.criticalCompetencies).toHaveLength(5);
  });
  it("keeps the rare-but-important audit task the analyst chose to keep", () => {
    const audit = s.criticalTasks.find((t) => t.text.startsWith("Prepares records"));
    expect(audit?.rareButImportant).toBe(true);
  });
  it("reads the job profile and the job experts' levels on the EU toolkit subfactors", () => {
    expect(s.department).toBe("Human Resources");
    expect(s.reportsTo).toBe("HR Manager");
    expect(s.projectId).toBe(example.id);
    expect(Object.keys(s.expertLevels)).toHaveLength(14);
    expect(s.expertLevels.knowledge).toEqual({ median: 4, min: 4, max: 4, n: 3 });
    expect(s.expertLevels.problemSolving).toEqual({ median: 3, min: 3, max: 4, n: 3 });
  });
  it("updates the same job when the project is imported again", async () => {
    const { useJobEvaluationStore } = await import("../jobEvaluationStore");
    const st = useJobEvaluationStore.getState();
    st.reset();
    const a = useJobEvaluationStore.getState().importOja(s);
    useJobEvaluationStore.getState().setRating(a.id, "knowledge", { final: 5 });
    const b = useJobEvaluationStore.getState().importOja({ ...s, criticalTasks: [] });
    expect(b).toEqual({ id: a.id, updated: true });
    const job = useJobEvaluationStore.getState().jobs[0];
    expect(useJobEvaluationStore.getState().jobs).toHaveLength(1);
    expect(job.title).toBe("HR Assistant");
    expect(job.ratings.knowledge.final).toBe(5);
    expect(job.analysis?.criticalTasks).toHaveLength(0);
  });
  it("rejects rater files and other JSON", () => {
    expect(() => parseOjaProject({ kind: "oja-response" })).toThrow(OjaParseError);
    expect(() => parseOjaProject({ hello: "world" })).toThrow(OjaParseError);
    expect(() => parseOjaProject({ ...example, raterMode: true })).toThrow(OjaParseError);
  });
  it("ignores the experts' levels once the profile is switched off", () => {
    const off = parseOjaProject({ ...example, eige: false });
    expect(off.expertLevels).toEqual({});
    expect(off.criticalTasks).toHaveLength(7);
  });
  it("fills in fields missing from jobs imported by an earlier version", () => {
    const old = {
      title: "HR Assistant",
      organisation: "",
      family: "",
      sources: "",
      raterCount: 3,
      criticalTasks: [],
      criticalCompetencies: [],
    };
    expect(normalizeSummary(null)).toBeNull();
    expect(normalizeSummary(old)?.expertLevels).toEqual({});
    expect(normalizeSummary(old)?.stage).toBe("legacy");
    const migrated = migrateV1({
      jobs: [{ id: "j1", title: "HR Assistant", analysis: old } as never],
    });
    expect(
      fromFile(JSON.stringify({ kind: "jobeval-evaluation", version: 2, data: migrated })).jobs[0]
        .analysis?.expertLevels
    ).toEqual({});
  });
});
