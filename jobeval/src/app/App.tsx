import { useEffect } from "react";
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
import { StartupModal } from "../features/data-management/components/StartupModal";
import { SaveStatusIndicator } from "../components/SaveStatusIndicator";
import { initializeAutoSave } from "../lib/persistence/autoSaveManager";
import "./App.css";

function App() {
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

      <div className="min-h-screen bg-gray-50">
        {/* Header with save status indicator */}
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
            <SaveStatusIndicator />
          </div>
        </header>

        {/* Main content */}
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
        </Routes>
      </div>
    </>
  );
}

export default App;
