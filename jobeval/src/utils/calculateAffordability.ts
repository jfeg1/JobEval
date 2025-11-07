import type { CompanyProfile } from "../stores/companyStore";
import type { SelectedOccupation } from "../stores/matchingStore";
import { getAnnualMinimumWage, getMinimumWage } from "../data/minimumWages";

interface AffordabilityInputs {
  company: CompanyProfile;
  marketData: SelectedOccupation;
  budgetPercentage: number;
  additionalBudget: number;
}

interface AffordableRange {
  minimum: number;
  target: number;
  maximum: number;
}

interface MarketRange {
  percentile10: number;
  percentile25: number;
  median: number;
  percentile75: number;
  percentile90: number;
}

interface AffordabilityResult {
  affordableRange: AffordableRange;
  marketRange: MarketRange;
  marketAlignment: "below" | "within" | "above";
  gap: number;
  isBelowMinimum: boolean;
  minimumWageAmount: number;
  minimumWageAdjusted: boolean;
  recommendations: string[];
}

/**
 * Calculate affordability based on company budget, market data, and minimum wage
 *
 * Algorithm:
 * 1. Calculate base budget from revenue percentage + additional budget
 * 2. Create affordable range (80-120% of budget)
 * 3. Apply minimum wage floor (cannot pay below legal minimum)
 * 4. Compare to market data from BLS
 * 5. Determine market alignment
 * 6. Generate recommendations based on analysis
 */
export function calculateAffordability(
  inputs: AffordabilityInputs
): AffordabilityResult {
  const { company, marketData, budgetPercentage, additionalBudget } = inputs;

  // Step 1: Calculate available budget
  const revenueBasedBudget = (company.annualRevenue * budgetPercentage) / 100;
  const totalBudget = revenueBasedBudget + additionalBudget;

  // Step 2: Get minimum wage for the company's state
  const annualMinimumWage = getAnnualMinimumWage(company.state);
  const hourlyMinimumWage = getMinimumWage(company.state);

  // Step 3: Create affordable range (80-120% of budget)
  const rawRange = {
    minimum: totalBudget * 0.8,
    target: totalBudget,
    maximum: totalBudget * 1.2,
  };

  // Step 4: Apply minimum wage floor (both annual and hourly validation)
  const isBelowMinimum = rawRange.minimum < annualMinimumWage;
  const minimumWageAdjusted = isBelowMinimum;

  // Validate hourly rate meets minimum wage (2080 = 40 hrs/week * 52 weeks)
  const targetHourlyRate = rawRange.target / 2080;
  const meetsHourlyMinimum = targetHourlyRate >= hourlyMinimumWage;

  // Log warning if hourly calculation doesn't align (shouldn't happen if annual is correct)
  if (!meetsHourlyMinimum && !isBelowMinimum) {
    console.warn(
      `Hourly rate ($${targetHourlyRate.toFixed(2)}/hr) below minimum wage ($${hourlyMinimumWage}/hr) ` +
        `but annual salary meets requirements. This may indicate a calculation inconsistency.`
    );
  }

  const affordableRange: AffordableRange = {
    minimum: Math.max(rawRange.minimum, annualMinimumWage),
    target: Math.max(rawRange.target, annualMinimumWage),
    maximum: Math.max(rawRange.maximum, annualMinimumWage),
  };

  // Step 5: Extract market data from BLS (using wages object)
  const marketRange: MarketRange = {
    percentile10: marketData.wages.percentile10 || 0,
    percentile25: marketData.wages.percentile25 || 0,
    median: marketData.wages.annualMedian || 0,
    percentile75: marketData.wages.percentile75 || 0,
    percentile90: marketData.wages.percentile90 || 0,
  };

  // Step 6: Determine market alignment
  let marketAlignment: "below" | "within" | "above";

  if (affordableRange.maximum < marketRange.percentile25) {
    // Your max is below the market's 25th percentile
    marketAlignment = "below";
  } else if (affordableRange.minimum > marketRange.percentile75) {
    // Your min is above the market's 75th percentile
    marketAlignment = "above";
  } else {
    // You overlap with the market's middle 50%
    marketAlignment = "within";
  }

  // Step 7: Calculate gap (positive = above market, negative = below market)
  const gap = affordableRange.target - marketRange.median;

  // Step 8: Generate recommendations
  const recommendations = generateRecommendations({
    marketAlignment,
    gap,
    affordableRange,
    marketRange,
    companySize: company.employeeCount,
    isBelowMinimum,
    minimumWageAdjusted,
    state: company.state,
  });

  return {
    affordableRange,
    marketRange,
    marketAlignment,
    gap,
    isBelowMinimum,
    minimumWageAmount: annualMinimumWage,
    minimumWageAdjusted,
    recommendations,
  };
}

/**
 * Generate contextual recommendations based on calculation results
 */
function generateRecommendations(params: {
  marketAlignment: "below" | "within" | "above";
  gap: number;
  affordableRange: AffordableRange;
  marketRange: MarketRange;
  companySize: string;
  isBelowMinimum: boolean;
  minimumWageAdjusted: boolean;
  state: string;
}): string[] {
  const recommendations: string[] = [];

  // Critical: Minimum wage warning
  if (params.isBelowMinimum) {
    recommendations.push(
      `⚠️ Legal Requirement: Your initial budget was below minimum wage in ${params.state}.`,
      `The range has been adjusted to meet the legal minimum. Consider:`,
      "• Increasing your budget allocation",
      "• Reducing the position scope to match available budget",
      "• Exploring part-time or contract arrangements"
    );
    return recommendations; // Return early if below minimum
  }

  // Market-based recommendations
  if (params.marketAlignment === "below") {
    const percentBelow = Math.abs(
      (params.gap / params.marketRange.median) * 100
    ).toFixed(0);

    recommendations.push(
      `Your budget is ${percentBelow}% below market median. This may limit candidate quality.`,
      "",
      "Consider these strategies:",
      "• Adjust position scope to match budget (junior level, narrower responsibilities)",
      "• Offer equity, profit-sharing, or performance bonuses",
      "• Emphasize non-monetary benefits (flexibility, growth, culture)",
      "• Consider remote work to access lower cost-of-living markets",
      "• Plan for phased salary increases as company grows"
    );
  } else if (params.marketAlignment === "above") {
    const percentAbove = (
      (params.gap / params.marketRange.median) *
      100
    ).toFixed(0);

    recommendations.push(
      `Your budget is ${percentAbove}% above market median. You can compete for top talent.`,
      "",
      "Opportunities:",
      "• Attract highly experienced candidates",
      "• Expand job responsibilities to match compensation",
      "• Invest in professional development and training",
      "• Set yourself apart from competitors",
      "• Consider splitting into multiple roles if budget allows"
    );
  } else {
    recommendations.push(
      "✅ Your budget aligns well with market rates.",
      "",
      "Best practices:",
      "• Emphasize your company culture and mission",
      "• Highlight growth opportunities and career path",
      "• Consider performance-based bonuses (10-15% of base)",
      "• Offer competitive benefits package",
      "• Provide clear expectations and role clarity"
    );
  }

  return recommendations;
}
