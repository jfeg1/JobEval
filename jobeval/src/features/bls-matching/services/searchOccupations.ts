interface BLSOccupation {
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

export function searchOccupations(occupations: BLSOccupation[], query: string): BLSOccupation[] {
  if (!query.trim()) {
    return occupations; // Return all if no search query
  }

  const lowerQuery = query.toLowerCase();

  return occupations.filter((occupation) => {
    // Search in title
    const titleMatch = occupation.title.toLowerCase().includes(lowerQuery);

    // Search in occupation group
    const groupMatch = occupation.group.toLowerCase().includes(lowerQuery);

    // Search in code
    const codeMatch = occupation.code.toLowerCase().includes(lowerQuery);

    return titleMatch || groupMatch || codeMatch;
  });
}
