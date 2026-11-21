import React, { useRef, useState } from "react";
import { Button, Textarea } from "@/shared/components/ui";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import { activeSubfactors, FACTOR_KEYS, FACTOR_NAMES, weightsTotal } from "../lib/plans";
import { EIGE_FACTOR_INTROS } from "../lib/eigePlan";
import { OjaParseError, parseOjaProject } from "../lib/openJobAnalysis";
import type { FullEvaluation } from "../lib/assemble";
import { SubfactorRating } from "./SubfactorRating";
import { PairedComparison } from "./PairedComparison";
import { NumberInput, SectionNote } from "./inputs";
import { fmtScore, jobCode } from "./labels";

const OJA_URL = "https://jfeg1.github.io/work-analyzer.app/";

export const JobsTab: React.FC<{ ev: FullEvaluation }> = ({ ev }) => {
  const st = useJobEvaluationStore();
  const { jobs, settings, raters, blind, policy, structure } = st;
  const [selectedId, setSelectedId] = useState<string | null>(jobs[0]?.id ?? null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selIndex = Math.max(
    0,
    jobs.findIndex((j) => j.id === selectedId)
  );
  const selected = jobs[selIndex] ?? null;
  const subs = activeSubfactors(settings);
  const paired = settings.method === "paired";
  const weightsOk = settings.method !== "points" || Math.abs(weightsTotal(settings) - 100) < 1e-6;
  const label = (i: number) => (blind ? jobCode(i) : jobs[i].title || jobCode(i));
  const outcome = (id: string) => ev.outcomes.find((o) => o.job.id === id);

  const onFiles = async (files: FileList) => {
    setMessage(null);
    let added = 0;
    let updated = 0;
    const errors: string[] = [];
    let last: string | null = null;
    for (const file of Array.from(files)) {
      try {
        const r = st.importOja(parseOjaProject(JSON.parse(await file.text())));
        last = r.id;
        if (r.updated) updated++;
        else added++;
      } catch (e) {
        errors.push(
          `${file.name}: ${e instanceof OjaParseError ? e.message : "not a project file saved from Open Job Analysis."}`
        );
      }
    }
    if (last) setSelectedId(last);
    const parts = [];
    if (added) parts.push(`${added} job${added > 1 ? "s" : ""} added`);
    if (updated) parts.push(`${updated} updated with the latest analysis`);
    setMessage({
      ok: errors.length === 0,
      text: [parts.join(", ") + (parts.length ? "." : ""), ...errors].filter(Boolean).join(" "),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-3">
          <ul className="space-y-1" aria-label="Jobs">
            {jobs.map((j, i) => {
              const o = outcome(j.id);
              const active = selected?.id === j.id;
              return (
                <li key={j.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(j.id)}
                    aria-current={active}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${active ? "bg-sage-100 font-semibold text-sage-900" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    {label(i)}
                    <span className="float-right text-xs text-slate-500">
                      {paired
                        ? ""
                        : o?.score === null || o?.score === undefined
                          ? "not rated"
                          : fmtScore(o.score)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Button className="w-full" onClick={() => setSelectedId(st.addJob("New job"))}>
            Add a job
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}>
            Import from Open Job Analysis
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void onFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {message && (
            <p role="status" className={`text-sm ${message.ok ? "text-sage-800" : "text-red-700"}`}>
              {message.text}
            </p>
          )}
          <SectionNote>
            Choose one or more project files saved from{" "}
            <a className="underline" href={OJA_URL} target="_blank" rel="noreferrer">
              Open Job Analysis
            </a>
            , or use <strong>Send to JobEval</strong> on its Report step. Importing the same project
            again updates the evidence and keeps your ratings.
          </SectionNote>
        </aside>

        {!selected ? (
          <div className="card">
            <p className="card-text">
              Add a job or import a job analysis to begin, or load a worked example above.
            </p>
          </div>
        ) : (
          <section className="space-y-6" aria-label={`Evaluate ${label(selIndex)}`}>
            {!weightsOk && (
              <p role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                The subfactor weights do not total 100%. Check them on the Set up tab.
              </p>
            )}
            <div className="card space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-[16rem] flex-1">
                  {blind ? (
                    <h3 className="text-2xl font-light text-sage-900">{jobCode(selIndex)}</h3>
                  ) : (
                    <>
                      <label className="label" htmlFor="job-title">
                        Job title
                      </label>
                      <input
                        id="job-title"
                        className="input"
                        value={selected.title}
                        onChange={(e) => st.updateJob(selected.id, { title: e.target.value })}
                      />
                    </>
                  )}
                </div>
                {!paired && (
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      {settings.method === "points" ? "Points" : "Sum of levels"}
                    </div>
                    <div className="text-3xl font-light text-sage-900">
                      {fmtScore(outcome(selected.id)?.score ?? null)}
                    </div>
                  </div>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (window.confirm(`Remove "${label(selIndex)}"?`)) {
                      st.removeJob(selected.id);
                      setSelectedId(null);
                    }
                  }}
                >
                  Remove
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label" htmlFor="job-dept">
                    Department
                  </label>
                  <input
                    id="job-dept"
                    className="input"
                    value={selected.department}
                    onChange={(e) => st.updateJob(selected.id, { department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-reports">
                    Reports to (job, not person)
                  </label>
                  <input
                    id="job-reports"
                    className="input"
                    value={selected.reportsTo}
                    onChange={(e) => st.updateJob(selected.id, { reportsTo: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="job-purpose">
                  Job purpose
                </label>
                <Textarea
                  id="job-purpose"
                  rows={2}
                  value={selected.purpose}
                  onChange={(e) => st.updateJob(selected.id, { purpose: e.target.value })}
                  placeholder="Why the job exists and what it contributes, in two or three sentences"
                />
              </div>

              {selected.analysis && (
                <details className="rounded-md border border-slate-200 bg-slate-50 p-4" open>
                  <summary className="cursor-pointer text-sm font-semibold text-sage-900">
                    Job analysis evidence ({selected.analysis.raterCount} job experts
                    {Object.keys(selected.analysis.expertLevels).length > 0 &&
                      ", with a job evaluation profile"}
                    )
                  </summary>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Critical tasks
                      </h4>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {selected.analysis.criticalTasks.map((t) => (
                          <li key={t.text}>
                            {t.text}{" "}
                            <span className="text-xs text-slate-500">
                              (importance {t.importance?.toFixed(1)}
                              {t.rareButImportant ? ", rare but important" : ""})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Critical competencies
                      </h4>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {selected.analysis.criticalCompetencies.map((k) => (
                          <li key={k.name}>
                            <strong>{k.name}</strong>: {k.definition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              )}
            </div>

            {!paired && (
              <div className="space-y-6">
                <SectionNote>
                  Rate the job, not the person in it. Pick the level the job analysis evidence
                  supports and write down why.
                  {raters.length > 0 &&
                    " Each committee member enters their own level first; then agree the final level together."}
                </SectionNote>
                {FACTOR_KEYS.map((f) => {
                  const fs = subs.filter((d) => d.factor === f);
                  if (!fs.length) return null;
                  return (
                    <section key={f} className="space-y-2" aria-label={FACTOR_NAMES[f]}>
                      <h3 className="text-lg font-semibold text-sage-900">{FACTOR_NAMES[f]}</h3>
                      {settings.planId === "eige" && (
                        <p className="text-sm text-slate-600">{EIGE_FACTOR_INTROS[f]}</p>
                      )}
                      {fs.map((d) => (
                        <SubfactorRating
                          key={`${selected.id}-${d.id}`}
                          sub={d}
                          method={settings.method}
                          totalPoints={settings.totalPoints}
                          rating={selected.ratings[d.id]}
                          raters={raters}
                          expert={selected.analysis?.expertLevels[d.id]}
                          onFinal={(level) => st.setRating(selected.id, d.id, { final: level })}
                          onRater={(rid, level) => st.setRaterLevel(selected.id, d.id, rid, level)}
                          onRationale={(text) =>
                            st.setRating(selected.id, d.id, { rationale: text })
                          }
                        />
                      ))}
                    </section>
                  );
                })}
                <div>
                  <label className="label" htmlFor="job-notes">
                    Overall notes
                  </label>
                  <Textarea
                    id="job-notes"
                    rows={2}
                    value={selected.notes}
                    onChange={(e) => st.updateJob(selected.id, { notes: e.target.value })}
                  />
                </div>
              </div>
            )}

            {settings.method === "points" && structure.basis === "policy" && !blind && (
              <div className="card space-y-4">
                <h3 className="card-title">Market data</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="label" htmlFor="job-market">
                      Annual market median ({policy.currency})
                    </label>
                    <NumberInput
                      id="job-market"
                      value={selected.marketMedian}
                      onChange={(v) => st.updateJob(selected.id, { marketMedian: v })}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="job-match">
                      Duty match with the survey job
                    </label>
                    <NumberInput
                      id="job-match"
                      percent
                      value={selected.dutyMatch}
                      onChange={(v) => st.updateJob(selected.id, { dutyMatch: v })}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="job-source">
                      Source and period
                    </label>
                    <input
                      id="job-source"
                      className="input"
                      value={selected.marketSource}
                      onChange={(e) => st.updateJob(selected.id, { marketSource: e.target.value })}
                      placeholder="e.g. BLS OEWS May 2025, SOC 43-4161"
                    />
                  </div>
                </div>
                <SectionNote>
                  A job is used as a market benchmark only if it matches{" "}
                  {Math.round(policy.benchmarkMatch * 100)}% or more of the survey job&apos;s duties
                  (WorldatWork Handbook of Total Rewards, 2021, ch. 3). Other jobs get a market
                  estimate from their points.
                </SectionNote>
              </div>
            )}
          </section>
        )}
      </div>
      {paired && <PairedComparison ev={ev} />}
    </div>
  );
};
