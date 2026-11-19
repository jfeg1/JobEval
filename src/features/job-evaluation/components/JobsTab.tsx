import React, { useRef, useState } from "react";
import { Button, Textarea } from "@/shared/components/ui";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import { jobPoints, weightsTotal } from "../lib/factors";
import { OjaParseError, parseOjaProject } from "../lib/openJobAnalysis";
import { FactorRating } from "./FactorRating";
import { NumberInput, SectionNote } from "./inputs";

export const JobsTab: React.FC = () => {
  const { jobs, factors, totalPoints, policy, addJob, updateJob, setLevel, removeJob } =
    useJobEvaluationStore();
  const [selectedId, setSelectedId] = useState<string | null>(jobs[0]?.id ?? null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = jobs.find((j) => j.id === selectedId) ?? jobs[0] ?? null;
  const weightsOk = Math.abs(weightsTotal(factors) - 1) < 1e-6;

  const onFile = async (file: File) => {
    setImportError(null);
    try {
      const summary = parseOjaProject(JSON.parse(await file.text()));
      const title = summary.title.replace(/\s*\(example\)\s*$/i, "") || file.name;
      setSelectedId(addJob(title, summary));
    } catch (e) {
      setImportError(
        e instanceof OjaParseError
          ? e.message
          : "The file could not be read. Choose a .json project file saved from Open Job Analysis."
      );
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <aside className="space-y-3">
        <ul className="space-y-1" aria-label="Jobs">
          {jobs.map((j) => {
            const p = jobPoints(j.levels, factors, totalPoints);
            const active = selected?.id === j.id;
            return (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(j.id)}
                  aria-current={active}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${active ? "bg-sage-100 font-semibold text-sage-900" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  {j.title || "Untitled job"}
                  <span className="float-right text-xs text-slate-500">
                    {p === null ? "not rated" : `${p} pts`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <Button className="w-full" onClick={() => setSelectedId(addJob("New job"))}>
          Add a job
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}>
          Import from Open Job Analysis
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = "";
          }}
        />
        {importError && (
          <p role="alert" className="text-sm text-red-700">
            {importError}
          </p>
        )}
        <SectionNote>
          Import the project file saved from{" "}
          <a
            className="underline"
            href="https://github.com/jfeg1/work-analyzer.app"
            target="_blank"
            rel="noreferrer"
          >
            Open Job Analysis
          </a>
          . Its critical tasks and competencies appear beside the ratings as evidence.
        </SectionNote>
      </aside>

      {!selected ? (
        <div className="card">
          <p className="card-text">
            Add a job or import a job analysis to begin, or load the worked example above.
          </p>
        </div>
      ) : (
        <section className="space-y-6" aria-label={`Evaluate ${selected.title}`}>
          {!weightsOk && (
            <p role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              The factor weights do not total 100%. Check them on the Pay policy tab.
            </p>
          )}
          <div className="card space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[16rem] flex-1">
                <label className="label" htmlFor="job-title">
                  Job title
                </label>
                <input
                  id="job-title"
                  className="input"
                  value={selected.title}
                  onChange={(e) => updateJob(selected.id, { title: e.target.value })}
                />
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-slate-500">Points</div>
                <div className="text-3xl font-light text-sage-900">
                  {jobPoints(selected.levels, factors, totalPoints) ?? "–"}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  if (window.confirm(`Remove "${selected.title}"?`)) {
                    removeJob(selected.id);
                    setSelectedId(null);
                  }
                }}
              >
                Remove
              </Button>
            </div>

            {selected.analysis && (
              <details className="rounded-md border border-slate-200 bg-slate-50 p-4" open>
                <summary className="cursor-pointer text-sm font-semibold text-sage-900">
                  Job analysis evidence ({selected.analysis.raterCount} raters)
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

            <SectionNote>
              Pick the level the job analysis evidence supports for each factor. Rate the work, not
              the person in it, and keep the job title and current pay out of view while rating.
            </SectionNote>
            {factors.map((f) => (
              <FactorRating
                key={f.id}
                factor={f}
                totalPoints={totalPoints}
                value={selected.levels[f.id]}
                onChange={(level) => setLevel(selected.id, f.id, level)}
              />
            ))}
            <div>
              <label className="label" htmlFor="job-notes">
                Evidence for these ratings
              </label>
              <Textarea
                id="job-notes"
                rows={3}
                value={selected.notes}
                onChange={(e) => updateJob(selected.id, { notes: e.target.value })}
                placeholder="Which tasks and competencies support each level?"
              />
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="card-title">Market data (optional)</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label" htmlFor="job-market">
                  Annual market median ({policy.currency})
                </label>
                <NumberInput
                  id="job-market"
                  value={selected.marketMedian}
                  onChange={(v) => updateJob(selected.id, { marketMedian: v })}
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
                  onChange={(v) => updateJob(selected.id, { dutyMatch: v })}
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
                  onChange={(e) => updateJob(selected.id, { marketSource: e.target.value })}
                  placeholder="e.g. BLS OEWS May 2025, SOC 43-4161"
                />
              </div>
            </div>
            <SectionNote>
              A job is used as a market benchmark only if it matches{" "}
              {Math.round(policy.benchmarkMatch * 100)}% or more of the survey job&apos;s duties
              (WorldatWork Handbook of Total Rewards, 2021, ch. 3). Other jobs get a market estimate
              from their points.
            </SectionNote>
          </div>
        </section>
      )}
    </div>
  );
};
