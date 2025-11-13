import { useState, useEffect } from "react";

export interface BLSOccupation {
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

export interface BLSData {
  version: string;
  dataDate: string;
  source: string;
  metadata: {
    totalOccupations: number;
    lastUpdated: string;
    note?: string;
  };
  occupations: BLSOccupation[];
  index: Record<string, string[]>;
}

export function useBLSData() {
  const [data, setData] = useState<BLSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/data/bls-data.json");
        if (!response.ok) {
          throw new Error("Failed to load BLS data");
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}
