/**
 * Market positioning options for Quick Advisory
 */
export const MarketPositioning = {
  BUDGET_FRIENDLY: "budget_friendly",
  COMPETITIVE: "competitive",
  TOP_TALENT: "top_talent",
} as const;

export type MarketPositioning = (typeof MarketPositioning)[keyof typeof MarketPositioning];

/**
 * Labels for market positioning options
 */
export const MARKET_POSITIONING_LABELS: Record<MarketPositioning, string> = {
  [MarketPositioning.BUDGET_FRIENDLY]: "Fill the role affordably - Budget-friendly (lower 25%)",
  [MarketPositioning.COMPETITIVE]: "Match market averages - Competitive (middle 50%)",
  [MarketPositioning.TOP_TALENT]: "Attract top talent - Strong offer (top 25%)",
};

/**
 * Form data interface for Quick Advisory
 */
export interface QuickAdvisoryFormData {
  jobTitle: string;
  location: string;
  numEmployees: number;
  proposedSalary: number;
  marketPositioning: MarketPositioning | "";
  annualRevenue: number;
  annualPayroll: number;
}
