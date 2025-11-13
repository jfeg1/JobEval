import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../features/landing/components/LandingPage";
import CompanySetup from "../features/company-setup/components/CompanySetup";
import PositionBasic from "../features/position-wizard/components/PositionBasic";
import PositionDetails from "../features/position-wizard/components/PositionDetails";
import BLSMatching from "../features/bls-matching/components/BLSMatching";
import Calculator from "../features/calculator/components/Calculator";
import Results from "../features/results/components/Results";
import QuickAdvisoryForm from "../features/quick-advisory/components/QuickAdvisoryForm";
import QuickAdvisoryResults from "../features/quick-advisory/components/QuickAdvisoryResults";
import SettingsPage from "../features/settings/components/SettingsPage";
import { StartupModal } from "../features/data-management/components/StartupModal";
import { Navigation } from "../components/Navigation";
import { BetaBanner } from "../components/BetaBanner/BetaBanner";
import { Footer } from "../components/Footer/Footer";
import { BugReportModal } from "../components/feedback/BugReportModal";
import { FeatureRequestModal } from "../components/feedback/FeatureRequestModal";
import { initializeAutoSave } from "../lib/persistence/autoSaveManager";
import "./App.css";

function App() {
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isFeatureRequestOpen, setIsFeatureRequestOpen] = useState(false);

  useEffect(() => {
    // Initialize auto-save on app mount
    initializeAutoSave({
      intervalMs: 20000, // 20 seconds
    });
  }, []);

  return (
    <>
      {/* Startup modal for restoring previous work */}
      <StartupModal />

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Beta Banner */}
        <BetaBanner
          onReportBug={() => setIsBugReportOpen(true)}
          onRequestFeature={() => setIsFeatureRequestOpen(true)}
        />

        {/* Navigation with data controls */}
        <Navigation />

        {/* Main content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/quick" element={<QuickAdvisoryForm />} />
            <Route path="/quick/results" element={<QuickAdvisoryResults />} />
            <Route path="/setup/company" element={<CompanySetup />} />
            <Route path="/position/basic" element={<PositionBasic />} />
            {/* Placeholder for future routes */}
            <Route path="/position/details" element={<PositionDetails />} />
            <Route path="/position/match" element={<BLSMatching />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/results" element={<Results />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer
          onReportBug={() => setIsBugReportOpen(true)}
          onRequestFeature={() => setIsFeatureRequestOpen(true)}
        />
      </div>

      {/* Feedback Modals */}
      <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />
      <FeatureRequestModal
        isOpen={isFeatureRequestOpen}
        onClose={() => setIsFeatureRequestOpen(false)}
      />
    </>
  );
}

export default App;
