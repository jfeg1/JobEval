#!/usr/bin/env node
/**
 * O*NET Data Processing Script
 *
 * Parses O*NET tab-delimited text files and converts them into optimized JSON format
 * for runtime use in JobEval occupation matching system.
 *
 * Usage: node scripts/process-onet-data.js
 *
 * Input:  src/data/onet/raw/*.txt (tab-delimited text files)
 * Output: src/data/onet/processed/*.json (optimized JSON)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RAW_DATA_DIR = path.join(__dirname, "..", "src", "data", "onet", "raw");
const PROCESSED_DATA_DIR = path.join(__dirname, "..", "src", "data", "onet", "processed");

// File paths
const FILES = {
  occupationData: path.join(RAW_DATA_DIR, "Occupation Data.txt"),
  alternateTitles: path.join(RAW_DATA_DIR, "Alternate Titles.txt"),
  skills: path.join(RAW_DATA_DIR, "Skills.txt"),
  knowledge: path.join(RAW_DATA_DIR, "Knowledge.txt"),
  abilities: path.join(RAW_DATA_DIR, "Abilities.txt"),
  workActivities: path.join(RAW_DATA_DIR, "Work Activities.txt"),
  workContext: path.join(RAW_DATA_DIR, "Work Context.txt"),
  jobZones: path.join(RAW_DATA_DIR, "Job Zones.txt"),
};

// Job Zone descriptions (O*NET standard definitions)
const JOB_ZONE_INFO = {
  1: {
    education: "High school diploma or less",
    experience: "Little or no previous work-related skill, knowledge, or experience",
  },
  2: {
    education: "High school diploma",
    experience: "Some previous work-related skill, knowledge, or experience",
  },
  3: {
    education: "Vocational training or associate degree",
    experience: "Previous work-related skill, knowledge, or experience",
  },
  4: {
    education: "Bachelor's degree",
    experience:
      "Considerable preparation - several years of work-related skill, knowledge, or experience",
  },
  5: {
    education: "Bachelor's degree plus work experience, or graduate degree",
    experience: "Extensive preparation - extensive skill, knowledge, and experience",
  },
};

// Statistics tracking
const stats = {
  startTime: Date.now(),
  filesProcessed: 0,
  occupationsFound: 0,
  totalAlternateTitles: 0,
  totalSkills: 0,
  totalKnowledge: 0,
  totalAbilities: 0,
  totalWorkActivities: 0,
  totalWorkContext: 0,
  warnings: [],
  errors: [],
};

/**
 * Parse tab-delimited text file
 * @param {string} filePath - Path to the .txt file
 * @returns {Array<Object>} Array of objects with column headers as keys
 */
function parseTabDelimited(filePath) {
  if (!fs.existsSync(filePath)) {
    const warning = `File not found: ${path.basename(filePath)}`;
    console.warn(`⚠ ${warning}`);
    stats.warnings.push(warning);
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      const warning = `File is empty: ${path.basename(filePath)}`;
      console.warn(`⚠ ${warning}`);
      stats.warnings.push(warning);
      return [];
    }

    // Parse headers from first line
    const headers = lines[0].split("\t").map((h) => h.trim());

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split("\t");
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].trim() : "";
      });

      // Validate O*NET-SOC Code format if present
      const socCode = row["O*NET-SOC Code"];
      if (socCode && !/^\d{2}-\d{4}\.\d{2}$/.test(socCode)) {
        const warning = `Invalid SOC code format: ${socCode} in ${path.basename(filePath)}:${i + 1}`;
        console.warn(`⚠ ${warning}`);
        stats.warnings.push(warning);
        continue;
      }

      data.push(row);
    }

    stats.filesProcessed++;
    console.log(`✓ Parsed ${path.basename(filePath)}: ${data.length} rows`);
    return data;
  } catch (error) {
    const errorMsg = `Error parsing ${path.basename(filePath)}: ${error.message}`;
    console.error(`✗ ${errorMsg}`);
    stats.errors.push(errorMsg);
    return [];
  }
}

/**
 * Process occupation data (core info)
 */
function processOccupationData() {
  console.log("\nProcessing occupation data...");
  const data = parseTabDelimited(FILES.occupationData);

  const occupations = {};
  for (const row of data) {
    const code = row["O*NET-SOC Code"];
    if (!code) continue;

    occupations[code] = {
      code,
      title: row["Title"] || "",
      description: row["Description"] || "",
      alternateTitles: [],
      skills: [],
      knowledge: [],
      abilities: [],
      workActivities: [],
      workContext: [],
      jobZone: null,
      education: null,
      experience: null,
    };
  }

  stats.occupationsFound = Object.keys(occupations).length;
  console.log(`  Found ${stats.occupationsFound} occupations`);
  return occupations;
}

