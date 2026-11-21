import React from "react";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import type { FullEvaluation } from "../lib/assemble";
import type { Predominance } from "../lib/groups";
import { payInversions } from "../lib/biasCheck";
import { NumberInput, SectionNote } from "./inputs";
import { fmtRange, fmtScore, PREDOMINANCE_COLOR, PREDOMINANCE_LABEL } from "./labels";
import { money, pct } from "./format";

const ORDER: Predominance[] = ["women-dominated", "men-dominated", "balanced"];

const Swatch: React.FC<{ p: Predominance | null }> = ({ p }) =>
  p ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: PREDOMINANCE_COLOR[p] }}
        aria-hidden
      />
      {PREDOMINANCE_LABEL[p]}
    </span>
  ) : (
    <span className="text-slate-400">No head count</span>
  );

/** Score of each job on one axis, marked by gender predominance (EIGE Tool 5, sheet 9). */
const ScoreChart: React.FC<{ ev: FullEvaluation }> = ({ ev }) => {
  const rows = ev.outcomes
    .filter((o) => o.score !== null)
    .sort((a, b) => (b.score as number) - (a.score as number));
  if (!rows.length) return null;
  const W = 640;
  const left = 170;
  const right = 24;
  const rowH = 26;
  const top = 10;
  const H = top + rows.length * rowH + 28;
  const x = (v: number) => left + (v / ev.maxScore) * (W - left - right);
  const ticks = Array.from({ length: 5 }, (_, i) => (ev.maxScore * i) / 4);
  return (
    <figure className="space-y-2">
      <div className="flex flex-wrap gap-4 text-xs text-slate-600" aria-hidden>
        {ORDER.map((p) => (
          <Swatch key={p} p={p} />
        ))}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-3xl"
        role="img"
        aria-label="Score of each job, marked by gender predominance"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={top} y2={H - 22} stroke="#e5e7eb" strokeWidth={1} />
            <text x={x(t)} y={H - 6} fontSize={11} textAnchor="middle" fill="#64748b">
              {fmtScore(Math.round(t * 10) / 10)}
            </text>
          </g>
        ))}
        {rows.map((o, i) => {
          const y = top + i * rowH + rowH / 2;
          const c = o.predominance ? PREDOMINANCE_COLOR[o.predominance] : "#94a3b8";
          return (
            <g key={o.job.id}>
              <title>
                {`${o.job.title}: ${fmtScore(o.score)}, group ${o.group ?? "–"}, ${o.predominance ? PREDOMINANCE_LABEL[o.predominance].toLowerCase() : "no head count"} (${o.women} women, ${o.men} men)`}
              </title>
              <text x={left - 10} y={y + 4} fontSize={12} textAnchor="end" fill="#334155">
                {o.job.title.length > 24 ? `${o.job.title.slice(0, 23)}…` : o.job.title}
              </text>
              <line x1={left} x2={x(o.score as number)} y1={y} y2={y} stroke={c} strokeWidth={2} />
              <circle
                cx={x(o.score as number)}
                cy={y}
                r={6}
                fill={c}
                stroke="#fff"
                strokeWidth={2}
              />
              <rect x={0} y={y - rowH / 2} width={W} height={rowH} fill="transparent" />
            </g>
          );
        })}
      </svg>
      <figcaption className="text-xs text-slate-500">
        Hover a job for details. The same figures are in the table above.
      </figcaption>
    </figure>
  );
};

