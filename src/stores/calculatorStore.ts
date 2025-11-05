import { create } from 'zustand';

export interface BudgetConstraints {
  minSalary: number;
  maxSalary: number;
  budgetNotes?: string;
}

export interface AffordabilityResult {
  competitiveness:
    | 'Highly Competitive'
    | 'Competitive'
    | 'Below Market'
    | 'Significantly Below Market';
  score: number; // 0-100
  marketPosition: string; // e.g., "75th percentile"
  recommendations: string[];
  calculatedAt: string; // ISO timestamp
}

export interface CalculatorStore {
  budget: BudgetConstraints | null;
  result: AffordabilityResult | null;
  setBudget: (budget: BudgetConstraints) => void;
  updateBudget: (updates: Partial<BudgetConstraints>) => void;
  setResult: (result: AffordabilityResult) => void;
  clearCalculator: () => void;
  isBudgetComplete: () => boolean;
  isComplete: () => boolean;
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  budget: null,
  result: null,

  setBudget: (budget) => set({ budget }),

  updateBudget: (updates) =>
    set((state) => ({
      budget: state.budget ? { ...state.budget, ...updates } : null,
    })),

  setResult: (result) => set({ result }),

  clearCalculator: () => set({ budget: null, result: null }),

  isBudgetComplete: () => {
    const { budget } = get();
    if (!budget) return false;
    return !!(budget.minSalary > 0 && budget.maxSalary > 0 && budget.maxSalary >= budget.minSalary);
  },

  isComplete: () => {
    const { budget, result } = get();
    return budget !== null && result !== null;
  },
}));
