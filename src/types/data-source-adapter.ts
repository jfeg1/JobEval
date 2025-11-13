/**
 * Wage Data Source Adapters
 *
 * Abstract interfaces for pluggable wage data sources.
 * Each country's statistical agency can implement this interface
 * to provide standardized access to their wage data.
 */

import type {
  CountryCode,
  CurrencyCode,
  WageDataSource,
  OccupationClassificationSystem,
} from "./i18n";
import type {
  InternationalOccupation,
  OccupationDataFile,
  BaseWageData,
  TitleIndex,
} from "./occupation-international";

/**
 * Raw occupation data from a data source before normalization
 *
 * This is the data format that comes directly from the source API/file
 * before it's transformed into our standard InternationalOccupation format.
 */
export interface RawOccupationData {
  code: string;
  title: string;
  description?: string;
  alternateTitles?: string[];
  [key: string]: unknown; // Allow any additional fields from the source
}

/**
 * Capabilities of a data source
 *
 * Describes what features this data source supports.
 */
export interface DataSourceCapabilities {
  hasRegionalData: boolean; // Can provide state/province level data
  hasMetroData: boolean; // Can provide metropolitan area data
  hasIndustryData: boolean; // Can provide industry-specific data
  hasHistoricalData: boolean; // Can provide historical trends
  updateFrequency: "annually" | "quarterly" | "monthly" | "irregular";
  typicalUpdateMonth?: number; // Month when annual data is typically released (1-12)
}

/**
 * Options for downloading data from a source
 */
export interface DownloadOptions {
  outputPath: string; // Where to save downloaded files
  year?: string; // Specific year to download (if applicable)
  format?: "json" | "csv" | "xml"; // Preferred format
  includeMetadata?: boolean; // Include metadata files
  forceRefresh?: boolean; // Re-download even if cached
}

/**
 * Result of processing occupation data
 */
export interface ProcessingResult {
  totalOccupations: number;
  occupationsWithWages: number;
  occupationsWithoutWages: number;
  errors: Array<{
    code: string;
    message: string;
  }>;
  warnings: Array<{
    code: string;
    message: string;
  }>;
}

/**
 * Wage Data Source Adapter Interface
 *
 * This is the contract that all country-specific data source adapters must implement.
 * It provides a standardized way to download, parse, normalize, and validate wage data
 * from any statistical agency.
 *
 * Example implementations:
 * - BLS adapter (US Bureau of Labor Statistics)
 * - StatCan adapter (Statistics Canada)
 * - ONS adapter (UK Office for National Statistics)
 */
export interface WageDataSourceAdapter {
  // Metadata
  readonly source: WageDataSource;
  readonly country: CountryCode;
  readonly currency: CurrencyCode;
  readonly classificationSystem: OccupationClassificationSystem;
  readonly capabilities: DataSourceCapabilities;

  /**
   * Download raw data from the source
   *
   * This method fetches the latest data from the statistical agency's API or website
   * and saves it to local files for processing.
   *
   * @param outputPath - Directory where files should be saved
   * @param options - Download options
   * @returns Array of downloaded file paths
   */
  download(outputPath: string, options?: Partial<DownloadOptions>): Promise<string[]>;

  /**
   * Parse raw data files into structured format
   *
   * This method reads the downloaded files and converts them into an array of
   * RawOccupationData objects (still in the source's format).
   *
   * @param inputFiles - Paths to files to parse
   * @returns Array of raw occupation data
   */
  parse(inputFiles: string[]): Promise<RawOccupationData[]>;

  /**
   * Normalize raw data into standard InternationalOccupation format
   *
   * This method transforms the source-specific data structure into our
   * standardized InternationalOccupation format.
   *
   * @param raw - Raw occupation data from the source
   * @returns Normalized occupation in standard format
   */
  normalize(raw: RawOccupationData): InternationalOccupation;

