import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { getBudgetPositionPercentage } from "@/shared/utils/resultsCalculator";

interface SalaryRangeBarProps {
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

/**
 * Visual representation of salary range with percentile markers
 * Shows where the user's budget falls relative to market data
 */
export default function SalaryRangeBar({
  percentiles,
  userBudget,
  showLabels = true,
}: SalaryRangeBarProps) {
  const { p10, p25, p50, p75, p90 } = percentiles;

  // Calculate position percentages for each marker
  const range = p90 - p10;
  const getPosition = (value: number) => ((value - p10) / range) * 100;

  const p25Position = getPosition(p25);
  const p50Position = getPosition(p50);
  const p75Position = getPosition(p75);
  const userBudgetPosition = getBudgetPositionPercentage(userBudget, p10, p90);

  // Determine color based on budget position
  const getBudgetColor = () => {
    if (userBudget >= p50) return "bg-green-500";
    if (userBudget >= p25) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="w-full">
      {/* Range bar */}
      <div className="relative h-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 rounded-full mb-8">
        {/* Percentile markers */}
        <div
          className="absolute top-0 w-0.5 h-4 bg-gray-600"
          style={{ left: "0%" }}
          aria-label="10th percentile marker"
        />
        <div
          className="absolute top-0 w-0.5 h-4 bg-gray-700"
          style={{ left: `${p25Position}%` }}
          aria-label="25th percentile marker"
        />
        <div
          className="absolute top-0 w-1 h-4 bg-gray-900"
          style={{ left: `${p50Position}%` }}
          aria-label="Median marker"
        />
        <div
          className="absolute top-0 w-0.5 h-4 bg-gray-700"
          style={{ left: `${p75Position}%` }}
          aria-label="75th percentile marker"
        />
        <div
          className="absolute top-0 w-0.5 h-4 bg-gray-600"
          style={{ left: "100%", transform: "translateX(-100%)" }}
          aria-label="90th percentile marker"
        />

        {/* User budget marker */}
        {userBudget >= p10 && userBudget <= p90 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${userBudgetPosition}%` }}
          >
            <div
              className={`w-6 h-6 ${getBudgetColor()} rounded-full border-4 border-white shadow-lg`}
            />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded">
                Your Budget
              </div>
            </div>
          </div>
        )}

        {/* Budget outside range indicators */}
        {userBudget < p10 && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2">
              <span className="text-orange-600 text-xl">←</span>
              <div className="text-xs font-medium text-orange-600 whitespace-nowrap">
                Your Budget (Below Range)
              </div>
            </div>
          </div>
        )}

        {userBudget > p90 && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-green-600 whitespace-nowrap">
                Your Budget (Above Range)
              </div>
              <span className="text-green-600 text-xl">→</span>
            </div>
          </div>
        )}
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="relative w-full">
          <div className="flex justify-between items-start text-xs text-gray-600">
            <div className="text-center" style={{ width: "20%" }}>
              <div className="font-medium">10th</div>
              <div className="text-gray-900 font-semibold mt-1">
                <CurrencyDisplay value={p10} abbreviate />
              </div>
            </div>
            <div className="text-center" style={{ width: "20%" }}>
              <div className="font-medium">25th</div>
              <div className="text-gray-900 font-semibold mt-1">
                <CurrencyDisplay value={p25} abbreviate />
              </div>
            </div>
            <div className="text-center" style={{ width: "20%" }}>
              <div className="font-medium text-green-700">Median</div>
              <div className="text-gray-900 font-bold mt-1">
                <CurrencyDisplay value={p50} abbreviate />
              </div>
            </div>
            <div className="text-center" style={{ width: "20%" }}>
              <div className="font-medium">75th</div>
              <div className="text-gray-900 font-semibold mt-1">
                <CurrencyDisplay value={p75} abbreviate />
              </div>
            </div>
            <div className="text-center" style={{ width: "20%" }}>
              <div className="font-medium">90th</div>
              <div className="text-gray-900 font-semibold mt-1">
                <CurrencyDisplay value={p90} abbreviate />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen reader text */}
      <div className="sr-only">
        Market salary range visualization showing percentiles from 10th to 90th. Your budget
        position is{" "}
        {userBudget >= p50
          ? "at or above median"
          : userBudget >= p25
            ? "between 25th percentile and median"
            : "below 25th percentile"}
        .
      </div>
    </div>
  );
}
