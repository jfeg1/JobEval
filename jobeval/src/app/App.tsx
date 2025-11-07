import { Routes, Route, Navigate } from 'react-router-dom';
import CompanySetup from '../features/company-setup/components/CompanySetup';
import PositionBasic from '../features/position-wizard/components/PositionBasic';
import PositionDetails from '../features/position-wizard/components/PositionDetails';
import BLSMatching from '../features/bls-matching/components/BLSMatching';
import Calculator from '../features/calculator/components/Calculator';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/setup/company" replace />} />
        <Route path="/setup/company" element={<CompanySetup />} />
        <Route path="/position/basic" element={<PositionBasic />} />
        {/* Placeholder for future routes */}
        <Route path="/position/details" element={<PositionDetails />} />
        <Route path="/position/match" element={<BLSMatching />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/results" element={<div className="container mx-auto px-4 py-8"><h1 className="text-2xl">Results (Coming Soon)</h1></div>} />
      </Routes>
    </div>
  );
}

export default App;
