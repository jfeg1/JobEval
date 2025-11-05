import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full px-4 py-2.5 rounded-lg border
          text-slate-900 bg-white
          focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent
          transition-colors
          ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-300 hover:border-slate-400'
          }
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
