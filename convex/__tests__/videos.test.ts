import { describe, expect, it } from "vitest";

/**
 * Unit tests for video visibility logic.
 * These test the business rules without needing the full Convex runtime.
 */

describe("video visibility rules", () => {
  // Helper to simulate visibility check logic
  const isVideoVisible = (isMikes?: "undecided" | "mine" | "notMine"): boolean => {
    return isMikes === "mine";
  };

  it("videos with isMikes='mine' are visible", () => {
    expect(isVideoVisible("mine")).toBe(true);
  });

  it("videos with isMikes='notMine' are not visible", () => {
    expect(isVideoVisible("notMine")).toBe(false);
  });

  it("videos with isMikes='undecided' are not visible", () => {
    expect(isVideoVisible("undecided")).toBe(false);
  });

  it("videos with undefined isMikes are not visible", () => {
    expect(isVideoVisible(undefined)).toBe(false);
  });
});

describe("new video default status", () => {
  // The default status for new videos from YouTube refresh
  const DEFAULT_STATUS = "undecided";

  // Helper to check visibility using the same logic as isVideoVisible
  const isVisible = (status: "undecided" | "mine" | "notMine" | undefined): boolean => {
    return status === "mine";
  };

  it("new videos should start as undecided", () => {
    expect(DEFAULT_STATUS).toBe("undecided");
  });

  it("undecided videos should not be visible on public site", () => {
    expect(isVisible("undecided")).toBe(false);
  });
});

describe("video ownership transitions", () => {
  type IsMikes = "undecided" | "mine" | "notMine";

  // Simulate the state transitions
  const shouldExtractProjects = (
    previousStatus: IsMikes | undefined,
    newStatus: IsMikes
  ): boolean => {
    // Only extract projects when changing TO "mine" from a non-mine status
    return newStatus === "mine" && previousStatus !== "mine";
  };

  it("should extract projects when marking undecided as mine", () => {
    expect(shouldExtractProjects("undecided", "mine")).toBe(true);
  });

  it("should extract projects when marking undefined as mine", () => {
    expect(shouldExtractProjects(undefined, "mine")).toBe(true);
  });

  it("should extract projects when changing from notMine to mine", () => {
    expect(shouldExtractProjects("notMine", "mine")).toBe(true);
  });

  it("should NOT extract projects when already mine", () => {
    expect(shouldExtractProjects("mine", "mine")).toBe(false);
  });

  it("should NOT extract projects when marking as notMine", () => {
    expect(shouldExtractProjects("undecided", "notMine")).toBe(false);
    expect(shouldExtractProjects("mine", "notMine")).toBe(false);
  });
});

describe("aggregate inclusion rules", () => {
  // Videos should only be included in aggregates if visible
  const shouldIncludeInAggregates = (isMikes?: "undecided" | "mine" | "notMine"): boolean => {
    return isMikes === "mine";
  };

  it("mine videos are included in aggregates", () => {
    expect(shouldIncludeInAggregates("mine")).toBe(true);
  });

  it("notMine videos are excluded from aggregates", () => {
    expect(shouldIncludeInAggregates("notMine")).toBe(false);
  });

  it("undecided videos are excluded from aggregates", () => {
    expect(shouldIncludeInAggregates("undecided")).toBe(false);
  });
});

describe("video sorting", () => {
  // Test the sorting logic used in getVisibleVideos
  interface VideoWithDate {
    title: string;
    publishedAt: string;
  }

  const sortByPublishedAtDesc = (videos: VideoWithDate[]): VideoWithDate[] => {
    return [...videos].sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  };

  it("sorts videos by publishedAt descending (newest first)", () => {
    const videos: VideoWithDate[] = [
      { title: "Old Video", publishedAt: "2024-01-01T00:00:00Z" },
      { title: "New Video", publishedAt: "2025-12-01T00:00:00Z" },
      { title: "Middle Video", publishedAt: "2025-06-15T00:00:00Z" },
    ];

    const sorted = sortByPublishedAtDesc(videos);

    expect(sorted[0].title).toBe("New Video");
    expect(sorted[1].title).toBe("Middle Video");
    expect(sorted[2].title).toBe("Old Video");
  });

  it("handles videos with same date", () => {
    const videos: VideoWithDate[] = [
      { title: "Video A", publishedAt: "2025-06-15T10:00:00Z" },
      { title: "Video B", publishedAt: "2025-06-15T10:00:00Z" },
    ];

    const sorted = sortByPublishedAtDesc(videos);

    // Both videos should be present (stable sort)
    expect(sorted).toHaveLength(2);
    expect(sorted.map(v => v.title)).toContain("Video A");
    expect(sorted.map(v => v.title)).toContain("Video B");
  });

  it("handles empty array", () => {
    const sorted = sortByPublishedAtDesc([]);
    expect(sorted).toHaveLength(0);
  });

  it("handles single video", () => {
    const videos: VideoWithDate[] = [
      { title: "Only Video", publishedAt: "2025-01-01T00:00:00Z" },
    ];

    const sorted = sortByPublishedAtDesc(videos);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].title).toBe("Only Video");
  });
});
