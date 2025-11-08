import React from "react";
import type { BLSOccupation } from "@/features/bls-matching/hooks/useBLSData";
import type { PercentileResult, MarketPositionRange } from "@/utils/blsComparison";

interface MarketPositionChartProps {
  occupation: BLSOccupation;
  proposedSalary: number;
  percentileResult: PercentileResult;
  targetRange: MarketPositionRange;
  alignment: {
    aligned: boolean;
    message: string;
    status: "aligned" | "below" | "above";
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate position of proposed salary in the chart (0-100%)
  const minSalary = wages.percentile10;
  const maxSalary = wages.percentile90;
  const salaryRange = maxSalary - minSalary;
  const proposedPosition = ((proposedSalary - minSalary) / salaryRange) * 100;

  // Clamp position between 0 and 100
  const clampedPosition = Math.max(0, Math.min(100, proposedPosition));

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
          <div className="relative bg-slate-100 rounded-lg p-4">
            {/* Percentile markers */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center">
                <div className="text-xs font-medium text-slate-600 mb-1">10th</div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatCurrency(wages.percentile10)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-slate-600 mb-1">25th</div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatCurrency(wages.percentile25)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-sage-600 mb-1">Median</div>
                <div className="text-sm font-semibold text-sage-700">
                  {formatCurrency(wages.annualMedian)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-slate-600 mb-1">75th</div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatCurrency(wages.percentile75)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-slate-600 mb-1">90th</div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatCurrency(wages.percentile90)}
                </div>
              </div>
            </div>

            {/* Visual bar */}
            <div className="relative h-8 bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 via-yellow-200 to-red-200 rounded-full">
              {/* Proposed salary indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${clampedPosition}%` }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-sage-600 border-2 border-white rounded-full shadow-lg"></div>
                  <div className="mt-2 bg-sage-700 text-white text-xs font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    Your Salary: {formatCurrency(proposedSalary)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Percentile result */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-700">
            Your proposed salary of{" "}
            <span className="font-semibold">{formatCurrency(proposedSalary)}</span> is at the{" "}
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
              <p className="font-medium mb-1">{alignment.message}</p>
              <p className="text-sm opacity-90">Target range: {targetRange.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPositionChart;
