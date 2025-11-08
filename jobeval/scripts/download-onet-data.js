#!/usr/bin/env node
/**
 * O*NET Data Download Script
 *
 * Downloads the O*NET 30.0 Database in text (tab-delimited) format
 * from the official O*NET Center website.
 *
 * Usage:
 *   node scripts/download-onet-data.js          - normal download
 *   node scripts/download-onet-data.js --force  - force re-download
 *   node scripts/download-onet-data.js --verify - verify existing files
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ONET_VERSION = "30.0";
const ONET_ZIP_URL = "https://www.onetcenter.org/dl_files/database/db_30_0_text.zip";
const RAW_DATA_DIR = path.join(__dirname, "..", "src", "data", "onet", "raw");
const PROCESSED_DATA_DIR = path.join(__dirname, "..", "src", "data", "onet", "processed");
const LOG_FILE = path.join(__dirname, "..", "src", "data", "onet", "download.log");
const ZIP_FILE_NAME = "db_30_0_text.zip";

// Required files - Priority 1 (Essential)
const PRIORITY_1_FILES = [
  "Occupation Data.txt",
  "Alternate Titles.txt",
  "Content Model Reference.txt",
];

// Required files - Priority 2 (Important)
const PRIORITY_2_FILES = [
  "Skills.txt",
  "Knowledge.txt",
  "Abilities.txt",
  "Work Activities.txt",
  "Work Context.txt",
  "Job Zones.txt",
  "Education, Training, and Experience.txt",
  "Education, Training, and Experience Categories.txt",
];

// Required files - Priority 3 (Nice to have)
const PRIORITY_3_FILES = ["Work Values.txt", "Interests.txt", "Work Styles.txt", "Tasks.txt"];

const ALL_REQUIRED_FILES = [...PRIORITY_1_FILES, ...PRIORITY_2_FILES, ...PRIORITY_3_FILES];

/**
 * Log to both console and log file
 */
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;

  if (isError) {
    console.error(message);
  } else {
    console.log(message);
  }

  // Append to log file
  try {
    fs.appendFileSync(LOG_FILE, logMessage + "\n");
  } catch (err) {
    // Ignore log file errors
  }
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Download a file from a URL with progress tracking
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    log(`Downloading: ${url}`);

    const file = createWriteStream(destPath);
    let downloadedBytes = 0;
    let totalBytes = 0;
    let lastReportedPercent = 0;

    https
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirects
          const redirectUrl = response.headers.location;
          log(`Redirected to: ${redirectUrl}`);
          file.close();
          fs.unlinkSync(destPath);
          return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
          return;
        }

        totalBytes = parseInt(response.headers["content-length"] || "0", 10);
        log(`File size: ${formatBytes(totalBytes)}`);

        response.on("data", (chunk) => {
          downloadedBytes += chunk.length;

          if (totalBytes > 0) {
            const percent = Math.floor((downloadedBytes / totalBytes) * 100);

            // Report every 10%
            if (percent >= lastReportedPercent + 10) {
              log(
                `Progress: ${percent}% (${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)})`
              );
              lastReportedPercent = percent;
            }
          }
        });

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          log(`✓ Downloaded: ${path.basename(destPath)} (${formatBytes(downloadedBytes)})`);
          resolve();
        });
      })
      .on("error", (err) => {
        try {
          fs.unlinkSync(destPath);
        } catch (e) {
          // Ignore errors
        }
        reject(err);
      });
  });
}

/**
 * Extract ZIP file and handle subdirectory structure
 */
