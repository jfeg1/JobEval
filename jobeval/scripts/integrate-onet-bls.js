#!/usr/bin/env node
/**
 * O*NET and BLS Data Integration Script
 *
 * Merges O*NET occupation data with BLS wage data to create a unified
 * occupation database with skills, knowledge, and wage information.
 *
 * Usage: node scripts/integrate-onet-bls.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input paths
const ONET_DATA_PATH = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "onet",
  "processed",
  "occupations.json",
);
const BLS_DATA_PATH = path.join(__dirname, "..", "public", "data", "bls-data.json");

// Output paths
const OUTPUT_DIR = path.join(__dirname, "..", "src", "data");
const OCCUPATIONS_OUTPUT = path.join(OUTPUT_DIR, "occupations.json");
const STATS_OUTPUT = path.join(OUTPUT_DIR, "occupation-stats.json");

/**
 * Load JSON file
 */
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Integrate O*NET and BLS data for a single occupation
 */
function integrateOccupation(onetData, blsOccupation) {
  const integrated = {
    // Core identification
    code: onetData.code,
    title: onetData.title,
    description: onetData.description,
    group: onetData.group,

    // O*NET data
    alternateTitles: onetData.alternateTitles || [],
    skills: onetData.skills || [],
    knowledge: onetData.knowledge || [],
    jobZone: onetData.jobZone || 3,
    educationLevel: onetData.educationLevel || "Some college, no degree",

    // BLS wage data (if available)
    wageData: null,
    hasWageData: false,
    dataSource: "onet-only",
  };

  // Add BLS wage data if available
  if (blsOccupation && blsOccupation.wages) {
    integrated.wageData = {
      employment: blsOccupation.employment,
      hourly: {
        mean: blsOccupation.wages.hourlyMean,
        median: blsOccupation.wages.hourlyMedian,
      },
      annual: {
        mean: blsOccupation.wages.annualMean,
        median: blsOccupation.wages.annualMedian,
      },
      percentiles: {
        p10: blsOccupation.wages.percentile10,
        p25: blsOccupation.wages.percentile25,
        p50: blsOccupation.wages.annualMedian, // Median
        p75: blsOccupation.wages.percentile75,
        p90: blsOccupation.wages.percentile90,
      },
      dataDate: blsOccupation.dataDate,
    };
    integrated.hasWageData = true;
    integrated.dataSource = "integrated";
  }

  return integrated;
}

/**
 * Calculate integration statistics
 */
function calculateStatistics(occupations) {
  const stats = {
    totalOccupations: Object.keys(occupations).length,
    occupationsWithWages: 0,
    occupationsWithoutWages: 0,
    byGroup: {},
    coverageByGroup: {},
    topSkills: {},
    topKnowledge: {},
  };

  // Count occupations with/without wages
  Object.values(occupations).forEach((occ) => {
    if (occ.hasWageData) {
      stats.occupationsWithWages++;
    } else {
      stats.occupationsWithoutWages++;
    }

    // Count by group
    if (!stats.byGroup[occ.group]) {
      stats.byGroup[occ.group] = { total: 0, withWages: 0, withoutWages: 0 };
    }
    stats.byGroup[occ.group].total++;
    if (occ.hasWageData) {
      stats.byGroup[occ.group].withWages++;
    } else {
      stats.byGroup[occ.group].withoutWages++;
    }

    // Aggregate skills
    occ.skills.forEach((skill) => {
      if (!stats.topSkills[skill.name]) {
        stats.topSkills[skill.name] = { count: 0, avgImportance: 0, totalImportance: 0 };
      }
      stats.topSkills[skill.name].count++;
      stats.topSkills[skill.name].totalImportance += skill.importance;
      stats.topSkills[skill.name].avgImportance =
        stats.topSkills[skill.name].totalImportance / stats.topSkills[skill.name].count;
    });

    // Aggregate knowledge
    occ.knowledge.forEach((knowledge) => {
      if (!stats.topKnowledge[knowledge.name]) {
        stats.topKnowledge[knowledge.name] = {
          count: 0,
          avgImportance: 0,
          totalImportance: 0,
        };
      }
      stats.topKnowledge[knowledge.name].count++;
      stats.topKnowledge[knowledge.name].totalImportance += knowledge.importance;
      stats.topKnowledge[knowledge.name].avgImportance =
        stats.topKnowledge[knowledge.name].totalImportance /
        stats.topKnowledge[knowledge.name].count;
    });
  });

  // Calculate coverage percentages by group
  Object.keys(stats.byGroup).forEach((group) => {
    const groupData = stats.byGroup[group];
    stats.coverageByGroup[group] = {
      total: groupData.total,
      wageCoverage:
        groupData.total > 0
          ? ((groupData.withWages / groupData.total) * 100).toFixed(1) + "%"
          : "0%",
    };
  });

  // Sort top skills by frequency
  stats.topSkills = Object.entries(stats.topSkills)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .reduce((obj, [key, value]) => {
      obj[key] = {
        count: value.count,
        avgImportance: Math.round(value.avgImportance),
      };
      return obj;
    }, {});

  // Sort top knowledge by frequency
  stats.topKnowledge = Object.entries(stats.topKnowledge)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .reduce((obj, [key, value]) => {
      obj[key] = {
        count: value.count,
        avgImportance: Math.round(value.avgImportance),
      };
      return obj;
    }, {});

  return stats;
}

