import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanyStore } from "@/features/company-setup/companyStore";
import { usePositionStore } from "@/features/position-wizard/positionStore";
import { useMatchingStore } from "../matchingStore";
import { useWizardStore } from "@/features/position-wizard/wizardStore";
import { type BLSOccupation } from "../hooks/useBLSData";
import {
  matchOccupation,
  getOccupation,
  searchOccupations as searchOccupationsNew,
} from "@/utils/occupationMatcher";
import type { Occupation } from "@/types/occupation";
import { Input, Button } from "@/shared/components/ui";

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

interface SearchResult {
  occupation: BLSOccupation;
  confidence?: number;
}

const BLSMatching: React.FC = () => {
  const navigate = useNavigate();
  const { profile: companyProfile } = useCompanyStore();
  const { basicInfo, details } = usePositionStore();
  const { selectedOccupation, selectOccupation, setSearchQuery } = useMatchingStore();

  // Guard: Redirect if prerequisites not complete
  useEffect(() => {
    if (!companyProfile || !basicInfo || !details) {
      navigate("/setup/company");
    }
  }, [companyProfile, basicInfo, details, navigate]);

  // Initialize search with job title
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (basicInfo?.title && !searchInput) {
      setSearchInput(basicInfo.title);
      setSearchQuery(basicInfo.title);
    }
  }, [basicInfo, searchInput, setSearchQuery]);

  // Perform search when input changes
  useEffect(() => {
    if (!searchInput || searchInput.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    // First, try matching
    const matches = matchOccupation(searchInput, { maxResults: 10, minConfidence: 0.2 });

    if (matches.length > 0) {
      // Convert matches to search results
      const results: SearchResult[] = [];

      for (const match of matches) {
        const occupation = getOccupation(match.code);
        if (!occupation) continue;

        const blsOccupation = convertToBLSOccupation(occupation);
        if (!blsOccupation) continue;

        results.push({
          occupation: blsOccupation,
          confidence: match.confidence,
        });
      }

      setSearchResults(results);
    } else {
      // Fallback to keyword search
      const keywordResults = searchOccupationsNew(searchInput, 10);
      const results: SearchResult[] = [];

      for (const occ of keywordResults) {
        const blsOcc = convertToBLSOccupation(occ);
        if (blsOcc) {
          results.push({ occupation: blsOcc });
        }
      }

      setSearchResults(results);
    }
  }, [searchInput]);

  // Show loading while checking guard
  if (!companyProfile || !basicInfo || !details) {
    return null;
  }

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setSearchQuery(value);
  };

  const handleSelectOccupation = (occupation: BLSOccupation) => {
    // Convert to matching store format
    selectOccupation({
      code: occupation.code,
      title: occupation.title,
      group: occupation.group,
      employment: occupation.employment,
      wages: {
        hourlyMean: occupation.wages.hourlyMean,
        hourlyMedian: occupation.wages.hourlyMedian,
        annualMean: occupation.wages.annualMean,
        annualMedian: occupation.wages.annualMedian,
        percentile10: occupation.wages.percentile10,
        percentile25: occupation.wages.percentile25,
        percentile75: occupation.wages.percentile75,
        percentile90: occupation.wages.percentile90,
      },
      dataDate: occupation.dataDate,
    });
  };

  const handleContinue = () => {
    if (!selectedOccupation) return;

    // Mark step as complete
    const { markStepComplete } = useWizardStore.getState();
    markStepComplete(4);

    // Navigate to calculator
    navigate("/calculator");
  };

  const handleBack = () => {
    navigate("/position/details");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Progress indicator */}
      <div className="mb-6 text-sm text-slate-600">Step 4 of 6</div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-sage-900 mb-2">Match to BLS Occupation</h1>
        <p className="text-slate-600">
          Find the occupation code that best matches{" "}
          <span className="font-medium text-sage-800">{basicInfo.title}</span>
        </p>
      </div>

      {/* Search input */}
      <div className="mb-6">
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search occupations by title, group, or code..."
          className="text-lg"
        />
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-slate-600">
          {searchResults.length === 0
            ? "No matches found. Try a different search term."
            : searchResults.length === 1
              ? "1 occupation found"
              : `${searchResults.length} occupations found`}
        </p>
      </div>

      {/* Results list */}
      <div className="space-y-3 mb-8">
        {searchResults.map((result) => {
          const { occupation, confidence } = result;
          const isSelected = selectedOccupation?.code === occupation.code;

          return (
            <div
              key={occupation.code}
              className={`cursor-pointer transition-all rounded-lg border p-4 ${
                isSelected
                  ? "ring-2 ring-sage-500 bg-sage-50 border-sage-300"
                  : "border-slate-200 hover:border-sage-300 bg-white"
              }`}
              onClick={() => handleSelectOccupation(occupation)}
            >
              <div className="flex items-start gap-3">
                {/* Radio indicator */}
                <div className="mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-sage-600 bg-sage-600" : "border-slate-300"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>

                {/* Occupation info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">
                      {occupation.title}
                      {isSelected && (
                        <span className="ml-2 text-sm font-normal text-sage-700">(Selected)</span>
                      )}
                    </h3>
                    {confidence !== undefined && confidence < 1.0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {(confidence * 100).toFixed(0)}% match
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {occupation.code} | {occupation.group}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    Median: {formatCurrency(occupation.wages.annualMedian)}
                  </p>

                  {/* Expanded view for selected */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-sage-200">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">
                        Salary Breakdown
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-slate-600">10th percentile:</span>
                          <span className="ml-2 font-medium text-slate-900">
                            {formatCurrency(occupation.wages.percentile10)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">25th percentile:</span>
                          <span className="ml-2 font-medium text-slate-900">
                            {formatCurrency(occupation.wages.percentile25)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Median (50th):</span>
                          <span className="ml-2 font-medium text-sage-700">
                            {formatCurrency(occupation.wages.annualMedian)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">75th percentile:</span>
                          <span className="ml-2 font-medium text-slate-900">
                            {formatCurrency(occupation.wages.percentile75)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">90th percentile:</span>
                          <span className="ml-2 font-medium text-slate-900">
                            {formatCurrency(occupation.wages.percentile90)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Mean (average):</span>
                          <span className="ml-2 font-medium text-slate-900">
                            {formatCurrency(occupation.wages.annualMean)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Occupation data from O*NET 30.0 • Wage data from BLS • {occupation.dataDate}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button bar */}
      <div className="flex justify-between pt-6 border-t border-slate-200">
        <Button type="button" variant="secondary" onClick={handleBack}>
          Back
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={handleContinue}
          disabled={!selectedOccupation}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default BLSMatching;
