import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuickAdvisoryStore } from "../quickAdvisoryStore";
import { Button } from "@/shared/components/ui";
import MarketPositionChart from "./MarketPositionChart";
import AffordabilityAnalysis from "./AffordabilityAnalysis";
import RecommendationCard from "./RecommendationCard";
import UpgradePrompt from "./UpgradePrompt";
import { matchOccupation as matchOccupationNew, getOccupation } from "@/utils/occupationMatcher";
import {
  calculatePercentile,
  getTargetPercentileRange,
  checkAlignment,
} from "@/utils/blsComparison";
import { analyzeAffordability, projectNewPayroll } from "@/utils/affordabilityCalculator";
import type { MarketPositioningType } from "@/utils/blsComparison";
import type { Occupation, BLSOccupation } from "@/types/occupation";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { useCompanyStore } from "@/features/company-setup/companyStore";
import { COUNTRY_CONFIGS } from "@/types/i18n";
import type { CountryCode } from "@/types/i18n";
import {
  generateQuickAdvisoryPdf,
  type QuickAdvisoryPdfData,
} from "@/lib/pdf/quickAdvisoryPdfService";

/**
 * Get the data source name for a country
 */
function getDataSourceName(country: CountryCode): string {
  const config = COUNTRY_CONFIGS[country];
  if (!config) return "public statistical agencies";

  switch (config.wageDataSource) {
    case "BLS":
      return "U.S. Bureau of Labor Statistics (BLS)";
    case "STATISTICS_CANADA":
      return "Statistics Canada";
    case "ONS":
      return "UK Office for National Statistics (ONS)";
    case "ABS":
      return "Australian Bureau of Statistics (ABS)";
    default:
      return "public statistical agencies";
  }
}

/**
 * Convert Occupation to BLSOccupation for compatibility with existing components
 */
function convertToBLSOccupation(occupation: Occupation): BLSOccupation | null {
  if (!occupation.wageData) return null;

  return {
    code: occupation.code,
    title: occupation.title,
    group: occupation.group || "Uncategorized",
    employment: occupation.wageData.employment || 0,
    wages: {
      hourlyMean: occupation.wageData.hourly.mean,
      hourlyMedian: occupation.wageData.hourly.median,
      annualMean: occupation.wageData.annual.mean,
      annualMedian: occupation.wageData.annual.median,
      percentile10: occupation.wageData.percentiles.p10,
      percentile25: occupation.wageData.percentiles.p25,
      percentile75: occupation.wageData.percentiles.p75,
      percentile90: occupation.wageData.percentiles.p90,
    },
    dataDate: occupation.wageData.dataDate,
  };
}

const QuickAdvisoryResults: React.FC = () => {
  const navigate = useNavigate();
  const { formData, resetQuickAdvisory } = useQuickAdvisoryStore();
  const getCountry = useCompanyStore((state) => state.getCountry);
  const getCurrency = useCompanyStore((state) => state.getCurrency);
  const companyProfile = useCompanyStore((state) => state.profile);
  const country = getCountry();
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [matchConfidence, setMatchConfidence] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  // Match occupation using new matcher
  const matches = matchOccupationNew(formData.jobTitle, { maxResults: 3, minConfidence: 0.3 });
  const bestMatch = matches.length > 0 ? matches[0] : null;
  const occupation = bestMatch ? getOccupation(bestMatch.code) : null;
  const matchedOccupation = occupation ? convertToBLSOccupation(occupation) : null;

  // Update match confidence
  useEffect(() => {
    if (bestMatch) {
      setMatchConfidence(bestMatch.confidence);
      setNoMatchFound(false);
    } else {
      setNoMatchFound(true);
    }
  }, [bestMatch]);

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

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);

    try {
      // Build gap description for PDF
      const gapDescription = alignment.gap
        ? `${alignment.gap.percentilePoints} percentile points below your target range`
        : "Within target range";

      // Map Quick Advisory data to PDF data interface
      const pdfData: QuickAdvisoryPdfData = {
        proposedSalary: formData.proposedSalary,
        percentile: percentileResult.percentile,
        targetRangeLabel: targetRange.label,
        gapDescription: gapDescription,
        recommendedIncrease: alignment.gap?.salaryIncrease || 0,
        recommendedSalary: alignment.gap?.recommendedSalary || formData.proposedSalary,
        currentPayrollRatio: affordabilityResult?.currentRatio || 0,
        newPayrollRatio: affordabilityResult?.newRatio || 0,
        companyName: companyProfile?.name,
        generatedDate: new Date(),
        countryCode: country,
        currencyCode: getCurrency(),
        locale: navigator.language || "en-US",
      };

      const pdfBlob = await generateQuickAdvisoryPdf(pdfData);

      // Generate filename with current date
      const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const filename = `JobEval_QuickAdvisory_${dateStr}.pdf`;

      // Trigger download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Use inline alert for error handling (matching project pattern)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to generate PDF: ${errorMessage}. Please try again.`);
    } finally {
      setIsGeneratingPdf(false);
    }
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
              <CurrencyDisplay value={formData.proposedSalary} />
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

        <button
          onClick={handleExportPdf}
          disabled={isGeneratingPdf}
          className="w-full md:w-auto px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Export salary analysis as PDF"
        >
          {isGeneratingPdf ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Generating PDF...
            </>
          ) : (
            <>
              <span className="mr-2">📥</span>
              Export as PDF
            </>
          )}
        </button>
      </div>

      {/* Match confidence indicator (if below 0.9) */}
      {matchConfidence < 0.9 && matchConfidence > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-600">ℹ</span>
            <div className="text-sm text-blue-800">
              <strong>Match Confidence: {(matchConfidence * 100).toFixed(0)}%</strong>
              <p className="mt-1">
                We matched "{formData.jobTitle}" to "{matchedOccupation.title}". If this doesn't
                seem right, try our in-depth analysis for more accurate results.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data source note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          Occupation data from O*NET 30.0 • Wage data from {getDataSourceName(country)} •{" "}
          {matchedOccupation.dataDate}
        </p>
      </div>
    </div>
  );
};

export default QuickAdvisoryResults;
