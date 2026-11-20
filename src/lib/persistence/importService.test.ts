import { describe, expect, it } from "vitest";
import { validateImportData } from "./importService";

// A backup saved before Quick Advisory was removed.
const legacyQuickAdvisoryBackup = {
  version: "1.0",
  exportDate: "2025-11-20T10:00:00.000Z",
  metadata: {
    appVersion: "0.9.0",
    evaluationType: "quick",
    lastModified: "2025-11-20T10:00:00.000Z",
  },
  data: {
    company: null,
    position: null,
    quickAdvisory: {
      jobTitle: "Bookkeeper",
      location: "Ohio",
      numEmployees: 1,
      proposedSalary: 48000,
      marketPositioning: "competitive",
    },
    wizard: null,
    matching: null,
  },
};

describe("importing older backups", () => {
  it("accepts a backup that still contains Quick Advisory data", () => {
    const result = validateImportData(legacyQuickAdvisoryBackup);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
