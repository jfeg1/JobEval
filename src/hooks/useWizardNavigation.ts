import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '@/stores';

// Map of step numbers to their routes
const STEP_ROUTES: Record<number, string> = {
  1: '/setup/company',
  2: '/position/basic',
  3: '/position/details',
  4: '/benefits',
  5: '/market-analysis',
  6: '/results',
};

export const useWizardNavigation = () => {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, canNavigateToStep } = useWizardStore();

  const goToStep = (step: number) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
      navigate(STEP_ROUTES[step] || '/');
    }
  };

  const goToNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= 6) {
      goToStep(nextStep);
    }
  };

  const goToPrevious = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
      navigate(STEP_ROUTES[prevStep] || '/');
    } else {
      navigate('/');
    }
  };

  return {
    currentStep,
    goToStep,
    goToNext,
    goToPrevious,
    canNavigateToStep,
  };
};