  /**
   * Validate normalized occupation data
   *
   * Performs quality checks on the normalized data to ensure it meets
   * our standards (has required fields, wage data is reasonable, etc.)
   *
   * @param occupation - Normalized occupation to validate
   * @returns Validation errors (empty array if valid)
   */
  validate(occupation: InternationalOccupation): string[];

  /**
   * Build title index for fast occupation lookup
   *
   * Creates an index mapping normalized titles to occupation codes
   * for efficient searching.
   *
   * @param occupations - Array of occupations to index
   * @returns Title index
   */
  buildIndex(occupations: InternationalOccupation[]): TitleIndex;

  /**
   * Get the latest available data version
   *
   * Returns the most recent data version/year available from the source.
   *
   * @returns Version identifier (e.g., "2024", "2024-Q1", etc.)
   */
  getLatestVersion(): Promise<string>;

  /**
   * Process all data: download, parse, normalize, validate, and build index
   *
   * This is the main orchestration method that runs the full pipeline.
   *
   * @param outputPath - Where to save the final processed data
   * @param options - Download options
   * @returns Processing result with statistics
   */
  process(outputPath: string, options?: Partial<DownloadOptions>): Promise<ProcessingResult>;
}

/**
 * Registry of available data source adapters
 *
 * Maps country codes to their adapter classes.
 * This will be populated as we implement adapters for each country.
 */
export type DataSourceRegistry = {
  [K in CountryCode]?: new () => WageDataSourceAdapter;
};

/**
 * Abstract base class for data source adapters
 *
 * Provides common functionality that all adapters can inherit.
 * Country-specific adapters extend this class and implement the abstract methods.
 *
 * This includes:
 * - Default implementations of buildIndex() and validate()
 * - Helper methods for normalizing titles
 * - Helper methods for creating wage data objects
 */
export abstract class BaseDataSourceAdapter implements WageDataSourceAdapter {
  // Abstract properties - must be defined by subclasses
  abstract readonly source: WageDataSource;
  abstract readonly country: CountryCode;
  abstract readonly currency: CurrencyCode;
  abstract readonly classificationSystem: OccupationClassificationSystem;
  abstract readonly capabilities: DataSourceCapabilities;

  // Abstract methods - must be implemented by subclasses
  abstract download(outputPath: string, options?: Partial<DownloadOptions>): Promise<string[]>;
  abstract parse(inputFiles: string[]): Promise<RawOccupationData[]>;
  abstract normalize(raw: RawOccupationData): InternationalOccupation;
  abstract getLatestVersion(): Promise<string>;

  /**
   * Default validation implementation
   *
   * Checks for required fields and reasonable wage data.
   * Subclasses can override to add source-specific validation.
   */
  validate(occupation: InternationalOccupation): string[] {
    const errors: string[] = [];

    // Check required fields
    if (!occupation.code || occupation.code.trim() === "") {
      errors.push("Missing occupation code");
    }
    if (!occupation.title || occupation.title.trim() === "") {
      errors.push("Missing occupation title");
    }
    if (!occupation.description || occupation.description.trim() === "") {
      errors.push("Missing occupation description");
    }

    // Validate wage data if present
    if (occupation.wageData) {
      const { hourly, annual, percentiles } = occupation.wageData;

      // Check for negative or zero wages
      if (hourly.mean <= 0 || hourly.median <= 0) {
        errors.push("Invalid hourly wage data (must be positive)");
      }
      if (annual.mean <= 0 || annual.median <= 0) {
        errors.push("Invalid annual wage data (must be positive)");
      }

      // Check that mean and median are reasonably close
      const hourlyRatio = hourly.mean / hourly.median;
      if (hourlyRatio < 0.5 || hourlyRatio > 3) {
        errors.push("Hourly mean and median are too far apart (possible data error)");
      }

      // Check percentile ordering
      if (
        !(
          percentiles.p10 <= percentiles.p25 &&
          percentiles.p25 <= percentiles.p50 &&
          percentiles.p50 <= percentiles.p75 &&
          percentiles.p75 <= percentiles.p90
        )
      ) {
        errors.push("Percentiles are not in ascending order");
      }

      // Check that p50 matches median
      if (Math.abs(percentiles.p50 - hourly.median) > 0.01) {
        errors.push("Percentile 50 does not match median");
      }
    }

    // Validate hasWageData flag consistency
    if (occupation.hasWageData && !occupation.wageData) {
      errors.push("hasWageData is true but wageData is null");
    }
    if (!occupation.hasWageData && occupation.wageData) {
      errors.push("hasWageData is false but wageData is present");
    }

    return errors;
  }

