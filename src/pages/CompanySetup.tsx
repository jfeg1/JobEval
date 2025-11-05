import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore, useWizardStore } from '@/stores';
import { Input, Select, RadioGroup, FormField, Button } from '@/components/shared';
import { US_STATES, INDUSTRIES, EMPLOYEE_COUNT_OPTIONS } from '@/constants/formOptions';

interface FormData {
  name: string;
  industry: string;
  city: string;
  state: string;
  employeeCount: string;
}

interface FormErrors {
  name?: string;
  industry?: string;
  city?: string;
  state?: string;
  employeeCount?: string;
}

interface TouchedFields {
  name?: boolean;
  industry?: boolean;
  city?: boolean;
  state?: boolean;
  employeeCount?: boolean;
}

const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};

  // Company name validation
  if (!data.name.trim()) {
    errors.name = 'Company name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Company name must be at least 2 characters';
  } else if (data.name.length > 100) {
    errors.name = 'Company name must be less than 100 characters';
  }

  // Industry validation
  if (!data.industry) {
    errors.industry = 'Please select an industry';
  }

  // City validation
  if (!data.city.trim()) {
    errors.city = 'City is required';
  } else if (data.city.length < 2) {
    errors.city = 'City must be at least 2 characters';
  }

  // State validation
  if (!data.state) {
    errors.state = 'Please select a state';
  }

  // Employee count validation
  if (!data.employeeCount) {
    errors.employeeCount = 'Please select company size';
  }

  return errors;
};

export const CompanySetup = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useCompanyStore();
  const { markStepComplete } = useWizardStore();

  // Initialize form state from store (if returning to this page)
  const [formData, setFormData] = useState<FormData>({
    name: profile?.name || '',
    industry: profile?.industry || '',
    city: profile?.city || '',
    state: profile?.state || '',
    employeeCount: profile?.employeeCount || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const handleBlur = (fieldName: keyof FormData) => {
    // Mark field as touched
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    // Validate just this field
    const fieldErrors = validateForm(formData);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldErrors[fieldName],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validationErrors = validateForm(formData);

    // If errors exist, show them and don't proceed
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Mark all fields as touched so errors show
      setTouched({
        name: true,
        industry: true,
        city: true,
        state: true,
        employeeCount: true,
      });
      return;
    }

    // Save to store
    setProfile({
      name: formData.name.trim(),
      industry: formData.industry,
      city: formData.city.trim(),
      state: formData.state,
      employeeCount: formData.employeeCount,
    });

    // Mark step as complete
    markStepComplete(1);

    // Navigate to next page
    navigate('/position/basic');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-beige-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <p className="text-sm text-slate-600 mb-2">Step 1 of 6</p>
          <div className="flex gap-2">
            <div className="h-2 flex-1 bg-sage-600 rounded-full"></div>
            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-sage-900 mb-2">
            Tell us about your company
          </h1>
          <p className="text-slate-600">
            We'll use this to provide context for salary recommendations
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <FormField
            label="Company Name"
            htmlFor="company-name"
            required
            error={touched.name ? errors.name : undefined}
          >
            <Input
              id="company-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              onBlur={() => handleBlur('name')}
              error={touched.name && !!errors.name}
              placeholder="e.g., Acme Corporation"
              aria-required="true"
            />
          </FormField>

          {/* Industry */}
          <FormField
            label="Industry"
            htmlFor="industry"
            required
            error={touched.industry ? errors.industry : undefined}
          >
            <Select
              id="industry"
              options={INDUSTRIES}
              value={formData.industry}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, industry: e.target.value }))
              }
              onBlur={() => handleBlur('industry')}
              error={touched.industry && !!errors.industry}
              placeholder="Select your industry..."
              aria-required="true"
            />
          </FormField>

          {/* Location - City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="City"
              htmlFor="city"
              required
              error={touched.city ? errors.city : undefined}
            >
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                onBlur={() => handleBlur('city')}
                error={touched.city && !!errors.city}
                placeholder="e.g., San Francisco"
                aria-required="true"
              />
            </FormField>

            <FormField
              label="State"
              htmlFor="state"
              required
              error={touched.state ? errors.state : undefined}
            >
              <Select
                id="state"
                options={US_STATES}
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                onBlur={() => handleBlur('state')}
                error={touched.state && !!errors.state}
                placeholder="Select state..."
                aria-required="true"
              />
            </FormField>
          </div>

          {/* Company Size (Employee Count) */}
          <FormField
            label="Company Size"
            htmlFor="employee-count"
            required
            error={touched.employeeCount ? errors.employeeCount : undefined}
          >
            <RadioGroup
              name="employee-count"
              options={EMPLOYEE_COUNT_OPTIONS}
              value={formData.employeeCount}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, employeeCount: value }))
              }
              error={touched.employeeCount && !!errors.employeeCount}
            />
          </FormField>

          {/* Button Bar */}
          <div className="flex justify-between pt-6 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>

            <Button type="submit" variant="primary">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
