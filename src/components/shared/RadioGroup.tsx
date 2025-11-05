import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-start p-4 rounded-lg border cursor-pointer
            transition-all
            ${value === option.value
              ? 'border-sage-500 bg-sage-50 ring-2 ring-sage-500'
              : error
              ? 'border-red-500 hover:border-red-600'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 text-sage-600 focus:ring-sage-500 focus:ring-offset-0"
            aria-invalid={error ? 'true' : 'false'}
          />
          <div className="ml-3 flex-1">
            <div className="text-slate-900 font-medium">{option.label}</div>
            {option.description && (
              <div className="text-sm text-slate-600 mt-0.5">
                {option.description}
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};
