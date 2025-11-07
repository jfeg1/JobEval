import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SelectedOccupation {
  code: string;
  title: string;
  group: string;
  employment: number;
  wages: {
    hourlyMean: number;
    hourlyMedian: number;
    annualMean: number;
    annualMedian: number;
    percentile10: number;
    percentile25: number;
    percentile75: number;
    percentile90: number;
  };
  dataDate: string;
}

interface MatchingState {
  selectedOccupation: SelectedOccupation | null;
  searchQuery: string;

  selectOccupation: (occupation: SelectedOccupation) => void;
  setSearchQuery: (query: string) => void;
  clearMatching: () => void;
}

export const useMatchingStore = create<MatchingState>()(
  persist(
    (set) => ({
      selectedOccupation: null,
      searchQuery: '',

      selectOccupation: (occupation) => set({ selectedOccupation: occupation }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearMatching: () => set({
        selectedOccupation: null,
        searchQuery: '',
      }),
    }),
    {
      name: 'matching-storage',
    }
  )
);
