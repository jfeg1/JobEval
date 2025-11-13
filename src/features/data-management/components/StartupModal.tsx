/**
 * StartupModal component for restoring previous work on app launch
 *
 * Appears when:
 * - App just launched
 * - Zustand stores are empty (no persisted data)
 * - Recent backups exist in localStorage (jobeval-backup-* keys)
 *
 * Allows users to:
 * - Restore previous work from most recent backup
 * - Start fresh (clear all backups)
 * - Import from file
 */

/* eslint-disable react-refresh/only-export-components */
import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/shared/components/ui/Modal";
import { useToast } from "@/shared/components/ui/Toast";
import { useCompanyStore } from "@/features/company-setup/companyStore";
import { usePositionStore } from "@/features/position-wizard/positionStore";
import { useQuickAdvisoryStore } from "@/features/quick-advisory/quickAdvisoryStore";
import { importAllData } from "@/lib/persistence/importService";
import type { JobEvalExportData } from "@/lib/persistence/dataStructure";

/**
 * Check if Zustand stores are empty (no persisted data)
 */
function hasExistingData(): boolean {
  const hasCompanyData = useCompanyStore.getState().profile !== null;
  const hasPositionData = usePositionStore.getState().basicInfo !== null;
  const hasQuickData = useQuickAdvisoryStore.getState().formData.jobTitle !== "";

  return hasCompanyData || hasPositionData || hasQuickData;
}

/**
 * Get all backup keys from localStorage
 */
function getBackupKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("jobeval-backup-")) {
        keys.push(key);
      }
    }
  } catch (error) {
    console.error("Failed to enumerate localStorage keys:", error);
  }
  return keys.sort().reverse(); // Most recent first (ISO timestamps sort correctly)
}

/**
 * Get the most recent backup from localStorage
 */
function getMostRecentBackup(): { key: string; data: JobEvalExportData; timestamp: Date } | null {
  const backupKeys = getBackupKeys();

  if (backupKeys.length === 0) {
    return null;
  }

  const mostRecentKey = backupKeys[0];

  try {
    const jsonString = localStorage.getItem(mostRecentKey);
    if (!jsonString) {
      return null;
    }

    const data = JSON.parse(jsonString) as JobEvalExportData;

    // Extract timestamp from key (format: jobeval-backup-{ISO timestamp})
    const timestampStr = mostRecentKey.replace("jobeval-backup-", "");
    const timestamp = new Date(timestampStr);

    return { key: mostRecentKey, data, timestamp };
  } catch (error) {
    console.error("Failed to parse backup:", error);
    return null;
  }
}

/**
 * Check if startup modal should be shown
 */
export function shouldShowStartupModal(): boolean {
  const hasData = hasExistingData();
  const backupKeys = getBackupKeys();

  return !hasData && backupKeys.length > 0;
}

/**
 * Clear all backups from localStorage
 */
function clearAllBackups(): void {
  const backupKeys = getBackupKeys();

  backupKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove backup: ${key}`, error);
    }
  });
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    // Format as date/time
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  }
}

/**
 * Determine where to redirect user after restore based on data
 */
function getRedirectPath(data: JobEvalExportData): string {
  const { evaluationType } = data.metadata;

  // Redirect based on evaluation type
  switch (evaluationType) {
    case "quick":
      return "/quick";
    case "full":
      return "/position/basic";
    case "mixed":
      // If has both, go to quick advisory (simpler workflow)
      return "/quick";
    case "none":
    default:
      return "/";
  }
}

export interface StartupModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function StartupModal({ isOpen: isOpenProp, onClose: onCloseProp }: StartupModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Determine if we're controlling state internally or externally
  const isControlled = isOpenProp !== undefined;
  const isOpen = isControlled ? isOpenProp : internalIsOpen;
  const handleClose = () => {
    if (onCloseProp) {
      onCloseProp();
    }
    setInternalIsOpen(false);
  };

  // Check if modal should be shown on mount (only if not controlled)
  useEffect(() => {
    if (!isControlled) {
      const shouldShow = shouldShowStartupModal();
      setInternalIsOpen(shouldShow);
    }
  }, [isControlled]);

  const backup = getMostRecentBackup();

  const handleRestorePreviousWork = async () => {
    if (!backup) {
      showToast("No backup found", "error");
      return;
    }

    setIsRestoring(true);

    try {
      // Create a File object from the backup data (to use importAllData)
      const jsonString = JSON.stringify(backup.data);
      const blob = new Blob([jsonString], { type: "application/json" });
      const file = new File([blob], "backup.json", { type: "application/json" });

      const result = await importAllData(file);

      if (result.success) {
        showToast("Previous work restored", "success");
        handleClose();

        // Redirect to appropriate page
        const redirectPath = getRedirectPath(backup.data);
        navigate(redirectPath);
      } else {
        showToast("Failed to restore backup", "error");
        console.error("Restore errors:", result.errors);
      }
    } catch (error) {
      showToast("Failed to restore backup", "error");
      console.error("Restore error:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleStartFresh = () => {
    // Clear all backups
    clearAllBackups();
    showToast("Starting fresh", "info");
    handleClose();
    navigate("/");
  };

  const handleImportFromFile = () => {
    // Close modal and trigger file picker
    handleClose();
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".json")) {
      showToast("Please select a JSON file", "error");
      return;
    }

    setIsRestoring(true);

    try {
      const result = await importAllData(file);

      if (result.success) {
        showToast("Data imported successfully", "success");

        // Parse the file to determine redirect path
        const fileContent = await file.text();
        const data = JSON.parse(fileContent) as JobEvalExportData;
        const redirectPath = getRedirectPath(data);
        navigate(redirectPath);
      } else {
        showToast("Failed to import file", "error");
        console.error("Import errors:", result.errors);
      }
    } catch (error) {
      showToast("Failed to import file", "error");
      console.error("Import error:", error);
    } finally {
      setIsRestoring(false);
      // Reset input so same file can be selected again
      event.target.value = "";
    }
  };

  if (!backup) {
    // Should never happen, but handle gracefully
    return <></>;
  }

  const formattedTime = formatTimestamp(backup.timestamp);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Welcome back to JobEval"
        size="md"
        actions={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleStartFresh}
              disabled={isRestoring}
              className="btn btn-secondary order-2 sm:order-1"
              aria-label="Start fresh with no data"
            >
              Start Fresh
            </button>
            <button
              onClick={handleImportFromFile}
              disabled={isRestoring}
              className="btn btn-secondary order-3 sm:order-2"
              aria-label="Import data from file"
            >
              Import from File
            </button>
            <button
              onClick={handleRestorePreviousWork}
              disabled={isRestoring}
              className="btn btn-primary order-1 sm:order-3"
              aria-label="Restore previous work from backup"
            >
              {isRestoring ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Restoring...
                </>
              ) : (
                "Restore Previous Work"
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            We detected a recent backup from <strong>{formattedTime}</strong>. Would you like to
            restore your previous work?
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What would you like to do?</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Restore your previous work from the backup</li>
                  <li>• Start fresh with a clean slate</li>
                  <li>• Import data from a different file</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Hidden file input for Import from File */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelected}
        className="hidden"
        aria-label="Select JSON file to import"
      />
    </>
  );
}
