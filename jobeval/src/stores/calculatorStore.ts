import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AffordableRange {
  minimum: number;
  target: number;
  maximum: number;
}

interface CalculatorState {
  // Budget inputs
  budgetPercentage: number; // % of revenue to allocate (default: 10%)
  additionalBudget: number; // Extra funds available

  // Calculations (derived)
  affordableRange: AffordableRange | null;
  marketAlignment: "below" | "within" | "above" | null;
  gap: number | null; // Difference between affordable and market median

  // Minimum wage compliance
  isBelowMinimum: boolean;
  minimumWageAmount: number | null;
  minimumWageAdjusted: boolean; // true if range was adjusted up to meet minimum

  // Actions
  setBudgetPercentage: (percentage: number) => void;
  setAdditionalBudget: (amount: number) => void;
  setCalculationResults: (results: {
    affordableRange: AffordableRange;
    marketAlignment: "below" | "within" | "above";
    gap: number;
    isBelowMinimum: boolean;
    minimumWageAmount: number;
    minimumWageAdjusted: boolean;
  }) => void;
  reset: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      budgetPercentage: 10,
      additionalBudget: 0,
      affordableRange: null,
      marketAlignment: null,
      gap: null,
      isBelowMinimum: false,
      minimumWageAmount: null,
      minimumWageAdjusted: false,

      setBudgetPercentage: (percentage) =>
        set({ budgetPercentage: percentage }),
      setAdditionalBudget: (amount) => set({ additionalBudget: amount }),

      setCalculationResults: (results) =>
        set({
          affordableRange: results.affordableRange,
          marketAlignment: results.marketAlignment,
          gap: results.gap,
          isBelowMinimum: results.isBelowMinimum,
          minimumWageAmount: results.minimumWageAmount,
          minimumWageAdjusted: results.minimumWageAdjusted,
        }),

      reset: () =>
        set({
          budgetPercentage: 10,
          additionalBudget: 0,
          affordableRange: null,
          marketAlignment: null,
          gap: null,
          isBelowMinimum: false,
          minimumWageAmount: null,
          minimumWageAdjusted: false,
        }),
    }),
    {
      name: "calculator-storage",
    }
  )
);
