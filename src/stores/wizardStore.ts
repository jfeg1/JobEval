import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WizardStore {
  currentStep: number;
  completedSteps: Set<number>;
  totalSteps: number;
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  canNavigateToStep: (step: number) => boolean;
  reset: () => void;
}

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      completedSteps: new Set<number>(),
      totalSteps: 6,

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      markStepComplete: (step: number) => {
        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step]),
        }));
      },

      isStepComplete: (step: number) => {
        return get().completedSteps.has(step);
      },

      canNavigateToStep: (step: number) => {
        const { completedSteps } = get();
        if (step === 1) return true;
        return completedSteps.has(step - 1);
      },

      reset: () => {
        set({ currentStep: 1, completedSteps: new Set<number>() });
      },
    }),
    {
      name: 'wizard-store',
      // Custom serialization for Set
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
        totalSteps: state.totalSteps,
      }),
      // Custom deserialization for Set
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        completedSteps: new Set(persistedState?.completedSteps || []),
      }),
    }
  )
);
