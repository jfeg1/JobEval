import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCompanyStore,
  useMatchingStore,
  useCalculatorStore,
} from "@/stores";
import { calculateAffordability } from "../utils/calculateAffordability";
import {
  getMinimumWage,
  MINIMUM_WAGE_LAST_UPDATED,
} from "../data/minimumWages";

export default function Calculator() {
  const navigate = useNavigate();

  // Get data from previous steps
  const { profile: company } = useCompanyStore();
  const { selectedOccupation } = useMatchingStore();

  // Calculator state
  const {
    budgetPercentage,
    additionalBudget,
    affordableRange,
    marketAlignment,
    gap,
    isBelowMinimum,
    minimumWageAmount,
    minimumWageAdjusted,
    setBudgetPercentage,
    setAdditionalBudget,
    setCalculationResults,
  } = useCalculatorStore();

  const [hasCalculated, setHasCalculated] = useState(!!affordableRange);

  // Validate prerequisites
  useEffect(() => {
    if (!company || !selectedOccupation) {
      navigate("/setup/company");
    }
  }, [company, selectedOccupation, navigate]);

  // Auto-calculate when inputs change (after first calculation)
  useEffect(() => {
    if (hasCalculated && company && selectedOccupation) {
      handleCalculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetPercentage, additionalBudget]);

  const handleCalculate = () => {
    if (!company || !selectedOccupation) return;

    const result = calculateAffordability({
      company,
      marketData: selectedOccupation,
      budgetPercentage,
      additionalBudget,
    });

    setCalculationResults({
      affordableRange: result.affordableRange,
      marketAlignment: result.marketAlignment,
      gap: result.gap,
      isBelowMinimum: result.isBelowMinimum,
      minimumWageAmount: result.minimumWageAmount,
      minimumWageAdjusted: result.minimumWageAdjusted,
    });

    setHasCalculated(true);
  };

  const handleContinue = () => {
    navigate("/results");
  };

  if (!company || !selectedOccupation) {
    return <div>Loading...</div>;
  }

  const totalBudgetBeforeMinimum =
    (company.annualRevenue * budgetPercentage) / 100 + additionalBudget;

  const minimumWageHourly = getMinimumWage(company.state);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Step 5 of 6</span>
            <span className="text-gray-600">83% Complete</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600" style={{ width: "83%" }}></div>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Budget Calculator
          </h1>
          <p className="text-gray-600 mb-8">
            Calculate what you can afford for this position
          </p>

          {/* Market Data Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Market Data: {selectedOccupation.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">10th Percentile</span>
                <p className="text-lg font-medium">
                  ${selectedOccupation.wages.percentile10?.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Median</span>
                <p className="text-lg font-medium text-green-700">
                  ${selectedOccupation.wages.annualMedian?.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-600">90th Percentile</span>
                <p className="text-lg font-medium">
                  ${selectedOccupation.wages.percentile90?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Budget Inputs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              Your Budget
            </h2>

            {/* Company Info Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Annual Revenue</p>
                <p className="text-2xl font-light text-gray-900">
                  ${company.annualRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Minimum Wage ({company.state})
                </p>
                <p className="text-2xl font-light text-gray-900">
                  ${minimumWageHourly}/hr
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ${(minimumWageHourly * 2080).toLocaleString()}/year
                </p>
              </div>
            </div>

            {/* Budget Percentage Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Allocation
                <span className="text-gray-500 font-normal ml-2">
                  (% of annual revenue)
                </span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={budgetPercentage}
                  onChange={(e) => setBudgetPercentage(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <span className="text-lg font-medium text-gray-900 min-w-[60px] text-right">
                  {budgetPercentage}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                = $
                {(
                  (company.annualRevenue * budgetPercentage) /
                  100
                ).toLocaleString()}
              </p>
            </div>

            {/* Additional Budget */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Budget Available
                <span className="text-gray-500 font-normal ml-2">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  $
                </span>
                <input
                  type="number"
                  value={additionalBudget || ""}
                  onChange={(e) =>
                    setAdditionalBudget(Number(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Extra funds from grants, reserves, or other sources
              </p>
            </div>

            {/* Total Budget Display */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Budget</p>
              <p className="text-3xl font-light text-gray-900">
                ${totalBudgetBeforeMinimum.toLocaleString()}
              </p>
              {totalBudgetBeforeMinimum < minimumWageHourly * 2080 && (
                <p className="text-xs text-amber-700 mt-2">
                  ⚠️ Below minimum wage - will be adjusted in calculation
                </p>
              )}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium mb-6"
          >
            {hasCalculated ? "Recalculate" : "Calculate Affordability"}
          </button>

          {/* Results Display */}
          {hasCalculated && affordableRange && (
            <div className="space-y-6">
              {/* Minimum Wage Warning */}
              {isBelowMinimum && minimumWageAdjusted && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-amber-900 mb-2">
                        Below Minimum Wage
                      </h3>
                      <p className="text-sm text-amber-800 mb-3">
                        Your initial budget ($
                        {totalBudgetBeforeMinimum.toLocaleString()}) was below
                        the minimum wage requirement in {company.state}
                        (${minimumWageAmount?.toLocaleString()}/year).
                      </p>
                      <p className="text-sm text-amber-800 font-medium">
                        Your affordable range has been automatically adjusted to
                        comply with legal requirements.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculation Results */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-medium text-gray-900 mb-6">
                  Calculation Results
                </h2>

                {/* Affordable Range */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Your Affordable Range
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Minimum</p>
                      <p className="text-xl font-medium text-gray-900">
                        ${affordableRange.minimum.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-300">
                      <p className="text-xs text-gray-600 mb-1">Target</p>
                      <p className="text-2xl font-medium text-green-700">
                        ${affordableRange.target.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Maximum</p>
                      <p className="text-xl font-medium text-gray-900">
                        ${affordableRange.maximum.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Market Alignment */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Market Alignment
                  </h3>
                  <div
                    className={`p-4 rounded-lg border-2 ${
                      marketAlignment === "below"
                        ? "bg-amber-50 border-amber-300"
                        : marketAlignment === "above"
                          ? "bg-blue-50 border-blue-300"
                          : "bg-green-50 border-green-300"
                    }`}
                  >
                    <p className="font-medium text-lg mb-2">
                      {marketAlignment === "below" && "⚠️ Below Market Rate"}
                      {marketAlignment === "above" && "⬆️ Above Market Rate"}
                      {marketAlignment === "within" && "✅ Within Market Range"}
                    </p>
                    <p className="text-sm text-gray-700">
                      {gap !== null &&
                        (gap > 0
                          ? `You're $${Math.abs(gap).toLocaleString()} above market median`
                          : `You're $${Math.abs(gap).toLocaleString()} below market median`)}
                    </p>
                  </div>
                </div>

                {/* Visual Comparison */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Comparison to Market
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Market 10th %ile</span>
                      <span className="font-medium">
                        $
                        {selectedOccupation.wages.percentile10?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Market 25th %ile</span>
                      <span className="font-medium">
                        $
                        {selectedOccupation.wages.percentile25?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-100 rounded border-2 border-green-300">
                      <span className="font-medium text-gray-700">
                        Market Median
                      </span>
                      <span className="font-bold text-gray-900">
                        $
                        {selectedOccupation.wages.annualMedian?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-100 rounded border-2 border-green-300">
                      <span className="font-medium text-gray-700">
                        Your Target
                      </span>
                      <span className="font-bold text-gray-900">
                        ${affordableRange.target.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Market 75th %ile</span>
                      <span className="font-medium">
                        $
                        {selectedOccupation.wages.percentile75?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Market 90th %ile</span>
                      <span className="font-medium">
                        $
                        {selectedOccupation.wages.percentile90?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => navigate("/position/match")}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back
            </button>

            <button
              onClick={handleContinue}
              disabled={!hasCalculated}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                hasCalculated
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue to Results →
            </button>
          </div>
        </div>

        {/* Data Attribution Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>
            Minimum wage data last updated: {MINIMUM_WAGE_LAST_UPDATED} |
            Source: U.S. Department of Labor
          </p>
          <p className="mt-1">
            Note: Local ordinances may require higher minimum wages. Consult
            your local labor authority.
          </p>
        </div>
      </div>
    </div>
  );
}
