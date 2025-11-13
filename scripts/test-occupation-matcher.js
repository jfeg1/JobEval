#!/usr/bin/env node
/**
 * Test Occupation Matcher
 *
 * Tests the occupation matcher with various job titles to verify matching accuracy
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data
const occupationsPath = path.join(__dirname, "..", "src", "data", "occupations.json");
const titlesIndexPath = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "onet",
  "processed",
  "titles-index.json",
);

const database = JSON.parse(fs.readFileSync(occupationsPath, "utf8"));
const titleIndex = JSON.parse(fs.readFileSync(titlesIndexPath, "utf8"));

/**
 * Normalize a job title for matching
 */
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  if (str1 === str2) return 1;

  const matrix = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return 1 - matrix[len1][len2] / maxLen;
}

/**
 * Calculate match confidence
 */
function calculateConfidence(inputTitle, matchedTitle, matchType) {
  const normalizedInput = normalizeTitle(inputTitle);
  const normalizedMatch = normalizeTitle(matchedTitle);

  if (normalizedInput === normalizedMatch) {
    return 1.0;
  }

  const similarity = calculateSimilarity(normalizedInput, normalizedMatch);
  let confidence = similarity;

  if (matchType === "primary") {
    confidence = Math.min(1.0, similarity * 1.1);
  } else if (matchType === "alternate") {
    confidence = similarity * 0.95;
  } else if (matchType === "partial") {
    confidence = similarity * 0.7;
  }

  if (normalizedMatch.includes(normalizedInput) || normalizedInput.includes(normalizedMatch)) {
    confidence = Math.min(1.0, confidence + 0.15);
  }

  const inputWords = normalizedInput.split(/\s+/);
  const matchWords = normalizedMatch.split(/\s+/);
  const commonWords = inputWords.filter((w) => matchWords.includes(w));

  if (commonWords.length > 0) {
    const wordOverlap = commonWords.length / Math.max(inputWords.length, matchWords.length);
    confidence = Math.max(confidence, wordOverlap * 0.8);
  }

  return Math.min(1.0, Math.max(0.0, confidence));
}

/**
 * Match a job title
 */
function matchOccupation(jobTitle, maxResults = 5, minConfidence = 0.3) {
  if (!jobTitle || jobTitle.trim().length === 0) {
    return [];
  }

  const normalizedInput = normalizeTitle(jobTitle);
  const matches = [];
  const seenCodes = new Set();

  // Try exact match
  if (titleIndex[normalizedInput]) {
    titleIndex[normalizedInput].forEach((entry) => {
      if (seenCodes.has(entry.code)) return;

      const occupation = database.occupations[entry.code];
      if (!occupation) return;
      if (!occupation.hasWageData) return;

      matches.push({
        code: entry.code,
        title: entry.title,
        confidence: 1.0,
        matchedOn: jobTitle,
        matchType: "exact",
      });
      seenCodes.add(entry.code);
    });
  }

  // Search for partial matches
  Object.entries(titleIndex).forEach(([indexedTitle, entries]) => {
    entries.forEach((entry) => {
      if (seenCodes.has(entry.code)) return;

      const occupation = database.occupations[entry.code];
      if (!occupation) return;
      if (!occupation.hasWageData) return;

      const confidence = calculateConfidence(normalizedInput, indexedTitle, entry.matchType);

      if (confidence >= minConfidence) {
        matches.push({
          code: entry.code,
          title: entry.title,
          confidence,
          matchedOn: indexedTitle,
          matchType: entry.matchType,
        });
        seenCodes.add(entry.code);
      }
    });
  });

  // Sort by confidence
  matches.sort((a, b) => b.confidence - a.confidence);

  return matches.slice(0, maxResults);
}

/**
 * Test cases
 */
const testCases = [
  // Exact matches
  { input: "Software Developers", expected: "Software Developers" },
  { input: "Accountants and Auditors", expected: "Accountants and Auditors" },

  // Alternate title matches
  { input: "Software Engineer", expected: "Software Developers" },
  { input: "Developer", expected: "Software Developers" },
  { input: "QA Tester", expected: "Software Quality Assurance Analysts and Testers" },
  { input: "HR Manager", expected: "Human Resources Managers" },

  // Partial matches
  { input: "Marketing", expected: "Marketing Managers" },
  { input: "Sales", expected: "Sales Managers" },
  { input: "Engineer", expected: null }, // Should match multiple

  // Fuzzy matches
  { input: "Sofware Developer", expected: "Software Developers" }, // Typo
  { input: "Accountant", expected: "Accountants and Auditors" },
  { input: "Graphic Design", expected: "Graphic Designers" },

  // Challenging cases
  { input: "Full Stack Developer", expected: "Software Developers" },
  { input: "Business Analyst", expected: "Management Analysts" },
  { input: "Customer Support", expected: "Customer Service Representatives" },
];

/**
 * Run tests
 */
function runTests() {
  console.log("Occupation Matcher Test Suite");
  console.log("=" .repeat(70));
  console.log(`Total test cases: ${testCases.length}`);
  console.log(`Database: ${Object.keys(database.occupations).length} occupations`);
  console.log(`Title index: ${Object.keys(titleIndex).length} variants\n`);

  let passed = 0;
  let failed = 0;

  testCases.forEach((test, index) => {
    const matches = matchOccupation(test.input, 3);

    console.log(`Test ${index + 1}: "${test.input}"`);

    if (matches.length === 0) {
      console.log("  ✗ No matches found");
      if (test.expected !== null) {
        failed++;
      } else {
        passed++;
      }
    } else {
      const topMatch = matches[0];
      const isCorrect = test.expected === null || topMatch.title === test.expected;

      console.log(
        `  ${isCorrect ? "✓" : "✗"} Top match: ${topMatch.title} (${(topMatch.confidence * 100).toFixed(0)}%)`,
      );

      if (matches.length > 1) {
        console.log(`  Other matches:`);
        matches.slice(1).forEach((m) => {
          console.log(`    - ${m.title} (${(m.confidence * 100).toFixed(0)}%)`);
        });
      }

      if (isCorrect) {
        passed++;
      } else {
        failed++;
        if (test.expected !== null) {
          console.log(`  Expected: ${test.expected}`);
        }
      }
    }
    console.log();
  });

  console.log("=" .repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Success rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
}

// Run tests
runTests();
