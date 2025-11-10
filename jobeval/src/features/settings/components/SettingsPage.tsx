/**
 * SettingsPage component
 *
 * Provides a settings interface for managing app configuration and data.
 * Includes data management section with Export and Import functionality.
 */

import { ExportButton } from "@/features/data-management/components/ExportButton";
import { ImportButton } from "@/features/data-management/components/ImportButton";

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your JobEval preferences and data</p>
        </div>

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

        {/* Additional Settings Sections Can Be Added Here */}
      </div>
    </div>
  );
}

export default SettingsPage;
