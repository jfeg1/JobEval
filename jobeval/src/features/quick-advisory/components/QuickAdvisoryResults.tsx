import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuickAdvisoryStore } from "../quickAdvisoryStore";
import { useBLSData } from "@/hooks/useBLSData";
import { Button } from "@/shared/components/ui";
import MarketPositionChart from "./MarketPositionChart";
import AffordabilityAnalysis from "./AffordabilityAnalysis";
import RecommendationCard from "./RecommendationCard";
import UpgradePrompt from "./UpgradePrompt";
import {
  matchOccupation,
  calculatePercentile,
  getTargetPercentileRange,
  checkAlignment,
} from "@/utils/blsComparison";
import { analyzeAffordability, projectNewPayroll } from "@/utils/affordabilityCalculator";
import type { MarketPositioningType } from "@/utils/blsComparison";

const QuickAdvisoryResults: React.FC = () => {
  const navigate = useNavigate();
  const { formData, resetQuickAdvisory } = useQuickAdvisoryStore();
  const { data: blsData, loading: blsLoading, error: blsError } = useBLSData();
  const [noMatchFound, setNoMatchFound] = useState(false);

  // Guard: Redirect if no form data
  useEffect(() => {
    if (
      !formData.jobTitle ||
      !formData.location ||
      !formData.proposedSalary ||
      !formData.marketPositioning
    ) {
      navigate("/quick");
    }
  }, [formData, navigate]);

  // Loading state
  if (blsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-slate-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (blsError || !blsData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading BLS data: {blsError || "Unknown error"}</p>
          <Button variant="secondary" onClick={() => navigate("/quick")}>
            Back to Quick Advisory
          </Button>
        </div>
      </div>
    );
  }

  // Match occupation
  const matchedOccupation = matchOccupation(formData.jobTitle, blsData.occupations);

  // No match found
  if (!matchedOccupation && !noMatchFound) {
    setNoMatchFound(true);
  }

  if (noMatchFound || !matchedOccupation) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-sage-900 mb-2">Quick Advisory Results</h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠</span>
            <div>
              <h2 className="font-semibold text-amber-900 mb-2">
                Unable to Find Matching Occupation
              </h2>
              <p className="text-amber-800 mb-4">
                We couldn't find a matching BLS occupation for "{formData.jobTitle}". This may be
                because:
              </p>
              <ul className="list-disc list-inside text-amber-800 mb-4 space-y-1">
                <li>The job title is very specialized or unique</li>
                <li>It's a newer role not yet categorized by BLS</li>
                <li>The title uses non-standard naming conventions</li>
              </ul>
              <p className="text-amber-900 font-medium">
                Try our in-depth analysis for a more comprehensive evaluation that doesn't rely
                solely on BLS matching.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <UpgradePrompt jobTitle={formData.jobTitle} location={formData.location} />
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button variant="secondary" onClick={() => navigate("/quick")}>
            Try Different Job Title
          </Button>
          <Button variant="primary" onClick={() => navigate("/setup/company")}>
            Start In-Depth Analysis
          </Button>
        </div>
      </div>
    );
  }

  // Calculate market position
  const percentileResult = calculatePercentile(formData.proposedSalary, matchedOccupation);
  const targetRange = getTargetPercentileRange(formData.marketPositioning as MarketPositioningType);
  const alignment = checkAlignment(
    formData.proposedSalary,
    formData.marketPositioning as MarketPositioningType,
    matchedOccupation
  );

  // Calculate affordability (if data provided)
  const hasAffordabilityData = formData.annualRevenue > 0 && formData.annualPayroll >= 0;
  const affordabilityResult = hasAffordabilityData
    ? analyzeAffordability(
        formData.annualPayroll,
        formData.annualRevenue,
        formData.proposedSalary,
        formData.numEmployees
      )
    : null;

  const newPayroll = hasAffordabilityData
    ? projectNewPayroll(formData.annualPayroll, formData.proposedSalary, formData.numEmployees)
    : 0;

  const handleStartOver = () => {
    resetQuickAdvisory();
    navigate("/quick");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-sage-900 mb-2">Quick Advisory Results</h1>
        <p className="text-slate-600">
          Market analysis for {formData.jobTitle} in {formData.location}
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-sage-50 rounded-lg border border-sage-200 p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-sage-700 font-medium mb-1">Proposed Salary</div>
            <div className="text-2xl font-bold text-sage-900">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(formData.proposedSalary)}
            </div>
          </div>
          <div>
            <div className="text-sm text-sage-700 font-medium mb-1">Number of Employees</div>
            <div className="text-2xl font-bold text-sage-900">{formData.numEmployees}</div>
          </div>
          <div>
            <div className="text-sm text-sage-700 font-medium mb-1">Market Percentile</div>
            <div className="text-2xl font-bold text-sage-900">
              {percentileResult.percentileLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* Market Position Analysis */}
        <MarketPositionChart
          occupation={matchedOccupation}
          proposedSalary={formData.proposedSalary}
          percentileResult={percentileResult}
          targetRange={targetRange}
          alignment={alignment}
        />

        {/* Affordability Analysis (conditional) */}
        {affordabilityResult && (
          <AffordabilityAnalysis
            result={affordabilityResult}
            revenue={formData.annualRevenue}
            currentPayroll={formData.annualPayroll}
            newPayroll={newPayroll}
          />
        )}

        {/* Recommendations */}
        <RecommendationCard
          proposedSalary={formData.proposedSalary}
          alignmentStatus={alignment.status}
          affordabilityStatus={affordabilityResult?.status}
          occupation={matchedOccupation}
          positioning={formData.marketPositioning as MarketPositioningType}
        />

        {/* Upgrade Prompt */}
        <UpgradePrompt jobTitle={formData.jobTitle} location={formData.location} />
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-200 mt-8">
        <Button variant="secondary" onClick={handleStartOver}>
          Start Over
        </Button>

        <div className="flex gap-3">
          {/* Placeholder for future features */}
          {/* <Button variant="outline" disabled>
            Download PDF
          </Button>
          <Button variant="outline" disabled>
            Save Results
          </Button> */}
        </div>
      </div>

      {/* Data source note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          Market data from U.S. Bureau of Labor Statistics (BLS) • {blsData.dataDate}
        </p>
      </div>
    </div>
  );
};

export default QuickAdvisoryResults;
