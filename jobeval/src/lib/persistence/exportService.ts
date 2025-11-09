/**
 * Export service for JobEval data persistence
 *
 * Provides functionality to export all application data to JSON format
 * for backup, portability, and data persistence across sessions.
 */

import { useCompanyStore } from "@/features/company-setup/companyStore";
import { useMatchingStore } from "@/features/bls-matching/matchingStore";
import { useQuickAdvisoryStore } from "@/features/quick-advisory/quickAdvisoryStore";
import { useWizardStore } from "@/features/position-wizard/wizardStore";
import { usePositionStore } from "@/features/position-wizard/positionStore";
import type {
  JobEvalExportData,
  SaveError,
  WizardState,
} from "./dataStructure";

/**
 * Determines the type of evaluation based on available data
 */
function determineEvaluationType(
  hasQuickAdvisory: boolean,
  hasFullPosition: boolean
): "quick" | "full" | "mixed" | "none" {
  if (hasQuickAdvisory && hasFullPosition) {
    return "mixed";
  } else if (hasQuickAdvisory) {
    return "quick";
  } else if (hasFullPosition) {
    return "full";
  }
  return "none";
}

/**
 * Checks if position data is present
 */
function hasPositionData(position: JobEvalExportData["data"]["position"]): boolean {
  if (!position) return false;
  return !!(
    position.basicInfo ||
    position.details ||
    position.responsibilities ||
    position.requirements ||
    position.compensation
  );
}

/**
 * Gathers data from all Zustand stores and creates export object
 *
 * Accesses store data using getState() to avoid React hook constraints.
 * All data is gathered synchronously from the stores.
 *
 * @returns Complete JobEval export data object
 */
export function gatherAllData(): JobEvalExportData {
  // Access store states without hooks
  const companyState = useCompanyStore.getState();
  const matchingState = useMatchingStore.getState();
  const quickAdvisoryState = useQuickAdvisoryStore.getState();
  const wizardState = useWizardStore.getState();
  const positionState = usePositionStore.getState();

  const now = new Date().toISOString();

  // Build position data object
  const position = {
    basicInfo: positionState.basicInfo,
    details: positionState.details,
    responsibilities: positionState.responsibilities,
    requirements: positionState.requirements,
    compensation: positionState.compensation,
  };

  // Build wizard state
  const wizard: WizardState = {
    currentStep: wizardState.currentStep,
    steps: wizardState.steps,
  };

  // Determine evaluation type
  const hasQuickAdvisory = !!quickAdvisoryState.formData.jobTitle;
  const hasFullPosition = hasPositionData(position);
  const evaluationType = determineEvaluationType(
    hasQuickAdvisory,
    hasFullPosition
  );

  // Get app version from environment or fallback
  const appVersion = import.meta.env.VITE_APP_VERSION || "0.0.0";

  const exportData: JobEvalExportData = {
    version: "1.0",
    exportDate: now,
    metadata: {
      appVersion,
      companyName: companyState.profile?.name,
      evaluationType,
      lastModified: now,
    },
    data: {
      company: companyState.profile,
      position,
      quickAdvisory: quickAdvisoryState.formData,
      wizard,
      matching: matchingState.selectedOccupation,
    },
  };

  return exportData;
}

/**
 * Generates filename in format: JobEval_Data_CompanyName_YYYY-MM-DD.json
 * If no company name, uses: JobEval_Data_YYYY-MM-DD.json
 *
 * @param companyName - Optional company name to include in filename
 * @returns Formatted filename string
 */
export function generateFilename(companyName?: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  if (companyName) {
    // Sanitize company name for filename (remove special chars, limit length)
    const sanitized = companyName
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .substring(0, 50);
    return `JobEval_Data_${sanitized}_${dateStr}.json`;
  }

  return `JobEval_Data_${dateStr}.json`;
}

/**
 * Triggers browser download of JSON file
 *
 * Creates a Blob from the data and uses URL.createObjectURL to trigger download.
 * Automatically cleans up the object URL after download.
 *
 * @param data - Export data to download
 * @param filename - Name for the downloaded file
 */
export function downloadJsonFile(
  data: JobEvalExportData,
  filename: string
): void {
  try {
    // Convert data to JSON string with formatting
    const jsonString = JSON.stringify(data, null, 2);

    // Create blob with JSON data
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    // Re-throw with more context
    throw new Error(
      `Failed to download JSON file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Main export function - gathers data and triggers download
 *
 * This is the primary entry point for exporting all JobEval data.
 * Handles the complete export flow including error handling.
 *
 * @returns Promise resolving to success status and optional error
 */
export async function exportAllData(): Promise<{
  success: boolean;
  error?: SaveError;
}> {
  try {
    // Gather all data from stores
    const exportData = gatherAllData();

    // Generate appropriate filename
    const filename = generateFilename(exportData.metadata.companyName);

    // Trigger download
    downloadJsonFile(exportData, filename);

    return { success: true };
  } catch (error) {
    const saveError: SaveError = {
      timestamp: new Date(),
      errorType: "export_failed",
      message:
        error instanceof Error ? error.message : "Unknown export error",
      stack: error instanceof Error ? error.stack : undefined,
      userAction: "export_all_data",
    };

    return { success: false, error: saveError };
  }
}
