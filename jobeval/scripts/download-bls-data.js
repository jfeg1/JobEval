#!/usr/bin/env node
/**
 * BLS Data Download Script (Auto-Updating XLSX Version)
 *
 * Downloads the latest Occupational Employment and Wage Statistics (OES) data
 * from the Bureau of Labor Statistics Special Requests page.
 *
 * Features:
 * - Automatically determines which year of data to download
 * - Checks URL availability before downloading
 * - Falls back to previous year if current year not available
 * - Supports manual year override: --year=XX
 * - Detects corrupt downloads (0 bytes)
 *
 * Usage:
 *   node scripts/download-bls-data.js           # Auto-detect year
 *   node scripts/download-bls-data.js --year=23 # Download specific year
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = path.join(__dirname, "..", "data", "raw");

/**
 * Determine which year of data to download
 * - Checks for --year=XX command line argument
 * - Before April: uses last year
 * - April or later: uses current year
 *
 * Returns: Two-digit year string (e.g., '24' for 2024)
 */
function determineDataYear() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Parse command line argument if provided
  const yearArg = process.argv.find(arg => arg.startsWith('--year='));
  if (yearArg) {
    const year = yearArg.split('=')[1];
    console.log(`Using manually specified year: 20${year}`);
    return year;
  }

  // BLS typically releases May data in late March/early April
  // Before April: Use last year's data
  if (currentMonth < 4) {
    const lastYear = (currentYear - 1).toString().slice(-2);
    console.log(`Before April - using last year's data (20${lastYear})`);
    return lastYear;
  }

  // April or later: Try current year first
  const thisYear = currentYear.toString().slice(-2);
  console.log(`After April - trying current year data (20${thisYear})`);
  return thisYear;
}

/**
 * Check if a URL is accessible (returns 200)
 */
function checkUrlAvailability(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };

    const request = https.request(options, (response) => {
      // Follow redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        return checkUrlAvailability(redirectUrl).then(resolve);
      }

      resolve(response.statusCode === 200);
    });

    request.on('error', () => resolve(false));
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });

    request.end();
  });
}

/**
 * Find the latest available year by checking URLs
 * Tries the suggested year first, then falls back to previous years
 */
async function findAvailableYear(startYear) {
  const yearNum = parseInt(startYear, 10);

  console.log('\nChecking data availability...');

  // Try up to 3 years back
  for (let i = 0; i < 3; i++) {
    const testYear = (yearNum - i).toString().padStart(2, '0');
    const testFilename = `oesm${testYear}nat.zip`;
    const testUrl = `https://www.bls.gov/oes/special-requests/${testFilename}`;

    process.stdout.write(`  Checking 20${testYear}... `);

    const isAvailable = await checkUrlAvailability(testUrl);

    if (isAvailable) {
      console.log('✓ Available');
      return { year: testYear, filename: testFilename, url: testUrl };
    } else {
      console.log('✗ Not found');
    }
  }

  // If nothing found, return the original suggestion and let download fail with helpful error
  const fallbackFilename = `oesm${startYear}nat.zip`;
  const fallbackUrl = `https://www.bls.gov/oes/special-requests/${fallbackFilename}`;

  console.log('\n⚠ Warning: Could not find available data for recent years.');
  console.log('Will attempt to download suggested year, but it may fail.');

  return { year: startYear, filename: fallbackFilename, url: fallbackUrl };
}

