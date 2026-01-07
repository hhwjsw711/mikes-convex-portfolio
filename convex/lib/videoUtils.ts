import { Doc } from "../_generated/dataModel";

// Parse ISO 8601 duration (e.g., "PT1M30S") to seconds
export function parseDurationToSeconds(duration?: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// YouTube Shorts are less than 3 minutes (180 seconds)
export function isShort(video: Doc<"videos">): boolean {
  const seconds = parseDurationToSeconds(video.duration);
  return seconds > 0 && seconds < 180;
}

// Get video type for aggregation namespace
export function getVideoType(video: Doc<"videos">): "longform" | "shorts" {
  return isShort(video) ? "shorts" : "longform";
}