/**
 * Process alternate titles
 */
function processAlternateTitles(occupations) {
  console.log("\nProcessing alternate titles...");
  const data = parseTabDelimited(FILES.alternateTitles);

  for (const row of data) {
    const code = row["O*NET-SOC Code"];
    const title = row["Alternate Title"];

    if (!code || !title || !occupations[code]) continue;

    // Avoid duplicates
    if (!occupations[code].alternateTitles.includes(title)) {
      occupations[code].alternateTitles.push(title);
      stats.totalAlternateTitles++;
    }
  }

  console.log(`  Added ${stats.totalAlternateTitles} alternate titles`);
  return occupations;
}

/**
 * Process skills/knowledge/abilities data (common structure)
 * @param {string} filePath - Path to data file
 * @param {Object} occupations - Occupations object
 * @param {string} fieldName - Field name (skills, knowledge, abilities)
 * @param {number} importanceThreshold - Minimum importance to include (default: 0)
 */
function processSkillsLikeData(filePath, occupations, fieldName, importanceThreshold = 0) {
  console.log(`\nProcessing ${fieldName}...`);
  const data = parseTabDelimited(filePath);

  // Group by O*NET-SOC Code and Element Name
  const grouped = {};
  for (const row of data) {
    const code = row["O*NET-SOC Code"];
    const elementName = row["Element Name"];
    const scaleId = row["Scale ID"];
    const dataValue = parseFloat(row["Data Value"]);

    if (!code || !elementName || !occupations[code]) continue;
    if (isNaN(dataValue) || dataValue <= importanceThreshold) continue;

    const key = `${code}::${elementName}`;
    if (!grouped[key]) {
      grouped[key] = {
        code,
        name: elementName,
        importance: null,
        level: null,
      };
    }

    // IM = Importance, LV = Level
    if (scaleId === "IM") {
      grouped[key].importance = dataValue;
    } else if (scaleId === "LV") {
      grouped[key].level = dataValue;
    }
  }

  // Add to occupations, sorted by importance
  let itemCount = 0;
  for (const key in grouped) {
    const item = grouped[key];
    const code = item.code;

    // Only add if we have at least importance value
    if (item.importance !== null) {
      occupations[code][fieldName].push({
        name: item.name,
        importance: item.importance,
        level: item.level,
      });
      itemCount++;
    }
  }

  // Sort by importance (descending)
  for (const code in occupations) {
    occupations[code][fieldName].sort((a, b) => (b.importance || 0) - (a.importance || 0));
  }

  console.log(`  Added ${itemCount} ${fieldName} entries`);
  return itemCount;
}

/**
 * Process work context data
 */
function processWorkContext(occupations) {
  console.log("\nProcessing work context...");
  const data = parseTabDelimited(FILES.workContext);

  for (const row of data) {
    const code = row["O*NET-SOC Code"];
    const elementName = row["Element Name"];
    const dataValue = parseFloat(row["Data Value"]);

    if (!code || !elementName || !occupations[code]) continue;
    if (isNaN(dataValue) || dataValue <= 0) continue;

    occupations[code].workContext.push({
      context: elementName,
      value: dataValue,
    });
    stats.totalWorkContext++;
  }

  // Sort by value (descending)
  for (const code in occupations) {
    occupations[code].workContext.sort((a, b) => (b.value || 0) - (a.value || 0));
  }

  console.log(`  Added ${stats.totalWorkContext} work context entries`);
  return occupations;
}

/**
 * Process job zones (education/experience requirements)
 */
function processJobZones(occupations) {
  console.log("\nProcessing job zones...");
  const data = parseTabDelimited(FILES.jobZones);

  for (const row of data) {
    const code = row["O*NET-SOC Code"];
    const jobZone = parseInt(row["Job Zone"]);

    if (!code || !occupations[code] || isNaN(jobZone)) continue;

    occupations[code].jobZone = jobZone;

    // Add education and experience descriptions
    const zoneInfo = JOB_ZONE_INFO[jobZone];
    if (zoneInfo) {
      occupations[code].education = zoneInfo.education;
      occupations[code].experience = zoneInfo.experience;
    }
  }

  console.log(`  Added job zone information`);
  return occupations;
}

