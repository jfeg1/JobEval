/**
 * BLS Comparison Utility
 *
 * Provides occupation matching and salary percentile calculations
 * for the Quick Advisory flow.
 */

import type { BLSOccupation } from "@/hooks/useBLSData";
import { searchOccupations } from "./searchOccupations";

export interface PercentileResult {
  percentile: number;
  percentileLabel: string;
  isAboveMedian: boolean;
}

export interface MarketPositionRange {
  min: number;
  max: number;
  label: string;
}

export type MarketPositioningType = "budget_friendly" | "competitive" | "top_talent";

/**
 * Match a job title to the best BLS occupation
 * Uses existing searchOccupations utility
 */
export function matchOccupation(
  jobTitle: string,
  allOccupations: BLSOccupation[]
): BLSOccupation | null {
  const matches = searchOccupations(allOccupations, jobTitle);

  if (matches.length === 0) {
    return null;
  }

  // Return the first (best) match
  return matches[0];
}

/**
 * Calculate which percentile a given salary falls into
 * based on BLS occupation wage data
 */
export function calculatePercentile(salary: number, occupation: BLSOccupation): PercentileResult {
  const { wages } = occupation;

  // Determine percentile range
  let percentile: number;
  let percentileLabel: string;

  if (salary < wages.percentile10) {
    percentile = 5; // Below 10th percentile
    percentileLabel = "Below 10th percentile";
  } else if (salary < wages.percentile25) {
    percentile = 17.5; // Between 10th and 25th
    percentileLabel = "10th-25th percentile";
  } else if (salary < wages.annualMedian) {
    percentile = 37.5; // Between 25th and 50th
    percentileLabel = "25th-50th percentile";
  } else if (salary < wages.percentile75) {
    percentile = 62.5; // Between 50th and 75th
    percentileLabel = "50th-75th percentile";
  } else if (salary < wages.percentile90) {
    percentile = 82.5; // Between 75th and 90th
    percentileLabel = "75th-90th percentile";
  } else {
    percentile = 95; // Above 90th percentile
    percentileLabel = "Above 90th percentile";
  }

  return {
    percentile,
    percentileLabel,
    isAboveMedian: salary >= wages.annualMedian,
  };
}

/**
 * Get the salary value at a specific percentile
 */
export function getSalaryAtPercentile(percentile: number, occupation: BLSOccupation): number {
  const { wages } = occupation;

  if (percentile <= 10) return wages.percentile10;
  if (percentile <= 25) return wages.percentile25;
  if (percentile <= 50) return wages.annualMedian;
  if (percentile <= 75) return wages.percentile75;
  if (percentile <= 90) return wages.percentile90;

  return wages.percentile90; // Max we have data for
}

/**
 * Get the target percentile range for a market positioning strategy
 */
export function getTargetPercentileRange(positioning: MarketPositioningType): MarketPositionRange {
  switch (positioning) {
    case "budget_friendly":
      return {
        min: 25,
        max: 40,
        label: "25th-40th percentile (Budget-friendly)",
      };
    case "competitive":
      return {
        min: 40,
        max: 60,
        label: "40th-60th percentile (Competitive)",
      };
    case "top_talent":
      return {
        min: 60,
        max: 80,
        label: "60th-80th percentile (Top talent)",
      };
    default:
      return {
        min: 40,
        max: 60,
        label: "40th-60th percentile (Competitive)",
      };
  }
}

/**
 * Check if a salary aligns with the target market positioning
 */
export function checkAlignment(
  salary: number,
  positioning: MarketPositioningType,
  occupation: BLSOccupation
): {
  aligned: boolean;
  message: string;
  status: "aligned" | "below" | "above";
} {
  const targetRange = getTargetPercentileRange(positioning);
  const result = calculatePercentile(salary, occupation);

  const isAligned = result.percentile >= targetRange.min && result.percentile <= targetRange.max;

  let status: "aligned" | "below" | "above";
  let message: string;

  if (isAligned) {
    status = "aligned";
    message = `Your proposed salary aligns with your goal to ${getPositioningLabel(positioning)}`;
  } else if (result.percentile < targetRange.min) {
    status = "below";
    message = `Your proposed salary is BELOW your stated goal to ${getPositioningLabel(positioning)}`;
  } else {
    status = "above";
    message = `Your proposed salary is ABOVE typical rates for your strategy`;
  }

  return { aligned: isAligned, message, status };
}

/**
 * Get user-friendly label for market positioning
 */
function getPositioningLabel(positioning: MarketPositioningType): string {
  switch (positioning) {
    case "budget_friendly":
      return "fill the role affordably";
    case "competitive":
      return "match market averages";
    case "top_talent":
      return "attract top talent";
    default:
      return "match market averages";
  }
}

/**
 * Get recommended salary range for a market positioning strategy
 */
export function getRecommendedSalaryRange(
  positioning: MarketPositioningType,
  occupation: BLSOccupation
): { min: number; max: number } {
  const { wages } = occupation;

  switch (positioning) {
    case "budget_friendly":
      // 25th-40th percentile approximation
      return {
        min: wages.percentile25,
        max: Math.round((wages.percentile25 + wages.annualMedian) / 2),
      };
    case "competitive":
      // 40th-60th percentile approximation
      return {
        min: Math.round((wages.percentile25 + wages.annualMedian) / 2),
        max: Math.round((wages.annualMedian + wages.percentile75) / 2),
      };
    case "top_talent":
      // 60th-80th percentile approximation
      return {
        min: Math.round((wages.annualMedian + wages.percentile75) / 2),
        max: Math.round((wages.percentile75 + wages.percentile90) / 2),
      };
    default:
      return {
        min: wages.annualMedian,
        max: wages.percentile75,
      };
  }
}
