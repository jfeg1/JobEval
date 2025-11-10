#!/usr/bin/env node
/**
 * BLS Data Processing Script
 *
 * Parses BLS OES tab-delimited files and transforms into optimized JSON format.
 *
 * Usage: node scripts/process-bls-data.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import zlib from "zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RAW_DATA_DIR = path.join(__dirname, "..", "data", "raw");
const PUBLIC_DATA_DIR = path.join(__dirname, "..", "public", "data");

// Datatype codes we care about
const DATATYPES = {
  "03": "hourlyMean",
  "04": "annualMean",
  "11": "hourlyMedian",
  "12": "annualMedian",
  "13": "percentile10",
  "14": "percentile25",
  "15": "percentile75",
  "16": "percentile90",
};

/**
 * Parse a tab-delimited file line by line (handles gzip compression)
 */
async function parseTabDelimitedFile(filePath, processLine) {
  return new Promise((resolve, reject) => {
    // Create read stream
    const fileStream = fs.createReadStream(filePath);

    // Try to decompress with gunzip (will pass through if not gzipped)
    const gunzipStream = zlib.createGunzip();

    // Pipe file through gunzip
    const stream = fileStream.pipe(gunzipStream);

    // Handle gunzip errors (means file isn't gzipped)
    gunzipStream.on('error', (err) => {
      console.log('  Note: File is not gzipped, reading as plain text');
      // If not gzipped, read the file directly
      fileStream.destroy();
      const plainStream = fs.createReadStream(filePath);
      parseStream(plainStream, processLine, resolve, reject);
    });

    // Parse the decompressed stream
    parseStream(stream, processLine, resolve, reject);
  });
}

/**
 * Parse a stream of tab-delimited data
 */
function parseStream(stream, processLine, resolve, reject) {
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let headers = null;
  let lineCount = 0;

  rl.on("line", (line) => {
    lineCount++;
    const parts = line.split("\t");

    if (!headers) {
      headers = parts;
      return;
    }

    const row = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = parts[i] || "";
    }

    processLine(row);
  });

  rl.on("close", () => {
    console.log(`  Processed ${lineCount - 1} rows`);
    resolve();
  });

  rl.on("error", reject);
}

/**
 * Load occupation definitions
 */
async function loadOccupations() {
  console.log("Loading occupations...");
  const occupations = new Map();

  await parseTabDelimitedFile(
    path.join(RAW_DATA_DIR, "oe.occupation"),
    (row) => {
      const code = row.occupation_code;
      const name = row.occupation_name;

      if (code && name) {
        occupations.set(code, {
          code,
          title: name,
          wages: {},
        });
      }
    }
  );

  console.log(`✓ Loaded ${occupations.size} occupations\n`);
  return occupations;
}

/**
 * Build series index (maps series_id to occupation_code and datatype)
 */
async function buildSeriesIndex() {
  console.log("Building series index (this may take a while - 1.2GB file)...");
  const seriesIndex = new Map();

  await parseTabDelimitedFile(
    path.join(RAW_DATA_DIR, "oe.series"),
    (row) => {
      const seriesId = row.series_id;
      const occCode = row.occupation_code;
      const datatypeCode = row.datatype_code;
      const areaCode = row.area_code;
      const industryCode = row.industry_code;

      // We only want national-level (area 00), all-industry (000000) data
      if (areaCode === "00" && industryCode === "000000" && DATATYPES[datatypeCode]) {
        seriesIndex.set(seriesId, {
          occupation: occCode,
          datatype: DATATYPES[datatypeCode],
        });
      }
    }
  );

  console.log(`✓ Built series index with ${seriesIndex.size} relevant series\n`);
  return seriesIndex;
}

/**
 * Load wage data and join with occupations
 */
async function loadWageData(occupations, seriesIndex) {
  console.log("Loading wage data (this may take a while - 332MB file)...");
  let matchCount = 0;

  await parseTabDelimitedFile(
    path.join(RAW_DATA_DIR, "oe.data.0.Current"),
    (row) => {
      const seriesId = row.series_id;
      const value = parseFloat(row.value);

      if (!seriesIndex.has(seriesId) || isNaN(value)) {
        return;
      }

      const { occupation: occCode, datatype } = seriesIndex.get(seriesId);
      const occ = occupations.get(occCode);

      if (occ) {
        occ.wages[datatype] = value;
        matchCount++;
      }
    }
  );

  console.log(`✓ Matched ${matchCount} wage data points\n`);
}

/**
 * Filter to detailed occupations with complete data
 */
