import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CountryCode, CurrencyCode } from "@/types/i18n";
import type {
  InternationalCompanyProfile,
  CompanyProfile as LegacyCompanyProfile,
} from "@/types/company-international";
import {
  convertLegacyCompanyProfile,
  convertToLegacyCompanyProfile,
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
  profile: CompanyProfile | null;

  // Core actions
  setProfile: (profile: CompanyProfile) => void;
  clearProfile: () => void;

  // Convenience getters
  getCountry: () => CountryCode;
  getCurrency: () => CurrencyCode;

  // International profile support
  setInternationalProfile: (profile: InternationalCompanyProfile) => void;
  getInternationalProfile: () => InternationalCompanyProfile | null;

  // Legacy compatibility helpers
  setLegacyProfile: (profile: LegacyCompanyProfile) => void;
  getLegacyProfile: () => LegacyCompanyProfile | null;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      profile: null,

      setProfile: (profile) => set({ profile }),

      clearProfile: () => set({ profile: null }),

      getCountry: () => {
        const profile = get().profile;
        if (!profile) return "US"; // Default to US

        // If profile has a 'state' field, it's legacy US profile
        if (profile.state) return "US";

        // Otherwise, try to extract from geography if it exists
        // (Future: when profile is InternationalCompanyProfile)
        return "US"; // Default for now
      },

      getCurrency: () => {
        const country = get().getCountry();
        // Map country to currency
        const currencyMap: Record<CountryCode, CurrencyCode> = {
          US: "USD",
          CA: "CAD",
          GB: "GBP",
          AU: "AUD",
          DE: "EUR",
          FR: "EUR",
          IT: "EUR",
          ES: "EUR",
          NL: "EUR",
          SE: "SEK",
          JP: "JPY",
          SG: "SGD",
        };
        return currencyMap[country] || "USD";
      },

      setInternationalProfile: (intlProfile) => {
        // Convert international profile to legacy format for storage
        const legacyProfile = convertToLegacyCompanyProfile(intlProfile);
        set({ profile: legacyProfile });
      },

      getInternationalProfile: () => {
        const profile = get().profile;
        if (!profile) return null;

        // Convert legacy profile to international format
        return convertLegacyCompanyProfile(profile);
      },

      setLegacyProfile: (legacyProfile) => {
        set({ profile: legacyProfile });
      },

      getLegacyProfile: () => {
        return get().profile;
      },
    }),
    {
      name: "company-storage",
      version: 2, // Increment version for migration
      migrate: (persistedState: unknown, version: number) => {
        // Migration from version 1 (if exists) to version 2
        if (
          version === 1 &&
          typeof persistedState === "object" &&
          persistedState !== null &&
          "profile" in persistedState
        ) {
          // Version 1 profile is already in legacy format
          // No transformation needed, just pass through
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);
