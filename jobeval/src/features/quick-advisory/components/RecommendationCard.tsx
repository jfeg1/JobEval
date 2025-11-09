import React from "react";
import type { BLSOccupation } from "@/features/bls-matching/hooks/useBLSData";
import type { MarketPositioningType } from "@/utils/blsComparison";
import { getRecommendedSalaryRange } from "@/utils/blsComparison";
import type { AffordabilityStatus } from "@/utils/affordabilityCalculator";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";

interface RecommendationCardProps {
  proposedSalary: number;
  alignmentStatus: "aligned" | "below" | "above";
  affordabilityStatus?: AffordabilityStatus;
  occupation: BLSOccupation;
  positioning: MarketPositioningType;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  proposedSalary,
  alignmentStatus,
  affordabilityStatus,
  occupation,
  positioning,
}) => {
  const recommendedRange = getRecommendedSalaryRange(positioning, occupation);

  // Generate recommendations based on alignment and affordability
  const getRecommendations = () => {
    const recommendations: Array<{
      type: "action" | "risk" | "opportunity";
      title: string;
      message: string;
    }> = [];

    // Market alignment recommendations
    if (alignmentStatus === "below") {
      recommendations.push({
        type: "action",
        title: "Consider Increasing Salary",
        message:
          "To meet your hiring strategy goal, consider increasing the salary to the recommended range shown below. This aligns with market expectations for your strategy.",
      });
      recommendations.push({
        type: "risk",
        title: "Risk: Difficulty Attracting Candidates",
        message:
          "Below-market salaries may result in fewer qualified applicants, longer time-to-hire, and potential need to compromise on candidate quality.",
      });
    } else if (alignmentStatus === "aligned") {
      recommendations.push({
        type: "action",
        title: "Salary Well-Positioned",
        message:
          "Your proposed salary aligns well with your market goals and should be competitive for attracting qualified candidates.",
      });
    } else if (alignmentStatus === "above") {
      recommendations.push({
        type: "opportunity",
        title: "Opportunity: Strong Competitive Advantage",
        message:
          "Your above-market salary offers a strong competitive advantage in hiring. You're likely to attract high-quality candidates quickly.",
      });
    }

    // Affordability recommendations
    if (affordabilityStatus === "exceed") {
      recommendations.push({
        type: "risk",
        title: "Financial Sustainability Concern",
        message:
          "Consider adjusting either salary or headcount to maintain financial sustainability. A high payroll ratio can limit growth opportunities and strain cash flow.",
      });
    } else if (affordabilityStatus === "warning") {
      recommendations.push({
        type: "action",
        title: "Monitor Payroll Ratio",
        message:
          "Your payroll ratio is approaching the high end. Consider this when planning future hires or revenue growth.",
      });
    }

    // Market positioning insights
    if (alignmentStatus === "aligned" && affordabilityStatus === "sustainable") {
      recommendations.push({
        type: "opportunity",
        title: "Optimal Balance Achieved",
        message:
          "Your proposed salary strikes a good balance between market competitiveness and financial sustainability.",
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getRecommendationColor = (type: "action" | "risk" | "opportunity") => {
    switch (type) {
      case "action":
        return "border-blue-200 bg-blue-50";
      case "risk":
        return "border-amber-200 bg-amber-50";
      case "opportunity":
        return "border-green-200 bg-green-50";
      default:
        return "border-slate-200 bg-slate-50";
    }
  };

  const getRecommendationIcon = (type: "action" | "risk" | "opportunity") => {
    switch (type) {
      case "action":
        return "→";
      case "risk":
        return "⚠";
      case "opportunity":
        return "✦";
      default:
        return "•";
    }
  };

  const getRecommendationTextColor = (type: "action" | "risk" | "opportunity") => {
    switch (type) {
      case "action":
        return "text-blue-900";
      case "risk":
        return "text-amber-900";
      case "opportunity":
        return "text-green-900";
      default:
        return "text-slate-900";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-sage-900 mb-4">Recommendations</h2>

      <p className="text-sm text-slate-600 mb-6">
        Action items based on your market analysis and financial data
      </p>

      {/* Recommendations list */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className={`rounded-lg border p-4 ${getRecommendationColor(rec.type)}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0" aria-hidden="true">
                {getRecommendationIcon(rec.type)}
              </span>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${getRecommendationTextColor(rec.type)}`}>
                  {rec.title}
                </h3>
                <p className={`text-sm ${getRecommendationTextColor(rec.type)} opacity-90`}>
                  {rec.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market reference */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Market Reference</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Your proposed salary:</span>
            <span className="ml-2 font-semibold text-slate-900">
              <CurrencyDisplay value={proposedSalary} />
            </span>
          </div>
          <div>
            <span className="text-slate-600">Market median:</span>
            <span className="ml-2 font-semibold text-slate-900">
              <CurrencyDisplay value={occupation.wages.annualMedian} />
            </span>
          </div>
          <div>
            <span className="text-slate-600">Recommended range:</span>
            <span className="ml-2 font-semibold text-sage-700">
              <CurrencyDisplay value={recommendedRange.min} /> -{" "}
              <CurrencyDisplay value={recommendedRange.max} />
            </span>
          </div>
          <div>
            <span className="text-slate-600">Top 10% earn:</span>
            <span className="ml-2 font-semibold text-slate-900">
              <CurrencyDisplay value={occupation.wages.percentile90} />+
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
