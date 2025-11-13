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
import { BugReportModal } from "@/components/feedback/BugReportModal";
import { FeatureRequestModal } from "@/components/feedback/FeatureRequestModal";

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
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isFeatureRequestOpen, setIsFeatureRequestOpen] = useState(false);

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

        {/* Help & Feedback Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Help & Feedback</h2>
          <p className="text-gray-600 mb-6">
            Get help, report issues, or suggest improvements for JobEval.
          </p>

          <div className="space-y-4 mb-6">
            {/* Report Bug */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Report a Bug</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Found something that's not working? Let us know so we can fix it.
                </p>
                <Button variant="secondary" onClick={() => setIsBugReportOpen(true)}>
                  Report Bug
                </Button>
              </div>
            </div>

            {/* Request Feature */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Request a Feature</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Have an idea to improve JobEval? We'd love to hear your suggestions.
                </p>
                <Button variant="secondary" onClick={() => setIsFeatureRequestOpen(true)}>
                  Request Feature
                </Button>
              </div>
            </div>

            {/* External Resources */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Documentation & Support</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Access guides, join discussions, or contact the team directly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/jfeg1/JobEval#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Documentation
                  </a>
                  <a
                    href="https://github.com/jfeg1/JobEval/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Community Discussions
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900">
              <span className="font-semibold">Beta Feedback:</span> Your input helps shape JobEval!
              All feedback creates a GitHub issue that we review and prioritize.
            </p>
          </div>
        </section>
      </div>

      {/* Feedback Modals */}
      <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />
      <FeatureRequestModal
        isOpen={isFeatureRequestOpen}
        onClose={() => setIsFeatureRequestOpen(false)}
      />
    </div>
  );
}

export default SettingsPage;
