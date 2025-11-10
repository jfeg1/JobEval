/**
 * Navigation component
 *
 * Main navigation bar with Data management controls and Settings link.
 */

import { Link, useLocation } from "react-router-dom";
import { ExportButton } from "@/features/data-management/components/ExportButton";
import { ImportButton } from "@/features/data-management/components/ImportButton";
import { SaveStatusIndicator } from "./SaveStatusIndicator";

export function Navigation() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center justify-between">
          {/* Left side - Logo/Home */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              JobEval
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/settings"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === "/settings"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Settings
              </Link>
            </div>
          </div>

          {/* Right side - Data Controls & Save Status */}
          <div className="flex items-center gap-4">
            {/* Data Management Group */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Data:</span>
              <ExportButton variant="secondary" size="sm" />
              <ImportButton variant="secondary" size="sm" />
            </div>

            {/* Save Status Indicator */}
            <div className="border-l border-gray-300 pl-4">
              <SaveStatusIndicator />
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
          <Link
            to="/settings"
            className={`inline-block text-sm font-medium transition-colors ${
              location.pathname === "/settings"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
