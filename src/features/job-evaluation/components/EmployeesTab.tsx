import React from "react";
import { Button } from "@/shared/components/ui";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import { equityByGrade, evaluateEmployee, type Sex, type RangePosition } from "../lib/payPolicy";
import type { FullEvaluation } from "../lib/assemble";
import { NumberInput, SectionNote } from "./inputs";
import { money, pct } from "./format";

const POSITION_LABEL: Record<RangePosition, string> = {
  below: "Below minimum",
  within: "Within range",
  above: "Above maximum",
};

export const EmployeesTab: React.FC<{ ev: FullEvaluation }> = ({ ev }) => {
  const { employees, jobs, policy, addEmployee, updateEmployee, removeEmployee } =
    useJobEvaluationStore();
  const c = policy.currency;
  const results = employees.map((e) => evaluateEmployee(e, ev.gradeForJob));
  const equity = equityByGrade(results, ev.grades);
  const supplementFor = (jobId: string) =>
    ev.policyEvaluation?.jobs.find((j) => j.job.id === jobId)?.layeredSupplement ?? null;

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h3 className="card-title">Pay by component</h3>
        <SectionNote>
          Record pay the way a U.S. Standard Form 50 does: base pay, plus a location differential,
          plus a market supplement, plus other pay, equals total pay. Each component needs its own
          documented, objective criterion. The compa ratio uses base pay only, so a supplement
          cannot hide a low base. Enter full-time equivalent annual amounts, so part-time pay
          compares fairly. For the Directive reports, base pay is the basic salary and every other
          line counts as complementary or variable pay. Use IDs, not names, if you will share a
          file.
        </SectionNote>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">Job</th>
                <th className="px-2 py-2">Sex</th>
                <th className="px-2 py-2">Base pay</th>
                <th className="px-2 py-2">Location %</th>
                <th className="px-2 py-2">Market supplement</th>
                <th className="px-2 py-2">Other pay</th>
                <th className="px-2 py-2 text-right">Total</th>
                <th className="px-2 py-2 text-right">Grade</th>
                <th className="px-2 py-2 text-right">Compa ratio</th>
                <th className="px-2 py-2">Range</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map(({ employee: e, totalPay, grade, compaRatio, rangePosition }) => {
                const suggested = supplementFor(e.jobId);
                return (
                  <tr key={e.id}>
                    <td className="px-2 py-1">
                      <input
                        aria-label="Employee ID"
                        className="input w-16"
                        value={e.label}
                        onChange={(ev) => updateEmployee(e.id, { label: ev.target.value })}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <select
                        aria-label="Job"
                        className="select w-40"
                        value={e.jobId}
                        onChange={(ev) => updateEmployee(e.id, { jobId: ev.target.value })}
                      >
                        <option value="">Choose…</option>
                        {jobs.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <select
                        aria-label="Sex"
                        className="select w-16"
                        value={e.sex}
                        onChange={(ev) => updateEmployee(e.id, { sex: ev.target.value as Sex })}
                      >
                        <option value="">–</option>
                        <option value="F">F</option>
                        <option value="M">M</option>
                        <option value="X">X</option>
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <NumberInput
                        aria-label="Base pay"
                        className="w-24"
                        value={e.basePay}
                        onChange={(v) => updateEmployee(e.id, { basePay: v })}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <NumberInput
                        aria-label="Location differential"
                        className="w-20"
                        percent
                        value={e.locationPct}
                        onChange={(v) => updateEmployee(e.id, { locationPct: v ?? 0 })}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <NumberInput
                        aria-label="Market supplement"
                        className="w-24"
                        value={e.marketSupplement}
                        onChange={(v) => updateEmployee(e.id, { marketSupplement: v ?? 0 })}
                      />
                      {policy.approach === "layered" && suggested !== null && suggested > 0 && (
                        <div className="mt-1 text-xs text-slate-500">
                          Policy: {money(suggested, c)}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1">
                      <NumberInput
                        aria-label="Other pay"
                        className="w-20"
                        value={e.otherPay}
                        onChange={(v) => updateEmployee(e.id, { otherPay: v ?? 0 })}
                      />
                    </td>
                    <td className="px-2 py-1 text-right">{money(totalPay, c)}</td>
                    <td className="px-2 py-1 text-right">{grade?.grade ?? "–"}</td>
                    <td className="px-2 py-1 text-right">
                      {compaRatio === null ? "–" : compaRatio.toFixed(2)}
                    </td>
                    <td
                      className={`px-2 py-1 ${rangePosition && rangePosition !== "within" ? "font-semibold text-red-700" : ""}`}
                    >
                      {rangePosition ? POSITION_LABEL[rangePosition] : "–"}
                    </td>
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        className="text-xs text-slate-500 underline hover:text-red-700"
                        onClick={() => removeEmployee(e.id)}
                        aria-label={`Remove ${e.label}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button onClick={addEmployee} disabled={!jobs.length}>
          Add an employee
        </Button>
      </div>

      <div className="card space-y-3">
        <h3 className="card-title">Equity check by grade</h3>
        <SectionNote>
          Within a grade, a gap concerns equal work or work of equal value. Every gap needs a
          documented, objective, gender-neutral reason, or it should be closed (Directive (EU)
          2023/970, Articles 4 and 9–10). With small groups, read the figures with care.
        </SectionNote>
        {equity.length === 0 ? (
          <p className="card-text">Add employees with a job, sex and base pay to see this check.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Grade</th>
                  <th className="px-3 py-2 text-right">Women</th>
                  <th className="px-3 py-2 text-right">Men</th>
                  <th className="px-3 py-2 text-right">Avg base, women</th>
                  <th className="px-3 py-2 text-right">Avg base, men</th>
                  <th className="px-3 py-2 text-right">Gap</th>
                  <th className="px-3 py-2 text-right">Avg compa, women</th>
                  <th className="px-3 py-2 text-right">Avg compa, men</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equity.map((r) => (
                  <tr key={r.grade}>
                    <td className="px-3 py-2 font-medium">{r.grade}</td>
                    <td className="px-3 py-2 text-right">{r.women}</td>
                    <td className="px-3 py-2 text-right">{r.men}</td>
                    <td className="px-3 py-2 text-right">{money(r.avgBaseWomen, c)}</td>
                    <td className="px-3 py-2 text-right">{money(r.avgBaseMen, c)}</td>
                    <td
                      className={`px-3 py-2 text-right ${r.gap !== null && r.gap >= 0.05 ? "font-semibold text-red-700" : ""}`}
                    >
                      {pct(r.gap, 1)}
                    </td>
                    <td className="px-3 py-2 text-right">{r.avgCompaWomen?.toFixed(2) ?? "–"}</td>
                    <td className="px-3 py-2 text-right">{r.avgCompaMen?.toFixed(2) ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
