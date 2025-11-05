import { create } from 'zustand';

export interface BLSData {
  code: string;
  title: string;
  occupationalGroup: string;
  salaryData: {
    median: number;
    mean: number;
    percentile10: number;
    percentile25: number;
    percentile75: number;
    percentile90: number;
  };
  employmentLevel: number;
  dataYear: string;
}

export interface MatchingStore {
  selectedOccupation: BLSData | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectOccupation: (occupation: BLSData) => void;
  clearSelection: () => void;
  isComplete: () => boolean;
}

export const useMatchingStore = create<MatchingStore>((set, get) => ({
  selectedOccupation: null,
  searchQuery: '',

  setSearchQuery: (query) => set({ searchQuery: query }),

  selectOccupation: (occupation) => set({ selectedOccupation: occupation }),

  clearSelection: () => set({ selectedOccupation: null, searchQuery: '' }),

  isComplete: () => {
    const { selectedOccupation } = get();
    return selectedOccupation !== null;
  },
}));
