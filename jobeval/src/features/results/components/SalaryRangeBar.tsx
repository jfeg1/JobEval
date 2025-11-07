import { getBudgetPositionPercentage } from "@/shared/utils/resultsCalculator";
import { formatSalary } from "@/shared/utils/formatSalary";

export interface SalaryRangeBarProps {
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  userBudget: number;
  showLabels?: boolean;
}

export default function SalaryRangeBar({
  percentiles,
  userBudget,
  showLabels = true,
}: SalaryRangeBarProps) {
  const { p10, p25, p50, p75, p90 } = percentiles;

  // Calculate position of user's budget on the bar (0-100%)
  const budgetPosition = getBudgetPositionPercentage(userBudget, p10, p90);

  // Determine color based on budget position relative to median
  const getBudgetColor = () => {
    if (userBudget >= p50) return "bg-green-600";
    if (userBudget >= p25) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full" aria-label="Salary range visualization">
      {/* Bar container */}
      <div className="relative h-16 mb-4">
        {/* Background bar with gradient */}
        <div className="absolute top-6 left-0 right-0 h-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 rounded-full"></div>

        {/* Percentile markers */}
        {[
          { value: p10, label: "10th", position: 0 },
          { value: p25, label: "25th", position: 25 },
          { value: p50, label: "Median", position: 50 },
          { value: p75, label: "75th", position: 75 },
          { value: p90, label: "90th", position: 100 },
        ].map(({ value, label, position }) => (
          <div
            key={label}
            className="absolute"
            style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          >
            {/* Marker line */}
            <div className="absolute top-6 w-0.5 h-4 bg-gray-700"></div>

            {/* Label above */}
            {showLabels && (
              <div className="absolute bottom-full mb-2 whitespace-nowrap text-xs text-gray-600 text-center">
                <div className="font-medium">{label}</div>
                <div>{formatSalary(value, true)}</div>
              </div>
            )}
          </div>
        ))}

        {/* User budget marker */}
        {budgetPosition >= 0 && budgetPosition <= 100 && (
          <div
            className="absolute z-10"
            style={{ left: `${budgetPosition}%`, transform: "translateX(-50%)" }}
            aria-label={`Your budget: ${formatSalary(userBudget)}`}
          >
            {/* Budget marker dot */}
            <div
              className={`absolute top-4 w-6 h-6 rounded-full ${getBudgetColor()} border-4 border-white shadow-lg`}
            ></div>

            {/* Budget label */}
            <div className="absolute top-full mt-2 whitespace-nowrap text-xs font-semibold text-center">
              <div className={`${getBudgetColor().replace("bg-", "text-")}`}>Your Budget</div>
              <div className="text-gray-900">{formatSalary(userBudget, true)}</div>
            </div>
          </div>
        )}

        {/* Out of range indicators */}
        {budgetPosition < 0 && (
          <div className="absolute left-0 top-4 -translate-x-2">
            <div className="text-2xl text-red-600">←</div>
            <div className="text-xs font-semibold text-red-600 whitespace-nowrap">Below Range</div>
          </div>
        )}

        {budgetPosition > 100 && (
          <div className="absolute right-0 top-4 translate-x-2">
            <div className="text-2xl text-green-600">→</div>
            <div className="text-xs font-semibold text-green-600 whitespace-nowrap">
              Above Range
            </div>
          </div>
        )}
      </div>

      {/* Accessibility: Text description */}
      <div className="sr-only">
        Salary range from {formatSalary(p10)} (10th percentile) to {formatSalary(p90)} (90th
        percentile). Market median is {formatSalary(p50)}. Your budget of {formatSalary(userBudget)}{" "}
        is{" "}
        {userBudget >= p50
          ? "at or above median"
          : userBudget >= p25
            ? "below median but within competitive range"
            : "below the competitive range"}
        .
      </div>
    </div>
  );
}
