#!/usr/bin/env node
/**
 * Resumable BLS API Batch Fetcher for JobEval
 *
 * Fetches OEWS wage data for ~830 occupations across national + 15 state geographies.
 * Uses the BLS Public API v2 to retrieve comprehensive wage statistics.
 *
 * Features:
 * - Resumable progress tracking
 * - Rate limiting (500 requests/day)
 * - Batch requests (up to 50 series per request)
 * - Comprehensive error handling with retries
 * - CLI arguments for testing and control
 *
 * Usage:
 *   node scripts/fetch-bls-data.js              # Resume from last progress
 *   node scripts/fetch-bls-data.js --reset      # Start fresh
 *   node scripts/fetch-bls-data.js --geography=national --limit=10  # Test mode
 */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
const BLS_API_KEY = "a1fc0faf952b4ae7b4d535cbf401a7bd";
const DAILY_REQUEST_LIMIT = 500;
const REQUEST_BUFFER = 10; // Stop at 490 to leave buffer
const MAX_SERIES_PER_REQUEST = 50;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

// Paths
const ONET_DATA_PATH = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "onet",
  "processed",
  "occupations.json"
);
const PROGRESS_PATH = path.join(__dirname, "..", "data", "progress.json");
const OUTPUT_PATH = path.join(__dirname, "..", "public", "data", "bls-api-data.json");
const ERROR_LOG_PATH = path.join(__dirname, "..", "data", "errors.log");

// Data types to fetch per occupation
const DATA_TYPES = {
  "03": "annualMean",
  "04": "annualMedian",
  "05": "percentile10",
  "06": "percentile25",
  "08": "percentile75",
  "09": "percentile90",
  "11": "hourlyMean",
  "12": "hourlyMedian",
  "01": "employment",
};

// Geographic areas
const GEOGRAPHIES = {
  National: "0000000",
  CA: "0600000",
  TX: "4800000",
  NY: "3600000",
  FL: "1200000",
  PA: "4200000",
  IL: "1700000",
  OH: "3900000",
  GA: "1300000",
  NC: "3700000",
  MI: "2600000",
  NJ: "3400000",
  VA: "5100000",
  WA: "5300000",
  MA: "2500000",
  AZ: "0400000",
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  resume: !args.includes("--reset"),
  reset: args.includes("--reset"),
  geography: args.find((a) => a.startsWith("--geography="))?.split("=")[1] || "all",
  limit: parseInt(args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "0"),
};

/**
 * Load occupation codes from O*NET data
 * Returns array of { code, title } objects
 */
async function loadOccupationCodes() {
  try {
    const data = await fs.readFile(ONET_DATA_PATH, "utf8");
    const occupations = JSON.parse(data);

    const codes = Object.entries(occupations).map(([code, data]) => ({
      code: code.substring(0, 7), // Strip to 7-character format (e.g., "11-2021.00" → "11-2021")
      title: data.title,
    }));

    // Remove duplicates (some O*NET codes may map to same SOC-7)
    const uniqueCodes = Array.from(
      new Map(codes.map((item) => [item.code, item])).values()
    );

    return uniqueCodes;
  } catch (error) {
    throw new Error(`Failed to load O*NET data: ${error.message}`);
  }
}

/**
 * Load progress from file or initialize fresh
 */
async function loadProgress() {
  if (!options.resume) {
    return initializeProgress();
  }

  try {
    const data = await fs.readFile(PROGRESS_PATH, "utf8");
    const progress = JSON.parse(data);
    console.log("✓ Loaded progress from previous session");
    console.log(`  Completed: ${progress.completedOccupations.length} occupations`);
    console.log(`  Failed: ${progress.failedOccupations.length} occupations`);
    console.log(`  Requests today: ${progress.dailyRequestCount}`);
    return progress;
  } catch (error) {
    console.log("No previous progress found, starting fresh");
    return initializeProgress();
  }
}

