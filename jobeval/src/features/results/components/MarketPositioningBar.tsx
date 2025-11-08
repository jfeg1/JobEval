import { useMemo } from "react";
import { formatSalary } from "@/shared/utils/formatSalary";

/**
 * MarketPositioningBar - Visualizes salary positioning against market data
 *
 * @example
 * <MarketPositioningBar
 *   currentSalary={85000}
 *   currentPercentile={18}
 *   targetPercentile={40}
 *   targetSalary={123678}
 *   optimalSalary={147000}
 *   blsMin={65000}
 *   blsMax={180000}
 *   bls25th={95000}
 *   bls75th={165000}
 * />
 */

interface MarketPositioningBarProps {
  currentSalary: number;
  currentPercentile: number; // Calculated position in market
  targetPercentile: number; // User's desired percentile (e.g., 40)
  targetSalary: number; // Interpolated salary at target percentile
  optimalSalary: number; // BLS annualMedian (50th percentile)
  blsMin: number; // wages.percentile10
  blsMax: number; // wages.percentile90
  bls25th?: number; // wages.percentile25
  bls75th?: number; // wages.percentile75
}

export default function MarketPositioningBar({
  currentSalary,
  currentPercentile,
  targetPercentile,
  targetSalary,
  optimalSalary,
  blsMin,
  blsMax,
  bls25th,
  bls75th,
}: MarketPositioningBarProps) {
  const calculations = useMemo(() => {
    // Dynamic scale calculation
    const minScale = Math.min(currentSalary, blsMin) * 0.9;
    const maxScale = Math.max(currentSalary, targetSalary, optimalSalary, blsMax) * 1.1;
    const totalRange = maxScale - minScale;

    // Calculate segment widths
    const currentAmount = currentSalary - minScale;
    const currentWidth = (currentAmount / totalRange) * 100;

    let gapToTargetAmount = 0;
    let gapToTargetWidth = 0;
    let gapToOptimalAmount = 0;
    let gapToOptimalWidth = 0;

    // Determine which case we're in
    const isAboveOptimal = currentSalary >= optimalSalary;
    const isAtOrAboveTarget = currentSalary >= targetSalary;
    const isBelowMarketMin = currentSalary < blsMin;
    const isAboveMarketMax = currentSalary > blsMax;

    if (isAboveOptimal) {
      // Case 3: Already at/above optimal - single segment
      // Nothing to add
    } else if (isAtOrAboveTarget) {
      // Case 2: At/above target but below optimal - two segments
      gapToOptimalAmount = optimalSalary - currentSalary;
      gapToOptimalWidth = (gapToOptimalAmount / totalRange) * 100;
    } else {
      // Case 1: Below target - three segments
      gapToTargetAmount = targetSalary - currentSalary;
      gapToTargetWidth = (gapToTargetAmount / totalRange) * 100;
      gapToOptimalAmount = optimalSalary - targetSalary;
      gapToOptimalWidth = (gapToOptimalAmount / totalRange) * 100;
    }

    // Calculate percentile marker positions
    const getMarkerPosition = (salary: number) => ((salary - minScale) / totalRange) * 100;

    const markers = [
      { label: "10th", salary: blsMin, position: getMarkerPosition(blsMin) },
      ...(bls25th
        ? [{ label: "25th", salary: bls25th, position: getMarkerPosition(bls25th) }]
        : []),
      { label: "50th", salary: optimalSalary, position: getMarkerPosition(optimalSalary) },
      ...(bls75th
        ? [{ label: "75th", salary: bls75th, position: getMarkerPosition(bls75th) }]
        : []),
      { label: "90th", salary: blsMax, position: getMarkerPosition(blsMax) },
    ];

    // Calculate percentage differences for messages
    const belowMinPercentage = isBelowMarketMin
      ? Math.round(((blsMin - currentSalary) / blsMin) * 100)
      : 0;
    const aboveMaxPercentage = isAboveMarketMax
      ? Math.round(((currentSalary - blsMax) / blsMax) * 100)
      : 0;
    const aboveOptimalPercentage = isAboveOptimal
      ? Math.round(((currentSalary - optimalSalary) / optimalSalary) * 100)
      : 0;
    const targetDifference =
      isAtOrAboveTarget && !isAboveOptimal ? currentSalary - targetSalary : 0;

    return {
      minScale,
      maxScale,
      totalRange,
      currentWidth,
      gapToTargetWidth,
      gapToOptimalWidth,
      gapToTargetAmount,
      gapToOptimalAmount,
      isAboveOptimal,
      isAtOrAboveTarget,
      isBelowMarketMin,
      isAboveMarketMax,
      markers,
      belowMinPercentage,
      aboveMaxPercentage,
      aboveOptimalPercentage,
      targetDifference,
    };
  }, [currentSalary, targetSalary, optimalSalary, blsMin, blsMax, bls25th, bls75th]);

  const {
    currentWidth,
    gapToTargetWidth,
    gapToOptimalWidth,
    gapToTargetAmount,
    gapToOptimalAmount,
    isAboveOptimal,
    isAtOrAboveTarget,
    isBelowMarketMin,
    isAboveMarketMax,
    markers,
    belowMinPercentage,
    aboveMaxPercentage,
    aboveOptimalPercentage,
    targetDifference,
  } = calculations;

  return (
    <div className="w-full">
      {/* Warning/Success Messages */}
      {isBelowMarketMin && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-semibold">⚠️ Below Market Minimum:</span> Current salary is{" "}
            {belowMinPercentage}% below market minimum. This may significantly impact recruitment
            and retention.
          </p>
        </div>
      )}

      {isAboveMarketMax && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-semibold">✓ Above Market Maximum:</span> Current salary is{" "}
            {aboveMaxPercentage}% above market maximum. You're offering a premium compensation
            package.
          </p>
        </div>
      )}

      {isAtOrAboveTarget && !isAboveOptimal && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">✓ At Target:</span> You're already at target by{" "}
            {formatSalary(targetDifference)}
          </p>
        </div>
      )}

      {isAboveOptimal && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-800">
            <span className="font-semibold">✓ Above Optimal:</span> You're {aboveOptimalPercentage}%
            above market optimal
          </p>
        </div>
      )}

      {/* Main Stacked Bar */}
      <div className="mb-8">
        <div className="relative h-16 bg-slate-100 rounded-lg overflow-hidden">
          {/* Segment container */}
          <div className="absolute inset-0 flex">
            {/* Current Salary Segment */}
            <div
              className={`group relative h-full ${
                isBelowMarketMin ? "bg-red-600" : isAboveOptimal ? "bg-emerald-600" : "bg-blue-600"
              }`}
              style={{ width: `${currentWidth}%` }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded shadow-lg whitespace-nowrap">
                  <div className="font-semibold">Current Salary</div>
                  <div>{formatSalary(currentSalary)}</div>
                  <div className="text-slate-300">{currentPercentile.toFixed(1)}th percentile</div>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
              </div>
            </div>

            {/* Gap to Target Segment (if below target) */}
            {!isAtOrAboveTarget && gapToTargetWidth > 0 && (
              <div
                className="group relative h-full bg-amber-500"
                style={{ width: `${gapToTargetWidth}%` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded shadow-lg whitespace-nowrap">
                    <div className="font-semibold">Gap to Target</div>
                    <div>{formatSalary(gapToTargetAmount)}</div>
                    <div className="text-slate-300">To reach {targetPercentile}th percentile</div>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
                </div>
              </div>
            )}

            {/* Gap to Optimal Segment (if below optimal) */}
            {!isAboveOptimal && gapToOptimalWidth > 0 && (
              <div
                className="group relative h-full bg-green-600"
                style={{ width: `${gapToOptimalWidth}%` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded shadow-lg whitespace-nowrap">
                    <div className="font-semibold">Gap to Optimal</div>
                    <div>{formatSalary(gapToOptimalAmount)}</div>
                    <div className="text-slate-300">To reach market median (50th)</div>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Percentile Markers */}
      <div className="relative mb-4">
        <div className="relative h-12">
          {markers.map((marker, index) => (
            <div
              key={`${marker.label}-${index}`}
              className="absolute top-0"
              style={{ left: `${marker.position}%`, transform: "translateX(-50%)" }}
            >
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-3 bg-slate-400 mb-1" />
                <div className="text-xs font-medium text-slate-600 whitespace-nowrap">
                  {marker.label}
                </div>
                <div className="text-xs text-slate-900 font-semibold whitespace-nowrap">
                  {formatSalary(marker.salary, true)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded ${
              isBelowMarketMin ? "bg-red-600" : isAboveOptimal ? "bg-emerald-600" : "bg-blue-600"
            }`}
          />
          <span className="text-slate-700">Current Salary</span>
        </div>
        {!isAtOrAboveTarget && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded" />
            <span className="text-slate-700">Gap to Target ({targetPercentile}th)</span>
          </div>
        )}
        {!isAboveOptimal && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded" />
            <span className="text-slate-700">Gap to Optimal (50th)</span>
          </div>
        )}
      </div>

      {/* Screen reader text */}
      <div className="sr-only">
        Market positioning visualization. Current salary is {formatSalary(currentSalary)} at the{" "}
        {currentPercentile.toFixed(1)}th percentile. Target salary is {formatSalary(targetSalary)}{" "}
        at the {targetPercentile}th percentile. Optimal market salary is{" "}
        {formatSalary(optimalSalary)} at the 50th percentile. Market range is from{" "}
        {formatSalary(blsMin)} at 10th percentile to {formatSalary(blsMax)} at 90th percentile.
        {isBelowMarketMin &&
          ` Warning: Current salary is ${belowMinPercentage}% below market minimum.`}
        {isAboveMarketMax && ` Current salary is ${aboveMaxPercentage}% above market maximum.`}
      </div>
    </div>
  );
}
