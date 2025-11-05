import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompanyProfile {
  name: string;
  industry: string;
  city: string;
  state: string;
  employeeCount: string;
}

interface CompanyStore {
  profile: CompanyProfile | null;
  setProfile: (profile: CompanyProfile) => void;
  clearProfile: () => void;
  isComplete: () => boolean;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      profile: null,

      setProfile: (profile: CompanyProfile) => {
        set({ profile });
      },

      clearProfile: () => {
        set({ profile: null });
      },

      isComplete: () => {
        const { profile } = get();
        if (!profile) return false;
        return !!(
          profile.name &&
          profile.industry &&
          profile.city &&
          profile.state &&
          profile.employeeCount
        );
      },
    }),
    {
      name: 'company-store',
    }
  )
);