export const GroupsTab: React.FC<{ ev: FullEvaluation }> = ({ ev }) => {
  const { jobs, employees, structure, settings, policy, updateJob, updateStructure } =
    useJobEvaluationStore();
  const c = policy.currency;
  const fromPolicy = settings.method === "points" && structure.basis === "policy";
  const inversions = payInversions(ev.outcomes, employees);
  const groupRows = ev.bands
    .map((b, i) => {
      const inG = ev.outcomes.filter((o) => o.group === i + 1);
      const women = inG.reduce((s, o) => s + o.women, 0);
      const men = inG.reduce((s, o) => s + o.men, 0);
      return { g: i + 1, b, jobs: inG, women, men };
    })
    .filter((r) => r.jobs.length);

  if (!jobs.length) {
    return (
      <div className="card">
        <p className="card-text">Add jobs on the Rate jobs tab first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h3 className="card-title">Jobs, scores and who holds them</h3>
        <SectionNote>
          A job is women-dominated when 60% or more of its holders are women, men-dominated at 40%
          or less, and balanced in between (EIGE toolkit). Head counts come from the Employees tab
          when the job has employees recorded; otherwise enter them here.
        </SectionNote>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Job</th>
                <th className="px-3 py-2 text-right">Score</th>
                <th className="px-3 py-2">Group</th>
                <th className="px-3 py-2">Women</th>
                <th className="px-3 py-2">Men</th>
                <th className="px-3 py-2">Predominance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ev.outcomes.map((o) => (
                <tr key={o.job.id}>
                  <td className="px-3 py-2 font-medium text-slate-800">{o.job.title}</td>
                  <td className="px-3 py-2 text-right">{fmtScore(o.score)}</td>
                  <td className="px-3 py-2">
                    {fromPolicy ? (
                      (o.group ?? "–")
                    ) : (
                      <select
                        aria-label={`Group for ${o.job.title}`}
                        className="select w-36"
                        value={o.job.groupOverride ?? ""}
                        onChange={(e) =>
                          updateJob(o.job.id, {
                            groupOverride: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                      >
                        <option value="">
                          {o.score === null || o.job.groupOverride !== null
                            ? "By score"
                            : `By score (${o.group})`}
                        </option>
                        {ev.bands.map((_, i) => (
                          <option key={i} value={i + 1}>
                            Group {i + 1}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  {o.countsFrom === "employees" ? (
                    <>
                      <td className="px-3 py-2">{o.women}</td>
                      <td className="px-3 py-2">{o.men}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2">
                        <NumberInput
                          aria-label={`Women in ${o.job.title}`}
                          className="w-20"
                          min={0}
                          value={o.job.women}
                          onChange={(v) => updateJob(o.job.id, { women: v })}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <NumberInput
                          aria-label={`Men in ${o.job.title}`}
                          className="w-20"
                          min={0}
                          value={o.job.men}
                          onChange={(v) => updateJob(o.job.id, { men: v })}
                        />
                      </td>
                    </>
                  )}
                  <td className="px-3 py-2">
                    <Swatch p={o.predominance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ScoreChart ev={ev} />
      </div>

      <div className="card space-y-3">
        <h3 className="card-title">Job groups</h3>
        {fromPolicy ? (
          <SectionNote>Groups are the point bands set on the Pay structure tab.</SectionNote>
        ) : (
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-40">
              <label className="label" htmlFor="group-count">
                Number of groups
              </label>
              <NumberInput
                id="group-count"
                min={1}
                max={20}
                value={structure.groupCount}
                onChange={(v) =>
                  updateStructure({ groupCount: v && v > 0 ? Math.min(20, Math.round(v)) : 1 })
                }
              />
            </div>
            <p className="max-w-2xl text-sm text-slate-600">
              Groups split the score range (0–{fmtScore(ev.maxScore)}) into equal bands. The toolkit
              uses ten for the point method; a micro-organisation usually needs two to four. Check
              that jobs in the same group have similar scores, and move a job by hand if the
              committee agrees a reason.
            </p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Group</th>
                <th className="px-3 py-2">Score range</th>
                <th className="px-3 py-2">Jobs</th>
                <th className="px-3 py-2 text-right">Women</th>
                <th className="px-3 py-2 text-right">Men</th>
                <th className="px-3 py-2 text-right">Share women</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupRows.map((r) => (
                <tr key={r.g}>
                  <td className="px-3 py-2 font-medium">{r.g}</td>
                  <td className="px-3 py-2">{fmtRange(r.b.from, r.b.to)}</td>
                  <td className="px-3 py-2">{r.jobs.map((o) => o.job.title).join(", ")}</td>
                  <td className="px-3 py-2 text-right">{r.women}</td>
                  <td className="px-3 py-2 text-right">{r.men}</td>
                  <td className="px-3 py-2 text-right">
                    {r.women + r.men ? pct(r.women / (r.women + r.men)) : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="card-title">Quick check for gender bias</h3>
        <SectionNote>
          Before you build pay on these results, look for a job that scores higher but is paid less
          than a job that scores lower, especially when the higher-scoring job is mostly held by
          women. Either the ratings missed something, or the pay needs a look. Uses average base pay
          from the Employees tab.
        </SectionNote>
        {inversions.length === 0 ? (
          <p className="text-sm text-slate-600">
            {employees.length
              ? "No higher-scoring job is paid less than a lower-scoring one."
              : "Add employees with pay to run this check."}
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {inversions.map((v) => (
              <li
                key={`${v.higher.job.id}-${v.lower.job.id}`}
                className={`rounded-md p-3 ${v.genderPattern ? "bg-amber-50 text-amber-950" : "bg-slate-50 text-slate-800"}`}
              >
                <strong>{v.higher.job.title}</strong> scores {fmtScore(v.higher.score)} and averages{" "}
                {money(v.payHigher, c)}. <strong>{v.lower.job.title}</strong> scores{" "}
                {fmtScore(v.lower.score)} and averages {money(v.payLower, c)}.
                {v.genderPattern && (
                  <>
                    {" "}
                    The higher-scoring job is women-dominated: check this first. It may be work of
                    equal or greater value paid less.
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
