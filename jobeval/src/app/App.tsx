import { Routes, Route } from "react-router-dom";
import LandingPage from "../features/landing/components/LandingPage";
import CompanySetup from "../features/company-setup/components/CompanySetup";
import PositionBasic from "../features/position-wizard/components/PositionBasic";
import PositionDetails from "../features/position-wizard/components/PositionDetails";
import BLSMatching from "../features/bls-matching/components/BLSMatching";
import Calculator from "../features/calculator/components/Calculator";
import Results from "../features/results/components/Results";
import QuickAdvisoryForm from "../features/quick-advisory/components/QuickAdvisoryForm";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quick" element={<QuickAdvisoryForm />} />
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
