import type { Predominance } from "../lib/groups";

/** "Job A", "Job B" … used instead of titles when rating blind. */
export const jobCode = (index: number) =>
  `Job ${index < 26 ? String.fromCharCode(65 + index) : index + 1}`;

export const PREDOMINANCE_LABEL: Record<Predominance, string> = {
  "women-dominated": "Women-dominated",
  "men-dominated": "Men-dominated",
  balanced: "Balanced",
};

/** Categorical slots 1–3 of the dataviz reference palette (validated for colour-vision deficiency). */
export const PREDOMINANCE_COLOR: Record<Predominance, string> = {
  "women-dominated": "#2a78d6",
  "men-dominated": "#eb6834",
  balanced: "#1baf7a",
};

export const fmtScore = (x: number | null) =>
  x === null ? "–" : Number.isInteger(x) ? String(x) : x.toFixed(1);

export const fmtRange = (from: number, to: number) =>
  from === to ? fmtScore(from) : `${fmtScore(from)}–${fmtScore(to)}`;