  /**
   * Default index building implementation
   *
   * Creates a title index for efficient occupation lookup.
   * Indexes both primary titles and alternate titles.
   */
  buildIndex(occupations: InternationalOccupation[]): TitleIndex {
    const index: TitleIndex = {};

    for (const occupation of occupations) {
      // Index primary title
      const normalizedPrimary = this.normalizeTitle(occupation.title);
      if (!index[normalizedPrimary]) {
        index[normalizedPrimary] = [];
      }
      index[normalizedPrimary].push({
        code: occupation.code,
        sourceCode: occupation.sourceCode,
        title: occupation.title,
        country: occupation.country,
        classificationSystem: occupation.classificationSystem,
        matchType: "primary",
      });

      // Index alternate titles
      for (const altTitle of occupation.alternateTitles) {
        const normalizedAlt = this.normalizeTitle(altTitle);
        if (!index[normalizedAlt]) {
          index[normalizedAlt] = [];
        }
        // Avoid duplicates
        if (!index[normalizedAlt].some((entry) => entry.code === occupation.code)) {
          index[normalizedAlt].push({
            code: occupation.code,
            sourceCode: occupation.sourceCode,
            title: occupation.title,
            country: occupation.country,
            classificationSystem: occupation.classificationSystem,
            matchType: "alternate",
          });
        }
      }
    }

    return index;
  }

