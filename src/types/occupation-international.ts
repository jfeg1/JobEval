/**
 * Occupation Data Types (International Edition)
 *
 * Extended TypeScript interfaces for occupation data that supports multiple
 * countries, classification systems, and wage data sources
 */

import type {
  CountryCode,
  CurrencyCode,
  WageDataSource,
  OccupationClassificationSystem,
  WageDataMetadata,
} from "./i18n";

/**
 * Skill or knowledge element from occupation classification systems
 * (e.g., O*NET for US, similar systems for other countries)
 */
export interface OccupationElement {
  name: string;
  importance: number; // 0-100 scale
  level: number; // 0-100 scale
}

/**
 * Normalized wage data structure with international support
 *
 * All monetary values are stored in the source currency and include
 * metadata about the data source, currency, and collection date.
 */
export interface BaseWageData {
  // Hourly wage data
  hourly: {
    mean: number;
    median: number;
    currency: CurrencyCode;
  };

  // Annual wage data
  annual: {
    mean: number;
    median: number;
    currency: CurrencyCode;
  };

  // Wage distribution percentiles
  percentiles: {
    p10: number;
    p25: number;
    p50: number; // Same as median
    p75: number;
    p90: number;
    currency: CurrencyCode;
  };

  // Employment statistics (if available)
  employment?: number;

  // Metadata about the data source
  metadata: {
    source: WageDataSource;
    country: CountryCode;
    dataDate: string; // ISO date or period (e.g., "2024-05" or "2024")
    collectionMethod?: string;
    sampleSize?: number;
    reliability?: "high" | "medium" | "low";
  };
}

/**
 * International occupation data structure
 *
 * Supports any occupation classification system and wage data source.
 * This is the primary type for occupation data going forward.
 */
export interface InternationalOccupation {
  // Core identification
  code: string; // Occupation code in the classification system
  sourceCode: string; // Full source identifier (e.g., "BLS-15-1252", "NOC-2173")
  title: string; // Official occupation title
  description: string; // Occupation description
  classificationSystem: OccupationClassificationSystem;
  country: CountryCode;

  // Alternate titles and variations
  alternateTitles: string[];

  // Skills and knowledge (if available from source)
  skills?: OccupationElement[];
  knowledge?: OccupationElement[];

  // Education and preparation (if available)
  jobZone?: number; // Job preparation level (system-specific)
  educationLevel?: string; // Typical education requirement

  // Occupational grouping
  group?: string; // Major group or category in classification system

  // Wage data (may be null if not available)
  wageData: BaseWageData | null;

  // Metadata
  hasWageData: boolean;
  dataSource: WageDataSource;
  lastUpdated: string; // ISO date when this data was last updated
}

/**
 * Legacy BLS-specific wage data structure (for backwards compatibility)
 * @deprecated Use BaseWageData instead
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
 * Legacy BLS occupation data structure (for backwards compatibility)
 * @deprecated Use InternationalOccupation instead
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
 * Legacy O*NET occupation data structure (for backwards compatibility)
 * @deprecated Use InternationalOccupation instead
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
 * Legacy integrated occupation data (O*NET + BLS) (for backwards compatibility)
 * @deprecated Use InternationalOccupation instead
 */
