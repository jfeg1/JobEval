/**
 * Affordability Calculator Utility
 *
 * Calculates payroll-to-revenue ratios and assesses affordability
 * for hiring decisions in the Quick Advisory flow.
 */

export type AffordabilityStatus = "sustainable" | "warning" | "exceed";

export interface PayrollRatioResult {
  currentRatio: number;
  newRatio: number;
  status: AffordabilityStatus;
  message: string;
}

/**
 * Calculate payroll-to-revenue ratio as a percentage
 */
export function calculatePayrollRatio(payroll: number, revenue: number): number {
  if (revenue <= 0) {
    return 0;
  }
  return (payroll / revenue) * 100;
}

/**
 * Assess affordability status based on payroll-to-revenue ratio
 *
 * Benchmark ranges:
 * - Sustainable: < 35%
 * - Warning: 35-45%
 * - Exceed: > 45%
 */
export function assessAffordability(ratio: number): AffordabilityStatus {
  if (ratio < 35) {
    return "sustainable";
  } else if (ratio >= 35 && ratio <= 45) {
    return "warning";
  } else {
    return "exceed";
  }
}

/**
 * Project new payroll after adding employees
 */
export function projectNewPayroll(
  currentPayroll: number,
  addedSalary: number,
  numEmployees: number
): number {
  return currentPayroll + addedSalary * numEmployees;
}

/**
 * Get user-friendly message for affordability status
 */
export function getAffordabilityMessage(status: AffordabilityStatus): string {
  switch (status) {
    case "sustainable":
      return "Within sustainable range";
    case "warning":
      return "Approaching high end of sustainable range";
    case "exceed":
      return "Exceeds recommended payroll ratio";
    default:
      return "Unknown status";
  }
}

/**
 * Calculate complete affordability analysis
 */
export function analyzeAffordability(
  currentPayroll: number,
  revenue: number,
  proposedSalary: number,
  numEmployees: number
): PayrollRatioResult {
  const currentRatio = calculatePayrollRatio(currentPayroll, revenue);
  const newPayroll = projectNewPayroll(currentPayroll, proposedSalary, numEmployees);
  const newRatio = calculatePayrollRatio(newPayroll, revenue);
  const status = assessAffordability(newRatio);
  const message = getAffordabilityMessage(status);

  return {
    currentRatio,
    newRatio,
    status,
    message,
  };
}
