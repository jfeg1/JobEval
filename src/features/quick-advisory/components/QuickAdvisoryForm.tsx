import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuickAdvisoryStore } from "../quickAdvisoryStore";
import { MarketPositioning, MARKET_POSITIONING_LABELS } from "../types";
import { Input, FormField, Button } from "@/shared/components/ui";
import { useCompanyStore } from "@/features/company-setup/companyStore";
import { COUNTRY_CONFIGS, CURRENCY_CONFIGS } from "@/types/i18n";
import type { CountryCode } from "@/types/i18n";

interface FormErrors {
  jobTitle?: string;
  location?: string;
  numEmployees?: string;
  proposedSalary?: string;
  marketPositioning?: string;
  annualRevenue?: string;
  annualPayroll?: string;
}

interface TouchedFields {
  jobTitle?: boolean;
  location?: boolean;
  numEmployees?: boolean;
  proposedSalary?: boolean;
  marketPositioning?: boolean;
  annualRevenue?: boolean;
  annualPayroll?: boolean;
}

/**
 * Get location placeholder based on country
 */
function getLocationPlaceholder(country: CountryCode): string {
  const placeholders: Record<CountryCode, string> = {
    US: "e.g., Austin, TX",
    CA: "e.g., Toronto, ON",
    GB: "e.g., London",
    AU: "e.g., Sydney, NSW",
    DE: "e.g., Berlin",
    FR: "e.g., Paris",
    IT: "e.g., Milan",
    ES: "e.g., Madrid",
    NL: "e.g., Amsterdam",
    SE: "e.g., Stockholm",
    JP: "e.g., Tokyo",
    SG: "e.g., Singapore",
  };
  return placeholders[country] || "e.g., Your city";
}

/**
 * Get location help text based on country
 */
function getLocationHelpText(country: CountryCode): string {
  const countryConfig = COUNTRY_CONFIGS[country];
  if (!countryConfig) return "City and state/province where the work will be performed";

  const divisionType = countryConfig.regionalDivisions.name;
  return `City and ${divisionType.toLowerCase()} where the work will be performed`;
}

const QuickAdvisoryForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    setJobTitle,
    setLocation,
    setNumEmployees,
    setProposedSalary,
    setMarketPositioning,
    setRevenue,
    setPayroll,
  } = useQuickAdvisoryStore();

  const getCountry = useCompanyStore((state) => state.getCountry);
  const getCurrency = useCompanyStore((state) => state.getCurrency);
  const country = getCountry();
  const currency = getCurrency();
  const currencySymbol = CURRENCY_CONFIGS[currency]?.symbol || "$";

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.jobTitle.trim()) {
      errors.jobTitle = "Job title is required";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    if (!formData.numEmployees || formData.numEmployees < 1) {
      errors.numEmployees = "Number of employees must be at least 1";
    }

    if (!formData.proposedSalary || formData.proposedSalary <= 0) {
      errors.proposedSalary = "Proposed salary must be greater than 0";
    }

    if (!formData.marketPositioning) {
      errors.marketPositioning = "Please select a hiring strategy";
    }

    // Optional fields validation - only validate if provided
    if (formData.annualRevenue < 0) {
      errors.annualRevenue = "Revenue cannot be negative";
    }

    if (formData.annualPayroll < 0) {
      errors.annualPayroll = "Payroll cannot be negative";
    }

    return errors;
  };

  const handleBlur = (fieldName: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const fieldErrors = validateForm();
    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldErrors[fieldName],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        jobTitle: true,
        location: true,
        numEmployees: true,
        proposedSalary: true,
        marketPositioning: true,
        annualRevenue: true,
        annualPayroll: true,
      });
      return;
    }

    navigate("/quick/results");
  };

  const formatCurrency = (value: number): string => {
    if (value === 0) return "";
    return value.toLocaleString("en-US");
  };

  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^0-9]/g, "");
    return cleaned === "" ? 0 : parseInt(cleaned, 10);
  };

  const isFormValid = (): boolean => {
    const validationErrors = validateForm();
    return Object.keys(validationErrors).length === 0;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-sage-900 mb-2">Quick Advisory</h1>
        <p className="text-slate-600">Get fast market comparison and affordability check</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields Section */}
        <div className="space-y-6">
          <FormField
            label="Job Title"
            htmlFor="job-title"
            required
            error={touched.jobTitle ? errors.jobTitle : undefined}
            helpText="Enter the exact job title for this position"
          >
            <Input
              id="job-title"
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onBlur={() => handleBlur("jobTitle")}
              error={touched.jobTitle && !!errors.jobTitle}
              placeholder="e.g., Senior Marketing Manager"
            />
          </FormField>

          <FormField
            label="Location"
            htmlFor="location"
            required
            error={touched.location ? errors.location : undefined}
            helpText={getLocationHelpText(country)}
          >
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={() => handleBlur("location")}
              error={touched.location && !!errors.location}
              placeholder={getLocationPlaceholder(country)}
            />
          </FormField>

          <FormField
            label="How many employees will occupy this position?"
            htmlFor="num-employees"
            required
            error={touched.numEmployees ? errors.numEmployees : undefined}
            helpText="Enter the total number of people in this role"
          >
            <Input
              id="num-employees"
              type="number"
              min="1"
              value={formData.numEmployees || ""}
              onChange={(e) => setNumEmployees(parseInt(e.target.value, 10) || 1)}
              onBlur={() => handleBlur("numEmployees")}
              error={touched.numEmployees && !!errors.numEmployees}
              placeholder="1"
            />
          </FormField>

          <FormField
            label="What is your proposed annual salary for this position?"
            htmlFor="proposed-salary"
            required
            error={touched.proposedSalary ? errors.proposedSalary : undefined}
            helpText="Enter the base salary you're considering (excluding benefits)"
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                {currencySymbol}
              </span>
              <Input
                id="proposed-salary"
                type="text"
                value={formatCurrency(formData.proposedSalary)}
                onChange={(e) => setProposedSalary(parseCurrency(e.target.value))}
                onBlur={() => handleBlur("proposedSalary")}
                error={touched.proposedSalary && !!errors.proposedSalary}
                placeholder="0"
                className="pl-8"
              />
            </div>
          </FormField>

          <FormField
            label="What's your hiring strategy for this position?"
            htmlFor="market-positioning"
            required
            error={touched.marketPositioning ? errors.marketPositioning : undefined}
            helpText="This helps us compare your proposed salary to your stated goal"
          >
            <select
              id="market-positioning"
              value={formData.marketPositioning}
              onChange={(e) => setMarketPositioning(e.target.value as MarketPositioning | "")}
              onBlur={() => handleBlur("marketPositioning")}
              className={`input ${touched.marketPositioning && errors.marketPositioning ? "border-red-500 focus:border-red-500" : ""}`}
              aria-invalid={touched.marketPositioning && !!errors.marketPositioning}
              aria-required="true"
            >
              <option value="">Select a hiring strategy...</option>
              {Object.entries(MARKET_POSITIONING_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Optional Fields Section */}
        <div className="pt-6 border-t border-slate-200">
          <h2 className="text-lg font-medium text-sage-900 mb-4">
            Optional: Affordability Analysis
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Providing these details helps us assess if the salary is sustainable for your business
          </p>

          <div className="space-y-6">
            <FormField
              label="Current annual revenue (optional)"
              htmlFor="annual-revenue"
              error={touched.annualRevenue ? errors.annualRevenue : undefined}
              helpText="Helps assess if the salary is sustainable for your business"
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {currencySymbol}
                </span>
                <Input
                  id="annual-revenue"
                  type="text"
                  value={formatCurrency(formData.annualRevenue)}
                  onChange={(e) => setRevenue(parseCurrency(e.target.value))}
                  onBlur={() => handleBlur("annualRevenue")}
                  error={touched.annualRevenue && !!errors.annualRevenue}
                  placeholder="0"
                  className="pl-8"
                />
              </div>
            </FormField>

            <FormField
              label="Current annual payroll expenses (optional)"
              htmlFor="annual-payroll"
              error={touched.annualPayroll ? errors.annualPayroll : undefined}
              helpText="Total payroll costs help determine affordability"
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {currencySymbol}
                </span>
                <Input
                  id="annual-payroll"
                  type="text"
                  value={formatCurrency(formData.annualPayroll)}
                  onChange={(e) => setPayroll(parseCurrency(e.target.value))}
                  onBlur={() => handleBlur("annualPayroll")}
                  error={touched.annualPayroll && !!errors.annualPayroll}
                  placeholder="0"
                  className="pl-8"
                />
              </div>
            </FormField>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-200">
          <Button type="submit" variant="primary" disabled={!isFormValid()}>
            Continue to Results
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuickAdvisoryForm;
