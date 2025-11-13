import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCompanyStore } from "@/features/company-setup/companyStore";
import { usePositionStore } from "@/features/position-wizard/positionStore";
import { useMatchingStore } from "@/features/bls-matching/matchingStore";
import { useCalculatorStore } from "@/features/calculator/calculatorStore";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import {
  calculateRecommendation,
  formatRecommendationText,
  type BLSData,
} from "@/shared/utils/resultsCalculator";
import SalaryRangeBar from "./SalaryRangeBar";
import RecommendationCard from "./RecommendationCard";
import { generateResultsPdf, type ResultsPdfData } from "@/lib/pdf/resultsPdfService";

// Helper function to get data source name based on country
function getDataSourceName(countryCode: string): string {
  const sources: Record<string, string> = {
    US: "U.S. Bureau of Labor Statistics",
    CA: "Statistics Canada",
    GB: "UK Office for National Statistics",
    AU: "Australian Bureau of Statistics",
    DE: "Statistisches Bundesamt (Destatis)",
    FR: "Institut national de la statistique et des études économiques (INSEE)",
    // Add more as needed
  };
  return sources[countryCode] || "public statistical agencies";
}

// Helper function to get currency full name
function getCurrencyName(currencyCode: string): string {
  const names: Record<string, string> = {
    USD: "U.S. Dollars",
    CAD: "Canadian Dollars",
    EUR: "Euros",
    GBP: "British Pounds",
    AUD: "Australian Dollars",
    JPY: "Japanese Yen",
    SGD: "Singapore Dollars",
    // Add more as needed
  };
  return names[currencyCode] || currencyCode;
}

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from all stores
  const { profile: company, getCountry, getCurrency } = useCompanyStore();
  const { basicInfo: position, clearPosition } = usePositionStore();
  const { selectedOccupation, clearMatching } = useMatchingStore();
  const { affordableRange, reset: resetCalculator } = useCalculatorStore();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Validate all required data is present
  useEffect(() => {
    if (!company || !company.name || !company.annualRevenue) {
      navigate("/setup/company");
      return;
    }

    if (!position || !position.title) {
      navigate("/position/basic");
      return;
    }

    if (!selectedOccupation) {
      navigate("/position/match");
      return;
    }

    if (!affordableRange) {
      navigate("/calculator");
      return;
    }
  }, [company, position, selectedOccupation, affordableRange, navigate]);

  // Save to position history ONLY when completing evaluation (coming from Calculator)
  useEffect(() => {
    // Only save if coming from calculator (completing evaluation), not when returning from Settings
    const fromCalculator = location.state?.fromCalculator === true;

    if (fromCalculator && company && position && selectedOccupation && affordableRange) {
      // Load existing history
      const stored = localStorage.getItem("jobeval_position_history");
      let history = [];
      if (stored) {
        try {
          history = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to load position history:", e);
        }
      }

      // Add current position
      const newEntry = {
        title: position.title,
        department: position.department || "Not specified",
        occupationTitle: selectedOccupation.title,
        targetSalary: affordableRange.target,
        evaluatedAt: new Date().toISOString(),
      };

      // Check if this position was already saved (avoid duplicates)
      const isDuplicate = history.some(
        (p: typeof newEntry) =>
          p.title === newEntry.title &&
          p.department === newEntry.department &&
          Math.abs(new Date(p.evaluatedAt).getTime() - new Date(newEntry.evaluatedAt).getTime()) <
            60000 // Within 1 minute
      );

      if (!isDuplicate) {
        history.unshift(newEntry); // Add to beginning
        // Keep only last 10 positions
        if (history.length > 10) {
          history = history.slice(0, 10);
        }
        localStorage.setItem("jobeval_position_history", JSON.stringify(history));
      }
    }
  }, [location.state, company, position, selectedOccupation, affordableRange]);

  // Return null while redirecting
  if (!company || !position || !selectedOccupation || !affordableRange) {
    return null;
  }

  // Get country and currency for internationalization
  const country = getCountry();
  const currency = getCurrency();

  // Extract data for calculations
  const userBudget = affordableRange.target;
  const blsData: BLSData = {
    median: selectedOccupation.wages.annualMedian,
    percentile25: selectedOccupation.wages.percentile25,
    percentile75: selectedOccupation.wages.percentile75,
    percentile10: selectedOccupation.wages.percentile10,
    percentile90: selectedOccupation.wages.percentile90,
  };

  // Calculate recommendation
  const recommendation = calculateRecommendation(userBudget, blsData);
  const recommendationText = formatRecommendationText(
    recommendation,
    userBudget,
    blsData.median,
    selectedOccupation.title,
    company.location
  );

  // Handle navigation
  const handleStartNewEvaluation = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmNewEvaluation = () => {
    // Clear position-related stores only (keep company profile)
    clearPosition();
    clearMatching();
    resetCalculator();

    // Navigate to position wizard (skip company setup)
    navigate("/position/basic");
  };

  const handleAdjustBudget = () => {
    navigate("/calculator");
  };

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);

    try {
      // Calculate current payroll ratio if payroll is provided
      const currentPayrollRatio =
        company.currentPayroll > 0 ? (company.currentPayroll / company.annualRevenue) * 100 : 0;

      // Calculate new payroll ratio
      const newPayroll = company.currentPayroll + affordableRange.target;
      const newPayrollRatio = (newPayroll / company.annualRevenue) * 100;

      // Determine payroll status
      let payrollStatus: "sustainable" | "warning" | "exceed" | undefined;
      if (company.currentPayroll >= 0) {
        if (newPayrollRatio < 35) {
          payrollStatus = "sustainable";
        } else if (newPayrollRatio >= 35 && newPayrollRatio <= 45) {
          payrollStatus = "warning";
        } else {
          payrollStatus = "exceed";
        }
      }

      // Map data to PDF format
      const pdfData: ResultsPdfData = {
        companyName: company.name,
        companyLocation: company.location,
        annualRevenue: company.annualRevenue,
        currentPayroll: company.currentPayroll || 0,
        employeeCount: company.employeeCount,
        positionTitle: position.title,
        department: position.department || "Not specified",
        reportsTo: position.reportsTo || "Not specified",
        occupationTitle: selectedOccupation.title,
        marketMedian: blsData.median,
        marketP25: blsData.percentile25,
        marketP75: blsData.percentile75,
        marketP10: blsData.percentile10,
        marketP90: blsData.percentile90,
        dataDate: selectedOccupation.dataDate || "Unknown",
        affordableRangeMin: affordableRange.minimum,
        affordableRangeTarget: affordableRange.target,
        affordableRangeMax: affordableRange.maximum,
        marketAlignment: recommendation,
        gap: affordableRange.target - blsData.median,
        currentPayrollRatio: company.currentPayroll > 0 ? currentPayrollRatio : undefined,
        newPayrollRatio: company.currentPayroll > 0 ? newPayrollRatio : undefined,
        payrollStatus: payrollStatus,
        generatedDate: new Date(),
        countryCode: country,
        currencyCode: currency,
        locale: navigator.language || "en-US",
      };

      const pdfBlob = await generateResultsPdf(pdfData);

      // Generate filename with current date
      const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const filename = `JobEval_Analysis_${company.name.replace(/\s+/g, "_")}_${dateStr}.pdf`;

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
      // Log error for debugging
      if (import.meta.env.DEV) {
        console.error("PDF generation failed:", error);
      }

      alert(
        "We encountered an error generating your PDF. Please try again. If the problem persists, try refreshing the page."
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">{position.title}</h1>
          <p className="text-lg text-gray-600">
            {position.department} • {position.reportsTo}
          </p>
        </div>

        {/* Key Stats Grid - 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Market Median */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Market Median</p>
            <CurrencyDisplay
              value={blsData.median}
              className="text-3xl font-semibold text-gray-900 block"
            />
          </div>

          {/* Market Range */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Market Range</p>
            <div className="text-3xl font-semibold text-gray-900">
              <CurrencyDisplay value={blsData.percentile25} abbreviate />
              <span className="mx-2">-</span>
              <CurrencyDisplay value={blsData.percentile75} abbreviate />
            </div>
            <p className="text-xs text-gray-500 mt-1">25th - 75th percentile</p>
          </div>

          {/* Your Budget */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Your Budget</p>
            <CurrencyDisplay
              value={userBudget}
              className="text-3xl font-semibold text-green-700 block"
            />
            <p className="text-xs text-gray-500 mt-1">Target salary</p>
          </div>
        </div>

        {/* Market Data Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Market Data</h2>
          <p className="text-sm text-gray-500 italic mb-6">
            Based on BLS data for {selectedOccupation.title} in {company.location} metro area (last
            updated {selectedOccupation.dataDate})
          </p>

          {/* Salary Range Bar */}
          <SalaryRangeBar
            percentiles={{
              p10: blsData.percentile10,
              p25: blsData.percentile25,
              p50: blsData.median,
              p75: blsData.percentile75,
              p90: blsData.percentile90,
            }}
            userBudget={userBudget}
            showLabels={true}
          />
        </div>

        {/* Recommendation Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Recommendation</h2>
          <RecommendationCard
            recommendation={recommendation}
            recommendationText={recommendationText}
          />
        </div>

        {/* Next Steps Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Next Steps</h2>
          <div className="space-y-4">
            {/* Export PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="inline-block animate-spin mr-2">⌛</span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <span className="mr-2">📄</span>
                  Download PDF Report
                </>
              )}
            </button>

            {/* Adjust Budget */}
            <button
              onClick={handleAdjustBudget}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ⚙️ Adjust Budget
            </button>

            {/* Go to Settings */}
            <button
              onClick={() => navigate("/settings", { state: { from: "/results" } })}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ⚙️ Update Company Info / View History
            </button>

            {/* Evaluate Another Position */}
            <button
              onClick={handleStartNewEvaluation}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ✨ Evaluate Another Position
            </button>
          </div>

          {/* Helper text for multi-position evaluations */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">💡 Tip:</span> Evaluating multiple positions? After
              completing each evaluation, update your company's current payroll in Settings to track
              the cumulative impact on your budget.
            </p>
          </div>
        </div>

        {/* Data Attribution Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>
            Occupation data from O*NET 30.0 • Wage data from {getDataSourceName(country)}
            {selectedOccupation.dataDate && ` • ${selectedOccupation.dataDate}`}
            {country !== "US" && <> • All amounts displayed in {getCurrencyName(currency)}</>}
          </p>
          <p className="mt-2 text-gray-600">
            <strong>Disclaimer:</strong> JobEval provides guidance based on public market data and
            your company's financial profile. Final compensation decisions should consider local
            labor laws, cost of living adjustments, and professional counsel.
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowConfirmDialog(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Evaluate Another Position?</h3>
            <p className="text-gray-600 mb-6">
              This will clear your current position evaluation but keep your company profile. You
              can evaluate another position for the same company.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNewEvaluation}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
