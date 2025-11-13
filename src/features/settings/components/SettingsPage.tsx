/**
 * SettingsPage component
 *
 * Provides a settings interface for managing app configuration and data.
 * Includes data management, company profile editing, and position history.
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ExportButton } from "@/features/data-management/components/ExportButton";
import { ImportButton } from "@/features/data-management/components/ImportButton";
import { useCompanyStore } from "@/features/company-setup/companyStore";
import { usePositionStore } from "@/features/position-wizard/positionStore";
import { useMatchingStore } from "@/features/bls-matching/matchingStore";
import { useCalculatorStore } from "@/features/calculator/calculatorStore";
import { Button } from "@/shared/components/ui";

interface EvaluatedPosition {
  title: string;
  department: string;
  occupationTitle: string;
  targetSalary: number;
  evaluatedAt: string;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useCompanyStore();
  const { basicInfo: position } = usePositionStore();
  const { selectedOccupation } = useMatchingStore();
  const { affordableRange } = useCalculatorStore();

  // Check if we came from Results page (user can go back)
  const canGoBack = location.state?.from === "/results";

  // Check if there's a completed evaluation
  const hasCompletedEvaluation = !!(profile && position && selectedOccupation && affordableRange);

  const [evaluatedPositions, setEvaluatedPositions] = useState<EvaluatedPosition[]>([]);

  useEffect(() => {
    // Load position history from localStorage
    const stored = localStorage.getItem("jobeval_position_history");
    if (stored) {
      try {
        setEvaluatedPositions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load position history:", e);
      }
    }
  }, []);

  const handleBackToResults = () => {
    navigate("/results");
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all position history? This cannot be undone.")) {
      localStorage.removeItem("jobeval_position_history");
      setEvaluatedPositions([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header with Back Button */}
        <div className="mb-8">
          {canGoBack && (
            <button
              onClick={handleBackToResults}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            >
              <span className="mr-2">←</span>
              Back to Results
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your JobEval preferences and data</p>
        </div>

        {/* Company Profile Section */}
        {profile && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Company Profile</h2>
            <p className="text-gray-600 mb-6">
              View or update your company information, including payroll for multi-position
              tracking.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Company Name:</span>
                <span className="font-medium text-gray-900">{profile.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Industry:</span>
                <span className="font-medium text-gray-900">{profile.industry}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">{profile.location}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Annual Revenue:</span>
                <span className="font-medium text-gray-900">
                  ${profile.annualRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Current Payroll:</span>
                <span className="font-medium text-gray-900">
                  ${(profile.currentPayroll || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Employees:</span>
                <span className="font-medium text-gray-900">{profile.employeeCount}</span>
              </div>
            </div>

            <Button variant="secondary" onClick={() => navigate("/setup/company")}>
              Edit Company Profile
            </Button>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">💡 Multi-Position Tracking:</span> After evaluating
                each position, return here to update your Current Payroll to reflect the cumulative
                salary commitments. This helps track your total payroll impact across multiple
                hires.
              </p>
            </div>
          </section>
        )}

        {/* Current Evaluation Section */}
        {hasCompletedEvaluation && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Current Evaluation</h2>
            <p className="text-gray-600 mb-6">
              Your in-progress or most recently completed position evaluation.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{position.title}</h3>
                  <p className="text-sm text-gray-600">
                    {position.department} • Matched to: {selectedOccupation.title}
                  </p>
                  <p className="text-sm font-medium text-green-700 mt-2">
                    Target Salary: ${affordableRange.target.toLocaleString()}
                  </p>
                </div>
                <Button variant="primary" onClick={() => navigate("/results")}>
                  View Results
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                <span className="font-semibold">💾 Note:</span> This evaluation is auto-saved. You
                can return to it anytime by clicking "View Results" or navigating through the
                workflow.
              </p>
            </div>
          </section>
        )}

        {/* Position History Section */}
        {evaluatedPositions.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-semibold text-gray-900">Position History</h2>
              <button
                onClick={handleClearHistory}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Clear History
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Previously evaluated positions (beta feature - basic tracking only).
            </p>

            <div className="space-y-3">
              {evaluatedPositions.map((pos, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{pos.title}</h3>
                    <p className="text-sm text-gray-600">
                      {pos.department} • {pos.occupationTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Evaluated: {new Date(pos.evaluatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${pos.targetSalary.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Target salary</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">⚠️ Beta Limitation:</span> Position history is for
                reference only. Full position management (edit, delete, status tracking) will be
                available in v1.0.
              </p>
            </div>
          </section>
        )}

        {/* Data Management Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Data Management</h2>
          <p className="text-gray-600 mb-6">
            Export your data for backup or import previously saved work.
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <ExportButton variant="primary" size="md" />
            <ImportButton variant="secondary" size="md" />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
            <p className="text-blue-900">
              <span className="text-lg mr-2" role="img" aria-label="lightbulb">
                💡
              </span>
              <strong>Tip:</strong> Export your data regularly to prevent loss if browser cache is
              cleared.
            </p>
            <p className="text-blue-800">
              Your data is stored locally and never sent to our servers.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
