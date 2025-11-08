/**
 * Occupation Matcher Utility
 *
 * Provides fuzzy matching of job titles to O*NET/BLS occupations
 * with confidence scoring and ranking.
 */

import occupationDatabase from "@/data/occupations.json";
import titleIndex from "@/data/onet/processed/titles-index.json";
import type {
  Occupation,
  OccupationMatch,
  SearchOptions,
  TitleIndex,
  TitleIndexEntry,
} from "@/types/occupation";

// Type the imported data
const typedTitleIndex = titleIndex as TitleIndex;
const typedDatabase = occupationDatabase as {
  occupations: { [socCode: string]: Occupation };
};

/**
 * Normalize a job title for matching
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Calculate string similarity using Levenshtein distance
 * Returns a score between 0 and 1 (1 = identical)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Handle edge cases
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  if (str1 === str2) return 1;

  // Create matrix
  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  // Convert distance to similarity (0-1 scale)
  const maxLen = Math.max(len1, len2);
  return 1 - matrix[len1][len2] / maxLen;
}

/**
 * Calculate match confidence based on match type and similarity
 */
function calculateConfidence(
  inputTitle: string,
  matchedTitle: string,
  matchType: "primary" | "alternate" | "partial"
): number {
  const normalizedInput = normalizeTitle(inputTitle);
  const normalizedMatch = normalizeTitle(matchedTitle);

  // Exact match = 1.0
  if (normalizedInput === normalizedMatch) {
    return 1.0;
  }

  // Calculate base similarity
  const similarity = calculateSimilarity(normalizedInput, normalizedMatch);

  // Adjust confidence based on match type
  let confidence = similarity;

  if (matchType === "primary") {
    // Primary title matches get a small boost
    confidence = Math.min(1.0, similarity * 1.1);
  } else if (matchType === "alternate") {
    // Alternate titles are slightly penalized
    confidence = similarity * 0.95;
  } else if (matchType === "partial") {
    // Partial matches are more heavily penalized
    confidence = similarity * 0.7;
  }

  // Check for substring matches (boost confidence)
  if (normalizedMatch.includes(normalizedInput) || normalizedInput.includes(normalizedMatch)) {
    confidence = Math.min(1.0, confidence + 0.15);
  }

  // Check for common word overlap
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
 * Match a job title to O*NET occupations
 * Returns top N matches sorted by confidence
 */
export function matchOccupation(jobTitle: string, options: SearchOptions = {}): OccupationMatch[] {
  const {
    maxResults = 5,
    minConfidence = 0.3,
    includeWithoutWages = true,
    preferredGroups = [],
  } = options;

  if (!jobTitle || jobTitle.trim().length === 0) {
    return [];
  }

  const normalizedInput = normalizeTitle(jobTitle);
  const matches: OccupationMatch[] = [];
  const seenCodes = new Set<string>();

  // 1. Try exact match in title index
  if (typedTitleIndex[normalizedInput]) {
    typedTitleIndex[normalizedInput].forEach((entry: TitleIndexEntry) => {
      if (seenCodes.has(entry.code)) return;

      const occupation = typedDatabase.occupations[entry.code];
      if (!occupation) return;

      // Skip occupations without wages if requested
      if (!includeWithoutWages && !occupation.hasWageData) return;

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

  // 2. Search for partial matches in title index
  Object.entries(typedTitleIndex).forEach(([indexedTitle, entries]) => {
    entries.forEach((entry: TitleIndexEntry) => {
      if (seenCodes.has(entry.code)) return;

      const occupation = typedDatabase.occupations[entry.code];
      if (!occupation) return;

      // Skip occupations without wages if requested
      if (!includeWithoutWages && !occupation.hasWageData) return;

      const confidence = calculateConfidence(normalizedInput, indexedTitle, entry.matchType);

      if (confidence >= minConfidence) {
        matches.push({
          code: entry.code,
          title: entry.title,
          confidence,
          matchedOn: indexedTitle,
          matchType: entry.matchType === "primary" ? "primary" : entry.matchType,
        });
        seenCodes.add(entry.code);
      }
    });
  });

  // 3. Sort by confidence (descending) and apply preferred groups
  matches.sort((a, b) => {
    // First, sort by confidence
    if (Math.abs(a.confidence - b.confidence) > 0.01) {
      return b.confidence - a.confidence;
    }

    // If confidence is similar, prefer preferred groups
    if (preferredGroups.length > 0) {
      const occA = typedDatabase.occupations[a.code];
      const occB = typedDatabase.occupations[b.code];

      const aPreferred = preferredGroups.includes(occA?.group || "");
      const bPreferred = preferredGroups.includes(occB?.group || "");

      if (aPreferred && !bPreferred) return -1;
      if (!aPreferred && bPreferred) return 1;
    }

    return 0;
  });

  // 4. Return top N matches
  return matches.slice(0, maxResults);
}

/**
 * Get full occupation data by SOC code
 */
export function getOccupation(socCode: string): Occupation | null {
  return typedDatabase.occupations[socCode] || null;
}

/**
 * Get all occupations (for browsing/selection)
 */
export function getAllOccupations(
  options: { includeWithoutWages?: boolean; group?: string } = {}
): Occupation[] {
  const { includeWithoutWages = true, group } = options;

  return Object.values(typedDatabase.occupations).filter((occ) => {
    if (!includeWithoutWages && !occ.hasWageData) return false;
    if (group && occ.group !== group) return false;
    return true;
  });
}

/**
 * Get unique occupational groups
 */
export function getOccupationGroups(): string[] {
  const groups = new Set<string>();
  Object.values(typedDatabase.occupations).forEach((occ) => {
    groups.add(occ.group);
  });
  return Array.from(groups).sort();
}

/**
 * Search occupations by keyword (fuzzy search across titles and descriptions)
 */
export function searchOccupations(keyword: string, limit: number = 10): Occupation[] {
  if (!keyword || keyword.trim().length === 0) {
    return [];
  }

  const normalizedKeyword = normalizeTitle(keyword);
  const keywordWords = normalizedKeyword.split(/\s+/);

  const scored = Object.values(typedDatabase.occupations).map((occ) => {
    const normalizedTitle = normalizeTitle(occ.title);
    const normalizedDesc = normalizeTitle(occ.description);

    let score = 0;

    // Exact title match
    if (normalizedTitle === normalizedKeyword) {
      score += 100;
    } else if (normalizedTitle.includes(normalizedKeyword)) {
      score += 50;
    }

    // Description match
    if (normalizedDesc.includes(normalizedKeyword)) {
      score += 20;
    }

    // Word overlap in title
    const titleWords = normalizedTitle.split(/\s+/);
    const titleOverlap = keywordWords.filter((w) => titleWords.includes(w)).length;
    score += titleOverlap * 15;

    // Alternate title matches
    const altTitleMatch = occ.alternateTitles.some((alt) => {
      const normalizedAlt = normalizeTitle(alt);
      return normalizedAlt.includes(normalizedKeyword);
    });
    if (altTitleMatch) {
      score += 30;
    }

    return { occupation: occ, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.occupation);
}

/**
 * Get occupation statistics
 */
export function getOccupationStats() {
  const occupations = Object.values(typedDatabase.occupations);

  return {
    total: occupations.length,
    withWages: occupations.filter((occ) => occ.hasWageData).length,
    withoutWages: occupations.filter((occ) => !occ.hasWageData).length,
    groups: getOccupationGroups().length,
  };
}