function filterOccupations(occupations) {
  console.log("Filtering occupations...");
  const filtered = [];

  for (const occ of occupations.values()) {
    // Skip if it's a summary code (major groups end in 0000, minor groups end in X000)
    if (occ.code.endsWith("0000") || /^\d{2}-\d000$/.test(occ.code)) {
      continue;
    }

    // Must have at least median annual wage
    if (!occ.wages.annualMedian || occ.wages.annualMedian === 0) {
      continue;
    }

    // Determine occupational group from code
    const majorGroup = occ.code.substring(0, 2);
    const groupNames = {
      "11": "Management",
      "13": "Business and Financial Operations",
      "15": "Computer and Mathematical",
      "17": "Architecture and Engineering",
      "19": "Life, Physical, and Social Science",
      "21": "Community and Social Service",
      "23": "Legal",
      "25": "Educational Instruction and Library",
      "27": "Arts, Design, Entertainment, Sports, and Media",
      "29": "Healthcare Practitioners and Technical",
      "31": "Healthcare Support",
      "33": "Protective Service",
      "35": "Food Preparation and Serving",
      "37": "Building and Grounds Cleaning and Maintenance",
      "39": "Personal Care and Service",
      "41": "Sales and Related",
      "43": "Office and Administrative Support",
      "45": "Farming, Fishing, and Forestry",
      "47": "Construction and Extraction",
      "49": "Installation, Maintenance, and Repair",
      "51": "Production",
      "53": "Transportation and Material Moving",
    };

    filtered.push({
      code: occ.code,
      title: occ.title,
      group: groupNames[majorGroup] || "Other",
      employment: occ.employment || 0,
      wages: {
        hourlyMean: occ.wages.hourlyMean || 0,
        hourlyMedian: occ.wages.hourlyMedian || 0,
        annualMean: occ.wages.annualMean || 0,
        annualMedian: occ.wages.annualMedian || 0,
        percentile10: occ.wages.percentile10 || 0,
        percentile25: occ.wages.percentile25 || 0,
        percentile75: occ.wages.percentile75 || 0,
        percentile90: occ.wages.percentile90 || 0,
      },
      dataDate: "2024-05",
    });
  }

  console.log(`✓ Filtered to ${filtered.length} detailed occupations\n`);
  return filtered;
}

/**
 * Build search index
 */
function buildSearchIndex(occupations) {
  console.log("Building search index...");
  const index = {};

  for (const occ of occupations) {
    const titleWords = occ.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2);

    for (const word of titleWords) {
      if (!index[word]) {
        index[word] = [];
      }
      if (!index[word].includes(occ.code)) {
        index[word].push(occ.code);
      }
    }
  }

  console.log(`✓ Built search index with ${Object.keys(index).length} terms\n`);
  return index;
}

/**
 * Main execution
 */
async function main() {
  console.log("BLS Data Processing Script");
  console.log("==========================\n");

  // Check if required files exist
  const requiredFiles = ["oe.occupation", "oe.series", "oe.data.0.Current"];
  for (const file of requiredFiles) {
    const filePath = path.join(RAW_DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`Error: Required file not found: ${filePath}`);
      console.error("Please run: npm run data:download first");
      process.exit(1);
    }
  }

  // Process data
  const occupations = await loadOccupations();

  if (occupations.size === 0) {
    console.error("\n✗ No occupations loaded. Check if files are properly formatted.");
    process.exit(1);
  }

  const seriesIndex = await buildSeriesIndex();

  if (seriesIndex.size === 0) {
    console.error("\n✗ No series found. Check series file format.");
    process.exit(1);
  }

  await loadWageData(occupations, seriesIndex);
  const filtered = filterOccupations(occupations);

  if (filtered.length === 0) {
    console.error("\n✗ No occupations with wage data found.");
    console.error("This might mean:");
    console.error("  - Series IDs don't match occupation codes");
    console.error("  - Wage data is in unexpected format");
    console.error("  - Filtering criteria are too strict");
    process.exit(1);
  }

  const index = buildSearchIndex(filtered);

  // Create output directory
  if (!fs.existsSync(PUBLIC_DATA_DIR)) {
    fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  }

  // Save processed data
  const outputData = {
    version: "1.0",
    dataDate: "2024-05",
    source: "U.S. Bureau of Labor Statistics - Occupational Employment and Wage Statistics",
    occupations: filtered,
    index,
    metadata: {
      totalOccupations: filtered.length,
      lastUpdated: new Date().toISOString(),
    },
  };

  const outputPath = path.join(PUBLIC_DATA_DIR, "bls-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

  console.log(`✓ Saved processed data to: ${outputPath}`);

  // Calculate file size
  const stats = fs.statSync(outputPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`File size: ${fileSizeInMB} MB`);

  console.log("\n✓ Data processing complete!");
  console.log(`\nProcessed ${filtered.length} occupations with wage data`);
  console.log("\nNext steps:");
  console.log("  1. Run: npm run onet:download");
  console.log("  2. Then: node scripts/process-onet-data.js");
  console.log("  3. Finally: node scripts/integrate-onet-bls.js");
  console.log("\nOr run the app with: npm run dev");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
