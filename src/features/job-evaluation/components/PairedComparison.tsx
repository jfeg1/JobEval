import React from "react";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import { activeSubfactors } from "../lib/plans";
import { inconsistentTriads, pairKey, pairsDecided, pairsTotal } from "../lib/paired";
import type { FullEvaluation } from "../lib/assemble";
import { SectionNote } from "./inputs";
import { fmtScore, jobCode } from "./labels";

/** Paired comparison (EIGE Tool 4): every pair once, the more demanding job wins. */
export const PairedComparison: React.FC<{ ev: FullEvaluation }> = ({ ev }) => {
  const { jobs, pairs, setPair, settings, blind } = useJobEvaluationStore();
  const ids = jobs.map((j) => j.id);
  const name = (id: string) => {
    const i = jobs.findIndex((j) => j.id === id);
    return blind ? jobCode(i) : jobs[i]?.title || jobCode(i);
  };
  const decided = pairsDecided(ids, pairs);
  const total = pairsTotal(ids.length);
  const loops = inconsistentTriads(ids, pairs);
  const subNames = activeSubfactors({ ...settings, method: "points" }).map((d) => d.name);
  const ranked = [...ev.outcomes].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  if (jobs.length < 2) {
    return (
      <div className="card">
        <p className="card-text">Add at least two jobs to compare them in pairs.</p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="card-title">Compare jobs in pairs</h3>
        <span className="text-sm text-slate-600">
          {decided} of {total} pairs decided
        </span>
      </div>
      <SectionNote>
        For each pair, decide which job is more demanding across the subfactors: skills,
        responsibility, effort and working conditions. Name the subfactor that decided it. Look at
        the whole job, including the parts that are easy to overlook, such as emotional effort and
        care for others.
      </SectionNote>
      <datalist id="subfactor-names">
        {subNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <ol className="divide-y divide-slate-100">
        {ids.flatMap((a, i) =>
          ids.slice(i + 1).map((b) => {
            const k = pairKey(a, b);
            const d = pairs[k];
            return (
              <li key={k} className="grid items-center gap-2 py-2 md:grid-cols-[1fr_1fr_16rem]">
                {[a, b].map((id) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${d?.winner === id ? "border-sage-600 bg-sage-50 font-semibold" : "border-slate-200"}`}
                  >
                    <input
                      type="radio"
                      name={`pair-${k}`}
                      checked={d?.winner === id}
                      onChange={() => setPair(a, b, { winner: id })}
                    />
                    {name(id)} is more demanding
                  </label>
                ))}
                <input
                  aria-label={`Deciding subfactor for ${name(a)} and ${name(b)}`}
                  className="input"
                  list="subfactor-names"
                  placeholder="Deciding subfactor and why"
                  value={d?.rationale ?? ""}
                  onChange={(e) => setPair(a, b, { rationale: e.target.value })}
                />
              </li>
            );
          })
        )}
      </ol>
      {loops.length > 0 && (
        <div role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Circular decisions.</strong> In{" "}
          {loops.map((t) => t.map(name).join(", ")).join("; ")}, each job beats one and loses to
          another. The same criteria were not applied throughout: look at these pairs again.
        </div>
      )}
      <div>
        <h4 className="text-sm font-semibold text-sage-900">Ranking</h4>
        <table className="mt-2 min-w-[20rem] text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-1 pr-6">Job</th>
              <th className="py-1 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((o) => (
              <tr key={o.job.id}>
                <td className="py-1 pr-6">{name(o.job.id)}</td>
                <td className="py-1 text-right">{fmtScore(o.score)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
