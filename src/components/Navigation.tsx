/**
 * Navigation component
 *
 * Main navigation bar with breadcrumbs, data management controls, and Settings link.
 * Includes visual workflow indicators and prominent auto-save status.
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { ExportButton } from "@/features/data-management/components/ExportButton";
import { ImportButton } from "@/features/data-management/components/ImportButton";
import { SaveStatusIndicator } from "./SaveStatusIndicator";

// Define breadcrumb labels for each route
const routeLabels: Record<string, string> = {
  "/": "Home",
  "/quick": "Quick Advisory",
  "/quick/results": "Quick Results",
  "/setup/company": "Company Setup",
  "/position/basic": "Position Info",
  "/position/details": "Position Details",
  "/position/match": "Occupation Matching",
  "/calculator": "Budget Calculator",
  "/results": "Results",
  "/settings": "Settings",
};

// Define which routes should show the "in-workflow" indicator
const workflowRoutes = [
  "/setup/company",
  "/position/basic",
  "/position/details",
  "/position/match",
  "/calculator",
  "/results",
];

// Routes where breadcrumb should be hidden (redundant with page title)
const hideBreadcrumbRoutes = ["/", "/settings"];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentLabel = routeLabels[location.pathname] || "JobEval";
  const isInWorkflow = workflowRoutes.includes(location.pathname);
  const isResultsPage = location.pathname === "/results";
  const showBreadcrumb = !hideBreadcrumbRoutes.includes(location.pathname);
  const isSettingsPage = location.pathname === "/settings";

  const handleLogoClick = (e: React.MouseEvent) => {
    // If in workflow, show confirmation dialog
    if (isInWorkflow && !isResultsPage) {
      const shouldNavigate = window.confirm(
        "Your work is auto-saved every 20 seconds.\n\nNavigating home won't lose your progress, but you'll need to return to this page to continue.\n\nGo to home page?"
      );
      if (!shouldNavigate) {
        e.preventDefault();
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center justify-between">
          {/* Left side - Logo/Home with Breadcrumb */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              onClick={handleLogoClick}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              JobEval <span className="text-xs text-gray-500 font-normal">v0.9</span>
            </Link>

            {/* Breadcrumb for current page (hidden on home and settings) */}
            {showBreadcrumb && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-700">{currentLabel}</span>
              </>
            )}

            {/* In-Workflow Indicator */}
            {isInWorkflow && !isResultsPage && (
              <span className="hidden md:inline-flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                In Progress
              </span>
            )}

            {/* Navigation Links - Hide Settings link when on Settings page */}
            <div className="hidden md:flex items-center gap-4 ml-4">
              {!isSettingsPage && (
                <Link
                  to="/settings"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Settings
                </Link>
              )}
            </div>
          </div>

          {/* Right side - Data Controls & Save Status */}
          <div className="flex items-center gap-4">
            {/* Data Management Group */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Data:</span>
              <ExportButton variant="secondary" size="sm" />
              <ImportButton variant="secondary" size="sm" />
            </div>

            {/* Save Status Indicator - Enhanced visibility */}
            <div className="border-l border-gray-300 pl-4">
              <div className="flex items-center gap-2">
                <SaveStatusIndicator />
                <span className="hidden lg:inline text-xs text-gray-600">Auto-save</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
          {/* Only show Settings link on mobile if not already on Settings page */}
          {!isSettingsPage && (
            <Link
              to="/settings"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Settings
            </Link>
          )}

          {/* Mobile data controls */}
          <div className="flex items-center gap-2">
            <ExportButton variant="secondary" size="sm" />
            <ImportButton variant="secondary" size="sm" />
          </div>
        </div>

        {/* Workflow Progress Notice (mobile) */}
        {isInWorkflow && !isResultsPage && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span>Evaluation in progress - Auto-saving every 20 seconds</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navigation;
