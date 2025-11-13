/**
 * Bug Report Modal Component
 *
 * Modal for submitting bug reports with detailed information about the issue.
 * Auto-detects environment information and validates all required fields.
 */

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { useToast } from "@/shared/components/ui/Toast";
import { submitBugReport, type BugReportData } from "@/lib/api/feedbackService";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<BugReportData>({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    dataContext: "",
    additionalContext: "",
  });

  // Validation function
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.stepsToReproduce.trim()) {
      newErrors.stepsToReproduce = "Steps to reproduce are required";
    }

    if (!formData.expectedBehavior.trim()) {
      newErrors.expectedBehavior = "Expected behavior is required";
    }

    if (!formData.actualBehavior.trim()) {
      newErrors.actualBehavior = "Actual behavior is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitBugReport(formData);

      if (result.success) {
        showToast(`Bug report submitted successfully! Issue #${result.issueNumber}`, "success");
        handleClose();
      } else {
        showToast(result.message || "Failed to submit bug report", "error");
      }
    } catch {
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      title: "",
      description: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
      dataContext: "",
      additionalContext: "",
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: keyof BugReportData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report a Bug"
      size="lg"
      actions={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isSubmitting ? "Submitting..." : "Submit Bug Report"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="bug-title" className="label">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="bug-title"
            type="text"
            placeholder="Brief summary of the issue"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={!!errors.title}
            maxLength={100}
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "bug-title-error" : undefined}
          />
          {errors.title && (
            <p id="bug-title-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.title}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="bug-description" className="label">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="bug-description"
            placeholder="Detailed description of what went wrong"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            error={!!errors.description}
            rows={4}
            maxLength={1000}
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "bug-description-error" : undefined}
          />
          {errors.description && (
            <p id="bug-description-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000</p>
        </div>

        {/* Steps to Reproduce */}
        <div>
          <label htmlFor="bug-steps" className="label">
            Steps to Reproduce <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="bug-steps"
            placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
            value={formData.stepsToReproduce}
            onChange={(e) => handleChange("stepsToReproduce", e.target.value)}
            error={!!errors.stepsToReproduce}
            rows={4}
            maxLength={1000}
            aria-required="true"
            aria-invalid={!!errors.stepsToReproduce}
            aria-describedby={errors.stepsToReproduce ? "bug-steps-error" : undefined}
          />
          {errors.stepsToReproduce && (
            <p id="bug-steps-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.stepsToReproduce}
            </p>
          )}
        </div>

        {/* Expected Behavior */}
        <div>
          <label htmlFor="bug-expected" className="label">
            Expected Behavior <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="bug-expected"
            placeholder="What should have happened?"
            value={formData.expectedBehavior}
            onChange={(e) => handleChange("expectedBehavior", e.target.value)}
            error={!!errors.expectedBehavior}
            rows={3}
            maxLength={500}
            aria-required="true"
            aria-invalid={!!errors.expectedBehavior}
            aria-describedby={errors.expectedBehavior ? "bug-expected-error" : undefined}
          />
          {errors.expectedBehavior && (
            <p id="bug-expected-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.expectedBehavior}
            </p>
          )}
        </div>

        {/* Actual Behavior */}
        <div>
          <label htmlFor="bug-actual" className="label">
            Actual Behavior <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="bug-actual"
            placeholder="What actually happened?"
            value={formData.actualBehavior}
            onChange={(e) => handleChange("actualBehavior", e.target.value)}
            error={!!errors.actualBehavior}
            rows={3}
            maxLength={500}
            aria-required="true"
            aria-invalid={!!errors.actualBehavior}
            aria-describedby={errors.actualBehavior ? "bug-actual-error" : undefined}
          />
          {errors.actualBehavior && (
            <p id="bug-actual-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.actualBehavior}
            </p>
          )}
        </div>

        {/* Data Context (Optional) */}
        <div>
          <label htmlFor="bug-data-context" className="label">
            Data Context <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <Textarea
            id="bug-data-context"
            placeholder="What data were you working with? (e.g., job title, salary range)"
            value={formData.dataContext}
            onChange={(e) => handleChange("dataContext", e.target.value)}
            rows={2}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            Help us understand the context. Do not include sensitive personal information.
          </p>
        </div>

        {/* Additional Context (Optional) */}
        <div>
          <label htmlFor="bug-additional" className="label">
            Additional Context <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <Textarea
            id="bug-additional"
            placeholder="Any other information that might help (screenshots URL, console errors, etc.)"
            value={formData.additionalContext}
            onChange={(e) => handleChange("additionalContext", e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Privacy:</strong> Your browser info, OS, and app version will be included
            automatically. All JobEval data stays local - we only receive what you type here.
          </p>
        </div>
      </form>
    </Modal>
  );
}
