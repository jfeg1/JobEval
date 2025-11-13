import React from "react";
import type { PayrollRatioResult } from "@/utils/affordabilityCalculator";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";

interface AffordabilityAnalysisProps {
  result: PayrollRatioResult;
  revenue: number;
  currentPayroll: number;
  newPayroll: number;
}

const AffordabilityAnalysis: React.FC<AffordabilityAnalysisProps> = ({
  result,
  revenue,
  currentPayroll,
  newPayroll,
}) => {
  const formatPercentage = (value: number) => {
    return value.toFixed(1) + "%";
  };

  const getStatusColor = () => {
    switch (result.status) {
      case "sustainable":
        return "text-green-700 bg-green-50 border-green-300";
      case "warning":
        return "text-amber-700 bg-amber-50 border-amber-300";
      case "exceed":
        return "text-red-700 bg-red-50 border-red-300";
      default:
        return "text-slate-700 bg-slate-50 border-slate-300";
    }
  };

  const getStatusIcon = () => {
    switch (result.status) {
      case "sustainable":
        return "✓";
      case "warning":
        return "⚠";
      case "exceed":
        return "✕";
      default:
        return "•";
    }
  };

  const getRatioColor = (ratio: number) => {
    if (ratio < 35) return "text-green-700";
    if (ratio <= 45) return "text-amber-700";
    return "text-red-700";
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-sage-900 mb-4">Affordability Analysis</h2>

      <p className="text-sm text-slate-600 mb-6">
        Analysis based on your current revenue and payroll expenses
      </p>

      {/* Current vs New Comparison */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Current Ratio */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="text-xs font-medium text-slate-600 uppercase mb-2">
            Current Payroll Ratio
          </div>
          <div className={`text-3xl font-bold mb-1 ${getRatioColor(result.currentRatio)}`}>
            {formatPercentage(result.currentRatio)}
          </div>
          <div className="text-xs text-slate-600">
            <CurrencyDisplay value={currentPayroll} /> / <CurrencyDisplay value={revenue} />
          </div>
        </div>

        {/* New Ratio */}
        <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
          <div className="text-xs font-medium text-sage-700 uppercase mb-2">
            New Payroll Ratio (After Hire)
          </div>
          <div className={`text-3xl font-bold mb-1 ${getRatioColor(result.newRatio)}`}>
            {formatPercentage(result.newRatio)}
          </div>
          <div className="text-xs text-slate-600">
            <CurrencyDisplay value={newPayroll} /> / <CurrencyDisplay value={revenue} />
          </div>
        </div>
      </div>

      {/* Benchmark info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
        <p className="text-sm text-blue-900">
          <span className="font-medium">Industry benchmark:</span> Typical payroll-to-revenue ratio
          is 30-40% for most SMEs. Ratios above 45% may indicate financial strain.
        </p>
      </div>

      {/* Status message */}
      <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
        <div className="flex items-start gap-3">
          <span className="text-xl" aria-hidden="true">
            {getStatusIcon()}
          </span>
          <div className="flex-1">
            <p className="font-medium">{result.message}</p>
            {result.status === "exceed" && (
              <p className="text-sm mt-2 opacity-90">
                Consider adjusting salary or headcount to maintain financial sustainability. A
                payroll ratio above 45% can strain cash flow and limit business growth.
              </p>
            )}
            {result.status === "warning" && (
              <p className="text-sm mt-2 opacity-90">
                Your new payroll ratio is approaching the high end of the sustainable range. Monitor
                closely to ensure financial health.
              </p>
            )}
            {result.status === "sustainable" && (
              <p className="text-sm mt-2 opacity-90">
                Your payroll expenses remain within a healthy range relative to revenue.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Change indicator */}
      {result.newRatio !== result.currentRatio && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Change in payroll ratio:</span>
            <span
              className={`font-semibold ${
                result.newRatio > result.currentRatio ? "text-red-700" : "text-green-700"
              }`}
            >
              {result.newRatio > result.currentRatio ? "+" : ""}
              {formatPercentage(result.newRatio - result.currentRatio)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffordabilityAnalysis;