export interface Occupation {
  // Core identification
  code: string; // SOC code
  title: string; // Official title
  description: string; // Description from O*NET
  group?: string; // Occupational group - optional, only present if BLS data matched

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
 * Cross-reference between different occupation classification systems
 *
 * Allows mapping occupations across countries and classification systems.
 * For example, mapping US SOC codes to Canadian NOC codes.
 */
export interface OccupationCrossReference {
  sourceSystem: OccupationClassificationSystem;
  sourceCode: string;
  sourceTitle: string;
  targetSystem: OccupationClassificationSystem;
  targetCode: string;
  targetTitle: string;
  mappingQuality: "exact" | "approximate" | "partial";
  notes?: string;
}

/**
 * Occupation title index entry
 */
export interface TitleIndexEntry {
  code: string; // Occupation code in its classification system
  sourceCode: string; // Full source identifier
  title: string; // Official title
  country: CountryCode;
  classificationSystem: OccupationClassificationSystem;
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
  code: string; // Occupation code
  sourceCode: string; // Full source identifier
  title: string; // Official title
  country: CountryCode;
  classificationSystem: OccupationClassificationSystem;
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
  preferredCountries?: CountryCode[]; // Prefer occupations from these countries
  preferredSystems?: OccupationClassificationSystem[]; // Prefer these classification systems
  preferredGroups?: string[]; // Prefer occupations from these groups
}

/**
 * Occupation data file structure
 *
 * Standard format for occupation data files from any source.
 */
export interface OccupationDataFile {
  version: string;
  country: CountryCode;
  classificationSystem: OccupationClassificationSystem;
  dataSource: WageDataSource;
  metadata: WageDataMetadata & {
    totalOccupations: number;
    occupationsWithWages: number;
    fileVersion?: string;
    generatedAt: string; // ISO timestamp
  };
  occupations: {
    [occupationCode: string]: InternationalOccupation;
  };
  crossReferences?: OccupationCrossReference[];
  titleIndex?: TitleIndex;
}

/**
 * Type guard to check if an occupation has wage data
 *
 * This narrows the type so TypeScript knows wageData is not null.
 *
 * @param occupation - The occupation to check
 * @returns True if the occupation has wage data
 */
export function hasWageData(
  occupation: InternationalOccupation
): occupation is InternationalOccupation & { wageData: BaseWageData } {
  return occupation.hasWageData && occupation.wageData !== null;
}

/**
 * Convert legacy BLS wage data to new BaseWageData format
 *
 * @param legacy - Legacy BLS wage data
 * @param dataDate - Data collection date
 * @returns Normalized BaseWageData
 */
export function convertLegacyWageData(legacy: BLSWageData, dataDate: string): BaseWageData {
  return {
    hourly: {
      mean: legacy.hourlyMean,
      median: legacy.hourlyMedian,
      currency: "USD",
    },
    annual: {
      mean: legacy.annualMean,
      median: legacy.annualMedian,
      currency: "USD",
    },
    percentiles: {
      p10: legacy.percentile10,
      p25: legacy.percentile25,
      p50: legacy.hourlyMedian, // p50 is median
      p75: legacy.percentile75,
      p90: legacy.percentile90,
      currency: "USD",
    },
    metadata: {
      source: "BLS",
      country: "US",
      dataDate,
    },
  };
}

/**
 * Convert legacy Occupation to new InternationalOccupation format
 *
 * @param legacy - Legacy occupation data
 * @returns InternationalOccupation
 */
export function convertLegacyOccupation(legacy: Occupation): InternationalOccupation {
  // Convert wage data if it exists
  let wageData: BaseWageData | null = null;
  if (legacy.wageData) {
    wageData = {
      hourly: {
        mean: legacy.wageData.hourly.mean,
        median: legacy.wageData.hourly.median,
        currency: "USD",
      },
      annual: {
        mean: legacy.wageData.annual.mean,
        median: legacy.wageData.annual.median,
        currency: "USD",
      },
      percentiles: {
        p10: legacy.wageData.percentiles.p10,
        p25: legacy.wageData.percentiles.p25,
        p50: legacy.wageData.percentiles.p50,
        p75: legacy.wageData.percentiles.p75,
        p90: legacy.wageData.percentiles.p90,
        currency: "USD",
      },
      employment: legacy.wageData.employment,
      metadata: {
        source: "BLS",
        country: "US",
        dataDate: legacy.wageData.dataDate,
      },
    };
  }

  return {
    code: legacy.code,
    sourceCode: `BLS-${legacy.code}`,
    title: legacy.title,
    description: legacy.description,
    classificationSystem: "SOC",
    country: "US",
    alternateTitles: legacy.alternateTitles,
    skills: legacy.skills,
    knowledge: legacy.knowledge,
    jobZone: legacy.jobZone,
    educationLevel: legacy.educationLevel,
    group: legacy.group,
    wageData,
    hasWageData: legacy.hasWageData,
    dataSource: "BLS",
    lastUpdated: wageData?.metadata.dataDate || new Date().toISOString().split("T")[0],
  };
}
