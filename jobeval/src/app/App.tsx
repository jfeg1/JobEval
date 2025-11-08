import { Routes, Route } from "react-router-dom";
import LandingPage from "../features/landing/components/LandingPage";
import CompanySetup from "../features/company-setup/components/CompanySetup";
import PositionBasic from "../features/position-wizard/components/PositionBasic";
import PositionDetails from "../features/position-wizard/components/PositionDetails";
import BLSMatching from "../features/bls-matching/components/BLSMatching";
import Calculator from "../features/calculator/components/Calculator";
import Results from "../features/results/components/Results";
import "./App.css";

// Placeholder component for Quick Advisory (coming soon)
const QuickAdvisoryPlaceholder = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-light text-sage-900 mb-4">Quick Advisory</h1>
        <p className="text-lg text-slate-600">Coming Soon</p>
        <p className="text-slate-500 mt-4">This feature is currently under development.</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quick" element={<QuickAdvisoryPlaceholder />} />
        <Route path="/setup/company" element={<CompanySetup />} />
        <Route path="/position/basic" element={<PositionBasic />} />
        {/* Placeholder for future routes */}
        <Route path="/position/details" element={<PositionDetails />} />
        <Route path="/position/match" element={<BLSMatching />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </div>
  );
}

export default App;