/**
 * Create title index for fuzzy matching
 * Maps lowercase job titles to O*NET-SOC codes
 */
function createTitleIndex(occupations) {
  console.log("\nCreating title index...");
  const index = {};

  for (const code in occupations) {
    const occupation = occupations[code];
    const titles = [occupation.title, ...occupation.alternateTitles];

    for (const title of titles) {
      if (!title) continue;

      // Normalize title: lowercase, remove special chars
      const normalized = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!normalized) continue;

      if (!index[normalized]) {
        index[normalized] = [];
      }

      // Avoid duplicate codes for the same normalized title
      if (!index[normalized].includes(code)) {
        index[normalized].push(code);
      }
    }
  }

  console.log(`  Created index with ${Object.keys(index).length} unique titles`);
  return index;
}

/**
 * Write output files
 */
function writeOutput(occupations, titleIndex) {
  console.log("\nWriting output files...");

  // Create processed directory if it doesn't exist
  if (!fs.existsSync(PROCESSED_DATA_DIR)) {
    fs.mkdirSync(PROCESSED_DATA_DIR, { recursive: true });
  }

  // Write main occupations file
  const occupationsPath = path.join(PROCESSED_DATA_DIR, "occupations.json");
  fs.writeFileSync(occupationsPath, JSON.stringify(occupations, null, 2));
  const occupationsSize = fs.statSync(occupationsPath).size;
  console.log(`  ✓ ${path.basename(occupationsPath)} (${formatBytes(occupationsSize)})`);

  // Write title index
  const titleIndexPath = path.join(PROCESSED_DATA_DIR, "titles-index.json");
  fs.writeFileSync(titleIndexPath, JSON.stringify(titleIndex, null, 2));
  const titleIndexSize = fs.statSync(titleIndexPath).size;
  console.log(`  ✓ ${path.basename(titleIndexPath)} (${formatBytes(titleIndexSize)})`);

  // Calculate statistics
  const processingTime = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  const avgSkillsPerOccupation = (stats.totalSkills / stats.occupationsFound).toFixed(1);
  const avgKnowledgePerOccupation = (stats.totalKnowledge / stats.occupationsFound).toFixed(1);
  const avgAbilitiesPerOccupation = (stats.totalAbilities / stats.occupationsFound).toFixed(1);

  const statistics = {
    version: "1.0",
    dataSource: "O*NET 30.0",
    processedDate: new Date().toISOString(),
    processingTimeSeconds: parseFloat(processingTime),
    summary: {
      totalOccupations: stats.occupationsFound,
      totalAlternateTitles: stats.totalAlternateTitles,
      totalSkills: stats.totalSkills,
      totalKnowledge: stats.totalKnowledge,
      totalAbilities: stats.totalAbilities,
      totalWorkActivities: stats.totalWorkActivities,
      totalWorkContext: stats.totalWorkContext,
      uniqueTitlesInIndex: Object.keys(titleIndex).length,
    },
    averages: {
      skillsPerOccupation: parseFloat(avgSkillsPerOccupation),
      knowledgePerOccupation: parseFloat(avgKnowledgePerOccupation),
      abilitiesPerOccupation: parseFloat(avgAbilitiesPerOccupation),
    },
    fileSizes: {
      occupationsJson: formatBytes(occupationsSize),
      titlesIndexJson: formatBytes(titleIndexSize),
      totalSize: formatBytes(occupationsSize + titleIndexSize),
    },
    warnings: stats.warnings.slice(0, 10), // Keep first 10 warnings
    errors: stats.errors,
  };

  // Write statistics
  const statsPath = path.join(PROCESSED_DATA_DIR, "stats.json");
  fs.writeFileSync(statsPath, JSON.stringify(statistics, null, 2));
  console.log(`  ✓ ${path.basename(statsPath)}`);

  return statistics;
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
 * Display sample occupation data
 */
function displaySampleData(occupations) {
  console.log("\n" + "=".repeat(70));
  console.log("SAMPLE OUTPUT (First 2 occupations)");
  console.log("=".repeat(70));

  const codes = Object.keys(occupations).slice(0, 2);
  for (const code of codes) {
    const occ = occupations[code];
    console.log(`\nO*NET-SOC Code: ${occ.code}`);
    console.log(`Title: ${occ.title}`);
    console.log(`Description: ${occ.description.substring(0, 100)}...`);
    console.log(
      `Alternate Titles (${occ.alternateTitles.length}):`,
      occ.alternateTitles.slice(0, 3)
    );
    console.log(`Skills (${occ.skills.length}):`, occ.skills.slice(0, 2));
    console.log(`Knowledge (${occ.knowledge.length}):`, occ.knowledge.slice(0, 2));
    console.log(`Job Zone: ${occ.jobZone} - ${occ.education}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("=".repeat(70));
  console.log("O*NET Data Processing Script");
  console.log("=".repeat(70));
  console.log(`Input:  ${RAW_DATA_DIR}`);
  console.log(`Output: ${PROCESSED_DATA_DIR}\n`);

  // Step 1: Process core occupation data
  let occupations = processOccupationData();

  if (Object.keys(occupations).length === 0) {
    console.error("\n✗ No occupations found. Please check that data files exist.");
    process.exit(1);
  }

  // Step 2: Process alternate titles
  occupations = processAlternateTitles(occupations);

  // Step 3: Process skills
  stats.totalSkills = processSkillsLikeData(FILES.skills, occupations, "skills");

  // Step 4: Process knowledge
  stats.totalKnowledge = processSkillsLikeData(FILES.knowledge, occupations, "knowledge");

  // Step 5: Process abilities
  stats.totalAbilities = processSkillsLikeData(FILES.abilities, occupations, "abilities");

  // Step 6: Process work activities
  stats.totalWorkActivities = processSkillsLikeData(
    FILES.workActivities,
    occupations,
    "workActivities"
  );

  // Step 7: Process work context
  occupations = processWorkContext(occupations);

  // Step 8: Process job zones
  occupations = processJobZones(occupations);

  // Step 9: Create title index
  const titleIndex = createTitleIndex(occupations);

  // Step 10: Write output
  const statistics = writeOutput(occupations, titleIndex);

  // Display sample data
  displaySampleData(occupations);

  // Final summary
  console.log("\n" + "=".repeat(70));
  console.log("PROCESSING STATISTICS");
  console.log("=".repeat(70));
  console.log(`Total occupations:           ${statistics.summary.totalOccupations}`);
  console.log(`Total alternate titles:      ${statistics.summary.totalAlternateTitles}`);
  console.log(`Total skills:                ${statistics.summary.totalSkills}`);
  console.log(`Total knowledge areas:       ${statistics.summary.totalKnowledge}`);
  console.log(`Total abilities:             ${statistics.summary.totalAbilities}`);
  console.log(`Total work activities:       ${statistics.summary.totalWorkActivities}`);
  console.log(`Total work context items:    ${statistics.summary.totalWorkContext}`);
  console.log(`Unique titles in index:      ${statistics.summary.uniqueTitlesInIndex}`);
  console.log(`\nAverage skills/occupation:   ${statistics.averages.skillsPerOccupation}`);
  console.log(`Average knowledge/occupation: ${statistics.averages.knowledgePerOccupation}`);
  console.log(`Average abilities/occupation: ${statistics.averages.abilitiesPerOccupation}`);
  console.log(`\nTotal output size:           ${statistics.fileSizes.totalSize}`);
  console.log(`Processing time:             ${statistics.processingTimeSeconds}s`);

  if (stats.warnings.length > 0) {
    console.log(`\n⚠ Warnings: ${stats.warnings.length} (see stats.json for details)`);
  }
  if (stats.errors.length > 0) {
    console.log(`\n✗ Errors: ${stats.errors.length} (see stats.json for details)`);
  }

  console.log("\n" + "=".repeat(70));
  console.log("✓ O*NET data processing complete!");
  console.log("=".repeat(70));
  console.log("\nOutput files:");
  console.log(`  - ${path.join(PROCESSED_DATA_DIR, "occupations.json")}`);
  console.log(`  - ${path.join(PROCESSED_DATA_DIR, "titles-index.json")}`);
  console.log(`  - ${path.join(PROCESSED_DATA_DIR, "stats.json")}`);
  console.log("\nValidation commands:");
  console.log("  npm run format    # Format with Prettier");
  console.log("  npm run lint      # Validate with ESLint");
  console.log("\nNext steps:");
  console.log("  1. Review sample output above");
  console.log("  2. Check stats.json for warnings/errors");
  console.log("  3. Integrate with JobEval occupation matching");
}

// Run the script
main().catch((error) => {
  console.error("\n✗ Fatal error:", error.message);
  console.error(error.stack);
  process.exit(1);
});
