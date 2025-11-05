import { useState } from 'react';
import {
  useCompanyStore,
  usePositionStore,
  useMatchingStore,
  useCalculatorStore,
  useWizardStore,
} from '../stores';

export default function StoreDemo() {
  const [showJson, setShowJson] = useState<string | null>(null);

  // Company Store
  const companyProfile = useCompanyStore((state) => state.profile);
  const setCompanyProfile = useCompanyStore((state) => state.setProfile);
  const clearCompanyProfile = useCompanyStore((state) => state.clearProfile);
  const isCompanyComplete = useCompanyStore((state) => state.isComplete());

  // Position Store
  const positionBasicInfo = usePositionStore((state) => state.basicInfo);
  const positionDetails = usePositionStore((state) => state.details);
  const setBasicInfo = usePositionStore((state) => state.setBasicInfo);
  const setDetails = usePositionStore((state) => state.setDetails);
  const clearPosition = usePositionStore((state) => state.clearPosition);
  const isPositionComplete = usePositionStore((state) => state.isComplete());

  // Matching Store
  const selectedOccupation = useMatchingStore((state) => state.selectedOccupation);
  const searchQuery = useMatchingStore((state) => state.searchQuery);
  const setSearchQuery = useMatchingStore((state) => state.setSearchQuery);
  const selectOccupation = useMatchingStore((state) => state.selectOccupation);
  const clearMatching = useMatchingStore((state) => state.clearSelection);
  const isMatchingComplete = useMatchingStore((state) => state.isComplete());

  // Calculator Store
  const budget = useCalculatorStore((state) => state.budget);
  const result = useCalculatorStore((state) => state.result);
  const setBudget = useCalculatorStore((state) => state.setBudget);
  const setResult = useCalculatorStore((state) => state.setResult);
  const clearCalculator = useCalculatorStore((state) => state.clearCalculator);
  const isCalculatorComplete = useCalculatorStore((state) => state.isComplete());

  // Wizard Store
  const currentStep = useWizardStore((state) => state.currentStep);
  const completedSteps = useWizardStore((state) => state.completedSteps);
  const sessionId = useWizardStore((state) => state.sessionId);
  const setCurrentStep = useWizardStore((state) => state.setCurrentStep);
  const markStepComplete = useWizardStore((state) => state.markStepComplete);
  const markStepIncomplete = useWizardStore((state) => state.markStepIncomplete);
  const resetWizard = useWizardStore((state) => state.resetWizard);

  // Test data generators
  const testCompanyData = () => {
    setCompanyProfile({
      name: 'Acme Corporation',
      industry: 'Technology',
      city: 'San Francisco',
      state: 'CA',
      employeeCount: '51-200',
    });
  };

  const testPositionData = () => {
    setBasicInfo({
      title: 'Senior Software Engineer',
      department: 'Engineering',
      reportsTo: 'VP of Engineering',
    });
    setDetails({
      responsibilities: 'Build and maintain web applications',
      requirements: '5+ years experience with React',
      qualifications: 'BS in Computer Science',
      workEnvironment: 'Hybrid - 3 days in office',
    });
  };

  const testMatchingData = () => {
    selectOccupation({
      code: '15-1252',
      title: 'Software Developers',
      occupationalGroup: 'Computer and Mathematical',
      salaryData: {
        median: 120000,
        mean: 125000,
        percentile10: 70000,
        percentile25: 95000,
        percentile75: 155000,
        percentile90: 180000,
      },
      employmentLevel: 1500000,
      dataYear: '2023',
    });
  };

  const testCalculatorData = () => {
    setBudget({
      minSalary: 100000,
      maxSalary: 130000,
      budgetNotes: 'Based on current team budget',
    });
    setResult({
      competitiveness: 'Competitive',
      score: 75,
      marketPosition: '60th percentile',
      recommendations: [
        'Your budget aligns with market rates',
        'Consider offering equity to stay competitive',
      ],
      calculatedAt: new Date().toISOString(),
    });
  };

  const resetAllStores = () => {
    clearCompanyProfile();
    clearPosition();
    clearMatching();
    clearCalculator();
    resetWizard();
  };

  const getAllState = () => {
    return {
      company: { profile: companyProfile, isComplete: isCompanyComplete },
      position: {
        basicInfo: positionBasicInfo,
        details: positionDetails,
        isComplete: isPositionComplete,
      },
      matching: {
        selectedOccupation,
        searchQuery,
        isComplete: isMatchingComplete,
      },
      calculator: { budget, result, isComplete: isCalculatorComplete },
      wizard: {
        currentStep,
        completedSteps,
        sessionId,
      },
    };
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Store Demo - Zustand State Management</h1>
      <p>Test all stores and view their state in real-time.</p>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={resetAllStores}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reset All Stores
        </button>
        <button
          onClick={() => setShowJson(showJson === 'all' ? null : 'all')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showJson === 'all' ? 'Hide JSON' : 'View All State (JSON)'}
        </button>
      </div>

      {showJson === 'all' && (
        <pre
          style={{
            backgroundColor: '#1f2937',
            color: '#10b981',
            padding: '20px',
            borderRadius: '8px',
            overflow: 'auto',
            marginBottom: '20px',
          }}
        >
          {JSON.stringify(getAllState(), null, 2)}
        </pre>
      )}

      {/* Company Store */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2>1. Company Store {isCompanyComplete && '✓'}</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>State:</strong> {companyProfile ? `${companyProfile.name} (${companyProfile.city}, ${companyProfile.state})` : 'No data'}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={testCompanyData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Load Test Data
          </button>
          <button
            onClick={clearCompanyProfile}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setShowJson(showJson === 'company' ? null : 'company')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0891b2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showJson === 'company' ? 'Hide' : 'Show'} JSON
          </button>
        </div>
        {showJson === 'company' && (
          <pre style={{ backgroundColor: '#f3f4f6', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
            {JSON.stringify(companyProfile, null, 2)}
          </pre>
        )}
      </div>

      {/* Position Store */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2>2. Position Store {isPositionComplete && '✓'}</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>Basic Info:</strong> {positionBasicInfo ? positionBasicInfo.title : 'No data'}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Details:</strong> {positionDetails ? 'Set' : 'Not set'}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={testPositionData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Load Test Data
          </button>
          <button
            onClick={clearPosition}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setShowJson(showJson === 'position' ? null : 'position')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0891b2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showJson === 'position' ? 'Hide' : 'Show'} JSON
          </button>
        </div>
        {showJson === 'position' && (
          <pre style={{ backgroundColor: '#f3f4f6', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
            {JSON.stringify({ basicInfo: positionBasicInfo, details: positionDetails }, null, 2)}
          </pre>
        )}
      </div>

      {/* Matching Store */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2>3. Matching Store {isMatchingComplete && '✓'}</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>Selected:</strong> {selectedOccupation ? `${selectedOccupation.code} - ${selectedOccupation.title}` : 'None'}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Search Query:</strong> {searchQuery || 'Empty'}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Test search query"
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={testMatchingData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Load Test Occupation
          </button>
          <button
            onClick={clearMatching}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setShowJson(showJson === 'matching' ? null : 'matching')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0891b2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showJson === 'matching' ? 'Hide' : 'Show'} JSON
          </button>
        </div>
        {showJson === 'matching' && (
          <pre style={{ backgroundColor: '#f3f4f6', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
            {JSON.stringify({ selectedOccupation, searchQuery }, null, 2)}
          </pre>
        )}
      </div>

      {/* Calculator Store */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2>4. Calculator Store {isCalculatorComplete && '✓'}</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>Budget:</strong> {budget ? `$${budget.minSalary.toLocaleString()} - $${budget.maxSalary.toLocaleString()}` : 'Not set'}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Result:</strong> {result ? `${result.competitiveness} (Score: ${result.score})` : 'Not calculated'}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={testCalculatorData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Load Test Data
          </button>
          <button
            onClick={clearCalculator}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setShowJson(showJson === 'calculator' ? null : 'calculator')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0891b2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showJson === 'calculator' ? 'Hide' : 'Show'} JSON
          </button>
        </div>
        {showJson === 'calculator' && (
          <pre style={{ backgroundColor: '#f3f4f6', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
            {JSON.stringify({ budget, result }, null, 2)}
          </pre>
        )}
      </div>

      {/* Wizard Store */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2>5. Wizard Store</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>Session ID:</strong> {sessionId}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Current Step:</strong> {currentStep}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Completed Steps:</strong> {completedSteps.join(', ') || 'None'}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              style={{
                padding: '8px 16px',
                backgroundColor: currentStep === step ? '#2563eb' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Go to Step {step}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <button
              key={step}
              onClick={() =>
                completedSteps.includes(step) ? markStepIncomplete(step) : markStepComplete(step)
              }
              style={{
                padding: '8px 16px',
                backgroundColor: completedSteps.includes(step) ? '#059669' : '#d1d5db',
                color: completedSteps.includes(step) ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {completedSteps.includes(step) ? '✓' : ''} Step {step}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
        <h3>Testing Instructions</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>Click "Load Test Data" buttons to populate each store</li>
          <li>Check that isComplete() shows ✓ when data is valid</li>
          <li>Use "Show JSON" to inspect raw state</li>
          <li>Test wizard navigation and step completion</li>
          <li>Click "Reset All Stores" to clear everything</li>
          <li>Open React DevTools to verify state updates</li>
        </ul>
      </div>
    </div>
  );
}
