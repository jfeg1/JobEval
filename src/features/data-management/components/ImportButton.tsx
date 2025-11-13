/**
 * ImportButton component for manual data import
 *
 * Provides a button that opens a file picker to import JobEval data from JSON.
 * Includes confirmation dialog, validation, error handling, and success notifications.
 */

import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { useToast, Modal } from "@/shared/components/ui";
import { importAllData } from "@/lib/persistence/importService";
import {
  generateErrorReport,
  createGitHubIssueUrl,
  formatErrorReportMarkdown,
} from "@/lib/errorReporting";
import type { ErrorReport } from "@/lib/errorReporting";

export interface ImportButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

interface ErrorModalData {
  errors: string[];
  errorReport: ErrorReport;
  githubUrl: string;
  markdown: string;
}

export function ImportButton({ variant = "primary", size = "md" }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState<ErrorModalData | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleButtonClick = () => {
    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".json")) {
      showToast("Please select a JSON file", "error");
      return;
    }

    // Store file and show confirmation modal
    setPendingFile(file);
    setShowConfirmModal(true);

    // Reset input so same file can be selected again
    event.target.value = "";
  };

  const handleConfirmImport = async () => {
    if (!pendingFile) return;

    setShowConfirmModal(false);
    setIsImporting(true);

    try {
      const result = await importAllData(pendingFile);

      if (result.success) {
        // Count items restored (simplified - just show success)
        showToast("Data imported successfully", "success");
      } else {
        // Generate error report for validation failures
        const errorReport = generateErrorReport({
          type: "import_validation_error",
          message: result.errors?.join("\n") || "Unknown validation error occurred",
          userAction: "Attempted to import data file",
        });

        const githubUrl = createGitHubIssueUrl(errorReport);
        const markdown = formatErrorReportMarkdown(errorReport);

        // Show error modal with detailed errors
        setErrorModalData({
          errors: result.errors || ["Unknown error occurred"],
          errorReport,
          githubUrl,
          markdown,
        });
        setShowErrorModal(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      const errorStack = error instanceof Error ? error.stack : undefined;

      // Generate error report for unexpected errors
      const errorReport = generateErrorReport({
        type: "import_error",
        message: errorMessage,
        stack: errorStack,
        userAction: "Attempted to import data file",
      });

      const githubUrl = createGitHubIssueUrl(errorReport);
      const markdown = formatErrorReportMarkdown(errorReport);

      // Show error modal with error details
      setErrorModalData({
        errors: [errorMessage],
        errorReport,
        githubUrl,
        markdown,
      });
      setShowErrorModal(true);
    } finally {
      setIsImporting(false);
      setPendingFile(null);
    }
  };

  const handleCancelImport = () => {
    setShowConfirmModal(false);
    setPendingFile(null);
  };

  const handleCopyErrorReport = async () => {
    if (!errorModalData) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(errorModalData.markdown);
        showToast("Error report copied to clipboard", "success");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = errorModalData.markdown;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            showToast("Error report copied to clipboard", "success");
          } else {
            showToast("Failed to copy error report", "error");
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch {
      showToast("Failed to copy error report", "error");
    }
  };

  const handleReportOnGitHub = () => {
    if (!errorModalData) return;

    // Open GitHub issue in new tab
    window.open(errorModalData.githubUrl, "_blank", "noopener,noreferrer");
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
    <>
      <button
        onClick={handleButtonClick}
        disabled={isImporting}
        className={`
          btn ${variantClasses[variant]} ${sizeClasses[size]}
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2 justify-center
          min-w-[140px]
        `}
        aria-label="Import data from JSON file"
        aria-busy={isImporting}
      >
        {isImporting ? (
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
            <span>Importing...</span>
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>Import Data</span>
          </>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelected}
        className="hidden"
        aria-label="Select JSON file to import"
      />

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCancelImport}
        title="Import Data"
        size="md"
        actions={
          <>
            <button onClick={handleCancelImport} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleConfirmImport} className="btn btn-primary">
              Import
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Importing will replace all current work. Any unsaved changes will be lost.
          </p>
          <p className="text-gray-700 font-medium">Continue?</p>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Import Failed"
        size="lg"
        actions={
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleCopyErrorReport} className="btn btn-secondary">
              Copy Error Report
            </button>
            <button onClick={handleReportOnGitHub} className="btn btn-secondary">
              Report on GitHub
            </button>
            <button onClick={() => setShowErrorModal(false)} className="btn btn-primary">
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Unable to import data file. The file may be corrupted or from an incompatible version.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
            <p className="text-sm font-semibold text-red-900 mb-2">
              Error{errorModalData && errorModalData.errors.length > 1 ? "s" : ""}:
            </p>
            <ul className="space-y-2">
              {errorModalData?.errors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-800 flex gap-2">
                  <span className="font-semibold flex-shrink-0">{idx + 1}.</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            You can copy the error report to your clipboard or report this issue directly on GitHub.
          </p>
        </div>
      </Modal>
    </>
  );
}
