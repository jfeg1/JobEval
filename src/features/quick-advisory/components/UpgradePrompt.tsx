import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui";
import { transferQuickDataToWizard } from "@/utils/dataTransfer";
import { useCompanyStore } from "@/features/company-setup/companyStore";
import { CURRENCY_CONFIGS } from "@/types/i18n";

interface UpgradePromptProps {
  jobTitle?: string;
  location?: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ jobTitle, location }) => {
  const navigate = useNavigate();
  const getCurrency = useCompanyStore((state) => state.getCurrency);
  const currency = getCurrency();
  const currencyName = CURRENCY_CONFIGS[currency]?.name || currency;
  const [isTransferring, setIsTransferring] = useState(false);

  const handleUpgrade = () => {
    setIsTransferring(true);

    try {
      // Transfer Quick Advisory data to wizard stores
      const result = transferQuickDataToWizard();

      if (result.success) {
        console.log(
          `[UpgradePrompt] Successfully transferred ${result.fieldsTransferred.length} fields`,
          result.fieldsTransferred
        );
      } else {
        // Log errors but don't block navigation - graceful degradation
        console.warn("[UpgradePrompt] Transfer completed with errors:", result.errors);
      }
    } catch (error) {
      // Even if transfer fails completely, allow user to proceed to wizard
      console.error("[UpgradePrompt] Unexpected error during transfer:", error);
    } finally {
      setIsTransferring(false);
      // Navigate to company setup (first step of wizard) regardless of transfer result
      navigate("/setup/company");
    }
  };

  return (
    <div className="bg-gradient-to-br from-sage-50 to-slate-50 rounded-lg border-2 border-sage-200 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-sage-600 text-white rounded-lg flex items-center justify-center text-2xl">
          ✦
        </div>

        {/* Content */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-sage-900 mb-2">
            Want a More Detailed Analysis?
          </h2>

          <p className="text-slate-700 mb-4">
            Our in-depth advisory uses point-factor methodology to evaluate knowledge requirements,
            decision-making authority, organizational impact, and working conditions. This provides
            defensible, comprehensive salary justification (takes ~30 minutes).
          </p>

          {/* Benefits list */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              What you'll get with in-depth analysis:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-sage-600 font-semibold mt-0.5">✓</span>
                <span>Systematic job evaluation using proven point-factor methodology</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-sage-600 font-semibold mt-0.5">✓</span>
                <span>Defensible salary structure for compliance and internal equity</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-sage-600 font-semibold mt-0.5">✓</span>
                <span>Detailed breakdown of job factors and their monetary value</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-sage-600 font-semibold mt-0.5">✓</span>
                <span>Comprehensive market comparison with similar positions</span>
              </li>
            </ul>
          </div>

          {/* Call to action */}
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={handleUpgrade}
              disabled={isTransferring}
              className="flex-shrink-0"
            >
              {isTransferring ? "Transferring data..." : "Upgrade to In-Depth Analysis"}
            </Button>
            <div className="text-xs text-slate-500">
              <p>
                {jobTitle && location
                  ? `We'll pre-fill your details for ${jobTitle} in ${location}`
                  : "Your Quick Advisory data will be carried over"}
              </p>
              {currency !== "USD" && <p className="mt-1">Supports {currencyName}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
