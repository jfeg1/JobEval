import React from "react";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import type { Evaluation } from "../lib/payPolicy";
import { SectionNote } from "./inputs";
import { money, pct } from "./format";

export const StructureTab: React.FC<{ evaluation: Evaluation }> = ({ evaluation }) => {
  const { policy } = useJobEvaluationStore();
  const { line, anchor, grades, jobs } = evaluation;
  const c = policy.currency;
  const layered = policy.approach === "layered";
  const used = new Set(jobs.map((j) => j.grade?.grade).filter(Boolean));

  if (anchor === null) {
    return (
      <div className="card">
        <p className="card-text">
          To build a structure, either rate at least two benchmark jobs (with a market median and a
          duty match of {Math.round(policy.benchmarkMatch * 100)}% or more), or set the pay at the
          anchor point from your budget on the Pay policy tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h3 className="card-title">Jobs: internal value and market</h3>
        {line && (
          <SectionNote>
            Market line fitted to {line.n} benchmark jobs: the market pays{" "}
            {pct(line.slopePer100, 1)} more per 100 points
            {line.r2 !== null ? ` (R² = ${line.r2.toFixed(2)})` : ""}. Your policy says{" "}
            {pct(policy.slopePer100, 1)}. The market line only estimates a market rate for jobs
            without a good survey match; your policy sets pay.
          </SectionNote>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Job</th>
                <th className="px-3 py-2 text-right">Points</th>
                <th className="px-3 py-2 text-right">Grade</th>
                <th className="px-3 py-2 text-right">Market</th>
                <th className="px-3 py-2 text-right">Internal value</th>
                {layered ? (
                  <>
                    <th className="px-3 py-2 text-right">Base pay target</th>
                    <th className="px-3 py-2 text-right">Market supplement</th>
                  </>
                ) : (
                  <th className="px-3 py-2 text-right">Blended target</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <tr key={j.job.id}>
                  <td className="px-3 py-2 font-medium text-slate-800">{j.job.title}</td>
                  <td className="px-3 py-2 text-right">{j.points ?? "not rated"}</td>
                  <td className="px-3 py-2 text-right">{j.grade?.grade ?? "–"}</td>
                  <td className="px-3 py-2 text-right">
                    {money(j.marketReference, c)}
                    {j.marketEstimated && (
                      <span className="ml-1 text-xs text-slate-500" title="Estimated from points">
                        (est.)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{money(j.internalValue, c)}</td>
                  {layered ? (
                    <>
                      <td className="px-3 py-2 text-right">{money(j.layeredBase, c)}</td>
                      <td className="px-3 py-2 text-right">{money(j.layeredSupplement, c)}</td>
                    </>
                  ) : (
                    <td className="px-3 py-2 text-right">{money(j.blendedTarget, c)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="card-title">Grades and ranges</h3>
        <SectionNote>
          {layered
            ? "Midpoints are for base pay only; any market supplement sits on top. "
            : "Midpoints blend internal value and the market at each band's centre. "}
          A band should be wider than the error in your ratings: re-rate any job close to a band
          edge before placing it (Law &amp; Carlopio, 1993).
        </SectionNote>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Grade</th>
                <th className="px-3 py-2 text-right">Points</th>
                <th className="px-3 py-2 text-right">Minimum</th>
                <th className="px-3 py-2 text-right">Midpoint</th>
                <th className="px-3 py-2 text-right">Maximum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grades.map((g) => (
                <tr key={g.grade} className={used.has(g.grade) ? "" : "text-slate-400"}>
                  <td className="px-3 py-2 font-medium">{g.grade}</td>
                  <td className="px-3 py-2 text-right">
                    {g.from}–{g.to}
                  </td>
                  <td className="px-3 py-2 text-right">{money(g.minimum, c)}</td>
                  <td className="px-3 py-2 text-right">{money(g.midpoint, c)}</td>
                  <td className="px-3 py-2 text-right">{money(g.maximum, c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
