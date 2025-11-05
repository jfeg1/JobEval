import { create } from 'zustand';

export interface PositionBasicInfo {
  title: string;
  department: string;
  reportsTo: string;
}

export interface PositionDetails {
  responsibilities: string;
  requirements: string;
  qualifications: string;
  workEnvironment: string;
}

export interface PositionStore {
  basicInfo: PositionBasicInfo | null;
  details: PositionDetails | null;
  setBasicInfo: (info: PositionBasicInfo) => void;
  updateBasicInfo: (updates: Partial<PositionBasicInfo>) => void;
  setDetails: (details: PositionDetails) => void;
  updateDetails: (updates: Partial<PositionDetails>) => void;
  clearPosition: () => void;
  isBasicComplete: () => boolean;
  isDetailsComplete: () => boolean;
  isComplete: () => boolean;
}

export const usePositionStore = create<PositionStore>((set, get) => ({
  basicInfo: null,
  details: null,

  setBasicInfo: (info) => set({ basicInfo: info }),

  updateBasicInfo: (updates) =>
    set((state) => ({
      basicInfo: state.basicInfo ? { ...state.basicInfo, ...updates } : null,
    })),

  setDetails: (details) => set({ details }),

  updateDetails: (updates) =>
    set((state) => ({
      details: state.details ? { ...state.details, ...updates } : null,
    })),

  clearPosition: () => set({ basicInfo: null, details: null }),

  isBasicComplete: () => {
    const { basicInfo } = get();
    if (!basicInfo) return false;
    return !!(basicInfo.title && basicInfo.department && basicInfo.reportsTo);
  },

  isDetailsComplete: () => {
    const { details } = get();
    if (!details) return false;
    return !!(
      details.responsibilities &&
      details.requirements &&
      details.qualifications &&
      details.workEnvironment
    );
  },

  isComplete: () => {
    const store = get();
    return store.isBasicComplete() && store.isDetailsComplete();
  },
}));
