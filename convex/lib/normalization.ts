/**
 * Utility functions for normalizing and comparing project names
 * to detect duplicates with different naming conventions.
 */

// Common words to ignore when comparing project names
const STOP_WORDS = new Set(["by", "the", "a", "an", "with", "for", "and", "or"]);

/**
 * Normalize a project name to lowercase with hyphens.
 * Examples:
 *   "EffectSim" -> "effectsim"
 *   "Mike AI Chat Bot" -> "mike-ai-chat-bot"
 *   "MikeBot V2" -> "mikebot-v2"
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Trim leading/trailing hyphens
    .replace(/-+/g, "-"); // Collapse multiple hyphens
}

/**
 * Extract significant words from a name, removing stop words
 */
export function extractWords(name: string): string[] {
  return normalizeName(name)
    .split("-")
    .filter(word => word.length > 0 && !STOP_WORDS.has(word));
}

/**
 * Calculate Jaccard similarity between two sets of words
 * (intersection size / union size)
 */
export function wordSetSimilarity(words1: string[], words2: string[]): number {
  const set1 = new Set(words1);
  const set2 = new Set(words2);

  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Calculate Levenshtein distance between two strings.
 * This is the minimum number of single-character edits (insertions,
 * deletions, or substitutions) required to change one string into the other.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity between two strings as a ratio between 0 and 1.
 * 1 means identical, 0 means completely different.
 */
export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const maxLen = Math.max(a.length, b.length);
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}

/**
 * Check if two project names are similar enough to be considered the same project.
 * Uses multiple comparison strategies:
 * 1. Exact match after normalization
 * 2. Word set similarity (handles word reordering like "Chef by Convex" vs "Convex Chef")
 * 3. Substring containment (handles "Tic-Tac-Toe" vs "Multiplayer Tic-Tac-Toe")
 * 4. Levenshtein fuzzy match
 *
 * @param name1 First project name
 * @param name2 Second project name
 * @param threshold Similarity threshold (0-1, default 0.7)
 * @returns true if names are similar enough
 */
export function isSimilarName(
  name1: string,
  name2: string,
  threshold = 0.7
): boolean {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  // 1. Exact match after normalization
  if (norm1 === norm2) return true;

  // For high thresholds (>0.9), only use exact match and Levenshtein
  // This allows callers to require very close matches
  if (threshold > 0.9) {
    const similarity = stringSimilarity(norm1, norm2);
    return similarity >= threshold;
  }

  // 2. Word set similarity (handles word reordering and "Chef by Convex" vs "Convex Chef")
  const words1 = extractWords(name1);
  const words2 = extractWords(name2);
  const wordSimilarity = wordSetSimilarity(words1, words2);
  if (wordSimilarity >= 0.5) return true;

  // 3. Check if all words from shorter name exist in longer name
  // This handles "Mike AI Chat Bot" containing "mikebot" as a combination
  const shorterWords = words1.length <= words2.length ? words1 : words2;
  const longerWords = words1.length <= words2.length ? words2 : words1;

  // Check if shorter name is a subset or close match
  // Require the shorter name to have at least 2 words or be specific enough
  if (shorterWords.length >= 2) {
    let matchedWords = 0;
    for (const shortWord of shorterWords) {
      // Check if any word in longer contains or is contained by short word
      for (const longWord of longerWords) {
        if (longWord.includes(shortWord) || shortWord.includes(longWord)) {
          matchedWords++;
          break;
        }
      }
    }
    if (matchedWords >= shorterWords.length * 0.7) return true;
  }

  // 3b. Check for compound word matching (e.g., "mikebot" contains "mike" + "bot")
  // If shorter has only 1 word, check if it's a compound of multiple words from longer
  if (shorterWords.length === 1 && longerWords.length >= 2) {
    const compound = shorterWords[0];
    let matchedLongerWords = 0;
    for (const longWord of longerWords) {
      if (compound.includes(longWord) && longWord.length >= 3) {
        matchedLongerWords++;
      }
    }
    // If the compound contains at least 2 words from the longer name, it's a match
    if (matchedLongerWords >= 2) return true;
  }

  // 4. Substring containment check
  // One normalized name contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const shorter = norm1.length < norm2.length ? norm1 : norm2;
    const longer = norm1.length < norm2.length ? norm2 : norm1;
    // Shorter must be a significant portion (at least 50% of longer)
    // AND shorter must be more than just a single common word
    if (shorter.length >= longer.length * 0.5 && shorter.length >= 8) return true;
  }

  // 5. Levenshtein fuzzy match
  const similarity = stringSimilarity(norm1, norm2);
  return similarity >= threshold;
}

/**
 * Find the best matching project name from a list of existing names.
 * Returns the matching name and its similarity score, or null if no match above threshold.
 */
export function findBestMatch(
  name: string,
  existingNames: string[],
  threshold = 0.7
): { name: string; similarity: number } | null {
  let bestMatch: { name: string; similarity: number } | null = null;

  for (const existing of existingNames) {
    // Use isSimilarName to check if they match
    if (isSimilarName(name, existing, threshold)) {
      // Calculate a similarity score for ranking
      const norm1 = normalizeName(name);
      const norm2 = normalizeName(existing);

      // Exact normalized match gets highest score
      if (norm1 === norm2) {
        return { name: existing, similarity: 1 };
      }

      // Calculate composite score
      const words1 = extractWords(name);
      const words2 = extractWords(existing);
      const wordSim = wordSetSimilarity(words1, words2);
      const stringSim = stringSimilarity(norm1, norm2);
      const score = Math.max(wordSim, stringSim);

      if (!bestMatch || score > bestMatch.similarity) {
        bestMatch = { name: existing, similarity: score };
      }
    }
  }

  return bestMatch;
}
