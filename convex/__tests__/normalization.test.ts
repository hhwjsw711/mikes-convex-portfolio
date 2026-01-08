import { describe, expect, it } from "vitest";
import {
  normalizeName,
  levenshteinDistance,
  stringSimilarity,
  isSimilarName,
  findBestMatch,
} from "../lib/normalization";

describe("normalizeName", () => {
  it("converts PascalCase to lowercase", () => {
    expect(normalizeName("EffectSim")).toBe("effectsim");
  });

  it("preserves existing hyphens", () => {
    expect(normalizeName("effect-sim")).toBe("effect-sim");
  });

  it("converts spaces to hyphens", () => {
    expect(normalizeName("Mike AI Chat Bot")).toBe("mike-ai-chat-bot");
  });

  it("handles mixed case with version numbers", () => {
    expect(normalizeName("MikeBot V2")).toBe("mikebot-v2");
  });

  it("trims and normalizes whitespace", () => {
    expect(normalizeName("  Spaced  Name  ")).toBe("spaced-name");
  });

  it("handles special characters", () => {
    expect(normalizeName("Tic-Tac-Toe!")).toBe("tic-tac-toe");
  });

  it("handles camelCase", () => {
    expect(normalizeName("myAwesomeProject")).toBe("myawesomeproject");
  });

  it("handles underscores", () => {
    expect(normalizeName("my_project_name")).toBe("my-project-name");
  });
});

describe("levenshteinDistance", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshteinDistance("hello", "hello")).toBe(0);
  });

  it("returns length for completely different strings", () => {
    expect(levenshteinDistance("abc", "xyz")).toBe(3);
  });

  it("handles single character difference", () => {
    expect(levenshteinDistance("cat", "bat")).toBe(1);
  });

  it("handles empty strings", () => {
    expect(levenshteinDistance("", "hello")).toBe(5);
    expect(levenshteinDistance("hello", "")).toBe(5);
    expect(levenshteinDistance("", "")).toBe(0);
  });

  it("handles insertions", () => {
    expect(levenshteinDistance("cat", "cats")).toBe(1);
  });

  it("handles deletions", () => {
    expect(levenshteinDistance("cats", "cat")).toBe(1);
  });
});

describe("stringSimilarity", () => {
  it("returns 1 for identical strings", () => {
    expect(stringSimilarity("hello", "hello")).toBe(1);
  });

  it("returns 0 for empty vs non-empty", () => {
    expect(stringSimilarity("", "hello")).toBe(0);
    expect(stringSimilarity("hello", "")).toBe(0);
  });

  it("returns high similarity for similar strings", () => {
    const similarity = stringSimilarity("effectsim", "effect-sim");
    expect(similarity).toBeGreaterThan(0.7);
  });

  it("returns low similarity for different strings", () => {
    const similarity = stringSimilarity("effectsim", "convex-os");
    expect(similarity).toBeLessThan(0.5);
  });
});

describe("isSimilarName", () => {
  describe("exact matches after normalization", () => {
    it("matches same case", () => {
      expect(isSimilarName("EffectSim", "EffectSim")).toBe(true);
    });

    it("matches different case", () => {
      expect(isSimilarName("EffectSim", "effectsim")).toBe(true);
    });

    it("matches with different casing patterns", () => {
      expect(isSimilarName("Mikebot", "MikeBot")).toBe(true);
    });

    it("matches hyphenated vs spaced", () => {
      expect(isSimilarName("Tic-Tac-Toe", "Tic Tac Toe")).toBe(true);
    });
  });

  describe("fuzzy matches", () => {
    it("matches effect-sim variations", () => {
      expect(isSimilarName("EffectSim", "effect-sim")).toBe(true);
    });

    it("matches project name abbreviations", () => {
      // "Mike AI Chat Bot" normalized = "mike-ai-chat-bot"
      // "Mikebot" normalized = "mikebot"
      // These are quite different, so this should be a fuzzy match
      expect(isSimilarName("Mike AI Chat Bot", "Mikebot")).toBe(true);
    });

    it("matches substring containment", () => {
      expect(isSimilarName("Multiplayer Tic-Tac-Toe", "Tic-Tac-Toe")).toBe(true);
    });
  });

  describe("non-matches", () => {
    it("does not match completely different projects", () => {
      expect(isSimilarName("EffectSim", "Convex OS")).toBe(false);
    });

    it("does not match short similar prefixes", () => {
      expect(isSimilarName("Video", "Video to Markdown")).toBe(false);
    });

    it("does not match unrelated projects with common words", () => {
      expect(isSimilarName("Convex Chat", "Convex Auth")).toBe(false);
    });
  });

  describe("threshold customization", () => {
    it("uses custom threshold", () => {
      // With high threshold, similar but not identical should not match
      expect(isSimilarName("effect-sim", "effect-simulator", 0.95)).toBe(false);
      // With lower threshold, they should match
      expect(isSimilarName("effect-sim", "effect-simulator", 0.5)).toBe(true);
    });
  });
});

describe("findBestMatch", () => {
  const existingNames = [
    "EffectSim",
    "Convex OS",
    "Mikebot",
    "Tic-Tac-Toe",
    "Video to Markdown",
  ];

  it("finds exact normalized match", () => {
    const result = findBestMatch("effectsim", existingNames);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("EffectSim");
    expect(result?.similarity).toBe(1);
  });

  it("finds fuzzy match", () => {
    const result = findBestMatch("effect-sim", existingNames);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("EffectSim");
  });

  it("finds substring match", () => {
    const result = findBestMatch("Multiplayer Tic-Tac-Toe", existingNames);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Tic-Tac-Toe");
  });

  it("returns null for no match", () => {
    const result = findBestMatch("Completely Different Project", existingNames);
    expect(result).toBeNull();
  });

  it("returns best match among multiple possibilities", () => {
    const names = ["MikeBot", "Mike AI Bot", "Mikebot V2"];
    const result = findBestMatch("mikebot", names);
    expect(result).not.toBeNull();
    // Should match either MikeBot or Mikebot V2 with highest similarity
  });
});

describe("real-world duplicate detection", () => {
  // These are actual duplicates found in the database
  const testCases = [
    { input: "Mike AI Chat Bot", expected: "Mikebot", shouldMatch: true },
    { input: "MikeBot", expected: "Mikebot", shouldMatch: true },
    { input: "Mike AI Chat Bot (Mikebot)", expected: "Mikebot", shouldMatch: true },
    { input: "Tic Tac Toe", expected: "Tic-Tac-Toe", shouldMatch: true },
    { input: "Multiplayer Tic Tac Toe", expected: "Tic-Tac-Toe", shouldMatch: true },
    { input: "Chef by Convex", expected: "Convex Chef", shouldMatch: true },
    { input: "Chef", expected: "Convex Chef", shouldMatch: true },
    { input: "effect-sim", expected: "EffectSim", shouldMatch: true },
    { input: "Convex OS", expected: "EffectSim", shouldMatch: false },
    { input: "Agent Inbox", expected: "Convex Agent", shouldMatch: false },
  ];

  testCases.forEach(({ input, expected, shouldMatch }) => {
    it(`${shouldMatch ? "matches" : "does not match"}: "${input}" vs "${expected}"`, () => {
      expect(isSimilarName(input, expected)).toBe(shouldMatch);
    });
  });
});
