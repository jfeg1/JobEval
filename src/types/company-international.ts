/**
 * Extended Company Profile Types
 *
 * Adds international support to company profiles including country, region,
 * and currency selection
 */

import type { CurrencyCode, GeographicLocation } from "./i18n";

/**
 * Legacy company profile interface (for backwards compatibility)
 * @deprecated Use InternationalCompanyProfile instead
 */
export interface CompanyProfile {
  name: string;
  industry: string;
  size: string;
  location: string;
  annualRevenue: number;
  currentPayroll: number;
  employeeCount: string;
  state: string;
}

/**
 * International company profile with geographic and currency support
 */
export interface InternationalCompanyProfile {
  // Basic information
  name: string;
  industry: string;
  size: string;

  // Geographic location
  geography: GeographicLocation;

  // Legacy location fields (for backwards compatibility)
  location: string; // City name or description
  state: string; // For US compatibility

  // Financial information
  annualRevenue: number;
  currency: CurrencyCode;

  // Employee information
  employeeCount: string;

  // Additional metadata
  timezone?: string; // For future scheduling features
  fiscalYearEnd?: string; // For future reporting features
}

/**
 * Company size categories standardized across countries
 */
export type CompanySizeCategory =
  | "micro" // 1-9 employees
  | "small" // 10-49 employees
  | "medium" // 50-249 employees
  | "large"; // 250+ employees

/**
 * Get standardized size category from employee count
 */
export function getCompanySizeCategory(employeeCount: string): CompanySizeCategory {
  const count = parseInt(employeeCount);

  if (isNaN(count)) {
    // Try to parse ranges like "10-50"
    const match = employeeCount.match(/(\d+)/);
    if (!match) return "small"; // Default
    const firstNumber = parseInt(match[1]);
    return getCompanySizeCategory(firstNumber.toString());
  }

  if (count < 10) return "micro";
  if (count < 50) return "small";
  if (count < 250) return "medium";
  return "large";
}

/**
 * Convert legacy company profile to international format
 */
export function convertLegacyCompanyProfile(legacy: CompanyProfile): InternationalCompanyProfile {
  return {
    name: legacy.name,
    industry: legacy.industry,
    size: legacy.size,
    geography: {
      country: "US", // Legacy profiles are US-only
      region: legacy.state,
    },
    location: legacy.location,
    state: legacy.state,
    annualRevenue: legacy.annualRevenue,
    currency: "USD", // Legacy profiles use USD
    employeeCount: legacy.employeeCount,
  };
}

/**
 * Convert international profile back to legacy format (for backwards compatibility)
 */
export function convertToLegacyCompanyProfile(
  international: InternationalCompanyProfile,
  currentPayroll: number = 0
): CompanyProfile {
  return {
    name: international.name,
    industry: international.industry,
    size: international.size,
    location: international.location,
    annualRevenue: international.annualRevenue,
    currentPayroll: currentPayroll, // Accept as parameter with default
    employeeCount: international.employeeCount,
    state: international.state || international.geography.region || "",
  };
}
