/**
 * Currency Utilities
 *
 * Functions for formatting and displaying monetary values across different currencies
 */

import type { CurrencyCode } from "@/types/i18n";
import { CURRENCY_CONFIGS } from "@/types/i18n";

/**
 * Format a number as currency
 *
 * @param amount - The numeric amount to format
 * @param currency - The currency code
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56, "USD") // "$1,234.56"
 * formatCurrency(1234.56, "EUR") // "1.234,56€"
 * formatCurrency(1234.56, "GBP") // "£1,234.56"
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  options?: {
    showCode?: boolean; // Show currency code (e.g., "USD")
    compact?: boolean; // Use compact notation (e.g., "$1.2K")
    decimals?: number; // Override default decimal places
  }
): string {
  const config = CURRENCY_CONFIGS[currency];

  if (options?.compact && Math.abs(amount) >= 1000) {
    return formatCompactCurrency(amount, currency);
  }

  const decimals = options?.decimals ?? config.decimalPlaces;
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;

  // Format the number
  const parts = absAmount.toFixed(decimals).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);

  // Combine with decimal part
  const formattedNumber = decimalPart
    ? `${formattedInteger}${config.decimalSeparator}${decimalPart}`
    : formattedInteger;

  // Add symbol
  const withSymbol =
    config.symbolPosition === "before"
      ? `${config.symbol}${formattedNumber}`
      : `${formattedNumber}${config.symbol}`;

  // Add currency code if requested
  const withCode = options?.showCode ? `${withSymbol} ${currency}` : withSymbol;

  // Add negative sign
  return isNegative ? `-${withCode}` : withCode;
}

/**
 * Format currency in compact notation (K, M, B)
 */
function formatCompactCurrency(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIGS[currency];
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;

  let value: number;
  let suffix: string;

  if (absAmount >= 1_000_000_000) {
    value = absAmount / 1_000_000_000;
    suffix = "B";
  } else if (absAmount >= 1_000_000) {
    value = absAmount / 1_000_000;
    suffix = "M";
  } else {
    value = absAmount / 1_000;
    suffix = "K";
  }

  // Format with one decimal place
  const formatted = value.toFixed(1);

  // Add symbol
  const withSymbol =
    config.symbolPosition === "before"
      ? `${config.symbol}${formatted}${suffix}`
      : `${formatted}${suffix}${config.symbol}`;

  return isNegative ? `-${withSymbol}` : withSymbol;
}

/**
 * Format a currency range
 *
 * @example
 * formatCurrencyRange(50000, 75000, "USD") // "$50,000 - $75,000"
 * formatCurrencyRange(50000, 75000, "USD", { compact: true }) // "$50K - $75K"
 */
export function formatCurrencyRange(
  min: number,
  max: number,
  currency: CurrencyCode,
  options?: {
    compact?: boolean;
    showCode?: boolean;
  }
): string {
  const formattedMin = formatCurrency(min, currency, options);
  const formattedMax = formatCurrency(max, currency, options);

  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Parse a currency string back to a number
 * Handles various currency formats
 *
 * @example
 * parseCurrency("$1,234.56", "USD") // 1234.56
 * parseCurrency("1.234,56€", "EUR") // 1234.56
 */
export function parseCurrency(value: string, currency: CurrencyCode): number | null {
  const config = CURRENCY_CONFIGS[currency];

  // Remove currency symbol and code
  let cleaned = value.replace(config.symbol, "").trim();
  cleaned = cleaned.replace(currency, "").trim();

  // Replace thousands separator with nothing
  cleaned = cleaned.replace(new RegExp(`\\${config.thousandsSeparator}`, "g"), "");

  // Replace decimal separator with period
  if (config.decimalSeparator !== ".") {
    cleaned = cleaned.replace(config.decimalSeparator, ".");
  }

  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_CONFIGS[currency].symbol;
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: CurrencyCode): string {
  return CURRENCY_CONFIGS[currency].name;
}

/**
 * Convert between currencies (requires conversion rates)
 * Note: This is a placeholder for future implementation
 * In production, you'd want to fetch real-time rates from an API
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rate?: number
): number {
  if (from === to) return amount;

  if (!rate) {
    throw new Error(
      `Currency conversion requires a rate. Please provide conversion rate from ${from} to ${to}`
    );
  }

  return amount * rate;
}

/**
 * Format hourly wage
 */
export function formatHourlyWage(hourlyRate: number, currency: CurrencyCode): string {
  return `${formatCurrency(hourlyRate, currency)}/hr`;
}

/**
 * Format annual salary
 */
export function formatAnnualSalary(annualAmount: number, currency: CurrencyCode): string {
  return `${formatCurrency(annualAmount, currency)}/year`;
}

/**
 * Calculate annual salary from hourly rate (standard 40hr/week, 52 weeks)
 */
export function hourlyToAnnual(hourlyRate: number): number {
  return hourlyRate * 40 * 52;
}

/**
 * Calculate hourly rate from annual salary
 */
export function annualToHourly(annualSalary: number): number {
  return annualSalary / (40 * 52);
}
