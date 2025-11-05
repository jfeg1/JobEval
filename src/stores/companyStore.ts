import { create } from 'zustand';

export interface CompanyProfile {
  name: string;
  industry: string;
  city: string;
  state: string;
  employeeCount: string; // "1-10", "11-50", "51-200", "201-500", "500+"
}

export interface CompanyStore {
  profile: CompanyProfile | null;
  setProfile: (profile: CompanyProfile) => void;
  updateProfile: (updates: Partial<CompanyProfile>) => void;
  clearProfile: () => void;
  isComplete: () => boolean;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  profile: null,

  setProfile: (profile) => set({ profile }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),

  clearProfile: () => set({ profile: null }),

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
}));