function extractZip(zipPath, outputDir) {
  log(`Extracting: ${path.basename(zipPath)}`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Use unzip command with -o to overwrite, -q for quiet (except errors)
    execSync(`unzip -o -q "${zipPath}" -d "${outputDir}"`, { stdio: "pipe" });
    log(`✓ Extracted to: ${outputDir}`);

    // Check for db_30_0_text subdirectory
    const subDirName = "db_30_0_text";
    const subDirPath = path.join(outputDir, subDirName);

    if (fs.existsSync(subDirPath) && fs.statSync(subDirPath).isDirectory()) {
      log(`Found subdirectory: ${subDirName}`);
      log(`Moving files from subdirectory to ${outputDir}...`);

      // Get all files from subdirectory
      const filesInSubDir = fs.readdirSync(subDirPath);
      let movedCount = 0;

      // Move each file from subdirectory to output directory
      for (const file of filesInSubDir) {
        const sourcePath = path.join(subDirPath, file);
        const destPath = path.join(outputDir, file);

        // Skip if it's a directory
        if (fs.statSync(sourcePath).isDirectory()) {
          continue;
        }

        // Move the file
        fs.renameSync(sourcePath, destPath);
        movedCount++;
      }

      log(`✓ Moved ${movedCount} files from subdirectory`);

      // Remove the now-empty subdirectory
      try {
        fs.rmdirSync(subDirPath);
        log(`✓ Removed empty subdirectory: ${subDirName}`);
      } catch (err) {
        log(`Warning: Could not remove subdirectory: ${err.message}`);
      }
    }

    // List extracted files
    const extractedFiles = fs.readdirSync(outputDir).filter((file) => {
      const filePath = path.join(outputDir, file);
      return fs.statSync(filePath).isFile();
    });
    log(`✓ Total files available: ${extractedFiles.length}`);

    return extractedFiles;
  } catch (error) {
    log("Error extracting ZIP: " + error.message, true);
    throw error;
  }
}

/**
 * Verify a file exists and is readable
 */
function verifyFile(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    return { valid: false, reason: "File not found" };
  }

  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    return { valid: false, reason: "File is empty" };
  }

  // Try to read first few bytes to ensure it's readable
  try {
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(100);
    fs.readSync(fd, buffer, 0, 100, 0);
    fs.closeSync(fd);

    // Check if file contains tab characters (tab-delimited format)
    const content = buffer.toString("utf-8");
    if (!content.includes("\t")) {
      return {
        valid: false,
        reason: "File does not appear to be tab-delimited",
      };
    }

    return { valid: true, size: stats.size };
  } catch (err) {
    return { valid: false, reason: "File is not readable: " + err.message };
  }
}

/**
 * Verify all required files
 */
