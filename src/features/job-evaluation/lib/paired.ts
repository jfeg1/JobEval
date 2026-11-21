/**
 * Paired comparison (EIGE toolkit, Tool 4). Each pair of jobs is compared
 * once; the more demanding job gets 1, the other 0. A job's score is the sum.
 * Ties are not allowed: the toolkit asks the committee to look again.
 */

export interface PairDecision {
  /** Id of the more demanding job, or null while undecided. */
  winner: string | null;
  /** The dominant factor or subfactor behind the decision. */
  rationale: string;
}

export type PairMap = Record<string, PairDecision>;

export const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export function pairedScores(jobIds: string[], pairs: PairMap): Record<string, number> {
  const scores: Record<string, number> = Object.fromEntries(jobIds.map((id) => [id, 0]));
  for (let i = 0; i < jobIds.length; i++) {
    for (let j = i + 1; j < jobIds.length; j++) {
      const w = pairs[pairKey(jobIds[i], jobIds[j])]?.winner;
      if (w && w in scores) scores[w] += 1;
    }
  }
  return scores;
}

export function pairsTotal(n: number): number {
  return (n * (n - 1)) / 2;
}

export function pairsDecided(jobIds: string[], pairs: PairMap): number {
  let n = 0;
  for (let i = 0; i < jobIds.length; i++)
    for (let j = i + 1; j < jobIds.length; j++) {
      const w = pairs[pairKey(jobIds[i], jobIds[j])]?.winner;
      if (w === jobIds[i] || w === jobIds[j]) n++;
    }
  return n;
}

/**
 * Circular decisions (A beats B, B beats C, C beats A) mean the committee has
 * not applied the same criteria throughout. Returns each such triple once.
 */
export function inconsistentTriads(jobIds: string[], pairs: PairMap): [string, string, string][] {
  const beats = (a: string, b: string) => pairs[pairKey(a, b)]?.winner === a;
  const out: [string, string, string][] = [];
  const n = jobIds.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++) {
        const [a, b, c] = [jobIds[i], jobIds[j], jobIds[k]];
        if (
          (beats(a, b) && beats(b, c) && beats(c, a)) ||
          (beats(b, a) && beats(c, b) && beats(a, c))
        )
          out.push([a, b, c]);
      }
  return out;
}