  /**
   * Default process implementation
   *
   * Orchestrates the full data processing pipeline:
   * 1. Download raw data
   * 2. Parse files
   * 3. Normalize each occupation
   * 4. Validate each occupation
   * 5. Build title index
   * 6. Save to output file
   */
  async process(outputPath: string, options?: Partial<DownloadOptions>): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      totalOccupations: 0,
      occupationsWithWages: 0,
      occupationsWithoutWages: 0,
      errors: [],
      warnings: [],
    };

    try {
      // Step 1: Download
      const files = await this.download(outputPath, options);

      // Step 2: Parse
      const rawData = await this.parse(files);
      result.totalOccupations = rawData.length;

      // Step 3 & 4: Normalize and validate
      const occupations: InternationalOccupation[] = [];
      for (const raw of rawData) {
        try {
          const normalized = this.normalize(raw);
          const validationErrors = this.validate(normalized);

          if (validationErrors.length > 0) {
            result.errors.push({
              code: raw.code,
              message: validationErrors.join("; "),
            });
          } else {
            occupations.push(normalized);
            if (normalized.hasWageData) {
              result.occupationsWithWages++;
            } else {
              result.occupationsWithoutWages++;
            }
          }
        } catch (error) {
          result.errors.push({
            code: raw.code,
            message: `Normalization failed: ${error}`,
          });
        }
      }

      // Step 5: Build index
      const titleIndex = this.buildIndex(occupations);

      // Step 6: Create output data file
      // @ts-expect-error - dataFile is created for documentation but file writing is done by caller
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dataFile: OccupationDataFile = {
        version: await this.getLatestVersion(),
        country: this.country,
        classificationSystem: this.classificationSystem,
        dataSource: this.source,
        metadata: {
          source: this.source,
          country: this.country,
          officialName: "", // Subclass should provide this
          url: "", // Subclass should provide this
          dataLicense: "", // Subclass should provide this
          updateSchedule: "", // Subclass should provide this
          coverage: {
            occupations: occupations.length,
            regions: "all",
            timeSpan: "",
          },
          reliability: "high",
          totalOccupations: occupations.length,
          occupationsWithWages: result.occupationsWithWages,
          generatedAt: new Date().toISOString(),
        },
        occupations: occupations.reduce(
          (acc, occ) => {
            acc[occ.code] = occ;
            return acc;
          },
          {} as Record<string, InternationalOccupation>
        ),
        titleIndex,
      };

      // Note: Actual file writing would be done by the caller
      // This method just returns the processing result
      // The dataFile can be saved separately

      return result;
    } catch (error) {
      result.errors.push({
        code: "PROCESSING_ERROR",
        message: `Failed to process data: ${error}`,
      });
      return result;
    }
  }

  /**
   * Normalize a title for indexing
   *
   * Converts a title to a canonical form for matching:
   * - Lowercase
   * - Remove special characters
   * - Collapse whitespace
   */
  protected normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special chars
      .replace(/\s+/g, " ") // Collapse whitespace
      .trim();
  }

  /**
   * Helper to create a BaseWageData object
   *
   * This standardizes the creation of wage data objects across all adapters.
   */
  protected createWageData(data: {
    hourlyMean: number;
    hourlyMedian: number;
    annualMean: number;
    annualMedian: number;
    p10: number;
    p25: number;
    p75: number;
    p90: number;
    employment?: number;
    dataDate: string;
  }): BaseWageData {
    return {
      hourly: {
        mean: data.hourlyMean,
        median: data.hourlyMedian,
        currency: this.currency,
      },
      annual: {
        mean: data.annualMean,
        median: data.annualMedian,
        currency: this.currency,
      },
      percentiles: {
        p10: data.p10,
        p25: data.p25,
        p50: data.hourlyMedian, // p50 is the median
        p75: data.p75,
        p90: data.p90,
        currency: this.currency,
      },
      employment: data.employment,
      metadata: {
        source: this.source,
        country: this.country,
        dataDate: data.dataDate,
        reliability: "high",
      },
    };
  }

  /**
   * Helper to create an InternationalOccupation object
   *
   * Provides a standard template for creating occupation objects.
   */
  protected createOccupation(data: {
    code: string;
    title: string;
    description: string;
    alternateTitles?: string[];
    group?: string;
    wageData?: BaseWageData;
    skills?: Array<{ name: string; importance: number; level: number }>;
    knowledge?: Array<{ name: string; importance: number; level: number }>;
    jobZone?: number;
    educationLevel?: string;
  }): InternationalOccupation {
    return {
      code: data.code,
      sourceCode: `${this.source}-${data.code}`,
      title: data.title,
      description: data.description,
      classificationSystem: this.classificationSystem,
      country: this.country,
      alternateTitles: data.alternateTitles || [],
      skills: data.skills,
      knowledge: data.knowledge,
      jobZone: data.jobZone,
      educationLevel: data.educationLevel,
      group: data.group,
      wageData: data.wageData || null,
      hasWageData: !!data.wageData,
      dataSource: this.source,
      lastUpdated: data.wageData?.metadata.dataDate || new Date().toISOString().split("T")[0],
    };
  }
}

/**
 * Get data source adapter for a country
 *
 * Factory function to instantiate the appropriate adapter for a country.
 * Returns null if no adapter is available for that country yet.
 *
 * @param country - Country code
 * @returns Adapter instance or null
 *
 * @example
 * const adapter = getDataSourceAdapter("US"); // Returns BLS adapter (when implemented)
 * const adapter = getDataSourceAdapter("CA"); // Returns StatCan adapter (when implemented)
 */
export function getDataSourceAdapter(
  // @ts-expect-error - country will be used when adapters are implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  country: CountryCode
): WageDataSourceAdapter | null {
  // This will be populated as we implement adapters for each country
  // For now, it returns null since no adapters are implemented yet
  // Future implementation:
  // const registry: DataSourceRegistry = {
  //   US: BLSAdapter,
  //   CA: StatCanAdapter,
  //   GB: ONSAdapter,
  //   // ... etc
  // };
  // const AdapterClass = registry[country];
  // return AdapterClass ? new AdapterClass() : null;

  return null; // No adapters implemented yet
}