/**
 * Download a file from a URL with progress reporting
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`\nDownloading: ${url}`);

    const file = createWriteStream(destPath);

    // Parse URL to get hostname and path
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
      },
    };

    const request = https.get(options, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        console.log(`Redirected to: ${redirectUrl}`);
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);

        let errorMsg = `Failed to download: ${response.statusCode} ${response.statusMessage}`;

        if (response.statusCode === 403 || response.statusCode === 404) {
          errorMsg += '\n\nPossible causes:';
          errorMsg += '\n  - Data for this year has not been released yet';
          errorMsg += '\n  - URL format has changed on BLS website';
          errorMsg += '\n\nTroubleshooting:';
          errorMsg += '\n  1. Visit https://www.bls.gov/oes/special-requests/ to check available files';
          errorMsg += '\n  2. Try downloading a previous year: npm run data:download -- --year=23';
          errorMsg += '\n  3. Check if BLS has changed their URL structure';
        }

        reject(new Error(errorMsg));
        return;
      }

      const totalBytes = parseInt(response.headers["content-length"] || "0", 10);
      let downloadedBytes = 0;
      let lastProgressUpdate = Date.now();

      response.on("data", (chunk) => {
        downloadedBytes += chunk.length;

        // Update progress every 500ms
        const now = Date.now();
        if (now - lastProgressUpdate > 500) {
          const percentComplete = totalBytes
            ? ((downloadedBytes / totalBytes) * 100).toFixed(1)
            : "?";
          const mbDownloaded = (downloadedBytes / (1024 * 1024)).toFixed(2);
          const mbTotal = totalBytes
            ? (totalBytes / (1024 * 1024)).toFixed(2)
            : "?";
          process.stdout.write(
            `\r  Progress: ${percentComplete}% (${mbDownloaded}/${mbTotal} MB)`
          );
          lastProgressUpdate = now;
        }
      });

      response.pipe(file);

      file.on("finish", () => {
        file.close();
        console.log(); // New line after progress

        // Verify file was actually downloaded
        const stats = fs.statSync(destPath);
        if (stats.size === 0) {
          console.error(`✗ Downloaded file is empty (0 bytes): ${path.basename(destPath)}`);
          console.error('\nThis usually means:');
          console.error('  - The file does not exist on the BLS server');
          console.error('  - The URL is incorrect');
          console.error('\nTry downloading a previous year: npm run data:download -- --year=23');
          reject(new Error("Downloaded file is empty"));
          return;
        }

        // Warn if file is suspiciously small (should be 20-30 MB)
        if (stats.size < 1024 * 1024) {
          console.warn(`⚠ Warning: File is only ${stats.size} bytes - expected ~20-30 MB`);
          console.warn('The download may be incomplete or corrupted.');
        }

        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`✓ Downloaded: ${path.basename(destPath)} (${sizeInMB} MB)`);
        resolve();
      });
    });

    request.on("error", (err) => {
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      reject(err);
    });

    request.setTimeout(60000, () => {
      request.destroy();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      reject(new Error('Download timed out after 60 seconds'));
    });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log("BLS Data Download Script (Auto-Updating XLSX Version)");
  console.log("=====================================================\n");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}\n`);
  }

  // Step 1: Determine which year to download
  const suggestedYear = determineDataYear();

  // Step 2: Find available year (with fallback)
  const { year, filename, url } = await findAvailableYear(suggestedYear);

  const outputFile = path.join(OUTPUT_DIR, filename);

  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    const stats = fs.statSync(outputFile);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\nFile already exists: ${outputFile} (${sizeInMB} MB)`);
    console.log("\nOptions:");
    console.log("  - To re-download, delete the existing file and run again:");
    console.log(`    rm "${outputFile}"`);
    console.log("  - To download a different year:");
    console.log("    npm run data:download -- --year=23");
    console.log("  - To proceed to processing:");
    console.log("    npm run data:process\n");
    return;
  }

  console.log("\nDownloading BLS OES Special Requests file...");
  console.log("This is a ~20-30 MB ZIP file containing Excel data.");

  try {
    await downloadFile(url, outputFile);

    console.log("\n" + "=".repeat(50));
    console.log("✓ BLS data downloaded successfully!");
    console.log("=".repeat(50));
    console.log("\nFile downloaded:");
    console.log(`  ${outputFile}`);
    console.log(`  Data period: May 20${year}`);
    console.log("\nNext steps:");
    console.log("  1. Run: npm run data:process");
    console.log("  2. This will extract and process the Excel data\n");
  } catch (error) {
    console.error(`\n✗ Download failed:\n${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
