import React from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  helpText,
  children,
}) => {
  const helpTextId = `${htmlFor}-help`;
  const errorId = `${htmlFor}-error`;

  return (
    <div className="mb-6">
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            'aria-describedby': `${helpText ? helpTextId : ''} ${error ? errorId : ''}`.trim() || undefined,
            'aria-required': required ? 'true' : undefined,
          } as Partial<React.HTMLAttributes<HTMLElement>>);
        }
        return child;
      })}

      {helpText && !error && (
        <p id={helpTextId} className="input-hint">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-red-500 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
