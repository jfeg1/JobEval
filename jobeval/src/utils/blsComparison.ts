/**
 * BLS Comparison Utility
 *
 * Provides occupation matching and salary percentile calculations
 * for the Quick Advisory flow.
 */

import type { BLSOccupation } from "@/features/bls-matching/hooks/useBLSData";
import { searchOccupations } from "@/features/bls-matching/services/searchOccupations";

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
 * Calculate the exact percentile rank for a given salary using linear interpolation
 * between known percentile points
 */
function calculateExactPercentile(
  salary: number,
  percentileData: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  }
): number {
  const points = [
    { percentile: 10, salary: percentileData.p10 },
    { percentile: 25, salary: percentileData.p25 },
    { percentile: 50, salary: percentileData.p50 },
    { percentile: 75, salary: percentileData.p75 },
    { percentile: 90, salary: percentileData.p90 },
  ];

  // Find the two points to interpolate between
  for (let i = 0; i < points.length - 1; i++) {
    if (salary >= points[i].salary && salary <= points[i + 1].salary) {
      // Linear interpolation
      const p1 = points[i];
      const p2 = points[i + 1];
      const ratio = (salary - p1.salary) / (p2.salary - p1.salary);
      const percentile = p1.percentile + ratio * (p2.percentile - p1.percentile);
      return Math.round(percentile);
    }
  }

  // Handle edge cases
  if (salary < points[0].salary) {
    // Below 10th percentile - extrapolate linearly
    return Math.min(10, Math.round((salary / points[0].salary) * 10));
  }
  if (salary > points[points.length - 1].salary) {
    // Above 90th percentile - cap at reasonable maximum
    return Math.max(
      90,
      90 +
        Math.round(
          ((salary - points[points.length - 1].salary) / points[points.length - 1].salary) * 10
        )
    );
  }

  return 50; // Fallback (should rarely happen)
}

/**
 * Get the ordinal suffix for a number (e.g., "st", "nd", "rd", "th")
 */
function getOrdinalSuffix(n: number): string {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return "th";
  }

  switch (lastDigit) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Calculate which percentile a given salary falls into
 * based on BLS occupation wage data
 */
export function calculatePercentile(salary: number, occupation: BLSOccupation): PercentileResult {
  const { wages } = occupation;

  // Calculate exact percentile using interpolation
  const percentile = calculateExactPercentile(salary, {
    p10: wages.percentile10,
    p25: wages.percentile25,
    p50: wages.annualMedian,
    p75: wages.percentile75,
    p90: wages.percentile90,
  });

  // Create percentile label with ordinal suffix
  const percentileLabel = `${percentile}${getOrdinalSuffix(percentile)} percentile`;

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
    message = `Your salary (${result.percentileLabel}) aligns with your goal to ${getPositioningLabel(positioning)}`;
  } else if (result.percentile < targetRange.min) {
    status = "below";
    message = `Your salary (${result.percentileLabel}) is BELOW your stated goal to ${getPositioningLabel(positioning)}`;
  } else {
    status = "above";
    message = `Your salary (${result.percentileLabel}) is ABOVE typical rates for your strategy`;
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