/**
 * Main integration process
 */
function main() {
  console.log("O*NET and BLS Data Integration");
  console.log("=" .repeat(50));

  // Load data
  console.log("\n1. Loading data files...");
  const onetData = loadJSON(ONET_DATA_PATH);
  const blsData = loadJSON(BLS_DATA_PATH);

  console.log(`   ✓ Loaded ${Object.keys(onetData).length} O*NET occupations`);
  console.log(`   ✓ Loaded ${blsData.occupations.length} BLS occupations`);

  // Create BLS lookup by SOC code
  // BLS uses codes like "11-2021" while O*NET uses "11-2021.00"
  // Create lookups for both formats
  const blsLookup = {};
  const blsLookupWithSuffix = {};

  blsData.occupations.forEach((occ) => {
    // Store with original BLS code (e.g., "11-2021")
    blsLookup[occ.code] = occ;

    // Also store with .00 suffix for O*NET matching (e.g., "11-2021.00")
    const codeWithSuffix = occ.code.includes('.') ? occ.code : `${occ.code}.00`;
    blsLookupWithSuffix[codeWithSuffix] = occ;
  });

  console.log(`   ✓ Created BLS lookup with ${Object.keys(blsLookup).length} codes`);

  // Integrate data
  console.log("\n2. Integrating occupation data...");
  const integrated = {};
  let matchCount = 0;
  let noMatchCount = 0;
  const matchedCodes = [];
  const unmatchedCodes = [];

  Object.entries(onetData).forEach(([socCode, onetOcc]) => {
    // Try exact match first (handles both "11-2021" and "11-2021.00" formats)
    let blsOcc = blsLookup[socCode] || blsLookupWithSuffix[socCode];

    // If no match and O*NET code has .00 suffix, try removing it
    if (!blsOcc && socCode.includes('.')) {
      const codeWithoutSuffix = socCode.replace(/\.00$/, '');
      blsOcc = blsLookup[codeWithoutSuffix];
    }

    // If no match and O*NET code doesn't have .00 suffix, try adding it
    if (!blsOcc && !socCode.includes('.')) {
      const codeWithSuffix = `${socCode}.00`;
      blsOcc = blsLookupWithSuffix[codeWithSuffix];
    }

    integrated[socCode] = integrateOccupation(onetOcc, blsOcc);

    if (blsOcc) {
      matchCount++;
      if (matchedCodes.length < 5) {
        matchedCodes.push({ onet: socCode, bls: blsOcc.code, title: onetOcc.title });
      }
    } else {
      noMatchCount++;
      if (unmatchedCodes.length < 5) {
        unmatchedCodes.push({ code: socCode, title: onetOcc.title });
      }
    }
  });

  const coveragePercent = ((matchCount / Object.keys(onetData).length) * 100).toFixed(1);

  console.log(`   ✓ Integrated ${matchCount} occupations with wage data`);
  console.log(`   ✓ ${noMatchCount} occupations without wage data`);
  console.log(`   ✓ Coverage: ${coveragePercent}%`);

  // Show examples of matched codes
  if (matchedCodes.length > 0) {
    console.log(`\n   Examples of matched codes:`);
    matchedCodes.forEach(({ onet, bls, title }) => {
      console.log(`     - O*NET: ${onet} / BLS: ${bls} - ${title}`);
    });
  }

  // Show examples of unmatched codes for debugging
  if (unmatchedCodes.length > 0) {
    console.log(`\n   Examples of unmatched codes (no wage data):`);
    unmatchedCodes.forEach(({ code, title }) => {
      console.log(`     - ${code} - ${title}`);
    });
  }

  // Calculate statistics
  console.log("\n3. Calculating statistics...");
  const stats = calculateStatistics(integrated);

  // Create output database structure
  const database = {
    version: "1.0",
    dataDate: new Date().toISOString().split("T")[0],
    metadata: {
      totalOccupations: stats.totalOccupations,
      occupationsWithWages: stats.occupationsWithWages,
      onetVersion: "30.0 (sample)",
      blsVersion: blsData.version || "1.0",
      lastUpdated: new Date().toISOString(),
      coveragePercentage:
        ((stats.occupationsWithWages / stats.totalOccupations) * 100).toFixed(1) + "%",
    },
    occupations: integrated,
  };

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write integrated data
  console.log("\n4. Writing output files...");
  fs.writeFileSync(OCCUPATIONS_OUTPUT, JSON.stringify(database, null, 2));
  console.log(`   ✓ Created: ${OCCUPATIONS_OUTPUT}`);
  console.log(`     ${database.metadata.totalOccupations} occupations`);

  // Write statistics
  const statsData = {
    generated: new Date().toISOString(),
    ...stats,
  };
  fs.writeFileSync(STATS_OUTPUT, JSON.stringify(statsData, null, 2));
  console.log(`   ✓ Created: ${STATS_OUTPUT}`);

  // Display summary
  console.log("\n" + "=" .repeat(50));
  console.log("INTEGRATION SUMMARY");
  console.log("=" .repeat(50));
  console.log(`Total Occupations:        ${stats.totalOccupations}`);
  console.log(`With Wage Data:           ${stats.occupationsWithWages}`);
  console.log(`Without Wage Data:        ${stats.occupationsWithoutWages}`);
  console.log(
    `Coverage:                 ${((stats.occupationsWithWages / stats.totalOccupations) * 100).toFixed(1)}%`,
  );

  console.log("\nCoverage by Occupational Group:");
  Object.entries(stats.coverageByGroup)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([group, data]) => {
      console.log(`  ${group.padEnd(45)} ${data.total} (${data.wageCoverage})`);
    });

  console.log("\nTop 10 Most Common Skills:");
  Object.entries(stats.topSkills)
    .slice(0, 10)
    .forEach(([skill, data], index) => {
      console.log(
        `  ${(index + 1).toString().padStart(2)}. ${skill.padEnd(40)} ${data.count} occupations (avg: ${data.avgImportance})`,
      );
    });

  console.log("\nTop 10 Most Common Knowledge Areas:");
  Object.entries(stats.topKnowledge)
    .slice(0, 10)
    .forEach(([knowledge, data], index) => {
      console.log(
        `  ${(index + 1).toString().padStart(2)}. ${knowledge.padEnd(40)} ${data.count} occupations (avg: ${data.avgImportance})`,
      );
    });

  console.log("\n✓ Integration completed successfully!\n");
}

// Run integration
main();
