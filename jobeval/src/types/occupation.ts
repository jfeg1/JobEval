/**
 * Occupation Data Types
 *
 * TypeScript interfaces for integrated O*NET and BLS occupation data
 */

/**
 * Skill or knowledge element from O*NET
 */
export interface OccupationElement {
  name: string;
  importance: number; // 0-100 scale
  level: number; // 0-100 scale
}

/**
 * O*NET occupation data structure
 */
export interface OnetOccupationData {
  code: string; // SOC code (e.g., "15-1252")
  title: string; // Official occupation title
  description: string; // Brief description
  group: string; // Occupational group/category
  alternateTitles: string[]; // Common job title variations
  skills: OccupationElement[]; // Key skills
  knowledge: OccupationElement[]; // Knowledge areas
  jobZone: number; // Job preparation level (1-5)
  educationLevel: string; // Typical education requirement
}

/**
 * BLS wage data structure
 */
export interface BLSWageData {
  hourlyMean: number;
  hourlyMedian: number;
  annualMean: number;
  annualMedian: number;
  percentile10: number;
  percentile25: number;
  percentile75: number;
  percentile90: number;
}

/**
 * Complete BLS occupation data (legacy format)
 */
export interface BLSOccupation {
  code: string;
  title: string;
  group: string;
  employment: number;
  wages: BLSWageData;
  dataDate: string;
}

/**
 * Integrated occupation data (O*NET + BLS)
 */
export interface Occupation {
  // Core identification
  code: string; // SOC code
  title: string; // Official title
  description: string; // Description from O*NET
  group: string; // Occupational group

  // O*NET data
  alternateTitles: string[];
  skills: OccupationElement[];
  knowledge: OccupationElement[];
  jobZone: number;
  educationLevel: string;

  // BLS wage data (may be null if not available)
  wageData: {
    employment?: number;
    hourly: {
      mean: number;
      median: number;
    };
    annual: {
      mean: number;
      median: number;
    };
    percentiles: {
      p10: number;
      p25: number;
      p50: number; // Same as median
      p75: number;
      p90: number;
    };
    dataDate: string;
  } | null;

  // Metadata
  hasWageData: boolean;
  dataSource: "integrated" | "onet-only" | "bls-only";
}

/**
 * Occupation title index entry
 */
export interface TitleIndexEntry {
  code: string; // SOC code
  title: string; // Official title
  matchType: "primary" | "alternate" | "partial";
}

/**
 * Title index structure (normalized title → matching occupations)
 */
export interface TitleIndex {
  [normalizedTitle: string]: TitleIndexEntry[];
}

/**
 * Occupation match result
 */
export interface OccupationMatch {
  code: string; // SOC code
  title: string; // Official title
  confidence: number; // 0-1 confidence score
  matchedOn: string; // The title variant that matched
  matchType: "exact" | "primary" | "alternate" | "partial" | "fuzzy";
}

/**
 * Occupation search options
 */
export interface SearchOptions {
  maxResults?: number; // Maximum matches to return (default: 5)
  minConfidence?: number; // Minimum confidence threshold (default: 0.3)
  includeWithoutWages?: boolean; // Include occupations without wage data (default: true)
  preferredGroups?: string[]; // Prefer occupations from these groups
}

/**
 * Integrated occupation database
 */
export interface OccupationDatabase {
  version: string;
  dataDate: string;
  metadata: {
    totalOccupations: number;
    occupationsWithWages: number;
    onetVersion?: string;
    blsVersion?: string;
    lastUpdated: string;
  };
  occupations: {
    [socCode: string]: Occupation;
  };
}
