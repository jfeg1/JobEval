import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WizardStep {
  id: number;
  title: string;
  path: string;
  completed: boolean;
}

interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  setCurrentStep: (step: number) => void;
  markStepComplete: (stepId: number) => void;
  resetWizard: () => void;
}

const initialSteps: WizardStep[] = [
  { id: 1, title: "Company Setup", path: "/setup/company", completed: false },
  { id: 2, title: "Position Basic", path: "/position/basic", completed: false },
  {
    id: 3,
    title: "Position Details",
    path: "/position/details",
    completed: false,
  },
  {
    id: 4,
    title: "Responsibilities",
    path: "/position/responsibilities",
    completed: false,
  },
  {
    id: 5,
    title: "Requirements",
    path: "/position/requirements",
    completed: false,
  },
  {
    id: 6,
    title: "Compensation",
    path: "/position/compensation",
    completed: false,
  },
];

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      steps: initialSteps,

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepComplete: (stepId) =>
        set((state) => ({
          steps: state.steps.map((step) =>
            step.id === stepId ? { ...step, completed: true } : step
          ),
        })),

      resetWizard: () => set({ currentStep: 1, steps: initialSteps }),
    }),
    {
      name: "wizard-storage",
    }
  )
);
