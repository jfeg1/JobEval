#!/usr/bin/env node

/**
 * DevExtreme License Setup Script
 * 
 * This script automatically creates the devextreme-license.ts file
 * using a license key from the DEVEXTREME_KEY environment variable.
 * 
 * Usage:
 * 1. Set environment variable: export DEVEXTREME_KEY="your-key-here"
 * 2. Run: node scripts/setup-devextreme-license.js
 * 
 * For CI/CD:
 * - Set DEVEXTREME_KEY as a secret in your CI system
 * - This script will run automatically via npm postinstall
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, writeFileSync, copyFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const licensePath = join(__dirname, '..', 'src', 'devextreme-license.ts');
const templatePath = join(__dirname, '..', 'src', 'devextreme-license.ts.template');

// Check if license key exists in environment
const key = process.env.DEVEXTREME_KEY || '';

// Only create/update the file if:
// 1. A key is provided via environment variable, OR
// 2. The license file doesn't exist yet
if (key) {
  console.log('📝 Creating devextreme-license.ts from DEVEXTREME_KEY environment variable...');
  
  const content = `// DevExtreme License Configuration
// This file contains the license key for DevExtreme components
// DO NOT commit this file to version control
// Generated automatically from DEVEXTREME_KEY environment variable

export const licenseKey = "${key}";
`;

  writeFileSync(licensePath, content);
  console.log('✅ DevExtreme license file created successfully');
  
} else if (!existsSync(licensePath)) {
  console.warn('⚠️  Warning: No DevExtreme license file found and DEVEXTREME_KEY not set');
  console.warn('');
  console.warn('To set up DevExtreme:');
  console.warn('1. Copy the template: cp src/devextreme-license.ts.template src/devextreme-license.ts');
  console.warn('2. Add your license key to the file');
  console.warn('');
  console.warn('OR');
  console.warn('');
  console.warn('Set environment variable: export DEVEXTREME_KEY="your-key-here"');
  console.warn('');
  console.warn('See DEVEXTREME_SETUP.md for more information');
  
  // Copy template as a starting point
  if (existsSync(templatePath)) {
    console.log('📋 Copying template file as a starting point...');
    copyFileSync(templatePath, licensePath);
    console.log('✅ Template copied. Please edit src/devextreme-license.ts with your key');
  }
  
} else {
  console.log('ℹ️  DevExtreme license file already exists, skipping...');
}
