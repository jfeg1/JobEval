/**
 * Minimum wage data by state (as of 2025)
 * Hourly rates - will be converted to annual for calculations
 * Source: U.S. Department of Labor
 * Last updated: 2025-01-01
 *
 * Note: Some states use federal minimum. Local ordinances may be higher.
 * Tool maintainers should update this file annually.
 */

export const minimumWages: Record<string, number> = {
  // States with higher than federal minimum
  'AK': 11.73,
  'AZ': 14.35,
  'AR': 11.00,
  'CA': 16.00,
  'CO': 14.42,
  'CT': 15.69,
  'DE': 13.25,
  'FL': 12.00,
  'HI': 14.00,
  'IL': 14.00,
  'ME': 14.15,
  'MD': 15.00,
  'MA': 15.00,
  'MI': 10.33,
  'MN': 10.85,
  'MO': 12.30,
  'MT': 10.30,
  'NE': 12.00,
  'NV': 12.00,
  'NJ': 15.13,
  'NM': 12.00,
  'NY': 15.00,
  'OH': 10.45,
  'OR': 14.20,
  'RI': 14.00,
  'SD': 11.20,
  'VT': 13.67,
  'VA': 12.00,
  'WA': 16.28,
  'DC': 17.00,

  // States using federal minimum ($7.25)
  'AL': 7.25,
  'GA': 7.25,
  'ID': 7.25,
  'IN': 7.25,
  'IA': 7.25,
  'KS': 7.25,
  'KY': 7.25,
  'LA': 7.25,
  'MS': 7.25,
  'NH': 7.25,
  'NC': 7.25,
  'ND': 7.25,
  'OK': 7.25,
  'PA': 7.25,
  'SC': 7.25,
  'TN': 7.25,
  'TX': 7.25,
  'UT': 7.25,
  'WV': 7.25,
  'WI': 7.25,
  'WY': 7.25,

  // Federal default
  'FEDERAL': 7.25,
};

/**
 * Get hourly minimum wage for a state
 * @param state Two-letter state code (e.g., 'CA', 'NY')
 * @returns Hourly minimum wage in dollars
 */
export function getMinimumWage(state: string): number {
  const stateCode = state.toUpperCase().trim();
  return minimumWages[stateCode] || minimumWages['FEDERAL'];
}

/**
 * Get annual minimum wage for a state (full-time equivalent)
 * @param state Two-letter state code
 * @returns Annual minimum wage (40 hrs/week × 52 weeks)
 */
export function getAnnualMinimumWage(state: string): number {
  const hourlyRate = getMinimumWage(state);
  return hourlyRate * 2080; // 40 hours/week * 52 weeks
}

/**
 * Check if a salary meets minimum wage requirements
 * @param annualSalary Proposed annual salary
 * @param state Two-letter state code
 * @returns true if salary meets or exceeds minimum wage
 */
export function meetsMinimumWage(annualSalary: number, state: string): boolean {
  return annualSalary >= getAnnualMinimumWage(state);
}

/**
 * Get the last updated date for minimum wage data
 */
export const MINIMUM_WAGE_LAST_UPDATED = '2025-01-01';
