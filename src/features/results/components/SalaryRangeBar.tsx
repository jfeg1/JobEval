import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";

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

  const userBudgetPosition = getPosition(userBudget); // Keep for debugging

  // DEBUG: Log all values
  console.log("🔍 SalaryRangeBar Debug:");
  console.log("  P10:", p10);
  console.log("  P25:", p25);
  console.log("  P50:", p50);
  console.log("  P75:", p75);
  console.log("  P90:", p90);
  console.log("  User Budget:", userBudget, "→ Position:", userBudgetPosition.toFixed(2) + "%");
  console.log("  Range (P90-P10):", range);
  console.log("  NOTE: Budget marker currently disabled for rebuild");

  return (
    <div className="w-full" style={{ width: "100%", minWidth: "0", maxWidth: "100%" }}>
      {/* Range bar */}
      <div
        className="relative h-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 rounded-full mb-8"
        style={{ width: "100%", minWidth: "0", maxWidth: "100%", display: "block" }}
      >
        {/* User budget marker - Dynamic positioning based on calculation */}
        {userBudget >= p10 && userBudget <= p90 && (
          <div
            style={{
              position: "absolute",
              left: `calc(${userBudgetPosition}% - 12px)`, // Subtract half marker width to center
              top: "0",
              width: "24px",
              height: "24px",
              marginTop: "-4px", // Position slightly above bar
              pointerEvents: "none",
            }}
          >
            {/* Marker circle */}
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor:
                  userBudget >= p50 ? "#22c55e" : userBudget >= p25 ? "#eab308" : "#f97316",
                border: "4px solid white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
            {/* Label */}
            <div
              style={{
                position: "absolute",
                top: "30px",
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                backgroundColor: "#1f2937",
                color: "white",
                fontSize: "12px",
                fontWeight: "500",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              Your Budget
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
