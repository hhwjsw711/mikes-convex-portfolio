import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check if crons should be disabled (useful for dev environments)
// Set DISABLE_CRONS=true in your Convex deployment to disable all cron jobs
const disableCrons = process.env.DISABLE_CRONS === "true";

if (!disableCrons) {
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

  // Refresh X (Twitter) posts every 24 hours
  crons.daily(
    "refreshX",
    { hourUTC: 6, minuteUTC: 0 }, // 6 AM UTC daily
    internal.x.refresh,
    {}
  );

  // Refresh public Convex backend commits every 24 hours
  crons.daily(
    "refreshGitHubContributions",
    { hourUTC: 7, minuteUTC: 0 },
    internal.github.refreshCodeContributions,
    {}
  );
} else {
  console.log("Cron jobs disabled via DISABLE_CRONS environment variable");
}

export default crons;
