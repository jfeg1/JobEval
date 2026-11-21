import React from "react";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import type { FullEvaluation } from "../lib/assemble";
import { NumberInput, SectionNote } from "./inputs";
import { PolicyTab } from "./PolicyTab";
import { PolicyStructure } from "./PolicyStructure";
import { money, pct } from "./format";
import { fmtRange } from "./labels";

export const StructureTab: React.FC<{ ev: FullEvaluation }> = ({ ev }) => {
  const { structure, updateStructure, settings, policy, updatePolicy } = useJobEvaluationStore();
  const points = settings.method === "points";
  const basis = points ? structure.basis : "table";
  const c = policy.currency;
  const usedGroups = [...new Set(ev.outcomes.map((o) => o.group).filter((g) => g !== null))];

  return (
    <div className="space-y-6">
      {points && (
        <div className="card space-y-3">
          <h3 className="card-title">How to build the pay structure</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                [
                  "table",
                  "Grade table from your job groups",
                  "Set the lowest and highest salary and the step between grades, as in the EU toolkit. No market data needed.",
                ],
                [
                  "policy",
                  "Pay line from points and market data",
                  "Write your pay philosophy as numbers: how much more a bigger job pays, how you mix your values with the market, and supplements in layers (Part 6).",
                ],
              ] as const
            ).map(([v, title, text]) => (
              <label
                key={v}
                className={`cursor-pointer rounded-md border p-4 ${basis === v ? "border-sage-600 bg-sage-50" : "border-slate-200"}`}
              >
                <span className="flex items-center gap-2 font-semibold text-sage-900">
                  <input
                    type="radio"
                    name="basis"
                    checked={basis === v}
                    onChange={() => updateStructure({ basis: v })}
                  />
                  {title}
                </span>
                <span className="mt-1 block text-sm text-slate-700">{text}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {basis === "policy" && ev.policyEvaluation ? (
        <>
          <PolicyTab evaluation={ev.policyEvaluation} />
          <PolicyStructure evaluation={ev.policyEvaluation} />
        </>
      ) : (
        <>
          <div className="card space-y-4">
            <h3 className="card-title">Grade table</h3>
            <SectionNote>
              Each job group that holds a job becomes a pay grade, lowest first ({usedGroups.length}{" "}
              {usedGroups.length === 1 ? "grade" : "grades"} now). Midpoints rise by the progression
              factor from grade to grade. Every grade gets the same range around its midpoint, set
              so the table starts at your minimum and ends at your maximum. Use full-time annual
              amounts.
            </SectionNote>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="label" htmlFor="st-cur">
                  Currency
                </label>
                <input
                  id="st-cur"
                  className="input uppercase"
                  maxLength={3}
                  value={policy.currency}
                  onChange={(e) => updatePolicy({ currency: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="label" htmlFor="st-min">
                  Lowest salary (grade 1 minimum)
                </label>
                <NumberInput
                  id="st-min"
                  min={0}
                  value={structure.minSalary}
                  onChange={(v) => updateStructure({ minSalary: v })}
                />
              </div>
              <div>
                <label className="label" htmlFor="st-max">
                  Highest salary (top grade maximum)
                </label>
                <NumberInput
                  id="st-max"
                  min={0}
                  value={structure.maxSalary}
                  onChange={(v) => updateStructure({ maxSalary: v })}
                />
              </div>
              <div>
                <label className="label" htmlFor="st-prog">
                  Progression between grades
                </label>
                <NumberInput
                  id="st-prog"
                  percent
                  min={0}
                  value={structure.progression}
                  onChange={(v) => updateStructure({ progression: v ?? 0 })}
                />
              </div>
            </div>
            {!ev.grades.length ? (
              <p role="status" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                {structure.minSalary === null || structure.maxSalary === null
                  ? "Enter the lowest and highest salary to build the table."
                  : !usedGroups.length
                    ? "Score at least one job first."
                    : "These numbers do not fit: the progression is too steep for the gap between the lowest and highest salary. Lower the progression or widen the gap."}
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Range around each midpoint: ±{pct(ev.tableSpread, 1)} (minimum to maximum spread{" "}
                  {pct(
                    ev.tableSpread !== null ? (2 * ev.tableSpread) / (1 - ev.tableSpread) : null
                  )}
                  ). Common practice is 20–40% for jobs that are learned quickly and wider for
                  professional jobs; if yours is far outside that, adjust the inputs.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Grade</th>
                        <th className="px-3 py-2">Job group (scores)</th>
                        <th className="px-3 py-2">Jobs</th>
                        <th className="px-3 py-2 text-right">Minimum</th>
                        <th className="px-3 py-2 text-right">Midpoint</th>
                        <th className="px-3 py-2 text-right">Maximum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ev.grades.map((g) => (
                        <tr key={g.grade}>
                          <td className="px-3 py-2 font-medium">{g.grade}</td>
                          <td className="px-3 py-2">
                            {g.group} ({fmtRange(g.from, g.to)})
                          </td>
                          <td className="px-3 py-2">
                            {ev.outcomes
                              .filter((o) => o.grade?.grade === g.grade)
                              .map((o) => o.job.title)
                              .join(", ")}
                          </td>
                          <td className="px-3 py-2 text-right">{money(g.minimum, c)}</td>
                          <td className="px-3 py-2 text-right">{money(g.midpoint, c)}</td>
                          <td className="px-3 py-2 text-right">{money(g.maximum, c)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className="card">
            <SectionNote>
              Apply the same principle to every part of pay: basic pay and any complementary or
              variable components (allowances, bonuses, benefits) must follow objective,
              gender-neutral criteria (Directive, Art. 4). Record them per person on the Employees
              tab.
            </SectionNote>
          </div>
        </>
      )}
    </div>
  );
};
