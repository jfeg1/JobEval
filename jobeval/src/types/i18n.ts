/**
 * Internationalization Types
 *
 * Defines types for supporting multiple countries, currencies, and wage data sources
 * in JobEval's globalization effort.
 */

/**
 * ISO 3166-1 alpha-2 country codes
 * Starting with countries that have comprehensive public wage data
 */
export type CountryCode =
  | "US" // United States
  | "CA" // Canada
  | "GB" // United Kingdom
  | "AU" // Australia
  | "DE" // Germany
  | "FR" // France
  | "IT" // Italy
  | "ES" // Spain
  | "NL" // Netherlands
  | "SE" // Sweden
  | "JP" // Japan
  | "SG"; // Singapore

/**
 * ISO 4217 currency codes
 * Currencies used in supported countries
 */
export type CurrencyCode =
  | "USD" // United States Dollar
  | "CAD" // Canadian Dollar
  | "GBP" // British Pound Sterling
  | "EUR" // Euro
  | "AUD" // Australian Dollar
  | "SEK" // Swedish Krona
  | "JPY" // Japanese Yen
  | "SGD" // Singapore Dollar
  | "CHF"; // Swiss Franc

/**
 * Data sources for wage and occupation information
 */
export type WageDataSource =
  | "BLS" // US Bureau of Labor Statistics
  | "STATISTICS_CANADA" // Statistics Canada
  | "ONS" // UK Office for National Statistics
  | "ABS" // Australian Bureau of Statistics
  | "DESTATIS" // German Federal Statistical Office
  | "INSEE" // French National Institute of Statistics
  | "ISTAT" // Italian National Institute of Statistics
  | "INE" // Spanish National Statistics Institute
  | "CBS" // Statistics Netherlands
  | "SCB" // Statistics Sweden
  | "MHLW" // Japan Ministry of Health, Labour and Welfare
  | "MOM"; // Singapore Ministry of Manpower

/**
 * Occupation classification systems used globally
 */
export type OccupationClassificationSystem =
  | "SOC" // Standard Occupational Classification (US)
  | "NOC" // National Occupational Classification (Canada)
  | "SOC_UK" // Standard Occupational Classification (UK)
  | "ANZSCO" // Australian and New Zealand Standard Classification of Occupations
  | "KldB" // Klassifikation der Berufe (Germany)
  | "PCS" // Professions et Catégories Socioprofessionnelles (France)
  | "CP2011" // Classificazione delle Professioni (Italy)
  | "CNO" // Clasificación Nacional de Ocupaciones (Spain)
  | "SBC" // Standaard Beroepenclassificatie (Netherlands)
  | "SSYK" // Standard för svensk yrkesklassificering (Sweden)
  | "JSOC" // Japan Standard Occupational Classification
  | "SSOC"; // Singapore Standard Occupational Classification

/**
 * Geographic location with hierarchical administrative divisions
 */
export interface GeographicLocation {
  country: CountryCode;
  region?: string; // State, Province, Territory, etc.
  locality?: string; // City, Municipality, etc.
  postalCode?: string;
}

/**
 * Metadata about a country's implementation status
 */
export interface CountryMetadata {
  code: CountryCode;
  name: string;
  nativeName: string;
  currency: CurrencyCode;
  languages: string[]; // ISO 639-1 codes
  wageDataSource: WageDataSource;
  occupationSystem: OccupationClassificationSystem;
  isAvailable: boolean; // Currently implemented in JobEval
  comingSoon: boolean; // Planned for implementation
  regionalDivisions: {
    name: string; // e.g., "State", "Province", "Prefecture"
    type: "state" | "province" | "territory" | "region" | "prefecture" | "canton";
    examples: string[]; // Sample divisions
  };
  dataUpdateFrequency: "annual" | "quarterly" | "monthly" | "irregular";
  dataCoverage: {
    hasNationalData: boolean;
    hasRegionalData: boolean;
    hasLocalData: boolean;
  };
  notes?: string;
}

