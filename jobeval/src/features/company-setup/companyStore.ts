import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompanyProfile {
  name: string;
  industry: string;
  size: string;
  location: string;
  annualRevenue: number;
  employeeCount: string;
  state: string;
}

interface CompanyState {
  profile: CompanyProfile | null;
  setProfile: (profile: CompanyProfile) => void;
  clearProfile: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "company-storage",
    }
  )
);
