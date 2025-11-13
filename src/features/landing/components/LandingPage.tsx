import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-sage-900 mb-4">Welcome to JobEval</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the evaluation approach that best fits your needs
          </p>
        </div>

        {/* Two Cards - Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Quick Advisory Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow duration-200">
            <div className="mb-6">
              <div className="text-3xl mb-3">⚡</div>
              <h2 className="text-2xl font-semibold text-sage-900 mb-2">Quick Advisory</h2>
              <p className="text-sm font-medium text-accent uppercase tracking-wide mb-4">
                2-3 minutes
              </p>
              <p className="text-slate-600 leading-relaxed">
                Get fast market comparison and affordability check for your proposed salary
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-3 mb-8 text-sm text-slate-600">
              <li className="flex items-start">
                <span className="text-sage-600 mr-2">✓</span>
                <span>Rapid market benchmarking</span>
              </li>
              <li className="flex items-start">
                <span className="text-sage-600 mr-2">✓</span>
                <span>Instant affordability analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-sage-600 mr-2">✓</span>
                <span>Quick decision support</span>
              </li>
            </ul>

            <Button variant="primary" className="w-full" onClick={() => navigate("/quick")}>
              Start Quick Advisory
            </Button>
          </div>

          {/* In-Depth Analysis Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow duration-200">
            <div className="mb-6">
              <div className="text-3xl mb-3">🎯</div>
              <h2 className="text-2xl font-semibold text-sage-900 mb-2">In-Depth Analysis</h2>
              <p className="text-sm font-medium text-accent uppercase tracking-wide mb-4">
                30 minutes
              </p>
              <p className="text-slate-600 leading-relaxed">
                Comprehensive point-factor evaluation with detailed job analysis and defensible
                salary justification
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-3 mb-8 text-sm text-slate-600">
              <li className="flex items-start">
                <span className="text-sage-600 mr-2">✓</span>
                <span>Detailed point-factor evaluation</span>
              </li>
              <li className="flex items-start">
                <span className="text-sage-600 mr-2">✓</span>
                <span>Complete job analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-sage-600 mr-2">✓</span>
                <span>Defensible documentation</span>
              </li>
            </ul>

            <Button variant="primary" className="w-full" onClick={() => navigate("/setup/company")}>
              Start In-Depth Analysis
            </Button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <button
            className="text-sm text-slate-500 hover:text-accent transition-colors duration-200 underline"
            onClick={() => {
              // Placeholder for future comparison page
              alert("Comparison guide coming soon!");
            }}
          >
            Not sure? Compare approaches
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