/**
 * Currency configuration with formatting rules
 */
export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  symbolPosition: "before" | "after";
  decimalPlaces: number;
  thousandsSeparator: "," | "." | " " | "'";
  decimalSeparator: "." | ",";
  example: string; // e.g., "$1,234.56" or "1.234,56 €"
}

/**
 * Metadata about wage data sources
 */
export interface WageDataMetadata {
  source: WageDataSource;
  country: CountryCode;
  officialName: string;
  url: string;
  dataLicense: string;
  lastUpdated?: string;
  updateSchedule: string;
  coverage: {
    occupations: number | "comprehensive";
    regions: number | "all";
    timeSpan: string; // e.g., "2010-present"
  };
  reliability: "high" | "medium" | "low";
  notes?: string;
}

/**
 * Country configurations with metadata for all supported countries
 */
export const COUNTRY_CONFIGS: Record<CountryCode, CountryMetadata> = {
  US: {
    code: "US",
    name: "United States",
    nativeName: "United States",
    currency: "USD",
    languages: ["en"],
    wageDataSource: "BLS",
    occupationSystem: "SOC",
    isAvailable: true,
    comingSoon: false,
    regionalDivisions: {
      name: "State",
      type: "state",
      examples: ["California", "Texas", "New York", "Florida"],
    },
    dataUpdateFrequency: "annual",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: true,
    },
    notes: "Comprehensive data from BLS with O*NET occupation details. Currently implemented.",
  },
  CA: {
    code: "CA",
    name: "Canada",
    nativeName: "Canada",
    currency: "CAD",
    languages: ["en", "fr"],
    wageDataSource: "STATISTICS_CANADA",
    occupationSystem: "NOC",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "Province",
      type: "province",
      examples: ["Ontario", "Quebec", "British Columbia", "Alberta"],
    },
    dataUpdateFrequency: "annual",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: true,
    },
    notes: "Statistics Canada provides comprehensive wage data through the Labour Force Survey.",
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    nativeName: "United Kingdom",
    currency: "GBP",
    languages: ["en"],
    wageDataSource: "ONS",
    occupationSystem: "SOC_UK",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "Region",
      type: "region",
      examples: ["England", "Scotland", "Wales", "Northern Ireland"],
    },
    dataUpdateFrequency: "annual",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: false,
    },
    notes: "ONS Annual Survey of Hours and Earnings (ASHE) provides detailed wage statistics.",
  },
  AU: {
    code: "AU",
    name: "Australia",
    nativeName: "Australia",
    currency: "AUD",
    languages: ["en"],
    wageDataSource: "ABS",
    occupationSystem: "ANZSCO",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "State",
      type: "state",
      examples: ["New South Wales", "Victoria", "Queensland", "Western Australia"],
    },
    dataUpdateFrequency: "quarterly",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: false,
    },
    notes:
      "Australian Bureau of Statistics provides wage data through Employee Earnings and Hours survey.",
  },
  DE: {
    code: "DE",
    name: "Germany",
    nativeName: "Deutschland",
    currency: "EUR",
    languages: ["de"],
    wageDataSource: "DESTATIS",
    occupationSystem: "KldB",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "State",
      type: "state",
      examples: ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Hesse"],
    },
    dataUpdateFrequency: "quarterly",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: false,
    },
    notes: "Destatis provides comprehensive wage statistics through Structure of Earnings Survey.",
  },
  FR: {
    code: "FR",
    name: "France",
    nativeName: "France",
    currency: "EUR",
    languages: ["fr"],
    wageDataSource: "INSEE",
    occupationSystem: "PCS",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "Region",
      type: "region",
      examples: ["Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur"],
    },
    dataUpdateFrequency: "annual",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: false,
    },
    notes: "INSEE provides detailed wage data through annual social data declarations (DADS).",
  },
  IT: {
    code: "IT",
    name: "Italy",
    nativeName: "Italia",
    currency: "EUR",
    languages: ["it"],
    wageDataSource: "ISTAT",
    occupationSystem: "CP2011",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "Region",
      type: "region",
      examples: ["Lombardy", "Lazio", "Campania", "Sicily"],
    },
    dataUpdateFrequency: "annual",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: false,
    },
    notes:
      "ISTAT provides wage statistics through the Structure of Earnings Survey and Labor Force Survey.",
  },
  ES: {
    code: "ES",
    name: "Spain",
    nativeName: "España",
    currency: "EUR",
    languages: ["es"],
    wageDataSource: "INE",
    occupationSystem: "CNO",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "Region",
      type: "region",
      examples: ["Catalonia", "Madrid", "Andalusia", "Valencia"],
    },
    dataUpdateFrequency: "annual",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: false,
    },
    notes:
      "INE provides comprehensive wage data through the Wage Structure Survey and Labor Force Survey.",
  },
  NL: {
    code: "NL",
    name: "Netherlands",
    nativeName: "Nederland",
    currency: "EUR",
    languages: ["nl"],
    wageDataSource: "CBS",
    occupationSystem: "SBC",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "Province",
      type: "province",
      examples: ["North Holland", "South Holland", "Utrecht", "North Brabant"],
    },
    dataUpdateFrequency: "quarterly",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: false,
    },
    notes: "CBS (Statistics Netherlands) provides detailed wage statistics through labor surveys.",
  },
  SE: {
    code: "SE",
    name: "Sweden",
    nativeName: "Sverige",
    currency: "SEK",
    languages: ["sv"],
    wageDataSource: "SCB",
    occupationSystem: "SSYK",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "County",
      type: "region",
      examples: ["Stockholm", "Västra Götaland", "Skåne", "Uppsala"],
    },
    dataUpdateFrequency: "annual",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: false,
    },
    notes: "Statistics Sweden provides comprehensive wage data through the Salary Statistics.",
  },
  JP: {
    code: "JP",
    name: "Japan",
    nativeName: "日本",
    currency: "JPY",
    languages: ["ja"],
    wageDataSource: "MHLW",
    occupationSystem: "JSOC",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "Prefecture",
      type: "prefecture",
      examples: ["Tokyo", "Osaka", "Kanagawa", "Aichi"],
    },
    dataUpdateFrequency: "annual",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: true,
      hasLocalData: false,
    },
    notes:
      "Ministry of Health, Labour and Welfare provides wage data through Basic Survey on Wage Structure.",
  },
  SG: {
    code: "SG",
    name: "Singapore",
    nativeName: "Singapore",
    currency: "SGD",
    languages: ["en", "zh", "ms", "ta"],
    wageDataSource: "MOM",
    occupationSystem: "SSOC",
    isAvailable: false,
    comingSoon: true,
    regionalDivisions: {
      name: "Region",
      type: "region",
      examples: ["Central", "East", "North", "West"],
    },
    dataUpdateFrequency: "annual",
    dataCoverage: {
      hasNationalData: true,
      hasRegionalData: false,
      hasLocalData: false,
    },
    notes:
      "Ministry of Manpower provides comprehensive wage data through annual labor market reports.",
  },
};

