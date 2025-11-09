import { create } from "zustand";
import { persist } from "zustand/middleware";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used in commented placeholders for Prompt #7
import type { CountryCode, CurrencyCode } from "@/types/i18n";
import type {
  InternationalCompanyProfile,
  CompanyProfile as LegacyCompanyProfile,
} from "@/types/company-international";

/**
 * Legacy company profile interface (for backwards compatibility)
 * @deprecated Use InternationalCompanyProfile instead
 */
export interface CompanyProfile {
  name: string;
  industry: string;
  size: string;
  location: string;
  annualRevenue: number;
  employeeCount: string;
  state: string;
}

// Re-export international types for convenience
export type { InternationalCompanyProfile, LegacyCompanyProfile };

// Export type aliases for future use (Prompt #7)
export type FutureCountryCode = CountryCode;
export type FutureCurrencyCode = CurrencyCode;

interface CompanyState {
  // Current profile storage (will transition to InternationalCompanyProfile)
  profile: CompanyProfile | null;

  // Actions
  setProfile: (profile: CompanyProfile) => void;
  clearProfile: () => void;

  // Future: Add these methods (will be implemented in Prompt #7)
  // getCountry: () => CountryCode;
  // getCurrency: () => CurrencyCode;
  // setInternationalProfile: (profile: InternationalCompanyProfile) => void;
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
