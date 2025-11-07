import { Routes, Route, Navigate } from 'react-router-dom';
import CompanySetup from './pages/CompanySetup';
import PositionBasic from './pages/PositionBasic';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/setup/company" replace />} />
        <Route path="/setup/company" element={<CompanySetup />} />
        <Route path="/position/basic" element={<PositionBasic />} />
        {/* Placeholder for future routes */}
        <Route
          path="/position/details"
          element={
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl">Position Details (Coming Soon)</h1>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
