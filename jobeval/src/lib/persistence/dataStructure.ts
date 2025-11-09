/**
 * Data structure definitions for JobEval export/import functionality
 *
 * This module defines TypeScript interfaces for the export data format,
 * enabling data persistence and portability across sessions.
 */

import type { CompanyProfile } from "@/features/company-setup/companyStore";
import type { SelectedOccupation } from "@/features/bls-matching/matchingStore";
import type { QuickAdvisoryFormData } from "@/features/quick-advisory/types";
import type { WizardStep } from "@/features/position-wizard/wizardStore";
import type {
  BasicInfo,
  PositionDetails,
  Responsibilities,
  Requirements,
  Compensation,
} from "@/features/position-wizard/positionStore";

/**
 * Main export data structure
 * Version 1.0 format
 */
export interface JobEvalExportData {
  /** Schema version for data format */
  version: string; // "1.0"

  /** ISO 8601 timestamp of when data was exported */
  exportDate: string;

  /** Metadata about the export */
  metadata: {
    /** Application version from package.json */
    appVersion: string;

    /** Company name if available */
    companyName?: string;

    /** Type of evaluation performed */
    evaluationType: "quick" | "full" | "mixed" | "none";

    /** ISO 8601 timestamp of last data modification */
    lastModified: string;
  };

  /** All application data */
  data: {
    /** Company profile information */
    company: CompanyProfile | null;

    /** Position information (wizard flow) */
    position: {
      basicInfo: BasicInfo | null;
      details: PositionDetails | null;
      responsibilities: Responsibilities | null;
      requirements: Requirements | null;
      compensation: Compensation | null;
    } | null;

    /** Quick advisory form data */
    quickAdvisory: QuickAdvisoryFormData | null;

    /** Wizard state */
    wizard: WizardState | null;

    /** BLS occupation matching data */
    matching: SelectedOccupation | null;
  };

  /** Results from completed evaluations */
  results?: {
    /** Quick advisory results */
    quick?: QuickAdvisoryResults;
  };
}

/**
 * Wizard state for export
 */
export interface WizardState {
  currentStep: number;
  steps: WizardStep[];
}

/**
 * Quick advisory calculation results
 */
export interface QuickAdvisoryResults {
  proposedSalary: number;
  percentile: number;
  targetRangeLabel: string;
  gapDescription: string;
  recommendedIncrease: number;
  recommendedSalary: number;
  currentPayrollRatio: number;
  newPayrollRatio: number;
  generatedDate: string; // ISO 8601
}

/**
 * Error types for save/load operations
 */
export interface SaveError {
  /** Timestamp when error occurred */
  timestamp: Date;

  /** Category of error */
  errorType:
    | "export_failed"
    | "import_failed"
    | "validation_failed"
    | "storage_full";

  /** Human-readable error message */
  message: string;

  /** Stack trace if available */
  stack?: string;

  /** User action that triggered the error */
  userAction?: string;
}
