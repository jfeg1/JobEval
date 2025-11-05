import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage, CompanySetup, PositionBasic } from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup/company" element={<CompanySetup />} />
        <Route path="/position/basic" element={<PositionBasic />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
