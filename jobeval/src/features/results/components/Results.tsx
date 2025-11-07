import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '@/features/company-setup/companyStore';
import { usePositionStore } from '@/features/position-wizard/positionStore';
import { useMatchingStore } from '@/features/bls-matching/matchingStore';
import { useCalculatorStore } from '@/features/calculator/calculatorStore';
import { formatSalary, formatSalaryRange } from '@/shared/utils/formatSalary';
import {
  calculateRecommendation,
  formatRecommendationText,
  type BLSPercentiles,
} from '@/shared/utils/resultsCalculator';
import SalaryRangeBar from './SalaryRangeBar';
import RecommendationCard from './RecommendationCard';
import { Button } from '@/shared/components/ui/Button';

export default function Results() {
  const navigate = useNavigate();
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Get data from all stores
  const { profile: company, clearProfile } = useCompanyStore();
  const { basicInfo: position, clearPosition } = usePositionStore();
  const { selectedOccupation, clearMatching } = useMatchingStore();
  const { affordableRange, reset: resetCalculator } = useCalculatorStore();

  // Validate prerequisites and redirect if missing
  useEffect(() => {
    if (!company || !company.name || !company.annualRevenue) {
      navigate('/setup/company');
      return;
    }

    if (!position || !position.title) {
      navigate('/position/basic');
      return;
    }

    if (!selectedOccupation) {
      navigate('/position/match');
      return;
    }

    if (!affordableRange) {
      navigate('/calculator');
      return;
    }
  }, [company, position, selectedOccupation, affordableRange, navigate]);

  // Show loading while checking guards
  if (!company || !position || !selectedOccupation || !affordableRange) {
    return null;
  }

  // User's budget is the target from affordable range
  const userBudget = affordableRange.target;

  // Prepare BLS data for calculations
  const blsPercentiles: BLSPercentiles = {
    median: selectedOccupation.wages.annualMedian,
    percentile10: selectedOccupation.wages.percentile10,
    percentile25: selectedOccupation.wages.percentile25,
    percentile75: selectedOccupation.wages.percentile75,
    percentile90: selectedOccupation.wages.percentile90,
  };

  // Calculate recommendation
  const recommendation = calculateRecommendation(userBudget, blsPercentiles);
  const recommendationText = formatRecommendationText(
    recommendation,
    userBudget,
    blsPercentiles,
    selectedOccupation.title
  );

  // Market range (25th to 75th percentile)
  const marketRangeMin = selectedOccupation.wages.percentile25;
  const marketRangeMax = selectedOccupation.wages.percentile75;

  // Handle clearing all data and starting new evaluation
  const handleStartNew = () => {
    setShowClearDialog(true);
  };

  const confirmStartNew = () => {
    // Clear all stores
    clearProfile();
    clearPosition();
    clearMatching();
    resetCalculator();

    // Navigate to start
    navigate('/setup/company');
  };

  const handleAdjustBudget = () => {
    navigate('/calculator');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">{position.title}</h1>
          <p className="text-lg text-gray-600">
            {position.department} • {position.reportsTo}
          </p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Market Median */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Market Median</h3>
            <p
              className="text-3xl font-light text-gray-900"
              aria-label={`Market median salary: ${formatSalary(blsPercentiles.median)}`}
            >
              {formatSalary(blsPercentiles.median)}
            </p>
          </div>

          {/* Market Range */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Market Range</h3>
            <p
              className="text-3xl font-light text-gray-900"
              aria-label={`Market range: ${formatSalaryRange(marketRangeMin, marketRangeMax)}`}
            >
              {formatSalary(marketRangeMin, true)} - {formatSalary(marketRangeMax, true)}
            </p>
            <p className="text-xs text-gray-500 mt-1">25th - 75th percentile</p>
          </div>

          {/* Your Budget */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Your Budget</h3>
            <p
              className="text-3xl font-light text-gray-900"
              aria-label={`Your budget: ${formatSalary(userBudget)}`}
            >
              {formatSalary(userBudget)}
            </p>
          </div>
        </div>

        {/* Market Data Section */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Market Data</h2>
          <p className="text-sm text-gray-500 italic mb-6">
            Based on BLS data for {selectedOccupation.title} in {company.location} metro area (last
            updated {selectedOccupation.dataDate})
          </p>

          {/* Salary Range Bar */}
          <SalaryRangeBar
            percentiles={{
              p10: blsPercentiles.percentile10,
              p25: blsPercentiles.percentile25,
              p50: blsPercentiles.median,
              p75: blsPercentiles.percentile75,
              p90: blsPercentiles.percentile90,
            }}
            userBudget={userBudget}
            showLabels={true}
          />
        </section>

        {/* Recommendation Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Recommendation</h2>
          <RecommendationCard
            recommendation={recommendation}
            recommendationText={recommendationText}
          />
        </section>

        {/* Next Steps Section */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Next Steps</h2>

          <div className="space-y-4">
            {/* Download PDF - Disabled for MVP */}
            <button
              disabled
              className="w-full md:w-auto px-6 py-3 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed opacity-60"
              title="Coming soon"
            >
              📄 Download PDF Report (Coming Soon)
            </button>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Adjust Budget */}
              <Button variant="secondary" onClick={handleAdjustBudget} className="flex-1">
                ← Adjust Budget
              </Button>

              {/* Start New Evaluation */}
              <button
                onClick={handleStartNew}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Start New Evaluation
              </button>
            </div>
          </div>
        </section>

        {/* Data Attribution Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>
            Market data from U.S. Bureau of Labor Statistics • Last updated:{' '}
            {selectedOccupation.dataDate}
          </p>
          <p className="mt-1">
            Note: Salaries vary by region, experience, and company size. This tool provides estimates
            for planning purposes.
          </p>
        </footer>

        {/* Clear Data Confirmation Dialog */}
        {showClearDialog && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClearDialog(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start New Evaluation?</h3>
              <p className="text-gray-600 mb-6">
                This will clear all current data including company profile, position details, and
                budget calculations. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowClearDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <button
                  onClick={confirmStartNew}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Clear & Start New
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
