#!/usr/bin/env node
/**
 * BLS Data Download Script
 *
 * Downloads the latest Occupational Employment and Wage Statistics (OES) data
 * from the Bureau of Labor Statistics.
 *
 * Note: BLS servers require a User-Agent header to prevent 403 Forbidden errors.
 *
 * Usage: node scripts/download-bls-data.js
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BLS_BASE_URL = "https://download.bls.gov/pub/time.series/oe";
const OUTPUT_DIR = path.join(__dirname, "..", "data", "raw");

// Files to download - BLS uses tab-delimited text files
const FILES_TO_DOWNLOAD = [
  {
    name: "occupation",
    url: `${BLS_BASE_URL}/oe.occupation`,
    filename: "oe.occupation",
    description: "Occupation codes and titles (261KB)",
  },
  {
    name: "data-current",
    url: `${BLS_BASE_URL}/oe.data.0.Current`,
    filename: "oe.data.0.Current",
    description: "Current period wage data (332MB)",
  },
  {
    name: "area",
    url: `${BLS_BASE_URL}/oe.area`,
    filename: "oe.area",
    description: "Geographic area codes (22KB)",
  },
  {
    name: "datatype",
    url: `${BLS_BASE_URL}/oe.datatype`,
    filename: "oe.datatype",
    description: "Data type codes",
  },
  {
    name: "series",
    url: `${BLS_BASE_URL}/oe.series`,
    filename: "oe.series",
    description: "Series metadata (1.2GB - needed for parsing)",
  },
];

/**
 * Download a file from a URL with proper headers
 * BLS requires User-Agent header to prevent 403 errors
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);

    const file = createWriteStream(destPath);

    // Parse URL to get hostname and path
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
    };

    https
      .get(options, (response) => {
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
          reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();

          // Verify file was actually downloaded
          const stats = fs.statSync(destPath);
          if (stats.size === 0) {
            console.error(`✗ Downloaded file is empty: ${path.basename(destPath)}`);
            reject(new Error("Downloaded file is empty"));
            return;
          }

          const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`✓ Downloaded: ${path.basename(destPath)} (${sizeInMB} MB)`);
          resolve();
        });
      })
      .on("error", (err) => {
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        reject(err);
      });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log("BLS Data Download Script");
  console.log("========================\n");
  console.log("Note: This will download ~1.5GB of data. Please be patient.\n");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}\n`);
  }

  // Download each file
  for (const file of FILES_TO_DOWNLOAD) {
    const destPath = path.join(OUTPUT_DIR, file.filename);
    console.log(`\nDownloading: ${file.name}`);
    console.log(`Description: ${file.description}`);

    try {
      await downloadFile(file.url, destPath);
    } catch (error) {
      console.error(`✗ Failed to download ${file.name}:`, error.message);
      process.exit(1);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✓ All BLS tab-delimited files downloaded successfully!");
  console.log("=".repeat(50));
  console.log("\nFiles downloaded:");
  console.log("  - oe.occupation (occupation codes)");
  console.log("  - oe.data.0.Current (wage data)");
  console.log("  - oe.area (area codes)");
  console.log("  - oe.datatype (data types)");
  console.log("  - oe.series (series metadata)");
  console.log("\nNext steps:");
  console.log("  1. Run: npm run data:process");
  console.log("  2. This will parse and transform the tab-delimited data\n");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
