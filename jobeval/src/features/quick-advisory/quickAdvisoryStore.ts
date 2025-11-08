import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuickAdvisoryFormData, MarketPositioning } from "./types";

interface QuickAdvisoryState {
  formData: QuickAdvisoryFormData;
  setJobTitle: (jobTitle: string) => void;
  setLocation: (location: string) => void;
  setNumEmployees: (numEmployees: number) => void;
  setProposedSalary: (proposedSalary: number) => void;
  setMarketPositioning: (marketPositioning: MarketPositioning | "") => void;
  setRevenue: (annualRevenue: number) => void;
  setPayroll: (annualPayroll: number) => void;
  resetQuickAdvisory: () => void;
}

const initialFormData: QuickAdvisoryFormData = {
  jobTitle: "",
  location: "",
  numEmployees: 1,
  proposedSalary: 0,
  marketPositioning: "",
  annualRevenue: 0,
  annualPayroll: 0,
};

export const useQuickAdvisoryStore = create<QuickAdvisoryState>()(
  persist(
    (set) => ({
      formData: initialFormData,
      setJobTitle: (jobTitle) =>
        set((state) => ({
          formData: { ...state.formData, jobTitle },
        })),
      setLocation: (location) =>
        set((state) => ({
          formData: { ...state.formData, location },
        })),
      setNumEmployees: (numEmployees) =>
        set((state) => ({
          formData: { ...state.formData, numEmployees },
        })),
      setProposedSalary: (proposedSalary) =>
        set((state) => ({
          formData: { ...state.formData, proposedSalary },
        })),
      setMarketPositioning: (marketPositioning) =>
        set((state) => ({
          formData: { ...state.formData, marketPositioning },
        })),
      setRevenue: (annualRevenue) =>
        set((state) => ({
          formData: { ...state.formData, annualRevenue },
        })),
      setPayroll: (annualPayroll) =>
        set((state) => ({
          formData: { ...state.formData, annualPayroll },
        })),
      resetQuickAdvisory: () => set({ formData: initialFormData }),
    }),
    {
      name: "quick-advisory-storage",
    }
  )
);
