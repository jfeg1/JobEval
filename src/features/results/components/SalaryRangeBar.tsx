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

  // Calculate percentile position for the user's budget
  // We need to interpolate between known percentiles
  const getUserPercentile = (budget: number): number => {
    // Below P10
    if (budget <= p10) return 10;
    // Between P10 and P25
    if (budget <= p25) {
      const range = p25 - p10;
      const position = budget - p10;
      return 10 + (position / range) * 15; // Interpolate between 10 and 25
    }
    // Between P25 and P50
    if (budget <= p50) {
      const range = p50 - p25;
      const position = budget - p25;
      return 25 + (position / range) * 25; // Interpolate between 25 and 50
    }
    // Between P50 and P75
    if (budget <= p75) {
      const range = p75 - p50;
      const position = budget - p50;
      return 50 + (position / range) * 25; // Interpolate between 50 and 75
    }
    // Between P75 and P90
    if (budget <= p90) {
      const range = p90 - p75;
      const position = budget - p75;
      return 75 + (position / range) * 15; // Interpolate between 75 and 90
    }
    // Above P90
    return 90;
  };

  const userPercentile = getUserPercentile(userBudget);
  const userBudgetPosition = userPercentile; // Position directly matches percentile

  // Determine color and status based on position
  const getMarkerColor = () => {
    if (userBudget >= p50) return "#22c55e"; // Green - at or above median
    if (userBudget >= p25) return "#3b82f6"; // Blue - competitive range
    return "#f97316"; // Orange - below competitive
  };

  const getStatusText = () => {
    if (userBudget >= p50) return "At or Above Median";
    if (userBudget >= p25) return "Competitive Range";
    return "Below Competitive";
  };

  // DEBUG: Log all values
  console.log("🔍 SalaryRangeBar Debug:");
  console.log("  P10:", p10);
  console.log("  P25:", p25);
  console.log("  P50:", p50);
  console.log("  P75:", p75);
  console.log("  P90:", p90);
  console.log("  User Budget:", userBudget);
  console.log("  Calculated Percentile:", userPercentile.toFixed(1) + "th");
  console.log("  Position on bar:", userBudgetPosition.toFixed(1) + "%");

  const markerColor = getMarkerColor();
  const statusText = getStatusText();

  return (
    <div className="w-full" style={{ width: "100%", minWidth: "0", maxWidth: "100%" }}>
      {/* Percentile labels above the bar */}
      {showLabels && (
        <div className="relative w-full mb-3" style={{ minHeight: "45px" }}>
          {/* 10th Percentile */}
          <div
            className="absolute"
            style={{ left: "10%", transform: "translateX(-50%)", width: "70px" }}
          >
            <div className="text-sm font-semibold text-gray-700 text-center">10th</div>
            <div className="text-gray-900 font-bold mt-1 text-center text-sm">
              <CurrencyDisplay value={p10} abbreviate />
            </div>
          </div>

          {/* 25th Percentile */}
          <div
            className="absolute"
            style={{ left: "25%", transform: "translateX(-50%)", width: "70px" }}
          >
            <div className="text-sm font-semibold text-gray-700 text-center">25th</div>
            <div className="text-gray-900 font-bold mt-1 text-center text-sm">
              <CurrencyDisplay value={p25} abbreviate />
            </div>
          </div>

          {/* 50th Percentile (Median) */}
          <div
            className="absolute"
            style={{ left: "50%", transform: "translateX(-50%)", width: "70px" }}
          >
            <div className="text-sm font-bold text-green-700 text-center">Median</div>
            <div className="text-gray-900 font-extrabold mt-1 text-center text-sm">
              <CurrencyDisplay value={p50} abbreviate />
            </div>
          </div>

          {/* 75th Percentile */}
          <div
            className="absolute"
            style={{ left: "75%", transform: "translateX(-50%)", width: "70px" }}
          >
            <div className="text-sm font-semibold text-gray-700 text-center">75th</div>
            <div className="text-gray-900 font-bold mt-1 text-center text-sm">
              <CurrencyDisplay value={p75} abbreviate />
            </div>
          </div>

          {/* 90th Percentile */}
          <div
            className="absolute"
            style={{ left: "90%", transform: "translateX(-50%)", width: "70px" }}
          >
            <div className="text-sm font-semibold text-gray-700 text-center">90th</div>
            <div className="text-gray-900 font-bold mt-1 text-center text-sm">
              <CurrencyDisplay value={p90} abbreviate />
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Bar Chart */}
      <div className="relative mb-20">
        {/* Main gradient bar representing the full salary range */}
        <div className="relative h-8 bg-gradient-to-r from-orange-200 via-blue-200 to-green-200 rounded-lg overflow-visible">
          {/* Percentile markers */}
          <div className="absolute inset-0">
            {/* 10th percentile line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-600 opacity-70"
              style={{ left: "10%" }}
            />
            {/* 25th percentile line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-700 opacity-80"
              style={{ left: "25%" }}
            />
            {/* 50th percentile (median) line - more prominent */}
            <div
              className="absolute top-0 bottom-0 w-1.5 bg-green-700 opacity-90"
              style={{ left: "50%" }}
            />
            {/* 75th percentile line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-700 opacity-80"
              style={{ left: "75%" }}
            />
            {/* 90th percentile line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-600 opacity-70"
              style={{ left: "90%" }}
            />
          </div>

          {/* User budget marker - Diamond shape */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ left: `${userBudgetPosition}%` }}
          >
            {/* Diamond/marker */}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: "32px",
                height: "32px",
              }}
            >
              {/* Diamond background */}
              <div
                className="absolute"
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: markerColor,
                  transform: "rotate(45deg)",
                  border: "3px solid white",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              />
              {/* Pulse animation */}
              <div
                className="absolute animate-ping"
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: markerColor,
                  opacity: 0.3,
                  transform: "rotate(45deg)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Status label below marker */}
        <div
          className="absolute top-10 -translate-x-1/2 z-10"
          style={{ left: `${userBudgetPosition}%` }}
        >
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm"
            style={{
              backgroundColor: markerColor,
              color: "white",
            }}
          >
            Your Budget
          </div>
          <div className="text-center mt-1">
            <div className="text-xs text-gray-600 font-medium">
              <CurrencyDisplay value={userBudget} abbreviate />
            </div>
            <div className="text-xs text-gray-500">{statusText}</div>
          </div>
        </div>
      </div>

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
