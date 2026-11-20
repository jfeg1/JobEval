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
    // The dataset is bundled with the app so it works offline and from disk.
    import("@/data/bls-data.json")
      .then((module) => setData(module.default as unknown as BLSData))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
