import { internalMutation } from "../_generated/server";
import {
  insertVideoAggregates,
  viewsAggregate,
  likesAggregate,
  commentsAggregate,
} from "../videoAggregates";

/**
 * One-time migration to backfill video aggregates with existing data.
 * Run this after deploying the aggregate component:
 *
 * npx convex run migrations/backfillVideoAggregates:backfill
 *
 * Note: This only includes videos where isMikes === "mine" in the aggregates.
 */
export const backfill = internalMutation({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").collect();

    let count = 0;
    let skipped = 0;
    for (const video of videos) {
      if (video.isMikes !== "mine") {
        skipped++;
        continue;
      }
      await insertVideoAggregates(ctx, video);
      count++;
    }

    console.log(
      `Backfilled aggregates for ${count} "mine" videos (skipped ${skipped} not mine)`
    );
    return { videosProcessed: count, skipped };
  },
});

/**
 * Clear all video aggregates before re-running backfill.
 * Run this if you need to reset the aggregates:
 *
 * npx convex run migrations/backfillVideoAggregates:clear
 */
export const clear = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear all aggregates by deleting each video from them
    const videos = await ctx.db.query("videos").collect();

    for (const video of videos) {
      try {
        await Promise.all([
          viewsAggregate.delete(ctx, video),
          likesAggregate.delete(ctx, video),
          commentsAggregate.delete(ctx, video),
        ]);
      } catch {
        // Ignore errors if video wasn't in aggregate
      }
    }

    console.log(`Cleared aggregates`);
    return { success: true };
  },
});
