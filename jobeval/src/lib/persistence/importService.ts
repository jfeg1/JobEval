/**
 * Import service for JobEval data restoration
 *
 * Provides functionality to import, validate, and restore application data
 * from JSON export files with comprehensive error handling.
 */

import { useCompanyStore } from "@/features/company-setup/companyStore";
import { useMatchingStore } from "@/features/bls-matching/matchingStore";
import { useQuickAdvisoryStore } from "@/features/quick-advisory/quickAdvisoryStore";
import { useWizardStore } from "@/features/position-wizard/wizardStore";
import { usePositionStore } from "@/features/position-wizard/positionStore";
import type { JobEvalExportData } from "./dataStructure";

/**
 * Current application version for data format compatibility
 */
const CURRENT_VERSION = "1.0";

/**
 * Validates imported JSON structure and version
 *
 * Performs comprehensive validation of the imported data structure,
 * checking for required fields, correct types, and data integrity.
 *
 * @param json - Unknown data to validate (typically parsed JSON)
 * @returns Validation result with errors array and parsed data if valid
 */
export function validateImportData(json: unknown): {
  valid: boolean;
  errors: string[];
  data?: JobEvalExportData;
} {
  const errors: string[] = [];

  // Check if input is an object
  if (!json || typeof json !== "object") {
    errors.push("Invalid file format - not a valid JSON file");
    return { valid: false, errors };
  }

  const data = json as Record<string, unknown>;

  // Validate version field
  if (!data.version || typeof data.version !== "string") {
    errors.push("Missing required field: version");
  }

  // Validate exportDate field
  if (!data.exportDate || typeof data.exportDate !== "string") {
    errors.push("Missing required field: exportDate");
  } else {
    // Validate ISO 8601 date format
    const date = new Date(data.exportDate);
    if (isNaN(date.getTime())) {
      errors.push("Invalid exportDate format - must be valid ISO 8601 date");
    }
  }

  // Validate metadata object
  if (!data.metadata || typeof data.metadata !== "object" || data.metadata === null) {
    errors.push("Missing required field: metadata");
  } else {
    const metadata = data.metadata as Record<string, unknown>;

    if (!metadata.appVersion || typeof metadata.appVersion !== "string") {
      errors.push("Missing required metadata field: appVersion");
    }

    if (
      !metadata.evaluationType ||
      typeof metadata.evaluationType !== "string" ||
      !["quick", "full", "mixed", "none"].includes(metadata.evaluationType)
    ) {
      errors.push("Invalid or missing metadata field: evaluationType");
    }

    if (!metadata.lastModified || typeof metadata.lastModified !== "string") {
      errors.push("Missing required metadata field: lastModified");
    }
  }

  // Validate data object
  if (!data.data || typeof data.data !== "object" || data.data === null) {
    errors.push("Missing required field: data");
  } else {
    const dataObj = data.data as Record<string, unknown>;

    // Validate company field (can be null)
    if (dataObj.company !== null && typeof dataObj.company !== "object") {
      errors.push("Company data is corrupted in import file");
    }

    // Validate position field (can be null)
    if (dataObj.position !== null) {
      if (typeof dataObj.position !== "object") {
        errors.push("Position data is corrupted in import file");
      } else {
        const position = dataObj.position as Record<string, unknown>;
        // Position should have the expected structure
        const hasValidStructure =
          "basicInfo" in position &&
          "details" in position &&
          "responsibilities" in position &&
          "requirements" in position &&
          "compensation" in position;

        if (!hasValidStructure) {
          errors.push("Position data structure is invalid in import file");
        }
      }
    }

    // Validate quickAdvisory field (can be null)
    if (dataObj.quickAdvisory !== null && typeof dataObj.quickAdvisory !== "object") {
      errors.push("Quick advisory data is corrupted in import file");
    }

    // Validate wizard field (can be null)
    if (dataObj.wizard !== null) {
      if (typeof dataObj.wizard !== "object") {
        errors.push("Unable to restore wizard state");
      } else {
        const wizard = dataObj.wizard as Record<string, unknown>;
        if (typeof wizard.currentStep !== "number" || !Array.isArray(wizard.steps)) {
          errors.push("Wizard state structure is invalid in import file");
        }
      }
    }

    // Validate matching field (can be null)
    if (dataObj.matching !== null && typeof dataObj.matching !== "object") {
      errors.push("BLS matching data is corrupted in import file");
    }
  }

  // Return validation result
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], data: data as unknown as JobEvalExportData };
}

/**
 * Checks if imported data version matches current version
 * Returns migration strategy if needed
 *
 * @param importedVersion - Version string from imported data
 * @returns Compatibility status and migration information
 */
export function checkVersion(importedVersion: string): {
  compatible: boolean;
  needsMigration: boolean;
  message?: string;
} {
  // Exact version match - no migration needed
  if (importedVersion === CURRENT_VERSION) {
    return {
      compatible: true,
      needsMigration: false,
    };
  }

  // Future: Add migration logic for older versions
  // For now, only accept version 1.0
  return {
    compatible: false,
    needsMigration: false,
    message: `Incompatible data version - this file is from version ${importedVersion}`,
  };
}

/**
 * Populates all Zustand stores with imported data
 *
 * Uses getState() to access store actions and populate data.
 * Handles null values appropriately and maintains referential integrity.
 *
 * @param data - Validated export data to populate stores with
 * @throws Error if store population fails
 */
