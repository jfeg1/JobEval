import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    const baseClasses = "input";
    const errorClasses = error ? "border-red-500 focus:border-red-500" : "";

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${className}`}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
