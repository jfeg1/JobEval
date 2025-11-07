import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BasicInfo {
  title: string;
  department: string;
  reportsTo: string;
}

export interface PositionDetails {
  level: string;
  employmentType: string;
  workLocation: string;
}

export interface Responsibilities {
  primary: string[];
  secondary: string[];
}

export interface Requirements {
  education: string;
  experience: string;
  skills: string[];
}

export interface Compensation {
  salaryMin: number;
  salaryMax: number;
  currency: string;
  benefits: string[];
}

interface PositionState {
  basicInfo: BasicInfo | null;
  details: PositionDetails | null;
  responsibilities: Responsibilities | null;
  requirements: Requirements | null;
  compensation: Compensation | null;

  setBasicInfo: (info: BasicInfo) => void;
  setDetails: (details: PositionDetails) => void;
  setResponsibilities: (responsibilities: Responsibilities) => void;
  setRequirements: (requirements: Requirements) => void;
  setCompensation: (compensation: Compensation) => void;

  isBasicComplete: () => boolean;
  isDetailsComplete: () => boolean;

  clearPosition: () => void;
}

export const usePositionStore = create<PositionState>()(
  persist(
    (set, get) => ({
      basicInfo: null,
      details: null,
      responsibilities: null,
      requirements: null,
      compensation: null,

      setBasicInfo: (info) => set({ basicInfo: info }),
      setDetails: (details) => set({ details }),
      setResponsibilities: (responsibilities) => set({ responsibilities }),
      setRequirements: (requirements) => set({ requirements }),
      setCompensation: (compensation) => set({ compensation }),

      isBasicComplete: () => {
        const { basicInfo } = get();
        return !!(
          basicInfo &&
          basicInfo.title &&
          basicInfo.department &&
          basicInfo.reportsTo
        );
      },

      isDetailsComplete: () => {
        const { details } = get();
        return !!(
          details &&
          details.level &&
          details.employmentType &&
          details.workLocation
        );
      },

      clearPosition: () =>
        set({
          basicInfo: null,
          details: null,
          responsibilities: null,
          requirements: null,
          compensation: null,
        }),
    }),
    {
      name: 'position-storage',
    }
  )
);
