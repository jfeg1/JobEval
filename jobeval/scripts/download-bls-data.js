#!/usr/bin/env node
/**
 * BLS Data Download Script (XLSX Version)
 *
 * Downloads the latest Occupational Employment and Wage Statistics (OES) data
 * from the Bureau of Labor Statistics Special Requests page.
 *
 * This version uses XLSX files from the Special Requests endpoint instead of
 * the tab-delimited files, which were encountering 403 errors.
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

// Configuration - Using BLS Special Requests XLSX files
const BLS_ZIP_URL = "https://www.bls.gov/oes/special.requests/oesm24nat.zip";
const OUTPUT_DIR = path.join(__dirname, "..", "data", "raw");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "oesm24nat.zip");

/**
 * Download a file from a URL with progress reporting
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
        reject(
          new Error(
            `Failed to download: ${response.statusCode} ${response.statusMessage}`
          )
        );
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
          console.error(`✗ Downloaded file is empty: ${path.basename(destPath)}`);
          reject(new Error("Downloaded file is empty"));
          return;
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
  });
}

/**
 * Main execution
 */
async function main() {
  console.log("BLS Data Download Script (XLSX Version)");
  console.log("========================================\n");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}\n`);
  }

  // Check if file already exists
  if (fs.existsSync(OUTPUT_FILE)) {
    const stats = fs.statSync(OUTPUT_FILE);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`File already exists: ${OUTPUT_FILE} (${sizeInMB} MB)`);
    console.log("\nTo re-download, delete the existing file and run again.");
    console.log("Or proceed to processing with: npm run data:process\n");
    return;
  }

  console.log("Downloading BLS OES Special Requests file...");
  console.log("This is a ~20-30 MB ZIP file containing Excel data.\n");

  try {
    await downloadFile(BLS_ZIP_URL, OUTPUT_FILE);

    console.log("\n" + "=".repeat(50));
    console.log("✓ BLS data downloaded successfully!");
    console.log("=".repeat(50));
    console.log("\nFile downloaded:");
    console.log(`  ${OUTPUT_FILE}`);
    console.log("\nNext steps:");
    console.log("  1. Run: npm run data:process");
    console.log("  2. This will extract and process the Excel data\n");
  } catch (error) {
    console.error(`✗ Failed to download:`, error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
