/**
 * ExportButton component for manual data export
 *
 * Provides a button that exports all JobEval data to a JSON file.
 * Shows loading state during export and displays success/error notifications.
 */

import { useState } from "react";
import { useToast } from "@/shared/components/ui";
import { exportAllData } from "@/lib/persistence/exportService";

export interface ExportButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function ExportButton({ variant = "primary", size = "md" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      const result = await exportAllData();

      if (result.success) {
        showToast("Data exported successfully", "success");
      } else {
        const errorMessage = result.error?.message || "Unknown error occurred";
        showToast(`Export failed - ${errorMessage}`, "error");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showToast(`Export failed - ${errorMessage}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg",
  };

  // Variant classes
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`
        btn ${variantClasses[variant]} ${sizeClasses[size]}
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2 justify-center
        min-w-[140px]
      `}
      aria-label="Export all data to JSON file"
      aria-busy={isExporting}
    >
      {isExporting ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Export Data</span>
        </>
      )}
    </button>
  );
}
