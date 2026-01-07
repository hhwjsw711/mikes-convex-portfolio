import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Refresh latest 20 YouTube videos every 12 hours
crons.interval(
  "refreshYouTubeLatest",
  { hours: 12 },
  internal.youtube.refreshLatest,
  {}
);

// Full refresh of all YouTube videos every 48 hours
crons.interval(
  "refreshYouTubeAll",
  { hours: 48 },
  internal.youtube.refreshAll,
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
