import type { RecommendationData } from "@/shared/utils/resultsCalculator";
import { formatSalaryRange } from "@/shared/utils/formatSalary";

interface RecommendationCardProps {
  recommendation: RecommendationData;
  recommendationText: string;
}

/**
 * Display recommendation card with dynamic styling based on budget status
 */
export default function RecommendationCard({
  recommendation,
  recommendationText,
}: RecommendationCardProps) {
  const { budgetStatus, recommendedMin, recommendedMax, strategies, warningMessage } =
    recommendation;

  // Determine border and header colors based on status
  const getStatusColors = () => {
    switch (budgetStatus) {
      case "competitive":
        return {
          border: "border-green-300",
          bg: "bg-green-50",
          header: "text-green-800",
          icon: "✅",
        };
      case "below-median":
        return {
          border: "border-yellow-300",
          bg: "bg-yellow-50",
          header: "text-yellow-800",
          icon: "⚡",
        };
      case "below-market":
        return {
          border: "border-orange-300",
          bg: "bg-orange-50",
          header: "text-orange-800",
          icon: "⚠️",
        };
    }
  };

  const colors = getStatusColors();

  return (
    <div
      className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-6`}
      role="article"
      aria-label="Salary recommendation"
    >
      {/* Header with icon */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl" role="img" aria-label="status indicator">
          {colors.icon}
        </span>
        <div className="flex-1">
          <h3 className={`text-xl font-semibold ${colors.header} mb-2`}>
            {budgetStatus === "competitive" && "Competitive Budget"}
            {budgetStatus === "below-median" && "Below Median - Actionable"}
            {budgetStatus === "below-market" && "Below Market - Action Needed"}
          </h3>
        </div>
      </div>

      {/* Main recommendation text */}
      <p className="text-gray-800 text-base leading-relaxed mb-4">{recommendationText}</p>

      {/* Recommended range */}
      <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-1">Recommended salary range:</p>
        <p className="text-2xl font-semibold text-gray-900">
          {formatSalaryRange(recommendedMin, recommendedMax, false)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {budgetStatus === "competitive" && "(Targeting the 50th-75th percentile)"}
          {budgetStatus === "below-median" && "(Targeting the 25th-50th percentile)"}
          {budgetStatus === "below-market" && "(Market competitive range)"}
        </p>
      </div>

      {/* Warning message for below-market */}
      {warningMessage && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
          <p className="text-sm font-medium text-orange-900">⚠️ {warningMessage}</p>
        </div>
      )}

      {/* Strategies */}
      {strategies.length > 0 && (
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-3">
            {budgetStatus === "competitive"
              ? "Recommended Approach:"
              : budgetStatus === "below-median"
                ? "Strategies to strengthen your offer:"
                : "Consider these options:"}
          </h4>
          <ul className="space-y-2">
            {strategies.map((strategy, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-gray-700 text-sm leading-relaxed"
              >
                <span className="text-green-600 font-bold mt-0.5">•</span>
                <span>{strategy}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional warning for below-market scenarios */}
      {budgetStatus === "below-market" && (
        <div className="mt-4 pt-4 border-t border-orange-200">
          <p className="text-sm text-gray-700 italic">
            <strong>Remember:</strong> Underpaying often leads to higher turnover costs and poor
            performance. Consider adjusting your budget or role expectations.
          </p>
        </div>
      )}
    </div>
  );
}
