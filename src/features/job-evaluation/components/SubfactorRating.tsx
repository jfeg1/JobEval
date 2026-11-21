import React, { useState } from "react";
import { Textarea } from "@/shared/components/ui";
import type { ActiveSubfactor, Method } from "../lib/plans";
import { pointsFor, round1 } from "../lib/plans";
import type { SubRating } from "../lib/assemble";
import type { ExpertLevel } from "../lib/openJobAnalysis";
import {
  EVIDENCE_CHECK_TEXT,
  EVIDENCE_CHECK_TEXT_NO_PROFILE,
  openEvidenceCheck,
  type SkillEvidence,
} from "../lib/competencyEvidence";
import type { Rater } from "../jobEvaluationStore";
import { fmtScore } from "./labels";

interface Props {
  sub: ActiveSubfactor;
  method: Method;
  totalPoints: number;
  rating: SubRating | undefined;
  raters: Rater[];
  expert: ExpertLevel | undefined;
  /** Competencies from the job analysis placed under this subfactor (skills only). */
  evidence?: SkillEvidence | null;
  onFinal: (level: number) => void;
  onRater: (raterId: string, level: number | null) => void;
  onRationale: (text: string) => void;
}

const firstSentence = (t: string) => {
  const m = t.match(/^(.+?[.!?])(\s|$)/);
  return m ? m[1] : t;
};