/**
 * Currency configurations with formatting rules
 */
export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "United States Dollar",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    example: "$1,234.56",
  },
  CAD: {
    code: "CAD",
    symbol: "$",
    name: "Canadian Dollar",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    example: "$1,234.56",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound Sterling",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    example: "£1,234.56",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    symbolPosition: "after",
    decimalPlaces: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
    example: "1.234,56 €",
  },
  AUD: {
    code: "AUD",
    symbol: "$",
    name: "Australian Dollar",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    example: "$1,234.56",
  },
  SEK: {
    code: "SEK",
    symbol: "kr",
    name: "Swedish Krona",
    symbolPosition: "after",
    decimalPlaces: 2,
    thousandsSeparator: " ",
    decimalSeparator: ",",
    example: "1 234,56 kr",
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    symbolPosition: "before",
    decimalPlaces: 0,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    example: "¥1,234",
  },
  SGD: {
    code: "SGD",
    symbol: "$",
    name: "Singapore Dollar",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    example: "$1,234.56",
  },
  CHF: {
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: "'",
    decimalSeparator: ".",
    example: "CHF 1'234.56",
  },
};

/**
 * Wage data source metadata for all supported sources
 */
export const WAGE_DATA_SOURCES: Record<WageDataSource, WageDataMetadata> = {
  BLS: {
    source: "BLS",
    country: "US",
    officialName: "Bureau of Labor Statistics",
    url: "https://www.bls.gov",
    dataLicense: "Public Domain (US Government)",
    updateSchedule: "Annual (May release)",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "1997-present",
    },
    reliability: "high",
    notes: "Gold standard for US wage data. Includes national, state, and metropolitan area data.",
  },
  STATISTICS_CANADA: {
    source: "STATISTICS_CANADA",
    country: "CA",
    officialName: "Statistics Canada",
    url: "https://www.statcan.gc.ca",
    dataLicense: "Open Government License - Canada",
    updateSchedule: "Annual",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "1997-present",
    },
    reliability: "high",
    notes: "Comprehensive wage data from Labour Force Survey and Census data.",
  },
  ONS: {
    source: "ONS",
    country: "GB",
    officialName: "Office for National Statistics",
    url: "https://www.ons.gov.uk",
    dataLicense: "Open Government License v3.0",
    updateSchedule: "Annual (October/November release)",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "1997-present",
    },
    reliability: "high",
    notes: "Annual Survey of Hours and Earnings (ASHE) is the primary source.",
  },
  ABS: {
    source: "ABS",
    country: "AU",
    officialName: "Australian Bureau of Statistics",
    url: "https://www.abs.gov.au",
    dataLicense: "Creative Commons Attribution 4.0",
    updateSchedule: "Quarterly and Annual",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "2000-present",
    },
    reliability: "high",
    notes: "Employee Earnings and Hours survey provides detailed wage data.",
  },
  DESTATIS: {
    source: "DESTATIS",
    country: "DE",
    officialName: "Federal Statistical Office of Germany",
    url: "https://www.destatis.de",
    dataLicense: "Data licence Germany – attribution – Version 2.0",
    updateSchedule: "Quarterly and Annual",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "2006-present",
    },
    reliability: "high",
    notes: "Structure of Earnings Survey conducted every four years, with quarterly updates.",
  },
  INSEE: {
    source: "INSEE",
    country: "FR",
    officialName: "National Institute of Statistics and Economic Studies",
    url: "https://www.insee.fr",
    dataLicense: "Open License / Licence Ouverte",
    updateSchedule: "Annual",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "2002-present",
    },
    reliability: "high",
    notes: "DADS (annual social data declarations) provide comprehensive wage statistics.",
  },
  ISTAT: {
    source: "ISTAT",
    country: "IT",
    officialName: "Italian National Institute of Statistics",
    url: "https://www.istat.it",
    dataLicense: "Italian Open Data License (IODL) v2.0",
    updateSchedule: "Annual",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "2008-present",
    },
    reliability: "high",
    notes: "Structure of Earnings Survey and Labor Force Survey data combined.",
  },
  INE: {
    source: "INE",
    country: "ES",
    officialName: "National Statistics Institute of Spain",
    url: "https://www.ine.es",
    dataLicense: "Creative Commons Attribution 3.0",
    updateSchedule: "Annual",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "2006-present",
    },
    reliability: "high",
    notes: "Wage Structure Survey provides detailed occupation-level data.",
  },
  CBS: {
    source: "CBS",
    country: "NL",
    officialName: "Statistics Netherlands",
    url: "https://www.cbs.nl",
    dataLicense: "CC0 1.0 Universal Public Domain",
    updateSchedule: "Quarterly",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "2006-present",
    },
    reliability: "high",
    notes: "Highly detailed wage data available through StatLine database.",
  },
  SCB: {
    source: "SCB",
    country: "SE",
    officialName: "Statistics Sweden",
    url: "https://www.scb.se",
    dataLicense: "Creative Commons CC0 1.0",
    updateSchedule: "Annual",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "2004-present",
    },
    reliability: "high",
    notes: "Comprehensive salary statistics covering all sectors.",
  },
  MHLW: {
    source: "MHLW",
    country: "JP",
    officialName: "Ministry of Health, Labour and Welfare",
    url: "https://www.mhlw.go.jp",
    dataLicense: "Japanese Government Standard Terms of Use (v2.0)",
    updateSchedule: "Annual",
    coverage: {
      occupations: "comprehensive",
      regions: "all",
      timeSpan: "1975-present",
    },
    reliability: "high",
    notes: "Basic Survey on Wage Structure is the primary source for wage data.",
  },
  MOM: {
    source: "MOM",
    country: "SG",
    officialName: "Ministry of Manpower",
    url: "https://www.mom.gov.sg",
    dataLicense: "Singapore Open Data License",
    updateSchedule: "Annual",
    coverage: {
      occupations: "comprehensive",
      regions: 1,
      timeSpan: "2010-present",
    },
    reliability: "high",
    notes: "Comprehensive labor market data including occupation-level wages.",
  },
};

