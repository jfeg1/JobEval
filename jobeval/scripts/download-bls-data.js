#!/usr/bin/env node
/**
 * BLS Data Download Script
 * 
 * Downloads the latest Occupational Employment and Wage Statistics (OEWS) data
 * from the Bureau of Labor Statistics.
 * 
 * Usage: node scripts/download-bls-data.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CURRENT_YEAR = '24'; // May 2024 data
const BLS_BASE_URL = 'https://www.bls.gov/oes/special.requests';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'raw');

// Files to download
const FILES_TO_DOWNLOAD = [
  {
    name: 'national',
    url: `${BLS_BASE_URL}/oesm${CURRENT_YEAR}nat.zip`,
    filename: `oesm${CURRENT_YEAR}nat.zip`
  },
  // We can add state and metro data later
  // {
  //   name: 'state',
  //   url: `${BLS_BASE_URL}/oesm${CURRENT_YEAR}st.zip`,
  //   filename: `oesm${CURRENT_YEAR}st.zip`
  // },
];

/**
 * Download a file from a URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);
    
    const file = createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        console.log(`Redirected to: ${redirectUrl}`);
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${path.basename(destPath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('BLS Data Download Script');
  console.log('========================\n');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}\n`);
  }
  
  // Download each file
  for (const file of FILES_TO_DOWNLOAD) {
    const destPath = path.join(OUTPUT_DIR, file.filename);
    
    try {
      await downloadFile(file.url, destPath);
    } catch (error) {
      console.error(`✗ Failed to download ${file.name}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('\n✓ All files downloaded successfully!');
  console.log('\nNext steps:');
  console.log('  1. Run: node scripts/process-bls-data.js');
  console.log('  2. This will extract and transform the data');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