/** One subfactor: its levels, the committee's levels and spread, and the agreed level. */
export const SubfactorRating: React.FC<Props> = ({
  sub,
  method,
  totalPoints,
  rating,
  raters,
  expert,
  evidence = null,
  onFinal,
  onRater,
  onRationale,
}) => {
  const final = rating?.final ?? null;
  const levels = sub.levels
    .map((t, i) => ({ level: i, text: t }))
    .filter((x): x is { level: number; text: string } => x.text !== null);
  const pts = (lv: number) =>
    method === "points" ? `${fmtScore(round1(pointsFor(sub, lv, totalPoints)))} pts` : `${lv}`;
  const given = raters
    .map((r) => rating?.byRater?.[r.id])
    .filter((x): x is number => typeof x === "number");
  const spread = given.length ? Math.max(...given) - Math.min(...given) : null;
  const name = `sub-${sub.id}`;
  const check = openEvidenceCheck(evidence, final, expert?.median, sub.maxLevel, rating?.rationale);
  const [open, setOpen] = useState(final === null);

  return (
    <details
      className="rounded-md border border-slate-200 bg-white"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      data-testid={name}
    >
      <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2 px-4 py-3">
        <span className="font-semibold text-sage-900">
          <span className="mr-2 text-xs font-normal text-slate-500">{sub.code}</span>
          {sub.name}
          {method === "points" && (
            <span className="ml-2 text-xs font-normal text-slate-500">{sub.weight}% of points</span>
          )}
        </span>
        <span className="text-sm text-slate-600">
          {final === null ? (
            <span className="text-amber-700">Not rated</span>
          ) : (
            <>
              Level {final}
              {method === "points" && ` · ${pts(final)}`}
            </>
          )}
          {spread !== null && spread >= 2 && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">
              spread {spread}
            </span>
          )}
          {check && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">
              rationale needed
            </span>
          )}
        </span>
      </summary>

      <div className="space-y-3 border-t border-slate-100 px-4 py-3">
        {sub.definition && <p className="text-sm text-slate-700">{sub.definition}</p>}

        {expert && (
          <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">
            Job experts (Open Job Analysis): median level {fmtScore(expert.median)}, range{" "}
            {expert.min}–{expert.max}, {expert.n} {expert.n === 1 ? "expert" : "experts"}.{" "}
            {final === null && (
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => onFinal(Math.round(expert.median))}
              >
                Start from level {Math.round(expert.median)}
              </button>
            )}
          </p>
        )}

        {evidence && (
          <div className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-800">
              Competency evidence (Open Job Analysis):{" "}
              {evidence.strength === "strong"
                ? "strong"
                : evidence.strength === "some"
                  ? "some"
                  : "none placed under this subfactor"}
            </p>
            {evidence.competencies.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {evidence.competencies.map((k, i) => (
                  <li key={`${k.name}-${i}`}>
                    <strong>{k.name}</strong>{" "}
                    <span className="text-xs text-slate-500">
                      (importance {k.importance?.toFixed(1)}
                      {k.linked?.length
                        ? `; ${k.linked.length} linked task${k.linked.length > 1 ? "s" : ""}: ${k.linked.map((n) => `T${n}`).join(", ")}`
                        : ""}
                      )
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {!expert && (
              <p className="mt-1 text-xs text-slate-500">
                No job evaluation profile in the analysis, so there is no suggested level.
              </p>
            )}
          </div>
        )}
        {check && (
          <p role="status" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {(expert ? EVIDENCE_CHECK_TEXT : EVIDENCE_CHECK_TEXT_NO_PROFILE)[check]}
          </p>
        )}

        <fieldset>
          <legend className="sr-only">Agreed level for {sub.name}</legend>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {levels.map(({ level, text }) => (
              <label
                key={level}
                className={`flex cursor-pointer gap-2 rounded-md border p-2 text-left text-xs leading-snug transition ${final === level ? "border-sage-600 bg-sage-50" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <input
                  type="radio"
                  name={name}
                  className="mt-0.5"
                  checked={final === level}
                  onChange={() => onFinal(level)}
                />
                <span>
                  <span className="flex justify-between gap-2 font-semibold text-slate-800">
                    Level {level}
                    <span className="font-normal text-slate-500">{pts(level)}</span>
                  </span>
                  <span className="text-slate-600" title={text}>
                    <strong className="font-medium text-slate-700">{firstSentence(text)}</strong>{" "}
                    {text.slice(firstSentence(text).length).trim()}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {raters.length > 0 && (
          <div className="flex flex-wrap items-end gap-3 rounded-md bg-slate-50 p-3">
            <span className="w-full text-xs font-semibold uppercase tracking-wide text-slate-500">
              Each member&apos;s own level
            </span>
            {raters.map((r) => (
              <div key={r.id}>
                <label className="block text-xs text-slate-600" htmlFor={`${name}-${r.id}`}>
                  {r.name}
                </label>
                <select
                  id={`${name}-${r.id}`}
                  className="select w-24"
                  value={rating?.byRater?.[r.id] ?? ""}
                  onChange={(e) =>
                    onRater(r.id, e.target.value === "" ? null : Number(e.target.value))
                  }
                >
                  <option value="">–</option>
                  {levels.map(({ level }) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {given.length > 0 && (
              <p className="text-sm text-slate-700">
                Range {Math.min(...given)}–{Math.max(...given)}.{" "}
                {spread !== null && spread >= 2
                  ? "Discuss the different readings before agreeing a level."
                  : "Close agreement."}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="label" htmlFor={`${name}-why`}>
            Rationale
          </label>
          <Textarea
            id={`${name}-why`}
            rows={2}
            value={rating?.rationale ?? ""}
            onChange={(e) => onRationale(e.target.value)}
            placeholder="The evidence from the job analysis that supports this level"
          />
        </div>

        {(sub.questions.length > 0 || sub.mistakes.length > 0) && (
          <details className="rounded-md bg-slate-50 p-3 text-sm">
            <summary className="cursor-pointer font-semibold text-slate-700">
              Guidance: what to assess, and mistakes to avoid
            </summary>
            <div className="mt-2 grid gap-4 md:grid-cols-3">
              {sub.questions.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    What is assessed
                  </h5>
                  <ul className="mt-1 space-y-1 text-slate-700">
                    {sub.questions.map((q) => (
                      <li key={q.topic}>
                        <strong>{q.topic}.</strong> {q.question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {sub.mistakes.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mistakes to avoid
                  </h5>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-700">
                    {sub.mistakes.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sub.howToAct.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    How to act
                  </h5>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-700">
                    {sub.howToAct.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {sub.example && (
              <p className="mt-3 border-t border-slate-200 pt-2 text-slate-600">
                <strong>Example.</strong> {sub.example}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Source: EIGE, EU-wide guidelines on gender-neutral job evaluation and classification:
              step-by-step toolkit, factor and subfactor plan.
            </p>
          </details>
        )}
      </div>
    </details>
  );
};