/**
 * Helper function to get all available countries
 */
export function getAvailableCountries(): CountryMetadata[] {
  return Object.values(COUNTRY_CONFIGS).filter((country) => country.isAvailable);
}

/**
 * Helper function to get all countries (available and coming soon)
 */
export function getAllCountries(): CountryMetadata[] {
  return Object.values(COUNTRY_CONFIGS);
}

/**
 * Helper function to get countries coming soon
 */
export function getComingSoonCountries(): CountryMetadata[] {
  return Object.values(COUNTRY_CONFIGS).filter((country) => country.comingSoon);
}

/**
 * Helper function to get country metadata by country code
 */
export function getCountryMetadata(code: CountryCode): CountryMetadata | undefined {
  return COUNTRY_CONFIGS[code];
}

/**
 * Helper function to get currency configuration by currency code
 */
export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig | undefined {
  return CURRENCY_CONFIGS[code];
}

/**
 * Helper function to get wage data source metadata
 */
export function getWageDataSource(source: WageDataSource): WageDataMetadata | undefined {
  return WAGE_DATA_SOURCES[source];
}

/**
 * Helper function to format currency amount according to currency rules
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const config = getCurrencyConfig(currencyCode);
  if (!config) {
    return `${amount}`;
  }

  // Round to appropriate decimal places
  const rounded = config.decimalPlaces === 0 ? Math.round(amount) : amount;

  // Format the number
  const parts = rounded.toFixed(config.decimalPlaces).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add thousands separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);

  // Combine integer and decimal parts
  const formattedNumber =
    config.decimalPlaces === 0
      ? formattedInteger
      : `${formattedInteger}${config.decimalSeparator}${decimalPart}`;

  // Add currency symbol in correct position
  if (config.symbolPosition === "before") {
    return `${config.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${config.symbol}`;
  }
}

/**
 * Helper function to get countries by currency
 */
export function getCountriesByCurrency(currencyCode: CurrencyCode): CountryMetadata[] {
  return Object.values(COUNTRY_CONFIGS).filter((country) => country.currency === currencyCode);
}

/**
 * Helper function to check if a country is available
 */
export function isCountryAvailable(code: CountryCode): boolean {
  const country = getCountryMetadata(code);
  return country?.isAvailable ?? false;
}

/**
 * Helper function to get all supported currency codes
 */
export function getSupportedCurrencies(): CurrencyCode[] {
  return Object.keys(CURRENCY_CONFIGS) as CurrencyCode[];
}

/**
 * Helper function to get all supported country codes
 */
export function getSupportedCountries(): CountryCode[] {
  return Object.keys(COUNTRY_CONFIGS) as CountryCode[];
}
