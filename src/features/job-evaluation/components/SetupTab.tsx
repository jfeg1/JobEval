import React from "react";
import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import { Button, Textarea } from "@/shared/components/ui";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import {
  activeSubfactors,
  FACTOR_KEYS,
  FACTOR_NAMES,
  factorWeight,
  METHOD_INFO,
  PLANS,
  suggestMethod,
  weightsTotal,
  type Method,
  type PlanId,
} from "../lib/plans";
import { NumberInput, SectionNote } from "./inputs";

const METHODS: Method[] = ["graduated", "paired", "points"];

export const SetupTab: React.FC = () => {
  const st = useJobEvaluationStore();
  const { org, settings, raters, blind, jobs } = st;
  const suggested = suggestMethod(org.workers, jobs.length);
  const subs = activeSubfactors({ ...settings, method: "points" });
  const total = weightsTotal(settings);
  const weighted = settings.method === "points";

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h3 className="card-title">Your organisation</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label" htmlFor="org-name">
              Name
            </label>
            <input
              id="org-name"
              className="input"
              value={org.name}
              onChange={(e) => st.setOrg({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="org-workers">
              Number of workers
            </label>
            <NumberInput
              id="org-workers"
              value={org.workers}
              min={0}
              onChange={(v) => st.setOrg({ workers: v })}
            />
            <p className="input-hint">Decides the suggested method and your reporting duty.</p>
          </div>
          <div>
            <span className="label">Job roles</span>
            <p className="mt-2 text-2xl font-light text-sage-900">{jobs.length}</p>
            <p className="input-hint">Add or import them on the next tab.</p>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="card-title">Method</h3>
        <SectionNote>
          The EU toolkit on gender-neutral job evaluation (EIGE) scales the method to the size of
          the organisation. All three methods use the same four criteria from Article 4 of the
          Directive: skills, responsibility, effort and working conditions.
        </SectionNote>
        <RadioGroup
          value={settings.method}
          onChange={(m: Method) => st.setMethod(m)}
          className="grid gap-3 md:grid-cols-3"
        >
          {METHODS.map((m) => (
            <Radio
              key={m}
              value={m}
              className="cursor-pointer rounded-md border border-slate-200 bg-white p-4 text-left focus:outline-none data-[focus]:ring-2 data-[focus]:ring-accent data-[checked]:border-sage-600 data-[checked]:bg-sage-50"
            >
              <Label className="flex items-center justify-between font-semibold text-sage-900">
                {METHOD_INFO[m].name}
                {m === suggested && (
                  <span className="rounded bg-sage-600 px-2 py-0.5 text-xs font-medium text-white">
                    Suggested
                  </span>
                )}
              </Label>
              <Description className="mt-1 text-xs font-medium text-slate-500">
                {METHOD_INFO[m].who}
              </Description>
              <p className="mt-2 text-sm text-slate-700">{METHOD_INFO[m].how}</p>
            </Radio>
          ))}
        </RadioGroup>
        {settings.method === "paired" && jobs.length > 15 && (
          <p role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
            The toolkit does not recommend paired comparison for more than 15 job roles. You have{" "}
            {jobs.length}. Consider the point-factor method.
          </p>
        )}
      </div>

      <div className="card space-y-4">
        <h3 className="card-title">Factor and subfactor plan</h3>
        <div className="max-w-md">
          <label className="label" htmlFor="plan">
            Plan
          </label>
          <select
            id="plan"
            className="select"
            value={settings.planId}
            onChange={(e) => {
              if (
                !jobs.some((j) => Object.keys(j.ratings).length) ||
                window.confirm("Ratings on the current plan will not carry over. Switch plan?")
              )
                st.setPlan(e.target.value as PlanId);
            }}
          >
            {(Object.keys(PLANS) as PlanId[]).map((id) => (
              <option key={id} value={id}>
                {PLANS[id].name}
              </option>
            ))}
          </select>
          <p className="input-hint">
            {settings.planId === "eige"
              ? "The toolkit's default plan: 14 subfactors, with explicit credit for soft skills and emotional effort."
              : "Four factors with five levels each. Quicker, but less detail to defend a rating."}
          </p>
        </div>

        {weighted && (
          <>
            <SectionNote>
              Weights are a value choice, so record the reason for each. Set them before you look at
              current pay, and check that they do not favour factors found mostly in men&apos;s jobs
              or in senior jobs. The toolkit&apos;s defaults are skills 40%, responsibility 35%,
              effort 15% and working conditions 10%.
            </SectionNote>
            <div className="grid gap-4 lg:grid-cols-4">
              {FACTOR_KEYS.map((f) => (
                <fieldset key={f} className="rounded-md border border-slate-200 p-3">
                  <legend className="px-1 text-sm font-semibold text-sage-900">
                    {FACTOR_NAMES[f]} · {factorWeight(settings, f)}%
                  </legend>
                  <div className="space-y-2">
                    {subs
                      .filter((d) => d.factor === f)
                      .map((d) => (
                        <div key={d.id} className="flex items-center justify-between gap-2">
                          <label htmlFor={`w-${d.id}`} className="text-xs text-slate-700">
                            {d.name}
                          </label>
                          <div className="w-20 shrink-0">
                            <NumberInput
                              id={`w-${d.id}`}
                              value={d.weight}
                              min={0}
                              max={100}
                              onChange={(v) => st.setWeight(d.id, v ?? 0)}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-6">
              <p
                className={`text-sm ${Math.abs(total - 100) < 1e-6 ? "text-slate-600" : "font-semibold text-red-700"}`}
              >
                Weights total {total}%
                {Math.abs(total - 100) < 1e-6 ? "." : ": they must total 100%."}
              </p>
              <div className="w-40">
                <label className="label" htmlFor="total-points">
                  Total points
                </label>
                <NumberInput
                  id="total-points"
                  value={settings.totalPoints}
                  min={100}
                  onChange={(v) =>
                    st.setTotalPoints(v && v > 0 ? v : PLANS[settings.planId].totalPoints)
                  }
                />
              </div>
            </div>
          </>
        )}

        {settings.method === "graduated" && (
          <>
            <SectionNote>
              Shortlist the subfactors that show the real differences between your jobs. Keep the
              ones that are easy to overlook in jobs mostly held by women, such as communication,
              emotional effort and responsibility for people&apos;s well-being.
            </SectionNote>
            <div className="grid gap-4 lg:grid-cols-4">
              {FACTOR_KEYS.map((f) => (
                <fieldset key={f} className="rounded-md border border-slate-200 p-3">
                  <legend className="px-1 text-sm font-semibold text-sage-900">
                    {FACTOR_NAMES[f]}
                  </legend>
                  {subs
                    .filter((d) => d.factor === f && !d.custom)
                    .map((d) => (
                      <label
                        key={d.id}
                        className="flex items-start gap-2 py-1 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={settings.shortlist[d.id] !== false}
                          onChange={(e) => st.toggleShortlist(d.id, e.target.checked)}
                        />
                        {d.name}
                      </label>
                    ))}
                </fieldset>
              ))}
            </div>
          </>
        )}

        <details className="rounded-md border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-sage-900">
            Additional subfactors ({settings.custom.length})
          </summary>
          <div className="mt-3 space-y-4">
            <SectionNote>
              Add a subfactor only if your jobs need it, define it clearly, and make sure it does
              not count something already measured: double counting overvalues the jobs that score
              high on it. One additional subfactor per factor, levels 0 to 5.
            </SectionNote>
            <div className="flex flex-wrap gap-2">
              {FACTOR_KEYS.filter((f) => !settings.custom.some((c) => c.factor === f)).map((f) => (
                <Button key={f} variant="secondary" onClick={() => st.addCustom(f)}>
                  Add to {FACTOR_NAMES[f].toLowerCase()}
                </Button>
              ))}
            </div>
            {settings.custom.map((c) => (
              <fieldset key={c.id} className="space-y-2 rounded-md border border-slate-200 p-3">
                <legend className="px-1 text-sm font-semibold text-sage-900">
                  {FACTOR_NAMES[c.factor]}: additional subfactor
                </legend>
                <div className="grid gap-3 md:grid-cols-[1fr_8rem_auto]">
                  <input
                    aria-label="Name"
                    className="input"
                    placeholder="Name"
                    value={c.name}
                    onChange={(e) => st.updateCustom(c.id, { name: e.target.value })}
                  />
                  {weighted ? (
                    <NumberInput
                      aria-label="Weight (%)"
                      value={c.weight}
                      onChange={(v) => st.setWeight(c.id, v ?? 0)}
                    />
                  ) : (
                    <span />
                  )}
                  <Button variant="secondary" onClick={() => st.removeCustom(c.id)}>
                    Remove
                  </Button>
                </div>
                <Textarea
                  aria-label="Definition"
                  rows={2}
                  placeholder="What it measures, and why your jobs need it"
                  value={c.definition}
                  onChange={(e) => st.updateCustom(c.id, { definition: e.target.value })}
                />
                <div className="grid gap-2 md:grid-cols-2">
                  {c.levels.map((t, i) => (
                    <input
                      key={i}
                      aria-label={`Level ${i}`}
                      className="input"
                      placeholder={`Level ${i}`}
                      value={t}
                      onChange={(e) =>
                        st.updateCustom(c.id, {
                          levels: c.levels.map((x, k) => (k === i ? e.target.value : x)),
                        })
                      }
                    />
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </details>
      </div>

      <div className="card space-y-4">
        <h3 className="card-title">Job evaluation committee</h3>
        <SectionNote>
          The toolkit asks each member to rate on their own first, then meet, compare the spread of
          levels and agree a final level with a written reason. Include women and men, and
          workers&apos; representatives where you have them: the Directive asks for criteria agreed
          with them (Art. 4(4)).
        </SectionNote>
        <ul className="space-y-2">
          {raters.map((r) => (
            <li key={r.id} className="flex gap-2">
              <input
                aria-label="Committee member"
                className="input max-w-xs"
                value={r.name}
                onChange={(e) => st.updateRater(r.id, e.target.value)}
              />
              <Button variant="secondary" onClick={() => st.removeRater(r.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <Button variant="secondary" onClick={() => st.addRater()}>
          Add a member
        </Button>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-1"
            checked={blind}
            onChange={(e) => st.setBlind(e.target.checked)}
          />
          <span>
            <strong>Rate blind.</strong> Show jobs as Job A, Job B… and hide pay while rating.
            Raters score the same job lower when it has a lower-status title (McShane, 1990), and
            knowing current pay shifts the points they give (Mount &amp; Ellis, 1989).
          </span>
        </label>
      </div>
    </div>
  );
};
