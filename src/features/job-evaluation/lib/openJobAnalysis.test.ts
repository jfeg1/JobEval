import { describe, expect, it } from "vitest";
import { OjaParseError, parseOjaProject } from "./openJobAnalysis";
import example from "./__fixtures__/oja-hr-assistant.json";

// The fixture is the "Load example" project from Open Job Analysis
// (HR Assistant, three raters), generated from the app's own code.
describe("Open Job Analysis import", () => {
  const s = parseOjaProject(example);

  it("reads the job and raters", () => {
    expect(s.title).toBe("HR Assistant (example)");
    expect(s.raterCount).toBe(3);
  });
  it("finds the same critical items as the app", () => {
    expect(s.criticalTasks.length).toBe(8);
    expect(s.criticalCompetencies.length).toBe(5);
  });
  it("keeps the rare-but-important audit task the analyst chose to keep", () => {
    const audit = s.criticalTasks.find((t) => t.text.startsWith("Prepares records"));
    expect(audit?.rareButImportant).toBe(true);
  });
  it("rejects rater files and other JSON", () => {
    expect(() => parseOjaProject({ kind: "oja-response" })).toThrow(OjaParseError);
    expect(() => parseOjaProject({ hello: "world" })).toThrow(OjaParseError);
    expect(() => parseOjaProject({ ...example, raterMode: true })).toThrow(OjaParseError);
  });
});
