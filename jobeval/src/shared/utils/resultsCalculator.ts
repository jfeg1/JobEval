import { formatSalary } from "./formatSalary";

export interface RecommendationData {
  budgetStatus: "competitive" | "below-median" | "below-market";
  recommendedMin: number;
  recommendedMax: number;
  strategies: string[];
  warningMessage?: string;
}

export interface BLSPercentiles {
  median: number;
  percentile25: number;
  percentile75: number;
  percentile10: number;
  percentile90: number;
}

/**
 * Calculate recommendation based on user budget and market data
 */
export function calculateRecommendation(
  userBudget: number,
  blsData: BLSPercentiles
): RecommendationData {
  const { median, percentile25, percentile75 } = blsData;

  // Determine budget status
  if (userBudget >= median) {
    // Competitive: Budget at or above market median
    return {
      budgetStatus: "competitive",
      recommendedMin: median,
      recommendedMax: percentile75,
      strategies: [
        "Target candidates with 5+ years of relevant experience",
        "Emphasize your competitive salary in job postings",
        "Focus on cultural fit and long-term growth opportunities",
        "Consider offering performance bonuses after first year",
      ],
    };
  } else if (userBudget >= percentile25) {
    // Below median but above 25th percentile
    return {
      budgetStatus: "below-median",
      recommendedMin: percentile25,
      recommendedMax: median,
      strategies: [
        "Focus on candidates with 3-5 years experience instead of 5+ years",
        "Highlight growth opportunities and career development",
        "Emphasize company culture, mission, and work-life balance",
        "Consider performance bonuses after 6-12 months",
        "Offer additional benefits: remote flexibility, professional development budget",
        "Look for candidates who value learning and advancement",
      ],
    };
  } else {
    // Below 25th percentile - significantly below market
    return {
      budgetStatus: "below-market",
      recommendedMin: percentile25,
      recommendedMax: median,
      strategies: [
        "Increase the budget to at least " + formatSalary(percentile25) + " (25th percentile)",
        "Restructure as a more junior position with reduced scope",
        "Look for candidates transitioning into this role from related fields",
        "Offer equity or profit-sharing to supplement base salary",
        "Plan for a salary review after 6 months once value is proven",
        "Consider part-time or contract arrangements initially",
      ],
      warningMessage:
        "⚠️ This budget may require adjusting either the budget or position expectations.",
    };
  }
}

/**
 * Calculate where user's budget falls on the salary range bar (0-100%)
 */
export function getBudgetPositionPercentage(userBudget: number, min: number, max: number): number {
  if (userBudget <= min) return 0;
  if (userBudget >= max) return 100;

  return ((userBudget - min) / (max - min)) * 100;
}

/**
 * Format the full recommendation text based on the data
 */
export function formatRecommendationText(
  data: RecommendationData,
  userBudget: number,
  blsData: BLSPercentiles,
  _occupation: string
): string {
  const { budgetStatus, recommendedMin, recommendedMax } = data;
  const { median, percentile25 } = blsData;

  if (budgetStatus === "competitive") {
    return `Your budget of ${formatSalary(userBudget)} is competitive for this role in your market. You should be able to attract qualified candidates at this level.

**Recommended salary range:** ${formatSalary(recommendedMin)} - ${formatSalary(recommendedMax)}
(Targeting the 50th-75th percentile)`;
  } else if (budgetStatus === "below-median") {
    return `Your budget of ${formatSalary(userBudget)} is below market median (${formatSalary(median)}) but within the competitive range. You can still attract talent with the right approach.

**Recommended salary range:** ${formatSalary(recommendedMin)} - ${formatSalary(recommendedMax)}
(Targeting the 25th-50th percentile)`;
  } else {
    return `Your budget of ${formatSalary(userBudget)} is significantly below market rates for this role. Market data suggests most candidates expect ${formatSalary(percentile25)} or higher.

${data.warningMessage || ""}

**Recommended minimum:** ${formatSalary(percentile25)} (25th percentile)`;
  }
}
