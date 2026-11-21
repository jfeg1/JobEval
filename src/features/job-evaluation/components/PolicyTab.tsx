import React from "react";
import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import type { Approach, Evaluation } from "../lib/payPolicy";
import { NumberInput, SectionNote } from "./inputs";
import { money, pct } from "./format";

const APPROACHES: { value: Approach; title: string; text: string }[] = [
  {
    value: "layered",
    title: "Layered",
    text: "Base pay comes from your internal pay line. Where the market pays more, add a separate, documented market supplement and review it every year. This is how U.S. federal pay separates basic pay from locality pay.",
  },
  {
    value: "blended",
    title: "Blended",
    text: "One number per job: internal weight × internal value + (1 − internal weight) × market value.",
  },
];

const Field: React.FC<{
  id: string;
  label: string;
  hint: string;
  children: React.ReactNode;
}> = ({ id, label, hint, children }) => (
  <div>
    <label className="label" htmlFor={id}>
      {label}
    </label>
    {children}
    <p className="input-hint">{hint}</p>
  </div>
);

export const PolicyTab: React.FC<{ evaluation: Evaluation }> = ({ evaluation }) => {
  const { policy, updatePolicy } = useJobEvaluationStore();
  const { line, anchor } = evaluation;

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h3 className="card-title">Your pay philosophy, as numbers</h3>
        <SectionNote>
          Managers already mix internal value and market data when they set pay, and usually give
          the market more weight (Rynes, Weber &amp; Milkovich, 1989). Writing the mix down makes it
          a decision you can explain, instead of a habit.
        </SectionNote>
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            id="pol-currency"
            label="Currency"
            hint="Three-letter code (USD, EUR, AUD…). Enter every pay figure in this currency."
          >
            <input
              id="pol-currency"
              className="input uppercase"
              maxLength={3}
              value={policy.currency}
              onChange={(e) => updatePolicy({ currency: e.target.value.toUpperCase() })}
            />
          </Field>
          <Field
            id="pol-position"
            label="Market position"
            hint="100% pays at the market median. 95% lags the market by 5%, which only works for jobs with real non-cash offsets."
          >
            <NumberInput
              id="pol-position"
              percent
              value={policy.marketPosition}
              onChange={(v) => updatePolicy({ marketPosition: v ?? 1 })}
            />
          </Field>
          <Field
            id="pol-weight"
            label="Internal weight (blended approach)"
            hint="0% pays what the market pays. 100% pays what your job evaluation says."
          >
            <NumberInput
              id="pol-weight"
              percent
              value={policy.internalWeight}
              onChange={(v) => updatePolicy({ internalWeight: Math.min(1, Math.max(0, v ?? 0)) })}
            />
          </Field>
          <Field
            id="pol-slope"
            label="Extra pay for a job 100 points bigger"
            hint={
              line
                ? `Your benchmark jobs' market pays ${pct(line.slopePer100, 1)} more per 100 points (${line.n} jobs). Choose your own answer.`
                : "Add at least two benchmark jobs to see what the market pays per 100 points."
            }
          >
            <NumberInput
              id="pol-slope"
              percent
              value={policy.slopePer100}
              onChange={(v) => updatePolicy({ slopePer100: v ?? 0 })}
            />
          </Field>
          <Field
            id="pol-anchor-pts"
            label="Anchor point (points)"
            hint="Where your internal pay line is pegged."
          >
            <NumberInput
              id="pol-anchor-pts"
              value={policy.anchorPoints}
              onChange={(v) => updatePolicy({ anchorPoints: v ?? 500 })}
            />
          </Field>
          <Field
            id="pol-anchor-pay"
            label={`Pay at the anchor point (${policy.currency}, optional)`}
            hint={
              anchor !== null && policy.anchorPayOverride === null
                ? `Blank pegs the line to the market at the anchor: currently ${money(anchor, policy.currency)}. Enter an amount to set it from your budget instead.`
                : "Blank pegs the line to the market at the anchor point. Enter an amount to set it from your budget."
            }
          >
            <NumberInput
              id="pol-anchor-pay"
              value={policy.anchorPayOverride}
              onChange={(v) => updatePolicy({ anchorPayOverride: v })}
            />
          </Field>
          <Field
            id="pol-min"
            label="Range minimum (share of midpoint)"
            hint="A common traditional range runs from 80% to 120% of the midpoint."
          >
            <NumberInput
              id="pol-min"
              percent
              value={policy.rangeMin}
              onChange={(v) => updatePolicy({ rangeMin: v ?? 0.8 })}
            />
          </Field>
          <Field id="pol-max" label="Range maximum (share of midpoint)" hint="">
            <NumberInput
              id="pol-max"
              percent
              value={policy.rangeMax}
              onChange={(v) => updatePolicy({ rangeMax: v ?? 1.2 })}
            />
          </Field>
        </div>
      </div>

      <div className="card">
        <RadioGroup
          value={policy.approach}
          onChange={(approach: Approach) => updatePolicy({ approach })}
          className="space-y-3"
        >
          <Label className="card-title">How pay is built</Label>
          <div className="grid gap-3 md:grid-cols-2">
            {APPROACHES.map((a) => (
              <Radio
                key={a.value}
                value={a.value}
                className="cursor-pointer rounded-md border border-slate-200 p-4 focus:outline-none data-[focus]:ring-2 data-[focus]:ring-accent data-[checked]:border-sage-600 data-[checked]:bg-sage-50"
              >
                <Label className="font-semibold text-sage-900">{a.title}</Label>
                <Description className="mt-1 text-sm text-slate-600">{a.text}</Description>
              </Radio>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
