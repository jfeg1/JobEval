import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanyStore } from "../companyStore";
import { useWizardStore } from "@/features/position-wizard/wizardStore";
import { Input, FormField, Button } from "@/shared/components/ui";
import { getAvailableCountries, getCountryMetadata, type CountryCode } from "@/types/i18n";

interface FormData {
  name: string;
  industry: string;
  size: string;
  country: CountryCode;
  region: string;
  location: string;
}

interface FormErrors {
  name?: string;
  industry?: string;
  size?: string;
  country?: string;
  region?: string;
  location?: string;
}

interface TouchedFields {
  name?: boolean;
  industry?: boolean;
  size?: boolean;
  country?: boolean;
  region?: boolean;
  location?: boolean;
}

const CompanySetup: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useCompanyStore();

  const [formData, setFormData] = useState<FormData>({
    name: profile?.name || "",
    industry: profile?.industry || "",
    size: profile?.size || "",
    country: "US", // Default to US
    region: profile?.state || "", // Use state as region for now
    location: profile?.location || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  // Get available countries and metadata for selected country
  const availableCountries = getAvailableCountries();
  const countryMetadata = getCountryMetadata(formData.country);
  const requiresRegion = !!countryMetadata?.regionalDivisions;

  const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.name.trim()) {
      errors.name = "Company name is required";
    } else if (data.name.length < 2) {
      errors.name = "Company name must be at least 2 characters";
    }

    if (!data.industry.trim()) {
      errors.industry = "Industry is required";
    }

    if (!data.size.trim()) {
      errors.size = "Company size is required";
    }

    if (!data.location.trim()) {
      errors.location = "Location is required";
    }

    // Validate region if required for selected country
    const metadata = getCountryMetadata(data.country);
    if (metadata?.regionalDivisions && !data.region.trim()) {
      errors.region = `${metadata.regionalDivisions.name} is required`;
    }

    return errors;
  };

  const handleBlur = (fieldName: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const fieldErrors = validateForm(formData);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldErrors[fieldName],
    }));
  };

  const handleCountryChange = (newCountry: CountryCode) => {
    setFormData((prev) => ({
      ...prev,
      country: newCountry,
      region: "", // Reset region when country changes
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        name: true,
        industry: true,
        size: true,
        country: true,
        region: true,
        location: true,
      });
      return;
    }

    setProfile({
      name: formData.name.trim(),
      industry: formData.industry.trim(),
      size: formData.size.trim(),
      location: formData.location.trim(),
      state: formData.region, // For backwards compatibility
      // Preserve existing values or use defaults (will be filled in later steps)
      annualRevenue: profile?.annualRevenue ?? 0,
      employeeCount: profile?.employeeCount ?? "",
    });

    const { markStepComplete } = useWizardStore.getState();
    markStepComplete(1);

    navigate("/position/basic");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-sage-900 mb-2">Company Setup</h1>
        <p className="text-slate-600">Tell us about your company</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Company Name"
          htmlFor="company-name"
          required
          error={touched.name ? errors.name : undefined}
          helpText="The official name of your company"
        >
          <Input
            id="company-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            onBlur={() => handleBlur("name")}
            error={touched.name && !!errors.name}
            placeholder="e.g., Acme Corporation"
          />
        </FormField>

        <FormField
          label="Country"
          htmlFor="country"
          required
          helpText="Where is your company primarily based?"
        >
          <select
            id="country"
            value={formData.country}
            onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
            className="input"
          >
            {availableCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </FormField>

        {requiresRegion && (
          <FormField
            label={countryMetadata?.regionalDivisions?.name || "Region"}
            htmlFor="region"
            required
            error={touched.region ? errors.region : undefined}
            helpText={`Select your ${(countryMetadata?.regionalDivisions?.name || "region").toLowerCase()}`}
          >
            <Input
              id="region"
              type="text"
              value={formData.region}
              onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
              onBlur={() => handleBlur("region")}
              error={touched.region && !!errors.region}
              placeholder={
                formData.country === "US"
                  ? "e.g., CA"
                  : formData.country === "CA"
                    ? "e.g., ON"
                    : "Region code"
              }
            />
          </FormField>
        )}

        <FormField
          label="Industry"
          htmlFor="industry"
          required
          error={touched.industry ? errors.industry : undefined}
          helpText="What industry does your company operate in?"
        >
          <Input
            id="industry"
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
            onBlur={() => handleBlur("industry")}
            error={touched.industry && !!errors.industry}
            placeholder="e.g., Technology, Healthcare, Finance"
          />
        </FormField>

        <FormField
          label="Company Size"
          htmlFor="company-size"
          required
          error={touched.size ? errors.size : undefined}
          helpText="Number of employees"
        >
          <Input
            id="company-size"
            type="text"
            value={formData.size}
            onChange={(e) => setFormData((prev) => ({ ...prev, size: e.target.value }))}
            onBlur={() => handleBlur("size")}
            error={touched.size && !!errors.size}
            placeholder="e.g., 1-10, 11-50, 51-200, 200+"
          />
        </FormField>

        <FormField
          label="City/Location"
          htmlFor="location"
          required
          error={touched.location ? errors.location : undefined}
          helpText="Primary city or location"
        >
          <Input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            onBlur={() => handleBlur("location")}
            error={touched.location && !!errors.location}
            placeholder={
              formData.country === "US"
                ? "e.g., San Francisco"
                : formData.country === "CA"
                  ? "e.g., Toronto"
                  : "City name"
            }
          />
        </FormField>

        <div className="flex justify-end pt-6 border-t border-slate-200">
          <Button type="submit" variant="primary">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanySetup;
