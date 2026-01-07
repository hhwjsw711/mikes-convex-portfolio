import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Refresh YouTube videos every hour
crons.hourly(
  "refreshYouTube",
  { minuteUTC: 0 },
  internal.youtube.refresh,
  {}
);

// Refresh Convex Stack articles every hour (offset by 30 minutes)
crons.hourly(
  "refreshStack",
  { minuteUTC: 30 },
  internal.stack.refresh,
  {}
);

export default crons;
