import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanyStore } from "@/features/company-setup/companyStore";
import { usePositionStore } from "@/features/position-wizard/positionStore";
import { useMatchingStore } from "@/features/bls-matching/matchingStore";
import { useCalculatorStore } from "@/features/calculator/calculatorStore";
import { formatSalary, formatSalaryRange } from "@/shared/utils/formatSalary";
import {
  calculateRecommendation,
  formatRecommendationText,
  type BLSData,
} from "@/shared/utils/resultsCalculator";
import SalaryRangeBar from "./SalaryRangeBar";
import RecommendationCard from "./RecommendationCard";

export default function Results() {
  const navigate = useNavigate();

  // Get data from all stores
  const { profile: company, clearProfile } = useCompanyStore();
  const { basicInfo: position, clearPosition } = usePositionStore();
  const { selectedOccupation, clearMatching } = useMatchingStore();
  const { affordableRange, reset: resetCalculator } = useCalculatorStore();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  // Return null while redirecting
  if (!company || !position || !selectedOccupation || !affordableRange) {
    return null;
  }

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
    // Clear all stores
    clearProfile();
    clearPosition();
    clearMatching();
    resetCalculator();

    // Navigate to start
    navigate("/setup/company");
  };

  const handleAdjustBudget = () => {
    navigate("/calculator");
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
            <p
              className="text-3xl font-semibold text-gray-900"
              aria-label={`Market median salary: ${formatSalary(blsData.median)}`}
            >
              {formatSalary(blsData.median)}
            </p>
          </div>

          {/* Market Range */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Market Range</p>
            <p
              className="text-3xl font-semibold text-gray-900"
              aria-label={`Market range: ${formatSalaryRange(blsData.percentile25, blsData.percentile75, false)}`}
            >
              {formatSalaryRange(blsData.percentile25, blsData.percentile75)}
            </p>
            <p className="text-xs text-gray-500 mt-1">25th - 75th percentile</p>
          </div>

          {/* Your Budget */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Your Budget</p>
            <p
              className="text-3xl font-semibold text-green-700"
              aria-label={`Your budget: ${formatSalary(userBudget)}`}
            >
              {formatSalary(userBudget)}
            </p>
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
            {/* Download PDF - disabled for MVP */}
            <button
              disabled
              className="w-full bg-gray-200 text-gray-400 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
              title="Coming soon"
            >
              📄 Download PDF Report (Coming Soon)
            </button>

            {/* Adjust Budget */}
            <button
              onClick={handleAdjustBudget}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ⚙️ Adjust Budget
            </button>

            {/* Start New Evaluation */}
            <button
              onClick={handleStartNewEvaluation}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ✨ Start New Evaluation
            </button>
          </div>
        </div>

        {/* Data Attribution Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>
            BLS occupation data from U.S. Bureau of Labor Statistics • Occupational Employment and
            Wage Statistics (OEWS) Survey
          </p>
          <p className="mt-1">
            This tool provides guidance only. Consult with HR professionals and legal counsel for
            specific hiring decisions.
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
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Start New Evaluation?</h3>
            <p className="text-gray-600 mb-6">
              This will clear all current data including company profile, position details, and
              calculations. This action cannot be undone.
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
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Clear & Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
