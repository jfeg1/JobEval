import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '@/features/company-setup/companyStore';
import { usePositionStore } from '../positionStore';
import { useWizardStore } from '../wizardStore';
import { FormField, Textarea, Button } from '@/shared/components/ui';

interface FormData {
  responsibilities: string;
  requirements: string;
  qualifications: string;
  workEnvironment: string;
}

interface FormErrors {
  responsibilities?: string;
  requirements?: string;
  qualifications?: string;
  workEnvironment?: string;
}

interface TouchedFields {
  responsibilities?: boolean;
  requirements?: boolean;
  qualifications?: boolean;
  workEnvironment?: boolean;
}

export default function PositionDetails() {
  const navigate = useNavigate();
  const { profile: companyProfile } = useCompanyStore();
  const { basicInfo, details, setDetails } = usePositionStore();
  const { markStepComplete } = useWizardStore();

  // Guard: Redirect if prerequisites not complete
  useEffect(() => {
    if (!companyProfile || !basicInfo) {
      navigate('/setup/company');
    }
  }, [companyProfile, basicInfo, navigate]);

  // Initialize form state from store (if returning to this page)
  const [formData, setFormData] = useState<FormData>({
    responsibilities: details?.responsibilities || '',
    requirements: details?.requirements || '',
    qualifications: details?.qualifications || '',
    workEnvironment: details?.workEnvironment || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  // Show loading while checking guard
  if (!companyProfile || !basicInfo) {
    return null;
  }

  const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    // Responsibilities validation
    if (!data.responsibilities.trim()) {
      errors.responsibilities = 'Key responsibilities are required';
    } else if (data.responsibilities.length < 20) {
      errors.responsibilities = 'Please provide at least 20 characters';
    } else if (data.responsibilities.length > 2000) {
      errors.responsibilities = 'Must be less than 2000 characters';
    }

    // Requirements validation
    if (!data.requirements.trim()) {
      errors.requirements = 'Required skills are required';
    } else if (data.requirements.length < 20) {
      errors.requirements = 'Please provide at least 20 characters';
    } else if (data.requirements.length > 2000) {
      errors.requirements = 'Must be less than 2000 characters';
    }

    // Qualifications validation
    if (!data.qualifications.trim()) {
      errors.qualifications = 'Preferred qualifications are required';
    } else if (data.qualifications.length < 10) {
      errors.qualifications = 'Please provide at least 10 characters';
    } else if (data.qualifications.length > 1000) {
      errors.qualifications = 'Must be less than 1000 characters';
    }

    // Work environment validation
    if (!data.workEnvironment.trim()) {
      errors.workEnvironment = 'Work environment details are required';
    } else if (data.workEnvironment.length < 10) {
      errors.workEnvironment = 'Please provide at least 10 characters';
    } else if (data.workEnvironment.length > 1000) {
      errors.workEnvironment = 'Must be less than 1000 characters';
    }

    return errors;
  };

  const handleBlur = (fieldName: keyof FormData) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    const fieldErrors = validateForm(formData);
    setErrors(prev => ({
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
        responsibilities: true,
        requirements: true,
        qualifications: true,
        workEnvironment: true,
      });
      return;
    }

    // Save to position store
    setDetails({
      responsibilities: formData.responsibilities.trim(),
      requirements: formData.requirements.trim(),
      qualifications: formData.qualifications.trim(),
      workEnvironment: formData.workEnvironment.trim(),
    });

    // Mark step as complete in wizard store
    markStepComplete(3);

    // Navigate to next page
    navigate('/position/match');
  };

  const handleBack = () => {
    navigate('/position/basic');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Page header with job title context */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-sage-900 mb-2">
          Job Details
        </h1>
        <p className="text-slate-600">
          for <span className="font-medium text-sage-800">{basicInfo.title}</span>
          {' '}at <span className="font-medium text-sage-800">{companyProfile.name}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Key Responsibilities"
          htmlFor="responsibilities"
          required
          error={touched.responsibilities ? errors.responsibilities : undefined}
          helpText="What will this person do day-to-day? List key tasks and objectives."
        >
          <Textarea
            id="responsibilities"
            rows={6}
            value={formData.responsibilities}
            onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
            onBlur={() => handleBlur('responsibilities')}
            error={touched.responsibilities && !!errors.responsibilities}
            placeholder="List the main duties and responsibilities for this role..."
          />
        </FormField>

        <FormField
          label="Required Skills & Experience"
          htmlFor="requirements"
          required
          error={touched.requirements ? errors.requirements : undefined}
          helpText="List must-have requirements (e.g., degree, certifications, years of experience, technical skills)."
        >
          <Textarea
            id="requirements"
            rows={6}
            value={formData.requirements}
            onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
            onBlur={() => handleBlur('requirements')}
            error={touched.requirements && !!errors.requirements}
            placeholder="What skills, education, and experience are absolutely necessary?"
          />
        </FormField>

        <FormField
          label="Preferred Qualifications"
          htmlFor="qualifications"
          required
          error={touched.qualifications ? errors.qualifications : undefined}
          helpText="List bonus qualifications that would make a candidate stand out."
        >
          <Textarea
            id="qualifications"
            rows={4}
            value={formData.qualifications}
            onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
            onBlur={() => handleBlur('qualifications')}
            error={touched.qualifications && !!errors.qualifications}
            placeholder="What would be nice to have but isn't required?"
          />
        </FormField>

        <FormField
          label="Work Environment"
          htmlFor="work-environment"
          required
          error={touched.workEnvironment ? errors.workEnvironment : undefined}
          helpText="Describe where and how this person will work (location, schedule, team structure)."
        >
          <Textarea
            id="work-environment"
            rows={4}
            value={formData.workEnvironment}
            onChange={(e) => setFormData(prev => ({ ...prev, workEnvironment: e.target.value }))}
            onBlur={() => handleBlur('workEnvironment')}
            error={touched.workEnvironment && !!errors.workEnvironment}
            placeholder="Remote, hybrid, or in-office? Team size? Travel requirements?"
          />
        </FormField>

        {/* Button bar */}
        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
          >
            Back
          </Button>

          <Button
            type="submit"
            variant="primary"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
