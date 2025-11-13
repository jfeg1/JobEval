#!/usr/bin/env node
/**
 * BLS Data Processing Script (Auto-Updating XLSX Version)
 *
 * Extracts and processes BLS OES Excel files into optimized JSON format.
 *
 * Features:
 * - Automatically detects any BLS ZIP file in data/raw/
 * - Uses the most recent file if multiple exist
 * - Extracts year from filename (no hard-coding)
 * - Flexible column name matching (handles BLS format changes)
 *
 * Usage: node scripts/process-bls-data.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RAW_DIR = path.join(__dirname, "..", "data", "raw");
const EXTRACTED_DIR = path.join(RAW_DIR, "extracted");
const PUBLIC_DATA_DIR = path.join(__dirname, "..", "public", "data");

// Occupational group names by SOC major group code
const GROUP_NAMES = {
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

/**
 * Find the most recent BLS ZIP file in the raw directory
 * Returns: { filename, path, year, fullYear }
 */
function findMostRecentZip() {
  console.log('Looking for BLS data files...\n');

  if (!fs.existsSync(RAW_DIR)) {
    throw new Error(
      `Data directory not found: ${RAW_DIR}\n` +
      `Run 'npm run data:download' first.`
    );
  }

  const files = fs.readdirSync(RAW_DIR);

  // Find all OEWS ZIP files (pattern: oesmXXnat.zip where XX is 2-digit year)
  const zipFiles = files.filter(f => /^oesm\d{2}nat\.zip$/i.test(f));

  if (zipFiles.length === 0) {
    throw new Error(
      `No BLS data files found in ${RAW_DIR}\n` +
      `Expected filename pattern: oesmXXnat.zip (e.g., oesm24nat.zip)\n` +
      `Run 'npm run data:download' to download BLS data.`
    );
  }

  console.log('Available BLS data files:');
  zipFiles.forEach(f => {
    const stats = fs.statSync(path.join(RAW_DIR, f));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const year = f.match(/oesm(\d{2})nat/i)[1];
    console.log(`  - ${f} (20${year}, ${sizeMB} MB)`);
  });

  // Sort by year (newest first)
  zipFiles.sort().reverse();

  const selectedFile = zipFiles[0];
  const year = selectedFile.match(/oesm(\d{2})nat/i)[1];
  const fullYear = `20${year}`;

  console.log(`\nUsing: ${selectedFile} (May ${fullYear} data)\n`);

  return {
    filename: selectedFile,
    path: path.join(RAW_DIR, selectedFile),
    year: year,
    fullYear: fullYear
  };
}

/**
 * Extract ZIP file
 */
function extractZipFile(zipPath) {
  console.log("Extracting ZIP file...");

  if (!fs.existsSync(zipPath)) {
    throw new Error(`ZIP file not found: ${zipPath}`);
  }

  // Clean and create extraction directory
  if (fs.existsSync(EXTRACTED_DIR)) {
    fs.rmSync(EXTRACTED_DIR, { recursive: true });
  }
  fs.mkdirSync(EXTRACTED_DIR, { recursive: true });

  try {
    // Use unzip command (should be available on most systems)
    execSync(`unzip -o "${zipPath}" -d "${EXTRACTED_DIR}"`, {
      stdio: "pipe",
    });
    console.log(`✓ Extracted to: ${EXTRACTED_DIR}\n`);
  } catch (error) {
    throw new Error(`Failed to extract ZIP: ${error.message}`);
  }
}

/**
 * Find the main Excel file in extracted directory
 */
function findExcelFile() {
  console.log("Looking for Excel file...");

  const files = fs.readdirSync(EXTRACTED_DIR);

  // Look for Excel files with "nat" (national) in the name
  const xlsxFiles = files.filter(
    (f) => f.endsWith(".xlsx") && f.toLowerCase().includes("nat")
  );

  if (xlsxFiles.length === 0) {
    console.log('Files in extracted directory:');
    files.forEach(f => console.log(`  - ${f}`));
    throw new Error(
      'No Excel file found in extracted directory.\n' +
      'Expected a file with "nat" (national) in the name and .xlsx extension.'
    );
  }

  const excelFile = path.join(EXTRACTED_DIR, xlsxFiles[0]);
  console.log(`✓ Found: ${xlsxFiles[0]}\n`);
  return excelFile;
}

/**
 * Parse Excel file and extract occupation data
 */
function parseExcelFile(filePath) {
  console.log("Reading Excel file...");

  // Read the workbook
  const workbook = XLSX.readFile(filePath);

  // Get the first worksheet (usually "All May 20XX Data")
  const sheetName = workbook.SheetNames[0];
  console.log(`  Sheet: ${sheetName}`);

  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON (with header row)
  const data = XLSX.utils.sheet_to_json(worksheet);
  console.log(`  Rows: ${data.length}`);

  console.log(`✓ Loaded ${data.length} rows\n`);
  return data;
}

