/**
 * Data structure definitions for JobEval export/import functionality
 *
 * This module defines TypeScript interfaces for the export data format,
 * enabling data persistence and portability across sessions.
 */

import type { CompanyProfile } from "@/features/company-setup/companyStore";
import type { SelectedOccupation } from "@/features/bls-matching/matchingStore";
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

    /**
     * Quick Advisory form data. The Quick Advisory flow has been removed:
     * new exports always write null, and imports ignore any value here.
     */
    quickAdvisory: unknown;

    /** Wizard state */
    wizard: WizardState | null;

    /** BLS occupation matching data */
    matching: SelectedOccupation | null;
  };

  /** Results from completed evaluations (legacy Quick Advisory results are ignored) */
  results?: {
    quick?: unknown;
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
 * Error types for save/load operations
 */
export interface SaveError {
  /** Timestamp when error occurred */
  timestamp: Date;

  /** Category of error */
  errorType: "export_failed" | "import_failed" | "validation_failed" | "storage_full";

  /** Human-readable error message */
  message: string;

  /** Stack trace if available */
  stack?: string;

  /** User action that triggered the error */
  userAction?: string;
}
