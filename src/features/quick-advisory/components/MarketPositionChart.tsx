import React from "react";
import type { BLSOccupation } from "@/features/bls-matching/hooks/useBLSData";
import type { PercentileResult, MarketPositionRange } from "@/utils/blsComparison";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";

interface MarketPositionChartProps {
  occupation: BLSOccupation;
  proposedSalary: number;
  percentileResult: PercentileResult;
  targetRange: MarketPositionRange;
  alignment: {
    aligned: boolean;
    message: string;
    status: "aligned" | "below" | "above";
    percentile: number;
    targetRange: MarketPositionRange;
    gap?: {
      percentilePoints: string;
      recommendedSalary: number;
      salaryIncrease: number;
    };
  };
}

const MarketPositionChart: React.FC<MarketPositionChartProps> = ({
  occupation,
  proposedSalary,
  percentileResult,
  targetRange,
  alignment,
}) => {
  const { wages } = occupation;

  // Calculate percentile position for the proposed salary
  // We need to interpolate between known percentiles
  const getUserPercentile = (salary: number): number => {
    const p10 = wages.percentile10;
    const p25 = wages.percentile25;
    const p50 = wages.annualMedian;
    const p75 = wages.percentile75;
    const p90 = wages.percentile90;

    // Below P10
    if (salary <= p10) return 10;
    // Between P10 and P25
    if (salary <= p25) {
      const range = p25 - p10;
      const position = salary - p10;
      return 10 + (position / range) * 15; // Interpolate between 10 and 25
    }
    // Between P25 and P50
    if (salary <= p50) {
      const range = p50 - p25;
      const position = salary - p25;
      return 25 + (position / range) * 25; // Interpolate between 25 and 50
    }
    // Between P50 and P75
    if (salary <= p75) {
      const range = p75 - p50;
      const position = salary - p50;
      return 50 + (position / range) * 25; // Interpolate between 50 and 75
    }
    // Between P75 and P90
    if (salary <= p90) {
      const range = p90 - p75;
      const position = salary - p75;
      return 75 + (position / range) * 15; // Interpolate between 75 and 90
    }
    // Above P90
    return 90;
  };

  const proposedPercentile = getUserPercentile(proposedSalary);
  const clampedPosition = Math.max(0, Math.min(100, proposedPercentile));

  const getStatusColor = () => {
    switch (alignment.status) {
      case "aligned":
        return "text-green-700 bg-green-50 border-green-300";
      case "below":
        return "text-amber-700 bg-amber-50 border-amber-300";
      case "above":
        return "text-amber-700 bg-amber-50 border-amber-300";
      default:
        return "text-slate-700 bg-slate-50 border-slate-300";
    }
  };

  const getStatusIcon = () => {
    switch (alignment.status) {
      case "aligned":
        return "✓";
      case "below":
        return "⚠";
      case "above":
        return "⚠";
      default:
        return "•";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-sage-900 mb-4">Market Position Analysis</h2>

      {/* Occupation info */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <p className="text-sm text-slate-600 mb-1">
          Matched to BLS occupation:{" "}
          <span className="font-medium text-slate-900">{occupation.title}</span>
        </p>
        <p className="text-xs text-slate-500">
          {occupation.code} | {occupation.group}
        </p>
      </div>

      {/* Percentile visualization */}
      <div className="mb-6">
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-medium text-slate-700">Salary Distribution</span>
            <span className="text-xs text-slate-500">National averages from BLS</span>
          </div>

          {/* Chart bars */}
          <div className="relative rounded-lg p-4">
            {/* Percentile labels above the bar */}
            <div className="relative w-full mb-3" style={{ minHeight: "45px" }}>
              {/* 10th Percentile */}
              <div
                className="absolute"
                style={{ left: "10%", transform: "translateX(-50%)", width: "70px" }}
              >
                <div className="text-sm font-semibold text-gray-700 text-center">10th</div>
                <div className="text-gray-900 font-bold mt-1 text-center text-sm">
                  <CurrencyDisplay value={wages.percentile10} abbreviate />
                </div>
              </div>

              {/* 25th Percentile */}
              <div
                className="absolute"
                style={{ left: "25%", transform: "translateX(-50%)", width: "70px" }}
              >
                <div className="text-sm font-semibold text-gray-700 text-center">25th</div>
                <div className="text-gray-900 font-bold mt-1 text-center text-sm">
                  <CurrencyDisplay value={wages.percentile25} abbreviate />
                </div>
              </div>

              {/* 50th Percentile (Median) */}
              <div
                className="absolute"
                style={{ left: "50%", transform: "translateX(-50%)", width: "70px" }}
              >
                <div className="text-sm font-bold text-green-700 text-center">Median</div>
                <div className="text-gray-900 font-extrabold mt-1 text-center text-sm">
                  <CurrencyDisplay value={wages.annualMedian} abbreviate />
                </div>
              </div>

              {/* 75th Percentile */}
              <div
                className="absolute"
                style={{ left: "75%", transform: "translateX(-50%)", width: "70px" }}
              >
                <div className="text-sm font-semibold text-gray-700 text-center">75th</div>
                <div className="text-gray-900 font-bold mt-1 text-center text-sm">
                  <CurrencyDisplay value={wages.percentile75} abbreviate />
                </div>
              </div>

              {/* 90th Percentile */}
              <div
                className="absolute"
                style={{ left: "90%", transform: "translateX(-50%)", width: "70px" }}
              >
                <div className="text-sm font-semibold text-gray-700 text-center">90th</div>
                <div className="text-gray-900 font-bold mt-1 text-center text-sm">
                  <CurrencyDisplay value={wages.percentile90} abbreviate />
                </div>
              </div>
            </div>

            {/* Visual bar with salary marker */}
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

                {/* User salary marker - Diamond shape */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                  style={{ left: `${clampedPosition}%` }}
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
                        backgroundColor: "#3b82f6", // Blue for Quick Advisory
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
                        backgroundColor: "#3b82f6",
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
                style={{ left: `${clampedPosition}%` }}
              >
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm"
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                  }}
                >
                  You: <CurrencyDisplay value={proposedSalary} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Percentile result */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-700">
            Your proposed salary of{" "}
            <span className="font-semibold">
              <CurrencyDisplay value={proposedSalary} />
            </span>{" "}
            is at the{" "}
            <span className="font-semibold text-sage-700">{percentileResult.percentileLabel}</span>
          </p>
        </div>

        {/* Alignment status */}
        <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
          <div className="flex items-start gap-3">
            <span className="text-xl" aria-hidden="true">
              {getStatusIcon()}
            </span>
            <div className="flex-1">
              {alignment.status === "below" && alignment.gap ? (
                <>
                  <p className="font-semibold mb-3">Market Positioning Comparison</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Your proposed salary:</span>{" "}
                      <CurrencyDisplay value={proposedSalary} /> ({percentileResult.percentileLabel}
                      )
                    </div>
                    <div>
                      <span className="font-medium">You selected:</span> {targetRange.label}
                    </div>
                    <div>
                      <span className="font-medium">Gap:</span> You're ~
                      {alignment.gap.percentilePoints} percentile points below your target range
                    </div>
                  </div>

                  {/* Visual gap indicator */}
                  <div className="mt-4 p-3 bg-white bg-opacity-50 rounded border border-amber-300">
                    <div className="text-xs font-medium mb-2">Visual Gap</div>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-700">Your Salary:</span>
                        <span className="text-amber-900 font-semibold">
                          [{percentileResult.percentile}th]
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-700">Your Goal: </span>
                        <span className="inline-block ml-8 text-amber-900 font-semibold">
                          [{targetRange.min}th-{targetRange.max}th]
                        </span>
                      </div>
                      <div className="text-amber-700">
                        ← Gap: Consider increasing by{" "}
                        <span className="font-semibold">
                          <CurrencyDisplay value={alignment.gap.salaryIncrease} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specific recommendation */}
                  <div className="mt-4 p-3 bg-white bg-opacity-50 rounded border border-amber-300">
                    <p className="text-sm font-medium mb-1">💡 Recommendation</p>
                    <p className="text-sm">
                      To reach the lower end of your target range ({targetRange.min}th percentile),
                      consider increasing the salary to{" "}
                      <span className="font-semibold">
                        <CurrencyDisplay value={alignment.gap.recommendedSalary} />
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1">{alignment.message}</p>
                  <p className="text-sm opacity-90">Target range: {targetRange.label}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPositionChart;
