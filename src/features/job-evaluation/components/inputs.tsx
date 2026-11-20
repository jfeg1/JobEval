import React, { useEffect, useState } from "react";

interface NumberInputProps {
  id?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  /** Shows and edits the value as a percentage while storing a fraction. */
  percent?: boolean;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

/** Number field that lets the user clear it and stores null when empty. */
export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  percent,
  className = "",
  ...rest
}) => {
  const toText = (v: number | null) =>
    v === null ? "" : percent ? String(Math.round(v * 10000) / 100) : String(v);
  const [text, setText] = useState(toText(value));
  useEffect(() => setText(toText(value)), [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        className={`input ${percent ? "pr-7" : ""} ${className}`}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = e.target.value === "" ? null : Number(e.target.value);
          if (n === null) onChange(null);
          else if (Number.isFinite(n)) onChange(percent ? n / 100 : n);
        }}
        {...rest}
      />
      {percent && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          %
        </span>
      )}
    </div>
  );
};

export const SectionNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-slate-600 leading-relaxed">{children}</p>
);
