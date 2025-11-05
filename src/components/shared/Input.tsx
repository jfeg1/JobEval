import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-4 py-2.5 rounded-lg border
          text-slate-900 placeholder:text-slate-400
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
      />
    );
  }
);

Input.displayName = 'Input';