function verifyAllFiles() {
  log("\nVerifying O*NET data files...");
  log("=".repeat(50));

  const results = {
    priority1: [],
    priority2: [],
    priority3: [],
    missing: [],
    invalid: [],
  };

  let totalSize = 0;

  // Check Priority 1 files
  log("\nPriority 1 (Essential):");
  for (const fileName of PRIORITY_1_FILES) {
    const filePath = path.join(RAW_DATA_DIR, fileName);
    const result = verifyFile(filePath, fileName);

    if (result.valid) {
      log(`  ✓ ${fileName} (${formatBytes(result.size)})`);
      results.priority1.push(fileName);
      totalSize += result.size;
    } else {
      log(`  ✗ ${fileName} - ${result.reason}`, true);
      if (result.reason === "File not found") {
        results.missing.push(fileName);
      } else {
        results.invalid.push(fileName);
      }
    }
  }

  // Check Priority 2 files
  log("\nPriority 2 (Important):");
  for (const fileName of PRIORITY_2_FILES) {
    const filePath = path.join(RAW_DATA_DIR, fileName);
    const result = verifyFile(filePath, fileName);

    if (result.valid) {
      log(`  ✓ ${fileName} (${formatBytes(result.size)})`);
      results.priority2.push(fileName);
      totalSize += result.size;
    } else {
      log(`  ✗ ${fileName} - ${result.reason}`, true);
      if (result.reason === "File not found") {
        results.missing.push(fileName);
      } else {
        results.invalid.push(fileName);
      }
    }
  }

  // Check Priority 3 files
  log("\nPriority 3 (Nice to have):");
  for (const fileName of PRIORITY_3_FILES) {
    const filePath = path.join(RAW_DATA_DIR, fileName);
    const result = verifyFile(filePath, fileName);

    if (result.valid) {
      log(`  ✓ ${fileName} (${formatBytes(result.size)})`);
      results.priority3.push(fileName);
      totalSize += result.size;
    } else {
      log(`  ✗ ${fileName} - ${result.reason}`, true);
      if (result.reason === "File not found") {
        results.missing.push(fileName);
      } else {
        results.invalid.push(fileName);
      }
    }
  }

  // Summary
  log("\n" + "=".repeat(50));
  log(
    `Total files verified: ${results.priority1.length + results.priority2.length + results.priority3.length}/${ALL_REQUIRED_FILES.length}`
  );
  log(`Total size: ${formatBytes(totalSize)}`);

  if (results.missing.length > 0) {
    log(`Missing files: ${results.missing.length}`, true);
  }
  if (results.invalid.length > 0) {
    log(`Invalid files: ${results.invalid.length}`, true);
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const forceDownload = args.includes("--force");
  const verifyOnly = args.includes("--verify");

  log("O*NET Data Download Script");
  log("=".repeat(50));
  log(`O*NET Version: ${ONET_VERSION}`);
  log(`Data Directory: ${RAW_DATA_DIR}\n`);

  // Create directories if they don't exist
  if (!fs.existsSync(RAW_DATA_DIR)) {
    fs.mkdirSync(RAW_DATA_DIR, { recursive: true });
    log(`Created directory: ${RAW_DATA_DIR}`);
  }
  if (!fs.existsSync(PROCESSED_DATA_DIR)) {
    fs.mkdirSync(PROCESSED_DATA_DIR, { recursive: true });
    log(`Created directory: ${PROCESSED_DATA_DIR}`);
  }

  // If verify only, just verify and exit
  if (verifyOnly) {
    const results = verifyAllFiles();

    if (results.missing.length === 0 && results.invalid.length === 0) {
      log("\n✓ All files verified successfully!");
      return;
    } else {
      log("\n✗ Verification failed!", true);
      process.exit(1);
    }
  }

  const zipPath = path.join(RAW_DATA_DIR, ZIP_FILE_NAME);

  // Check if ZIP file already exists
  if (fs.existsSync(zipPath) && !forceDownload) {
    log(`ZIP file already exists: ${zipPath}`);
    log("Use --force to re-download\n");
  } else {
    // Download ZIP file
    try {
      if (fs.existsSync(zipPath)) {
        log("Removing existing ZIP file...");
        fs.unlinkSync(zipPath);
      }

      await downloadFile(ONET_ZIP_URL, zipPath);
    } catch (error) {
      log("✗ Failed to download O*NET data: " + error.message, true);
      process.exit(1);
    }
  }

  // Extract ZIP file
  try {
    const extractedFiles = extractZip(zipPath, RAW_DATA_DIR);

    // Log some of the extracted files
    log("\nExtracted files:");
    extractedFiles.slice(0, 10).forEach((file) => {
      log(`  - ${file}`);
    });
    if (extractedFiles.length > 10) {
      log(`  ... and ${extractedFiles.length - 10} more files`);
    }
  } catch (error) {
    log("✗ Failed to extract ZIP file: " + error.message, true);
    process.exit(1);
  }

  // Verify extracted files
  const results = verifyAllFiles();

  // Clean up ZIP file after successful extraction
  if (fs.existsSync(zipPath)) {
    try {
      fs.unlinkSync(zipPath);
      log(`\n✓ Cleaned up ZIP file: ${ZIP_FILE_NAME}`);
    } catch (error) {
      log(`Warning: Could not delete ZIP file: ${error.message}`);
    }
  }

  // Final summary
  log("\n" + "=".repeat(50));
  if (results.missing.length === 0 && results.invalid.length === 0) {
    log("✓ Download and extraction completed successfully!");
    log("\nNext steps:");
    log("  1. Data is ready in: " + RAW_DATA_DIR);
    log("  2. Run: node scripts/process-onet-data.js (coming soon)");
    log("  3. Integrate with JobEval application");
  } else {
    log("⚠ Download completed with warnings:", true);
    if (results.missing.length > 0) {
      log(`  Missing files: ${results.missing.join(", ")}`, true);
    }
    if (results.invalid.length > 0) {
      log(`  Invalid files: ${results.invalid.join(", ")}`, true);
    }

    // Only fail if Priority 1 files are missing
    const missingPriority1 = results.missing.filter((f) => PRIORITY_1_FILES.includes(f));
    if (missingPriority1.length > 0) {
      log("\n✗ Critical files are missing! Download may have failed.", true);
      process.exit(1);
    }
  }
}

main().catch((error) => {
  log("Error: " + error.message, true);
  console.error(error);
  process.exit(1);
});
