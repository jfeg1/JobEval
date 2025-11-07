/**
 * Format a salary amount as currency
 * @param amount - The salary amount to format
 * @param abbreviated - Whether to use abbreviated format (e.g., $95k instead of $95,000)
 * @returns Formatted currency string
 */
export function formatSalary(amount: number, abbreviated = false): string {
  if (abbreviated && amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format salary range
 * @param min - Minimum salary
 * @param max - Maximum salary
 * @param abbreviated - Whether to use abbreviated format
 * @returns Formatted range string (e.g., "$75k - $115k")
 */
export function formatSalaryRange(min: number, max: number, abbreviated = false): string {
  return `${formatSalary(min, abbreviated)} - ${formatSalary(max, abbreviated)}`;
}
