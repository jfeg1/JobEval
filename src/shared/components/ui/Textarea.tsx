import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => {
    const baseClasses = "input";
    const errorClasses = error ? "border-red-500 focus:border-red-500" : "";

    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${className}`}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
