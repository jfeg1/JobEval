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
            Set pay you can explain: score each job on skills, effort, responsibility and working
            conditions, then build a pay structure from the scores.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Job Evaluation Card (recommended) */}
          <div className="md:col-span-3 bg-white rounded-lg shadow-sm border p-8 hover:shadow-md transition-shadow duration-200 border-sage-300">
            <div className="mb-6">
              <div className="text-3xl mb-3">⚖️</div>
              <h2 className="text-2xl font-semibold text-sage-900 mb-2">Job Evaluation</h2>
              <p className="text-sm font-medium text-accent uppercase tracking-wide mb-4">
                Recommended
              </p>
              <p className="text-slate-600 leading-relaxed">
                Rate each job on the four factors in the EU Pay Transparency Directive, set your pay
                philosophy as numbers, and build grades and pay ranges you can explain.
              </p>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-slate-600">
              <li className="flex items-start">
                <span className="text-sage-600 mr-2">✓</span>
                <span>Imports Open Job Analysis files as evidence for each rating</span>
              </li>
              <li className="flex items-start">
                <span className="text-sage-600 mr-2">✓</span>
                <span>Your job values and the market, combined by your own rule</span>
              </li>
              <li className="flex items-start">
                <span className="text-sage-600 mr-2">✓</span>
                <span>Grades, pay by component and an equity check</span>
              </li>
            </ul>

            <Button variant="primary" className="w-full" onClick={() => navigate("/evaluate")}>
              Start Job Evaluation
            </Button>
          </div>

          {/* In-Depth Analysis Card */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm border p-8 hover:shadow-md transition-shadow duration-200 border-slate-200">
            <div className="mb-6">
              <div className="text-3xl mb-3">🎯</div>
              <h2 className="text-2xl font-semibold text-sage-900 mb-2">Budget and market check</h2>
              <p className="text-sm font-medium text-accent uppercase tracking-wide mb-4">
                One job
              </p>
              <p className="text-slate-600 leading-relaxed">
                Describe one job and your company, match it to an occupation, and check a salary
                range against your budget. Uses demonstration data for now.
              </p>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate("/setup/company")}
            >
              Start budget check
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
