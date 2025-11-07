import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '@/stores';
import { usePositionStore } from '@/stores';
import { useWizardStore } from '@/stores';
import { Input } from '@/components/shared/Input';
import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';

interface FormData {
  title: string;
  department: string;
  reportsTo: string;
}

interface FormErrors {
  title?: string;
  department?: string;
  reportsTo?: string;
}

interface TouchedFields {
  title?: boolean;
  department?: boolean;
  reportsTo?: boolean;
}

const PositionBasic: React.FC = () => {
  const navigate = useNavigate();
  const { profile: companyProfile } = useCompanyStore();
  const { basicInfo, setBasicInfo } = usePositionStore();

  // Redirect if company profile not complete
  useEffect(() => {
    if (!companyProfile) {
      navigate('/setup/company');
    }
  }, [companyProfile, navigate]);

  // Initialize form state from store (if returning to this page)
  const [formData, setFormData] = useState<FormData>({
    title: basicInfo?.title || '',
    department: basicInfo?.department || '',
    reportsTo: basicInfo?.reportsTo || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  // Show loading or null while checking
  if (!companyProfile) {
    return null;
  }

  const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    // Job title validation
    if (!data.title.trim()) {
      errors.title = 'Job title is required';
    } else if (data.title.length < 2) {
      errors.title = 'Job title must be at least 2 characters';
    } else if (data.title.length > 100) {
      errors.title = 'Job title must be less than 100 characters';
    }

    // Department validation
    if (!data.department.trim()) {
      errors.department = 'Department is required';
    } else if (data.department.length < 2) {
      errors.department = 'Department must be at least 2 characters';
    } else if (data.department.length > 50) {
      errors.department = 'Department must be less than 50 characters';
    }

    // Reports To validation
    if (!data.reportsTo.trim()) {
      errors.reportsTo = 'Reporting structure is required';
    } else if (data.reportsTo.length < 2) {
      errors.reportsTo = 'Must be at least 2 characters';
    } else if (data.reportsTo.length > 100) {
      errors.reportsTo = 'Must be less than 100 characters';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validationErrors = validateForm(formData);

    // If errors exist, show them and don't proceed
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        title: true,
        department: true,
        reportsTo: true,
      });
      return;
    }

    // Save to position store
    setBasicInfo({
      title: formData.title.trim(),
      department: formData.department.trim(),
      reportsTo: formData.reportsTo.trim(),
    });

    // Mark step as complete in wizard store
    const { markStepComplete } = useWizardStore.getState();
    markStepComplete(2);

    // Navigate to next page
    navigate('/position/details');
  };

  const handleBack = () => {
    navigate('/setup/company');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Progress indicator placeholder - would be added from WizardLayout */}
      <div className="mb-6 text-sm text-slate-600">Step 2 of 6</div>

      {/* Page header with company context */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-sage-900 mb-2">Position Details</h1>
        {companyProfile && (
          <p className="text-slate-600">
            for <span className="font-medium text-sage-800">{companyProfile.name}</span>
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Job Title"
          htmlFor="job-title"
          required
          error={touched.title ? errors.title : undefined}
          helpText="The official title for this position"
        >
          <Input
            id="job-title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            onBlur={() => handleBlur('title')}
            error={touched.title && !!errors.title}
            placeholder="e.g., Senior Software Engineer"
          />
        </FormField>

        <FormField
          label="Department"
          htmlFor="department"
          required
          error={touched.department ? errors.department : undefined}
          helpText="Which department will this position be part of?"
        >
          <Input
            id="department"
            type="text"
            value={formData.department}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, department: e.target.value }))
            }
            onBlur={() => handleBlur('department')}
            error={touched.department && !!errors.department}
            placeholder="e.g., Engineering, Marketing, Sales"
          />
        </FormField>

        <FormField
          label="Reports To"
          htmlFor="reports-to"
          required
          error={touched.reportsTo ? errors.reportsTo : undefined}
          helpText="Who will this position report to?"
        >
          <Input
            id="reports-to"
            type="text"
            value={formData.reportsTo}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, reportsTo: e.target.value }))
            }
            onBlur={() => handleBlur('reportsTo')}
            error={touched.reportsTo && !!errors.reportsTo}
            placeholder="e.g., VP of Engineering, CEO, Marketing Director"
          />
        </FormField>

        {/* Button bar */}
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
  );
};

export default PositionBasic;
