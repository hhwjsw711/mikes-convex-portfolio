import { internalMutation } from "../_generated/server";

/**
 * Migration to convert isHidden boolean to isMikes field.
 *
 * Conversion logic:
 * - isHidden: false (or undefined) -> isMikes: "mine" (visible)
 * - isHidden: true -> isMikes: "notMine" (hidden)
 *
 * Run this migration with:
 * npx convex run migrations/migrateIsHiddenToIsMikes:migrate
 */
export const migrate = internalMutation({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").collect();

    let migrated = 0;
    let skipped = 0;

    for (const video of videos) {
      // Skip if already has isMikes set
      if (video.isMikes) {
        skipped++;
        continue;
      }

      // Convert isHidden to isMikes
      // Note: isHidden field no longer exists in schema but may exist in data
      const wasHidden = (video as unknown as { isHidden?: boolean }).isHidden;
      const newStatus = wasHidden ? "notMine" : "mine";

      await ctx.db.patch(video._id, {
        isMikes: newStatus,
      });
      migrated++;
    }

    console.log(
      `Migration complete: ${migrated} videos migrated, ${skipped} already had isMikes`
    );
    return { migrated, skipped };
  },
});

/**
 * Set all videos to a specific isMikes status.
 * Useful for resetting all videos to "undecided" for fresh review.
 *
 * Run with:
 * npx convex run migrations/migrateIsHiddenToIsMikes:setAll --args '{"status":"undecided"}'
 */
export const setAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").collect();

    let count = 0;
    for (const video of videos) {
      await ctx.db.patch(video._id, {
        isMikes: "undecided",
      });
      count++;
    }

    console.log(`Set ${count} videos to "undecided"`);
    return { count };
  },
});

// cleanupIsHidden mutation was used to remove the deprecated isHidden field.
// It has been run and is no longer needed since isHidden is removed from the schema.
