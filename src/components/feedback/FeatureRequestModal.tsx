/**
 * Feature Request Modal Component
 *
 * Modal for submitting feature requests with detailed information about the proposed feature.
 * Auto-detects environment information and validates all required fields.
 */

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { useToast } from "@/shared/components/ui/Toast";
import { submitFeatureRequest, type FeatureRequestData } from "@/lib/api/feedbackService";

interface FeatureRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  problemStatement?: string;
  proposedSolution?: string;
}

export function FeatureRequestModal({ isOpen, onClose }: FeatureRequestModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FeatureRequestData>({
    title: "",
    description: "",
    problemStatement: "",
    proposedSolution: "",
    alternatives: "",
    scope: "Both",
    priority: "Medium",
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

    if (!formData.problemStatement.trim()) {
      newErrors.problemStatement = "Problem statement is required";
    }

    if (!formData.proposedSolution.trim()) {
      newErrors.proposedSolution = "Proposed solution is required";
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
      const result = await submitFeatureRequest(formData);

      if (result.success) {
        showToast(
          `Feature request submitted successfully! Issue #${result.issueNumber}`,
          "success"
        );
        handleClose();
      } else {
        showToast(result.message || "Failed to submit feature request", "error");
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
      problemStatement: "",
      proposedSolution: "",
      alternatives: "",
      scope: "Both",
      priority: "Medium",
    });
    setErrors({});
    onClose();
  };

  const handleChange = (
    field: keyof FeatureRequestData,
    value: string | FeatureRequestData["scope"] | FeatureRequestData["priority"]
  ) => {
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
      title="Request a Feature"
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
            {isSubmitting ? "Submitting..." : "Submit Feature Request"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="feature-title" className="label">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="feature-title"
            type="text"
            placeholder="Brief summary of the feature"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={!!errors.title}
            maxLength={100}
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "feature-title-error" : undefined}
          />
          {errors.title && (
            <p id="feature-title-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.title}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="feature-description" className="label">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="feature-description"
            placeholder="Detailed description of the feature you'd like to see"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            error={!!errors.description}
            rows={4}
            maxLength={1000}
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "feature-description-error" : undefined}
          />
          {errors.description && (
            <p id="feature-description-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000</p>
        </div>

        {/* Problem Statement */}
        <div>
          <label htmlFor="feature-problem" className="label">
            Problem Statement <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="feature-problem"
            placeholder="What problem would this feature solve? What's the use case?"
            value={formData.problemStatement}
            onChange={(e) => handleChange("problemStatement", e.target.value)}
            error={!!errors.problemStatement}
            rows={4}
            maxLength={1000}
            aria-required="true"
            aria-invalid={!!errors.problemStatement}
            aria-describedby={errors.problemStatement ? "feature-problem-error" : undefined}
          />
          {errors.problemStatement && (
            <p id="feature-problem-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.problemStatement}
            </p>
          )}
        </div>

        {/* Proposed Solution */}
        <div>
          <label htmlFor="feature-solution" className="label">
            Proposed Solution <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="feature-solution"
            placeholder="How do you envision this feature working?"
            value={formData.proposedSolution}
            onChange={(e) => handleChange("proposedSolution", e.target.value)}
            error={!!errors.proposedSolution}
            rows={4}
            maxLength={1000}
            aria-required="true"
            aria-invalid={!!errors.proposedSolution}
            aria-describedby={errors.proposedSolution ? "feature-solution-error" : undefined}
          />
          {errors.proposedSolution && (
            <p id="feature-solution-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.proposedSolution}
            </p>
          )}
        </div>

        {/* Alternatives (Optional) */}
        <div>
          <label htmlFor="feature-alternatives" className="label">
            Alternatives Considered <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <Textarea
            id="feature-alternatives"
            placeholder="Have you considered any alternative solutions or workarounds?"
            value={formData.alternatives}
            onChange={(e) => handleChange("alternatives", e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </div>

        {/* Scope */}
        <div>
          <label htmlFor="feature-scope" className="label">
            Which flow would benefit? <span className="text-red-500">*</span>
          </label>
          <select
            id="feature-scope"
            className="select"
            value={formData.scope}
            onChange={(e) => handleChange("scope", e.target.value as FeatureRequestData["scope"])}
            aria-required="true"
          >
            <option value="Quick Advisory">Quick Advisory</option>
            <option value="In-Depth Analysis">In-Depth Analysis</option>
            <option value="Both">Both</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="feature-priority" className="label">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            id="feature-priority"
            className="select"
            value={formData.priority}
            onChange={(e) =>
              handleChange("priority", e.target.value as FeatureRequestData["priority"])
            }
            aria-required="true"
          >
            <option value="Low">Low - Nice to have</option>
            <option value="Medium">Medium - Would improve my workflow</option>
            <option value="High">High - Critical for my use case</option>
          </select>
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
