import React from "react";
import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import type { Factor } from "../lib/factors";
import { pointsForLevel } from "../lib/factors";

interface Props {
  factor: Factor;
  totalPoints: number;
  value: number | null;
  onChange: (level: number) => void;
}

/** One factor, five defined levels; the rater picks the level the evidence supports. */
export const FactorRating: React.FC<Props> = ({ factor, totalPoints, value, onChange }) => (
  <RadioGroup value={value ?? 0} onChange={onChange} className="space-y-2">
    <Label className="block text-sm font-semibold text-sage-900">
      {factor.name}{" "}
      <span className="font-normal text-slate-500">
        ({Math.round(factor.weight * 100)}% of points)
      </span>
    </Label>
    <div className="grid gap-2 md:grid-cols-5">
      {factor.levels.map((text, i) => {
        const level = i + 1;
        return (
          <Radio
            key={level}
            value={level}
            className="group cursor-pointer rounded-md border border-slate-200 bg-white p-3 text-left transition focus:outline-none data-[focus]:ring-2 data-[focus]:ring-accent data-[checked]:border-sage-600 data-[checked]:bg-sage-50"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-800">Level {level}</span>
              <span className="text-xs text-slate-500">
                {pointsForLevel(factor, level, totalPoints)} pts
              </span>
            </div>
            <Description className="mt-1 text-xs leading-snug text-slate-600">{text}</Description>
          </Radio>
        );
      })}
    </div>
  </RadioGroup>
);
