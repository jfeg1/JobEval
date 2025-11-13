import { useCompanyStore } from "@/features/company-setup/companyStore";
import { formatCurrency } from "@/shared/lib/currency";
import type { CurrencyCode } from "@/types/i18n";

export interface CurrencyDisplayProps {
  /**
   * The monetary value to display
   */
  value: number;

  /**
   * Optional currency override. If not provided, uses company's currency.
   */
  currency?: CurrencyCode;

  /**
   * Optional CSS class names
   */
  className?: string;

  /**
   * Whether to show full precision (default: false, shows 0 decimals)
   */
  showDecimals?: boolean;

  /**
   * Whether to abbreviate large numbers (e.g., $125K instead of $125,000)
   * Default: false
   */
  abbreviate?: boolean;

  /**
   * Accessibility label override
   */
  ariaLabel?: string;
}

/**
 * Currency Display Component
 *
 * Displays monetary values with proper currency formatting based on
 * the company's selected country/currency or an explicit currency override.
 *
 * Examples:
 * - <CurrencyDisplay value={75000} />
 *   → "$75,000" (if company currency is USD)
 *
 * - <CurrencyDisplay value={75000} currency="EUR" />
 *   → "75.000 €" (explicit EUR)
 *
 * - <CurrencyDisplay value={75000} abbreviate />
 *   → "$75K"
 *
 * - <CurrencyDisplay value={75000.50} showDecimals />
 *   → "$75,000.50"
 */
export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  value,
  currency: explicitCurrency,
  className = "",
  showDecimals = false,
  abbreviate = false,
  ariaLabel,
}) => {
  const getCurrency = useCompanyStore((state) => state.getCurrency);
  const currency = explicitCurrency || getCurrency();

  // Format the value
  let formattedValue: string;

  if (abbreviate && value >= 1000) {
    // Abbreviate large numbers
    if (value >= 1_000_000) {
      formattedValue =
        formatCurrency(value / 1_000_000, currency, {
          decimals: 1,
        }).replace(/\.0$/, "") + "M";
    } else {
      formattedValue =
        formatCurrency(value / 1000, currency, {
          decimals: 0,
        }) + "K";
    }
  } else {
    // Standard formatting
    formattedValue = formatCurrency(value, currency, {
      decimals: showDecimals ? 2 : 0,
    });
  }

  // Generate accessibility label
  const accessibilityLabel = ariaLabel || `${value.toLocaleString("en-US")} ${currency}`;

  return (
    <span className={className} aria-label={accessibilityLabel}>
      {formattedValue}
    </span>
  );
};

export default CurrencyDisplay;