/**
 * Initialize fresh progress object
 */
function initializeProgress() {
  return {
    version: "1.0",
    started: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    completedOccupations: [],
    failedOccupations: [],
    currentGeography: "National",
    dailyRequestCount: 0,
    lastRequestDate: new Date().toISOString().split("T")[0],
    totalRequests: 0,
  };
}

/**
 * Save progress to file
 */
async function saveProgress(progress) {
  progress.lastUpdated = new Date().toISOString();

  // Ensure directory exists
  const dir = path.dirname(PROGRESS_PATH);
  if (!fsSync.existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }

  await fs.writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

/**
 * Check if we're under rate limit
 */
function rateLimitCheck(progress) {
  const today = new Date().toISOString().split("T")[0];

  // Reset counter if it's a new day
  if (progress.lastRequestDate !== today) {
    progress.dailyRequestCount = 0;
    progress.lastRequestDate = today;
  }

  const remaining = DAILY_REQUEST_LIMIT - REQUEST_BUFFER - progress.dailyRequestCount;

  if (remaining <= 0) {
    console.log("\n⚠ Daily API limit reached (490 requests)");
    console.log("Resume tomorrow to continue fetching data");
    return false;
  }

  return true;
}

/**
 * Build BLS series IDs for a given SOC code and geography
 * Format: OEUM{AREA}{SOC}{DATA_TYPE}
 * Example: OEUM0000000011202103 (National, SOC 11-2021, annual mean wage)
 */
function buildSeriesIds(socCode, areaCode) {
  // Remove hyphens from SOC code (e.g., "11-2021" → "1120210")
  const socFormatted = socCode.replace(/-/g, "") + "0";

  const seriesIds = Object.keys(DATA_TYPES).map((dataType) => {
    return `OEUM${areaCode}${socFormatted}${dataType}`;
  });

  return seriesIds;
}

/**
 * Fetch batch of series from BLS API with retry logic
 */
async function fetchBatch(seriesIds, retryCount = 0) {
  const requestBody = {
    seriesid: seriesIds,
    registrationkey: BLS_API_KEY,
    startyear: "2023",
    endyear: "2024",
  };

  try {
    const response = await fetch(BLS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "REQUEST_SUCCEEDED") {
      throw new Error(`API error: ${data.message?.[0] || "Unknown error"}`);
    }

    return data;
  } catch (error) {
    if (retryCount < RETRY_ATTEMPTS) {
      const delay = RETRY_DELAYS[retryCount];
      console.log(`  Retry ${retryCount + 1}/${RETRY_ATTEMPTS} in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchBatch(seriesIds, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Parse BLS API response into our wage data format
 */
function parseResponse(response, socCode, geography) {
  const wages = {
    hourlyMean: 0,
    hourlyMedian: 0,
    annualMean: 0,
    annualMedian: 0,
    percentile10: 0,
    percentile25: 0,
    percentile75: 0,
    percentile90: 0,
  };

  let employment = 0;
  let dataDate = null;

  if (!response.Results || !response.Results.series) {
    return { employment, wages, dataDate };
  }

  // Process each series in the response
  response.Results.series.forEach((series) => {
    if (!series.data || series.data.length === 0) {
      return;
    }

    // Get most recent data point
    const latestData = series.data[0];
    const value = parseFloat(latestData.value);

    if (isNaN(value)) {
      return;
    }

    // Extract data type from series ID (last 2 digits)
    const dataType = series.seriesID.slice(-2);
    const dataKey = DATA_TYPES[dataType];

    // Set data date from first series (they should all be the same)
    if (!dataDate && latestData.year && latestData.period) {
      // Period format: M13 (annual), M01-M12 (monthly)
      // We want annual data which uses M13
      if (latestData.period === "M13") {
        dataDate = `${latestData.year}-05`; // May is when OEWS data is typically published
      }
    }

    // Map to our data structure
    if (dataKey === "employment") {
      employment = Math.round(value);
    } else if (dataKey in wages) {
      wages[dataKey] = value;
    }
  });

  return { employment, wages, dataDate };
}

/**
 * Process a single occupation across all geographies
 */
async function processOccupation(occupation, geographies, progress, allData) {
  const { code, title } = occupation;

  console.log(`\n[${new Date().toLocaleTimeString()}] Fetching ${code} - ${title}`);

  const occupationData = {
    code,
    title,
    employment: 0,
    wages: {},
    geography: "National",
    dataDate: null,
    stateData: {},
  };

  // Process each geography
  for (const [geoName, geoCode] of Object.entries(geographies)) {
    // Check rate limit before each request
    if (!rateLimitCheck(progress)) {
      return false; // Signal to stop processing
    }

    try {
      const seriesIds = buildSeriesIds(code, geoCode);

      console.log(
        `  ${geoName.padEnd(10)} [${progress.totalRequests + 1}/${estimateTotalRequests(geographies)}]`
      );

      const response = await fetchBatch(seriesIds);
      const { employment, wages, dataDate } = parseResponse(response, code, geoName);

      progress.dailyRequestCount++;
      progress.totalRequests++;

      // Store data
      if (geoName === "National") {
        occupationData.employment = employment;
        occupationData.wages = wages;
        occupationData.dataDate = dataDate;
        occupationData.geography = "National";
      } else {
        occupationData.stateData[geoName] = {
          employment,
          wages,
        };
      }

      // Add small delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      await logError(code, geoName, error.message);
      console.log(`  ✗ ${geoName}: ${error.message}`);
    }
  }

  // Add to output data
  allData.occupations.push(occupationData);

  // Mark as completed
  progress.completedOccupations.push(code);

  // Save progress after each occupation
  await saveProgress(progress);

  const remaining = DAILY_REQUEST_LIMIT - REQUEST_BUFFER - progress.dailyRequestCount;
  console.log(`  ✓ Complete. Requests remaining today: ${remaining}`);

  return true; // Continue processing
}

/**
 * Estimate total requests needed
 */
function estimateTotalRequests(geographies) {
  const geoCount = Object.keys(geographies).length;
  return 830 * geoCount; // Approximate
}

/**
 * Log error to file
 */
async function logError(socCode, geography, errorMessage) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${socCode} (${geography}): ${errorMessage}\n`;

  try {
    await fs.appendFile(ERROR_LOG_PATH, logEntry);
  } catch (error) {
    console.error("Failed to write to error log:", error.message);
  }
}

/**
 * Load existing output data if resuming
 */
async function loadExistingOutput() {
  try {
    const data = await fs.readFile(OUTPUT_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Save output data
 */
async function saveOutput(outputData) {
  // Ensure directory exists
  const dir = path.dirname(OUTPUT_PATH);
  if (!fsSync.existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(outputData, null, 2));
}

/**
 * Validate prerequisites before starting
 */
async function validatePrerequisites() {
  console.log("Validating prerequisites...\n");

  // Check O*NET file exists
  try {
    await fs.access(ONET_DATA_PATH);
    console.log("✓ O*NET occupation data found");
  } catch (error) {
    throw new Error(
      `O*NET data not found at ${ONET_DATA_PATH}\n` +
        `Run 'npm run onet:download' first to download O*NET data.`
    );
  }

  // Test API key with a simple request
  console.log("✓ Testing API connection...");
  try {
    const testSeriesIds = ["OEUM00000000011021103"]; // Test with one series
    const response = await fetchBatch(testSeriesIds);
    if (response.status === "REQUEST_SUCCEEDED") {
      console.log("✓ API connection successful\n");
    }
  } catch (error) {
    throw new Error(`API test failed: ${error.message}\nCheck API key and internet connection.`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("BLS API Batch Fetcher for JobEval");
  console.log("=".repeat(50));
  console.log(`Mode: ${options.reset ? "Fresh start" : "Resume from progress"}`);
  if (options.geography !== "all") {
    console.log(`Geography: ${options.geography} only (test mode)`);
  }
  if (options.limit > 0) {
    console.log(`Limit: First ${options.limit} occupations (test mode)`);
  }
  console.log("=".repeat(50));
  console.log();

  try {
    // Step 1: Validate prerequisites
    await validatePrerequisites();

    // Step 2: Load occupation codes
    console.log("Loading occupation codes...");
    let occupations = await loadOccupationCodes();
    console.log(`✓ Loaded ${occupations.length} unique SOC codes\n`);

    // Step 3: Determine geographies to process
    let geographies = { ...GEOGRAPHIES };
    if (options.geography === "national") {
      geographies = { National: GEOGRAPHIES.National };
      console.log("Test mode: National data only\n");
    }

    // Step 4: Apply limit if specified
    if (options.limit > 0) {
      occupations = occupations.slice(0, options.limit);
      console.log(`Test mode: Processing first ${occupations.length} occupations\n`);
    }

    // Step 5: Load or initialize progress
    let progress = await loadProgress();

    // Step 6: Load or initialize output data
    let outputData = null;
    if (options.resume) {
      outputData = await loadExistingOutput();
    }

    if (!outputData) {
      outputData = {
        version: "1.0",
        dataDate: new Date().toISOString().split("T")[0],
        source: "BLS OEWS API",
        metadata: {
          fetchStarted: progress.started,
          lastUpdated: new Date().toISOString(),
          totalOccupations: occupations.length,
          completedOccupations: 0,
          totalRequests: estimateTotalRequests(geographies),
          completedRequests: 0,
          failedRequests: 0,
          geographies: Object.keys(geographies),
        },
        occupations: [],
      };
    }

    // Step 7: Filter out already completed occupations
    const remainingOccupations = occupations.filter(
      (occ) => !progress.completedOccupations.includes(occ.code)
    );

    console.log(`Processing ${remainingOccupations.length} remaining occupations...`);
    console.log(`Already completed: ${progress.completedOccupations.length}`);
    console.log(`Requests used today: ${progress.dailyRequestCount}/${DAILY_REQUEST_LIMIT - REQUEST_BUFFER}`);
    console.log();

    // Step 8: Process each occupation
    let shouldContinue = true;
    for (const occupation of remainingOccupations) {
      shouldContinue = await processOccupation(occupation, geographies, progress, outputData);

      if (!shouldContinue) {
        console.log("\nStopping due to rate limit...");
        break;
      }

      // Update metadata
      outputData.metadata.completedOccupations = progress.completedOccupations.length;
      outputData.metadata.completedRequests = progress.totalRequests;
      outputData.metadata.lastUpdated = new Date().toISOString();

      // Save output periodically (every 10 occupations)
      if (progress.completedOccupations.length % 10 === 0) {
        await saveOutput(outputData);
        console.log(`  💾 Progress saved (${progress.completedOccupations.length} occupations)`);
      }
    }

    // Step 9: Final save
    await saveOutput(outputData);
    console.log("\n" + "=".repeat(50));
    console.log("FETCH SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total occupations: ${occupations.length}`);
    console.log(`Completed: ${progress.completedOccupations.length}`);
    console.log(`Remaining: ${occupations.length - progress.completedOccupations.length}`);
    console.log(`Total API requests: ${progress.totalRequests}`);
    console.log(`Requests today: ${progress.dailyRequestCount}`);
    console.log(`Output saved to: ${OUTPUT_PATH}`);

    if (progress.completedOccupations.length === occupations.length) {
      console.log("\n✓ All occupations fetched successfully!");
    } else {
      console.log(`\n⚠ Partially complete. Run again to continue.`);
    }

    console.log();
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}`);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the fetcher
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
