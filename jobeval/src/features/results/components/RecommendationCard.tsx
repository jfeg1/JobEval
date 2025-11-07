import type { RecommendationData } from "@/shared/utils/resultsCalculator";

export interface RecommendationCardProps {
  recommendation: RecommendationData;
  recommendationText: string;
}

export default function RecommendationCard({
  recommendation,
  recommendationText,
}: RecommendationCardProps) {
  const { budgetStatus, strategies, warningMessage } = recommendation;

  // Determine styling based on budget status
  const getStatusStyles = () => {
    switch (budgetStatus) {
      case "competitive":
        return {
          border: "border-green-300",
          bg: "bg-green-50",
          icon: "✅",
          iconColor: "text-green-600",
          title: "Competitive Budget",
          titleColor: "text-green-900",
        };
      case "below-median":
        return {
          border: "border-amber-300",
          bg: "bg-amber-50",
          icon: "💡",
          iconColor: "text-amber-600",
          title: "Below Median - Strategic Approach Needed",
          titleColor: "text-amber-900",
        };
      case "below-market":
        return {
          border: "border-red-300",
          bg: "bg-red-50",
          icon: "⚠️",
          iconColor: "text-red-600",
          title: "Below Market Rate",
          titleColor: "text-red-900",
        };
      default:
        return {
          border: "border-gray-300",
          bg: "bg-gray-50",
          icon: "ℹ️",
          iconColor: "text-gray-600",
          title: "Recommendation",
          titleColor: "text-gray-900",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className={`rounded-lg border-2 ${styles.border} ${styles.bg} p-6`}
      role="region"
      aria-label="Salary recommendation"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className={`text-3xl ${styles.iconColor}`} aria-hidden="true">
          {styles.icon}
        </span>
        <div className="flex-1">
          <h3 className={`text-xl font-semibold ${styles.titleColor}`}>{styles.title}</h3>
        </div>
      </div>

      {/* Warning message (if applicable) */}
      {warningMessage && (
        <div className="mb-4 p-3 bg-white rounded border border-red-200">
          <p className="text-sm font-medium text-red-800">{warningMessage}</p>
        </div>
      )}

      {/* Recommendation text */}
      <div className="mb-6 prose prose-sm max-w-none">
        {recommendationText.split("\n").map((line, idx) => {
          // Handle markdown-style bold
          if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <p key={idx} className="font-semibold text-gray-900 my-2">
                {line.replace(/\*\*/g, "")}
              </p>
            );
          }
          return line.trim() ? (
            <p key={idx} className="text-gray-700 leading-relaxed my-2">
              {line}
            </p>
          ) : null;
        })}
      </div>

      {/* Strategies section */}
      {strategies.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-300">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            {budgetStatus === "competitive"
              ? "Recommended Actions:"
              : budgetStatus === "below-median"
                ? "Strategies to Strengthen Your Offer:"
                : "Options to Consider:"}
          </h4>
          <ul className="space-y-2">
            {strategies.map((strategy, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 leading-relaxed">
                <span className="text-gray-500 mt-1">•</span>
                <span className="flex-1">{strategy}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional context for below-market scenarios */}
      {budgetStatus === "below-market" && (
        <div className="mt-6 pt-6 border-t border-red-200">
          <p className="text-sm text-red-800 leading-relaxed">
            <strong>Important:</strong> Underpaying often leads to higher turnover costs, difficulty
            attracting qualified candidates, and reduced performance. Consider whether the budget
            can be adjusted or the role can be restructured to better align with market
            expectations.
          </p>
        </div>
      )}
    </div>
  );
}
