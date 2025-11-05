#!/usr/bin/env node
/**
 * BLS Data Processing Script
 * 
 * Extracts and transforms BLS OEWS data from Excel files into optimized JSON format.
 * 
 * Usage: node scripts/process-bls-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RAW_DATA_DIR = path.join(__dirname, '..', 'data', 'raw');
const PROCESSED_DATA_DIR = path.join(__dirname, '..', 'data', 'processed');
const PUBLIC_DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const CURRENT_YEAR = '24';
const ZIP_FILE = `oesm${CURRENT_YEAR}nat.zip`;

/**
 * Extract ZIP file
 */
function extractZip(zipPath, outputDir) {
  console.log(`Extracting: ${path.basename(zipPath)}`);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    execSync(`unzip -o "${zipPath}" -d "${outputDir}"`, { stdio: 'pipe' });
    console.log(`✓ Extracted to: ${outputDir}\n`);
  } catch (error) {
    console.error('Error extracting ZIP:', error.message);
    throw error;
  }
}

/**
 * Find the main national data Excel file
 */
function findNationalDataFile(dir) {
  const files = fs.readdirSync(dir);
  
  // Look for files with patterns like: national_M2024_dl.xlsx, nat_may_2024.xlsx, etc.
  const patterns = [
    /national.*\.xlsx?$/i,
    /nat.*\.xlsx?$/i,
    /all_data.*\.xlsx?$/i
  ];
  
  for (const pattern of patterns) {
    const match = files.find(f => pattern.test(f));
    if (match) {
      console.log(`Found data file: ${match}`);
      return path.join(dir, match);
    }
  }
  
  // If no match, list all Excel files for debugging
  const excelFiles = files.filter(f => /\.xlsx?$/i.test(f));
  if (excelFiles.length > 0) {
    console.log('Available Excel files:', excelFiles);
    return path.join(dir, excelFiles[0]);
  }
  
  throw new Error('Could not find national data Excel file');
}

/**
 * Parse Excel file and extract occupation data
 */
function parseExcelData(filePath) {
  console.log('Parsing Excel data...');
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`Parsed ${data.length} rows\n`);
  
  // Transform into our format
  const occupations = [];
  const occupationIndex = {};
  
  for (const row of data) {
    // BLS column names vary by year, so we need to be flexible
    // Common column names:
    // - OCC_CODE, PRIM_STATE, O_GROUP, OCC_TITLE, TOT_EMP
    // - H_MEAN, A_MEAN, H_MEDIAN, A_MEDIAN
    // - H_PCT10, H_PCT25, H_PCT75, H_PCT90
    // - A_PCT10, A_PCT25, A_PCT75, A_PCT90
    
    const occCode = row['OCC_CODE'] || row['occ_code'] || row['code'];
    const occTitle = row['OCC_TITLE'] || row['occ_title'] || row['title'];
    
    if (!occCode || !occTitle) continue;
    if (occCode === 'OCC_CODE') continue; // Skip header rows
    
    // Skip summary codes (e.g., "00-0000")
    if (occCode.startsWith('00-')) continue;
    
    const occupation = {
      code: occCode,
      title: occTitle,
      group: row['O_GROUP'] || row['o_group'] || 'Other',
      employment: parseFloat(row['TOT_EMP'] || row['tot_emp'] || 0),
      wages: {
        hourlyMean: parseFloat(row['H_MEAN'] || row['h_mean'] || 0),
        hourlyMedian: parseFloat(row['H_MEDIAN'] || row['h_median'] || 0),
        annualMean: parseFloat(row['A_MEAN'] || row['a_mean'] || 0),
        annualMedian: parseFloat(row['A_MEDIAN'] || row['a_median'] || 0),
        percentile10: parseFloat(row['A_PCT10'] || row['a_pct10'] || 0),
        percentile25: parseFloat(row['A_PCT25'] || row['a_pct25'] || 0),
        percentile75: parseFloat(row['A_PCT75'] || row['a_pct75'] || 0),
        percentile90: parseFloat(row['A_PCT90'] || row['a_pct90'] || 0),
      },
      dataDate: '2024-05'
    };
    
    // Skip if no wage data
    if (occupation.wages.annualMedian === 0) continue;
    
    occupations.push(occupation);
    
    // Build search index (lowercase title words → occupation codes)
    const titleWords = occTitle.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Skip very short words
    
    for (const word of titleWords) {
      if (!occupationIndex[word]) {
        occupationIndex[word] = [];
      }
      if (!occupationIndex[word].includes(occCode)) {
        occupationIndex[word].push(occCode);
      }
    }
  }
  
  console.log(`✓ Processed ${occupations.length} occupations`);
  console.log(`✓ Built search index with ${Object.keys(occupationIndex).length} terms\n`);
  
  return { occupations, occupationIndex };
}

/**
 * Main execution
 */
async function main() {
  console.log('BLS Data Processing Script');
  console.log('==========================\n');
  
  const zipPath = path.join(RAW_DATA_DIR, ZIP_FILE);
  
  // Check if ZIP file exists
  if (!fs.existsSync(zipPath)) {
    console.error(`Error: ZIP file not found: ${zipPath}`);
    console.error('Please run: node scripts/download-bls-data.js first');
    process.exit(1);
  }
  
  // Extract ZIP
  const extractDir = path.join(PROCESSED_DATA_DIR, 'extracted');
  extractZip(zipPath, extractDir);
  
  // Find and parse Excel file
  const excelFile = findNationalDataFile(extractDir);
  const { occupations, occupationIndex } = parseExcelData(excelFile);
  
  // Create output directories
  if (!fs.existsSync(PUBLIC_DATA_DIR)) {
    fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  }
  
  // Save processed data
  const outputData = {
    version: '1.0',
    dataDate: '2024-05',
    source: 'U.S. Bureau of Labor Statistics - Occupational Employment and Wage Statistics',
    occupations,
    index: occupationIndex,
    metadata: {
      totalOccupations: occupations.length,
      lastUpdated: new Date().toISOString(),
    }
  };
  
  const outputPath = path.join(PUBLIC_DATA_DIR, 'bls-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log(`✓ Saved processed data to: ${outputPath}`);
  
  // Calculate file size
  const stats = fs.statSync(outputPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`File size: ${fileSizeInMB} MB`);
  
  // Create compressed version
  const compressedPath = path.join(PUBLIC_DATA_DIR, 'bls-data.min.json');
  fs.writeFileSync(compressedPath, JSON.stringify(outputData));
  const compressedStats = fs.statSync(compressedPath);
  const compressedSizeInMB = (compressedStats.size / (1024 * 1024)).toFixed(2);
  console.log(`Compressed size: ${compressedSizeInMB} MB`);
  
  console.log('\n✓ Data processing complete!');
  console.log('\nYou can now run the app with: npm run dev');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
