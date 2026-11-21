import React, { useRef } from "react";
import { Button, Textarea } from "@/shared/components/ui";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import {
  activeSubfactors,
  FACTOR_KEYS,
  FACTOR_NAMES,
  factorWeight,
  METHOD_INFO,
  PLANS,
} from "../lib/plans";
import { payRecords, type FullEvaluation } from "../lib/assemble";
import { gapReport, reportingDuty, type CategoryRow } from "../lib/directive";
import { SectionNote } from "./inputs";
import { openEvidenceCheck, skillEvidence } from "../lib/competencyEvidence";
import { money, pct } from "./format";
import { fmtRange, fmtScore, PREDOMINANCE_LABEL } from "./labels";
import { csvRow, downloadText, printSection } from "./print";

const Section: React.FC<{
  title: string;
  article: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, article, children, actions }) => {
  const ref = useRef<HTMLElement>(null);
  return (
    <section ref={ref} className="card space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{article}</p>
        </div>
        <div className="no-print flex gap-2">
          {actions}
          <Button variant="secondary" onClick={() => printSection(ref.current)}>
            Print or save as PDF
          </Button>
        </div>
      </div>
      {children}
    </section>
  );
};

const th = "px-3 py-2";
const thead = "bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500";

export const ReportsTab: React.FC<{ ev: FullEvaluation }> = ({ ev }) => {
  const st = useJobEvaluationStore();
  const { org, settings, employees, policy, justifications, progressionCriteria, raters } = st;
  const analysisOf = (jobId: string) => st.jobs.find((j) => j.id === jobId)?.analysis ?? null;
  const c = policy.currency;
  const subs = activeSubfactors(settings);
  const report = gapReport(payRecords(employees, ev));
  const today = new Date().toISOString().slice(0, 10);
  const orgName = org.name || "Your organisation";
  const flagged = report.categories.filter((r) => r.needsJustification);
  const gradeJobs = (g: number) =>
    ev.outcomes
      .filter((o) => o.grade?.grade === g)
      .map((o) => o.job.title)
      .join(", ");

  const downloadCsv = () => {
    const lines = [
      csvRow(["Indicator (Directive (EU) 2023/970, Art. 9(1))", "Value"]),
      csvRow(["(a) Gender pay gap (mean)", report.meanGap]),
      csvRow([
        "(b) Gender pay gap in complementary or variable components (mean)",
        report.meanVariableGap,
      ]),
      csvRow(["(c) Median gender pay gap", report.medianGap]),
      csvRow([
        "(d) Median gender pay gap in complementary or variable components",
        report.medianVariableGap,
      ]),
      csvRow([
        "(e) Share of women receiving complementary or variable components",
        report.receivingVariableWomen,
      ]),
      csvRow([
        "(e) Share of men receiving complementary or variable components",
        report.receivingVariableMen,
      ]),
      ...report.quartiles.map((q) =>
        csvRow([`(f) Quartile ${q.band}: women / men`, `${q.women} / ${q.men}`])
      ),
      "",
      csvRow([
        "(g) Category (grade)",
        "Women",
        "Men",
        "Basic pay gap",
        "Complementary/variable gap",
        "Total pay gap",
        "Gap of 5% or more",
      ]),
      ...report.categories.map((r) =>
        csvRow([
          r.category,
          r.women,
          r.men,
          r.baseGap,
          r.variableGap,
          r.totalGap,
          r.needsJustification ? "yes" : "no",
        ])
      ),
    ];
    downloadText(`pay-gap-report-${today}.csv`, lines.join("\n"));
  };

  return (
    <div className="space-y-6">
      <div className="card space-y-2">
        <SectionNote>
          These pages help with the information the EU Pay Transparency Directive (Directive (EU)
          2023/970) requires. National laws transposing it set the final rules and formats, and they
          differ by country: check yours before you publish. Gap figures use full-time equivalent
          pay and count only workers recorded as women or men.
        </SectionNote>
        <p className="text-sm font-medium text-sage-900">{reportingDuty(org.workers)}</p>
      </div>

      <Section
        title={`Pay criteria: ${orgName}`}
        article="Articles 4 and 6: criteria for pay, pay levels and pay progression"
      >
        <p className="text-sm text-slate-700">
          We set pay from a job evaluation that compares the value of every job on four objective,
          gender-neutral criteria: skills, responsibility, effort and working conditions. We
          evaluate the job, not the person in it. Method:{" "}
          <strong>{METHOD_INFO[settings.method].name}</strong>. Plan: {PLANS[settings.planId].name}
          {settings.custom.length ? `, with ${settings.custom.length} additional subfactor(s)` : ""}
          .
          {raters.length > 0 &&
            ` A committee of ${raters.length} rated each job independently, then agreed the levels.`}
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className={thead}>
              <tr>
                <th className={th}>Criterion</th>
                <th className={th}>Subfactors</th>
                {settings.method === "points" && <th className={`${th} text-right`}>Weight</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {FACTOR_KEYS.map((f) => (
                <tr key={f}>
                  <td className={`${th} font-medium`}>{FACTOR_NAMES[f]}</td>
                  <td className={th}>
                    {subs
                      .filter((d) => d.factor === f)
                      .map((d) =>
                        settings.method === "points" ? `${d.name} (${d.weight}%)` : d.name
                      )
                      .join("; ")}
                  </td>
                  {settings.method === "points" && (
                    <td className={`${th} text-right`}>{factorWeight(settings, f)}%</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ev.grades.length > 0 && (
          <div className="overflow-x-auto">
            <h4 className="text-sm font-semibold text-sage-900">Pay levels</h4>
            <table className="mt-1 min-w-full text-sm">
              <thead className={thead}>
                <tr>
                  <th className={th}>Grade</th>
                  <th className={th}>Score range</th>
                  <th className={`${th} text-right`}>Minimum</th>
                  <th className={`${th} text-right`}>Midpoint</th>
                  <th className={`${th} text-right`}>Maximum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ev.grades.map((g) => (
                  <tr key={g.grade}>
                    <td className={th}>{g.grade}</td>
                    <td className={th}>{fmtRange(g.from, g.to)}</td>
                    <td className={`${th} text-right`}>{money(g.minimum, c)}</td>
                    <td className={`${th} text-right`}>{money(g.midpoint, c)}</td>
                    <td className={`${th} text-right`}>{money(g.maximum, c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div>
          <label className="label" htmlFor="progression-criteria">
            Pay progression: how people move within and between grades
          </label>
          <Textarea
            id="progression-criteria"
            rows={3}
            value={progressionCriteria}
            onChange={(e) => st.setProgressionCriteria(e.target.value)}
            placeholder="For example: where new hires start in the range, how and when pay increases, what earns a move to a higher grade"
          />
          <p className="input-hint">
            Employers must make these criteria easy for workers to find. Member states may exempt
            employers with fewer than 50 workers from the pay progression part (Art. 6(2)).
          </p>
        </div>
      </Section>

      <Section
        title="Pay ranges for job adverts"
        article="Article 5: pay transparency before employment"
      >
        <SectionNote>
          Applicants have the right to the starting pay or its range before the interview, based on
          these criteria. Do not ask applicants about their pay history (Art. 5(2)), and keep job
          titles and adverts gender-neutral (Art. 5(3)).
        </SectionNote>
        <table className="min-w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th}>Job</th>
              <th className={th}>Grade</th>
              <th className={`${th} text-right`}>Pay range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ev.outcomes.map((o) => (
              <tr key={o.job.id}>
                <td className={th}>{o.job.title}</td>
                <td className={th}>{o.grade?.grade ?? "–"}</td>
                <td className={`${th} text-right`}>
                  {o.grade
                    ? `${money(o.grade.minimum, c)} – ${money(o.grade.maximum, c)} a year`
                    : "Not graded yet"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Pay gap between women and men"
        article="Article 9: reporting on the pay gap"
        actions={
          <Button variant="secondary" onClick={downloadCsv}>
            Download CSV
          </Button>
        }
      >
        {report.women + report.men === 0 ? (
          <p className="text-sm text-slate-600">
            Add employees with their sex and pay on the Employees tab.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              {report.women} women and {report.men} men
              {report.excluded
                ? `; ${report.excluded} people without a recorded sex of F or M are left out`
                : ""}
              . A positive gap means women are paid less on average.
            </p>
            <table className="min-w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {(
                  [
                    ["(a) Gender pay gap", pct(report.meanGap, 1)],
                    [
                      "(b) Gap in complementary or variable components*",
                      pct(report.meanVariableGap, 1),
                    ],
                    ["(c) Median gender pay gap", pct(report.medianGap, 1)],
                    [
                      "(d) Median gap in complementary or variable components*",
                      pct(report.medianVariableGap, 1),
                    ],
                    [
                      "(e) Receiving complementary or variable components",
                      `women ${pct(report.receivingVariableWomen)}, men ${pct(report.receivingVariableMen)}`,
                    ],
                  ] as const
                ).map(([k, v]) => (
                  <tr key={k}>
                    <td className={th}>{k}</td>
                    <td className={`${th} text-right font-medium`}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 className="text-sm font-semibold text-sage-900">
              (f) Women and men in each quartile pay band
            </h4>
            <table className="min-w-full text-sm">
              <thead className={thead}>
                <tr>
                  <th className={th}>Quartile</th>
                  <th className={`${th} text-right`}>Women</th>
                  <th className={`${th} text-right`}>Men</th>
                  <th className={`${th} text-right`}>Share women</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.quartiles.map((q) => (
                  <tr key={q.band}>
                    <td className={th}>
                      {["Lowest", "Lower middle", "Upper middle", "Highest"][q.band - 1]}
                    </td>
                    <td className={`${th} text-right`}>{q.women}</td>
                    <td className={`${th} text-right`}>{q.men}</td>
                    <td className={`${th} text-right`}>{pct(q.shareWomen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 className="text-sm font-semibold text-sage-900">
              (g) Gap by category of workers (grade)
            </h4>
            <CategoryTable rows={report.categories} currency={c} gradeJobs={gradeJobs} />
            <p className="text-xs text-slate-500">
              * Among the workers who receive them. Categories are your grades: groups of jobs of
              equal value under the job evaluation.
            </p>
          </>
        )}
      </Section>

      <Section
        title="Pay by category and joint pay assessment"
        article="Articles 7 and 10: right to information; joint pay assessment"
      >
        <SectionNote>
          Workers can ask, in writing, for their own pay level and the average pay of women and men
          in their category; answer within two months (Art. 7). Where one sex is only one or two
          people, the averages may reveal a colleague&apos;s pay: national law may then limit access
          (Art. 12(3)). Where a reported category shows a difference of 5% or more that objective,
          gender-neutral criteria do not justify, and it is not put right within six months,
          employers that must report have to carry out a joint pay assessment with workers&apos;
          representatives (Art. 10).
        </SectionNote>
        {report.categories.length === 0 ? (
          <p className="text-sm text-slate-600">No graded employees yet.</p>
        ) : (
          <div className="space-y-3">
            {report.categories.map((r) => (
              <div
                key={r.category}
                className={`rounded-md border p-3 ${r.needsJustification ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}
              >
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <strong>
                    Grade {r.category}: {gradeJobs(r.category)}
                  </strong>
                  <span>
                    Women {r.women}: {money(r.avgTotalWomen, c)} · Men {r.men}:{" "}
                    {money(r.avgTotalMen, c)} · Difference {pct(r.totalGap, 1)}
                  </span>
                </div>
                {(r.women > 0 && r.women < 3) || (r.men > 0 && r.men < 3) ? (
                  <p className="mt-1 text-xs text-slate-600">
                    Small group: averages may identify a colleague.
                  </p>
                ) : null}
                {r.needsJustification && (
                  <div className="mt-2">
                    <label className="label" htmlFor={`just-${r.category}`}>
                      Objective, gender-neutral reason, or the action you will take
                    </label>
                    <Textarea
                      id={`just-${r.category}`}
                      rows={2}
                      value={justifications[r.category] ?? ""}
                      onChange={(e) => st.setJustification(r.category, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
            <p className="text-sm font-medium text-slate-700">
              {flagged.length === 0
                ? "No category shows a difference of 5% or more."
                : `${flagged.length} ${flagged.length === 1 ? "category shows" : "categories show"} a difference of 5% or more; ${flagged.filter((r) => !(justifications[r.category] ?? "").trim()).length} without a recorded reason.`}
            </p>
          </div>
        )}
      </Section>

      <Section
        title="Job evaluation record"
        article="Evidence for each rating (keep with your records)"
      >
        <SectionNote>
          The levels and reasons behind each job&apos;s score. Keep this record: if a worker
          challenges their pay, the employer must show there was no discrimination (Art. 18).
        </SectionNote>
        {ev.outcomes.map((o) => (
          <div key={o.job.id} className="break-inside-avoid border-t border-slate-100 pt-2">
            <h4 className="font-semibold text-sage-900">
              {o.job.title} · score {fmtScore(o.score)} · group {o.group ?? "–"} · grade{" "}
              {o.grade?.grade ?? "–"}
              {o.predominance && (
                <span className="font-normal text-slate-600">
                  {" "}
                  · {PREDOMINANCE_LABEL[o.predominance].toLowerCase()}
                </span>
              )}
            </h4>
            {o.job.purpose && <p className="text-sm text-slate-600">{o.job.purpose}</p>}
            {settings.method !== "paired" && (
              <table className="mt-1 min-w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  {subs.map((d) => {
                    const r = o.job.ratings[d.id];
                    const analysis = analysisOf(o.job.id);
                    const unexplained = openEvidenceCheck(
                      skillEvidence(analysis, d.id, st.evidenceRules),
                      r?.final,
                      analysis?.expertLevels[d.id]?.median,
                      d.maxLevel,
                      r?.rationale
                    );
                    const given = Object.values(r?.byRater ?? {}).filter(
                      (x): x is number => typeof x === "number"
                    );
                    return (
                      <tr key={d.id}>
                        <td className="py-1 pr-3 align-top text-slate-700">{d.name}</td>
                        <td className="py-1 pr-3 align-top">{r?.final ?? "–"}</td>
                        <td className="py-1 pr-3 align-top text-slate-500">
                          {given.length
                            ? `committee ${Math.min(...given)}–${Math.max(...given)}`
                            : ""}
                        </td>
                        <td className="py-1 align-top text-slate-600">
                          {r?.rationale}
                          {unexplained && (
                            <span className="text-amber-800">
                              Rationale needed: the level goes against the competency evidence from
                              the job analysis.
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ))}
        {settings.method === "paired" && (
          <p className="text-sm text-slate-600">
            Paired decisions and their reasons are on the Rate jobs tab; print that tab to keep
            them.
          </p>
        )}
        <p className="text-xs text-slate-500">Printed {today} from JobEval.</p>
      </Section>
    </div>
  );
};

const CategoryTable: React.FC<{
  rows: CategoryRow[];
  currency: string;
  gradeJobs: (g: number) => string;
}> = ({ rows, currency, gradeJobs }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead className={thead}>
        <tr>
          <th className={th}>Grade</th>
          <th className={`${th} text-right`}>Women</th>
          <th className={`${th} text-right`}>Men</th>
          <th className={`${th} text-right`}>Basic pay gap</th>
          <th className={`${th} text-right`}>Complementary / variable gap</th>
          <th className={`${th} text-right`}>Total pay gap</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r) => (
          <tr key={r.category} title={gradeJobs(r.category)}>
            <td className={th}>{r.category}</td>
            <td className={`${th} text-right`}>{r.women}</td>
            <td className={`${th} text-right`}>{r.men}</td>
            <td className={`${th} text-right`}>{pct(r.baseGap, 1)}</td>
            <td className={`${th} text-right`}>
              {r.avgVariableMen === 0 && r.avgVariableWomen === 0
                ? "none paid"
                : pct(r.variableGap, 1)}
            </td>
            <td className={`${th} text-right font-medium`}>
              {pct(r.totalGap, 1)}
              {r.needsJustification && <span className="ml-1 text-amber-700">▲ 5%+</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="mt-1 text-xs text-slate-500">Amounts in {currency}.</p>
  </div>
);
