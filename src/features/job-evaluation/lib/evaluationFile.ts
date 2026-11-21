/**
 * The evaluation file: everything on the job evaluation screens, saved as one
 * JSON file so the work survives a cleared browser and can move to another
 * computer. It contains employee pay: store it as carefully as payroll data.
 */
import { initialData, normalizeData, type JobEvaluationData } from "../jobEvaluationStore";

export const FILE_KIND = "jobeval-evaluation";
export const FILE_VERSION = 2;

export function toFile(data: JobEvaluationData): string {
  return JSON.stringify(
    { kind: FILE_KIND, version: FILE_VERSION, savedAt: new Date().toISOString(), data },
    null,
    1
  );
}

export class EvaluationFileError extends Error {}

export function fromFile(text: string): JobEvaluationData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new EvaluationFileError("This file is not a JobEval evaluation file.");
  }
  const o = raw as { kind?: string; version?: number; data?: Partial<JobEvaluationData> };
  if (o?.kind === "oja-project")
    throw new EvaluationFileError(
      "This is an Open Job Analysis project. Import it on the Rate jobs tab."
    );
  if (o?.kind !== FILE_KIND || !o.data || typeof o.data !== "object")
    throw new EvaluationFileError("This file is not a JobEval evaluation file.");
  if ((o.version ?? 0) > FILE_VERSION)
    throw new EvaluationFileError("This file was saved by a newer version of JobEval.");
  const base = initialData();
  return normalizeData({
    ...base,
    ...o.data,
    settings: { ...base.settings, ...o.data.settings },
  } as JobEvaluationData);
}

/**
 * Hand-off from Open Job Analysis. When both apps run from the same site
 * (for example jfeg1.github.io), "Send to JobEval" leaves the project in this
 * browser-storage key and opens JobEval, which imports it and clears the key.
 */
export const INBOX_KEY = "jobeval-inbox";

export function takeInbox(): unknown[] {
  try {
    const raw = localStorage.getItem(INBOX_KEY);
    if (!raw) return [];
    localStorage.removeItem(INBOX_KEY);
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [v];
  } catch {
    return [];
  }
}
