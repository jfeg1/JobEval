/**
 * Data Transfer Utility
 *
 * Handles the transfer of data from Quick Advisory to the In-Depth Wizard.
 * This enables a seamless upgrade experience where users don't need to re-enter
 * information they've already provided in the Quick Advisory flow.
 */

import { useQuickAdvisoryStore } from "@/features/quick-advisory/quickAdvisoryStore";
import { useCompanyStore } from "@/features/company-setup/companyStore";
import { usePositionStore } from "@/features/position-wizard/positionStore";
import { useWizardStore } from "@/features/position-wizard/wizardStore";

/**
 * Result of a data transfer operation
 */
export interface TransferResult {
  /** Whether the transfer completed successfully */
  success: boolean;
  /** List of field names that were successfully transferred */
  fieldsTransferred: string[];
  /** Any errors encountered during transfer */
  errors?: string[];
}

/**
 * Converts a number of employees to a size range string
 */
function convertNumEmployeesToSizeRange(numEmployees: number): string {
  if (numEmployees <= 10) return "1-10";
  if (numEmployees <= 50) return "11-50";
  if (numEmployees <= 200) return "51-200";
  return "200+";
}

/**
 * Transfers data from Quick Advisory to the In-Depth Wizard stores
 *
 * This function:
 * 1. Reads current Quick Advisory data
 * 2. Maps it to appropriate wizard store fields
 * 3. Clears existing wizard data (override strategy for clean slate)
 * 4. Populates wizard stores with mapped data
 * 5. Returns a result indicating what was transferred
 *
 * Strategy: OVERRIDE - Clears existing wizard data to provide a clean slate
 * based on Quick Advisory data. This prevents confusion from mixed data sources.
 *
 * @returns TransferResult with success status and details
 */
export function transferQuickDataToWizard(): TransferResult {
  const fieldsTransferred: string[] = [];
  const errors: string[] = [];

  try {
    // Get current Quick Advisory data
    const quickData = useQuickAdvisoryStore.getState().formData;

    // Validate that we have some data to transfer
    if (!quickData.jobTitle && !quickData.location && !quickData.numEmployees) {
      errors.push("No Quick Advisory data found to transfer");
      return {
        success: false,
        fieldsTransferred: [],
        errors,
      };
    }

    // Clear existing wizard data for a clean slate
    const { clearPosition } = usePositionStore.getState();
    const { clearProfile } = useCompanyStore.getState();
    const { resetWizard } = useWizardStore.getState();

    clearPosition();
    clearProfile();
    resetWizard();

    // Transfer Company Data
    const { setProfile } = useCompanyStore.getState();

    // Build company profile with available data
    const companyProfile = {
      name: "", // No mapping from quick advisory - user must fill
      industry: "", // No mapping from quick advisory - user must fill
      size: quickData.numEmployees ? convertNumEmployeesToSizeRange(quickData.numEmployees) : "",
      location: quickData.location || "",
      annualRevenue: quickData.annualRevenue || 0,
      employeeCount: quickData.numEmployees ? quickData.numEmployees.toString() : "",
      state: "", // Could be extracted from location, but leaving empty for now
    };

    setProfile(companyProfile);

    // Track which fields were transferred
    if (quickData.location) {
      fieldsTransferred.push("location");
    }
    if (quickData.numEmployees) {
      fieldsTransferred.push("companySize");
      fieldsTransferred.push("employeeCount");
    }
    if (quickData.annualRevenue) {
      fieldsTransferred.push("annualRevenue");
    }

    // Transfer Position Data
    const { setBasicInfo } = usePositionStore.getState();

    // Build basic position info with available data
    const basicInfo = {
      title: quickData.jobTitle || "",
      department: "", // No mapping from quick advisory - user must fill
      reportsTo: "", // No mapping from quick advisory - user must fill
    };

    setBasicInfo(basicInfo);

    if (quickData.jobTitle) {
      fieldsTransferred.push("jobTitle");
    }

    // Note: proposedSalary and marketPositioning from Quick Advisory don't have
    // direct mappings to wizard stores. These could potentially be used to
    // inform compensation ranges in future enhancements, but for now we skip them
    // to maintain data integrity and avoid confusion.

    // Note: annualPayroll from Quick Advisory doesn't have a direct mapping
    // in the wizard stores, so it's not transferred.

    console.log("[DataTransfer] Successfully transferred Quick Advisory data to wizard", {
      fieldsTransferred,
      quickData: {
        jobTitle: quickData.jobTitle,
        location: quickData.location,
        numEmployees: quickData.numEmployees,
        annualRevenue: quickData.annualRevenue,
      },
    });

    return {
      success: true,
      fieldsTransferred,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error during transfer";
    errors.push(errorMessage);

    console.error("[DataTransfer] Error transferring Quick Advisory data:", error);

    return {
      success: false,
      fieldsTransferred,
      errors,
    };
  }
}
