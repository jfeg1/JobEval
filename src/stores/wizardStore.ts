import { create } from 'zustand';

// Simple session ID generator using timestamp + random string
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export interface WizardStore {
  currentStep: number;
  completedSteps: number[];
  sessionId: string;
  startedAt: string;
  lastUpdated: string;
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  markStepIncomplete: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  canNavigateToStep: (step: number) => boolean;
  resetWizard: () => void;
  initializeSession: () => void;
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  currentStep: 1,
  completedSteps: [],
  sessionId: generateSessionId(),
  startedAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),

  setCurrentStep: (step) =>
    set({
      currentStep: step,
      lastUpdated: new Date().toISOString(),
    }),

  markStepComplete: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step].sort((a, b) => a - b),
      lastUpdated: new Date().toISOString(),
    })),

  markStepIncomplete: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.filter((s) => s !== step),
      lastUpdated: new Date().toISOString(),
    })),

  isStepComplete: (step) => {
    const { completedSteps } = get();
    return completedSteps.includes(step);
  },

  canNavigateToStep: (step) => {
    const { completedSteps } = get();
    // Can navigate to step 1 always
    if (step === 1) return true;
    // Can navigate to a step if all previous steps are complete
    for (let i = 1; i < step; i++) {
      if (!completedSteps.includes(i)) {
        return false;
      }
    }
    return true;
  },

  resetWizard: () =>
    set({
      currentStep: 1,
      completedSteps: [],
      sessionId: generateSessionId(),
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }),

  initializeSession: () =>
    set({
      sessionId: generateSessionId(),
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }),
}));