export function populateStores(data: JobEvalExportData): void {
  try {
    // Populate company store
    if (data.data.company) {
      useCompanyStore.getState().setProfile(data.data.company);
    } else {
      useCompanyStore.getState().clearProfile();
    }

    // Populate position store
    if (data.data.position) {
      const positionStore = usePositionStore.getState();

      if (data.data.position.basicInfo) {
        positionStore.setBasicInfo(data.data.position.basicInfo);
      }

      if (data.data.position.details) {
        positionStore.setDetails(data.data.position.details);
      }

      if (data.data.position.responsibilities) {
        positionStore.setResponsibilities(data.data.position.responsibilities);
      }

      if (data.data.position.requirements) {
        positionStore.setRequirements(data.data.position.requirements);
      }

      if (data.data.position.compensation) {
        positionStore.setCompensation(data.data.position.compensation);
      }
    } else {
      // Clear position store if no data
      usePositionStore.getState().clearPosition();
    }

    // Populate quick advisory store
    if (data.data.quickAdvisory) {
      const quickAdvisoryStore = useQuickAdvisoryStore.getState();

      // Set each field individually using the store's setters
      if (data.data.quickAdvisory.jobTitle) {
        quickAdvisoryStore.setJobTitle(data.data.quickAdvisory.jobTitle);
      }
      if (data.data.quickAdvisory.location) {
        quickAdvisoryStore.setLocation(data.data.quickAdvisory.location);
      }
      if (data.data.quickAdvisory.numEmployees) {
        quickAdvisoryStore.setNumEmployees(data.data.quickAdvisory.numEmployees);
      }
      if (data.data.quickAdvisory.proposedSalary !== undefined) {
        quickAdvisoryStore.setProposedSalary(data.data.quickAdvisory.proposedSalary);
      }
      if (data.data.quickAdvisory.marketPositioning) {
        quickAdvisoryStore.setMarketPositioning(data.data.quickAdvisory.marketPositioning);
      }
      if (data.data.quickAdvisory.annualRevenue !== undefined) {
        quickAdvisoryStore.setRevenue(data.data.quickAdvisory.annualRevenue);
      }
      if (data.data.quickAdvisory.annualPayroll !== undefined) {
        quickAdvisoryStore.setPayroll(data.data.quickAdvisory.annualPayroll);
      }
    } else {
      // Reset to initial state if no data
      useQuickAdvisoryStore.getState().resetQuickAdvisory();
    }

    // Populate wizard store
    if (data.data.wizard) {
      const wizardStore = useWizardStore.getState();

      // Set current step
      wizardStore.setCurrentStep(data.data.wizard.currentStep);

      // Mark completed steps
      data.data.wizard.steps.forEach((step) => {
        if (step.completed) {
          wizardStore.markStepComplete(step.id);
        }
      });
    } else {
      // Reset wizard if no data
      useWizardStore.getState().resetWizard();
    }

    // Populate matching store
    if (data.data.matching) {
      useMatchingStore.getState().selectOccupation(data.data.matching);
    } else {
      useMatchingStore.getState().clearMatching();
    }
  } catch (error) {
    // Log detailed error for debugging
    console.error("Store population failed:", error);

    // Throw user-friendly error
    throw new Error(
      `Failed to restore data to application stores: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Main import function - validates, checks version, and populates stores
 *
 * This is the primary entry point for importing JobEval data.
 * Handles the complete import flow with comprehensive error handling.
 *
 * @param file - File object to import (should be JSON)
 * @returns Promise resolving to success status with optional errors and warnings
 */
export async function importAllData(
  file: File
): Promise<{ success: boolean; errors?: string[]; warnings?: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Step 1: Read file as text
    const fileContent = await file.text();

    // Step 2: Parse JSON
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(fileContent);
    } catch (parseError) {
      errors.push("Invalid file format - not a valid JSON file");
      console.error("JSON parse error:", parseError);
      return { success: false, errors };
    }

    // Step 3: Validate data structure
    const validation = validateImportData(parsedData);
    if (!validation.valid) {
      errors.push(...validation.errors);
      console.error("Validation errors:", validation.errors);
      return { success: false, errors };
    }

    const data = validation.data!;

    // Step 4: Check version compatibility
    const versionCheck = checkVersion(data.version);
    if (!versionCheck.compatible) {
      errors.push(versionCheck.message || "Incompatible data version");
      console.error("Version compatibility check failed:", versionCheck);
      return { success: false, errors };
    }

    // Add migration warning if needed
    if (versionCheck.needsMigration) {
      warnings.push("Data was migrated from an older version");
    }

    // Step 5: Populate stores
    try {
      populateStores(data);
    } catch (populateError) {
      errors.push(
        populateError instanceof Error
          ? populateError.message
          : "Failed to restore data to application"
      );
      console.error("Store population error:", populateError);
      return { success: false, errors };
    }

    // Success!
    console.log("Data import successful:", {
      version: data.version,
      exportDate: data.exportDate,
      evaluationType: data.metadata.evaluationType,
    });

    return {
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    // Catch-all for unexpected errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred during import";

    errors.push(errorMessage);
    console.error("Unexpected import error:", error);

    return { success: false, errors };
  }
}
