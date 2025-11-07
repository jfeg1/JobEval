export interface BLSData {
  median: number;
  percentile25: number;
  percentile75: number;
  percentile10: number;
  percentile90: number;
}

export interface RecommendationData {
  budgetStatus: "competitive" | "below-median" | "below-market";
  recommendedMin: number;
  recommendedMax: number;
  strategies: string[];
  warningMessage?: string;
}

/**
 * Calculate salary recommendation based on user's budget and market data
 */
export function calculateRecommendation(userBudget: number, blsData: BLSData): RecommendationData {
  const { median, percentile25, percentile75 } = blsData;

  // Determine budget status
  let budgetStatus: RecommendationData["budgetStatus"];
  let recommendedMin: number;
  let recommendedMax: number;
  let strategies: string[] = [];
  let warningMessage: string | undefined;

  if (userBudget >= median) {
    // Budget is competitive (at or above median)
    budgetStatus = "competitive";
    recommendedMin = median;
    recommendedMax = percentile75;
    strategies = [
      "Target candidates with strong experience in the field",
      "Emphasize career growth opportunities and company culture",
      "Consider offering performance-based bonuses",
    ];
  } else if (userBudget >= percentile25) {
    // Budget is below median but within competitive range
    budgetStatus = "below-median";
    recommendedMin = percentile25;
    recommendedMax = median;
    strategies = [
      "Focus on candidates with 3-5 years experience instead of 5+ years",
      "Highlight growth opportunities and career development",
      "Emphasize company culture, mission, and work-life balance",
      "Consider performance bonuses after 6-12 months",
      "Offer additional benefits: remote flexibility, professional development budget",
    ];
  } else {
    // Budget is below 25th percentile - significantly below market
    budgetStatus = "below-market";
    recommendedMin = percentile25;
    recommendedMax = median;
    warningMessage =
      "This budget may require adjusting either the budget or position expectations.";
    strategies = [
      `Increase the budget to at least ${formatCurrency(percentile25)} (25th percentile)`,
      "Restructure as a more junior position with reduced scope",
      "Look for candidates transitioning into this role from related fields",
      "Offer equity or profit-sharing to supplement base salary",
      "Plan for a salary review after 6 months once value is proven",
    ];
  }

  return {
    budgetStatus,
    recommendedMin,
    recommendedMax,
    formattedMin,
    formattedMax,
    strategies,
    warningMessage,
  };
}

/**
 * Calculate where the user's budget falls on the salary range (0-100%)
 * Used for positioning the marker on the visual range display
 */
export function getBudgetPositionPercentage(userBudget: number, min: number, max: number): number {
  if (userBudget <= min) return 0;
  if (userBudget >= max) return 100;

  return ((userBudget - min) / (max - min)) * 100;
}

/**
 * Generate the full recommendation text based on status
 */
export function formatRecommendationText(
  data: RecommendationData,
  userBudget: number,
  median: number,
  occupation: string,
  location: string
): string {
  const formattedBudget = formatCurrency(userBudget);
  const formattedMedian = formatCurrency(median);
  const formattedMin = formatCurrency(data.recommendedMin);
  const formattedMax = formatCurrency(data.recommendedMax);

  if (data.budgetStatus === "competitive") {
    return `Your budget of ${formattedBudget} is competitive for this role in ${location}. You should be able to attract qualified candidates at this level.`;
  } else if (data.budgetStatus === "below-median") {
    return `Your budget of ${formattedBudget} is below market median (${formattedMedian}) but within the competitive range. You can still attract talent with the right approach.`;
  } else {
    return `Your budget of ${formattedBudget} is significantly below market rates for ${occupation}. Market data suggests most candidates expect ${formattedMin} or higher.`;
  }
}

/**
 * Helper function to format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