/**
 * Parse a value that might be a number, "*", or "#"
 * Returns 0 for missing/invalid values
 */
function parseValue(val) {
  if (val === undefined || val === null || val === "" || val === "*" || val === "#") {
    return 0;
  }
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Process raw Excel data into our format
 */
function processOccupations(rawData) {
  console.log("Processing occupations...");

  const occupations = [];
  let processedCount = 0;
  let skippedCount = 0;

  for (const row of rawData) {
    // Extract fields with various possible column names
    const occCode = row.OCC_CODE || row.occ_code || row["OCC CODE"];
    const occTitle = row.OCC_TITLE || row.occ_title || row["OCC TITLE"];

    // Wage fields - trying various column name formats
    const hourlyMean = parseValue(row.H_MEAN || row.h_mean || row["H_MEAN"]);
    const hourlyMedian = parseValue(row.H_MEDIAN || row.h_median || row["H_MEDIAN"]);
    const annualMean = parseValue(row.A_MEAN || row.a_mean || row["A_MEAN"]);
    const annualMedian = parseValue(row.A_MEDIAN || row.a_median || row["A_MEDIAN"]);
    const percentile10 = parseValue(row.A_PCT10 || row.a_pct10 || row["A_PCT10"]);
    const percentile25 = parseValue(row.A_PCT25 || row.a_pct25 || row["A_PCT25"]);
    const percentile75 = parseValue(row.A_PCT75 || row.a_pct75 || row["A_PCT75"]);
    const percentile90 = parseValue(row.A_PCT90 || row.a_pct90 || row["A_PCT90"]);

    // Skip if missing required fields
    if (!occCode || !occTitle) {
      skippedCount++;
      continue;
    }

    // Skip summary codes (major groups end in 0000, minor groups end in X000)
    if (occCode.endsWith("0000") || /^\d{2}-\d000$/.test(occCode)) {
      skippedCount++;
      continue;
    }

    // Must have at least median annual wage
    if (!annualMedian || annualMedian === 0) {
      skippedCount++;
      continue;
    }

    // Determine occupational group from code
    const majorGroup = occCode.substring(0, 2);
    const group = GROUP_NAMES[majorGroup] || "Other";

    occupations.push({
      code: occCode,
      title: occTitle,
      group,
      wages: {
        hourly: {
          mean: hourlyMean,
          median: hourlyMedian,
        },
        annual: {
          mean: annualMean,
          median: annualMedian,
        },
        percentiles: {
          10: percentile10,
          25: percentile25,
          75: percentile75,
          90: percentile90,
        },
      },
    });

    processedCount++;
  }

  console.log(`✓ Processed ${processedCount} occupations`);
  console.log(`  Skipped ${skippedCount} rows (summaries or incomplete data)\n`);

  return occupations;
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
  console.log("BLS Data Processing Script (Auto-Updating XLSX Version)");
  console.log("========================================================\n");

  try {
    // Step 1: Find most recent ZIP file
    const zipInfo = findMostRecentZip();

    // Step 2: Extract ZIP file
    extractZipFile(zipInfo.path);

    // Step 3: Find Excel file
    const excelFile = findExcelFile();

    // Step 4: Parse Excel file
    const rawData = parseExcelFile(excelFile);

    // Step 5: Process occupations
    const occupations = processOccupations(rawData);

    if (occupations.length === 0) {
      console.error("\n✗ No occupations with wage data found.");
      console.error("Check the Excel file format and column names.");
      process.exit(1);
    }

    // Step 6: Build search index
    const index = buildSearchIndex(occupations);

    // Step 7: Save processed data
    if (!fs.existsSync(PUBLIC_DATA_DIR)) {
      fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
    }

    const outputData = {
      version: "2.0",
      source: "U.S. Bureau of Labor Statistics - OES Special Requests",
      sourceUrl: "https://www.bls.gov/oes/special-requests/",
      dataDate: `${zipInfo.fullYear}-05`,  // May of the extracted year
      metadata: {
        totalOccupations: occupations.length,
        lastUpdated: new Date().toISOString(),
        dataFormat: "xlsx",
        dataPeriod: `May ${zipInfo.fullYear}`,
        sourceFile: zipInfo.filename
      },
      occupations,
      index,
    };

    const outputPath = path.join(PUBLIC_DATA_DIR, "bls-data.json");
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log(`✓ Saved processed data to: ${outputPath}`);

    // Calculate file size
    const stats = fs.statSync(outputPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  File size: ${fileSizeInMB} MB`);

    console.log("\n" + "=".repeat(50));
    console.log("✓ Data processing complete!");
    console.log("=".repeat(50));
    console.log(`\nProcessed ${occupations.length} occupations with wage data`);
    console.log(`Data period: May ${zipInfo.fullYear}`);
    console.log(`Search index contains ${Object.keys(index).length} terms`);
    console.log("\nNext steps:");
    console.log("  Run the app with: npm run dev");
    console.log("  Or explore the data at: public/data/bls-data.json\n");
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}`);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
