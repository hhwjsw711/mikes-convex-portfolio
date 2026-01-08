import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const ADMIN_EMAIL = "mike.cann@gmail.com";

// Helper to check if user is authenticated and is admin
async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: Must be logged in");
  }
  if (identity.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Admin access required");
  }
  return identity;
}

// Admin query to get ALL content (including hidden)
export const getAllContent = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return {
      // Sort videos by publishedAt descending (newest first)
      videos: await ctx.db
        .query("videos")
        .withIndex("by_publishedAt")
        .order("desc")
        .collect(),
      // Sort articles by publishedAt descending (newest first)
      articles: await ctx.db
        .query("articles")
        .withIndex("by_publishedAt")
        .order("desc")
        .collect(),
      // Sort tweets by publishedAt descending (newest first)
      tweets: await ctx.db
        .query("tweets")
        .withIndex("by_publishedAt")
        .order("desc")
        .collect(),
      // Projects don't have publishedAt, so use default _creationTime
      projects: await ctx.db.query("projects").order("desc").collect(),
    };
  },
});

// Trigger YouTube refresh (admin only)
export const triggerYouTubeRefresh = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    // Schedule the refresh action
    await ctx.scheduler.runAfter(0, internal.youtube.refreshAll, {});
    return { success: true, message: "YouTube refresh triggered" };
  },
});

// Trigger Stack refresh (admin only)
export const triggerStackRefresh = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    // Schedule the refresh action
    await ctx.scheduler.runAfter(0, internal.stack.refresh, {});
    return { success: true, message: "Stack refresh triggered" };
  },
});

// Trigger X refresh (admin only)
export const triggerXRefresh = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    // Schedule the refresh action
    await ctx.scheduler.runAfter(0, internal.x.refresh, {});
    return { success: true, message: "X refresh triggered" };
  },
});

// Set video ownership status (mine/notMine)
// When marked as "mine", schedules project extraction
export const setVideoIsMikes = mutation({
  args: {
    id: v.id("videos"),
    isMikes: v.union(v.literal("mine"), v.literal("notMine")),
  },
  handler: async (ctx, { id, isMikes }) => {
    await requireAuth(ctx);
    const video = await ctx.db.get(id);
    if (!video) throw new Error("Video not found");

    const previousStatus = video.isMikes;
    await ctx.db.patch(id, { isMikes });

    // If changing to "mine", schedule project extraction
    if (isMikes === "mine" && previousStatus !== "mine") {
      await ctx.scheduler.runAfter(
        0,
        internal.youtube.extractProjectsForVideo,
        { youtubeId: video.youtubeId }
      );
      return { success: true, message: "Video marked as mine, project extraction scheduled" };
    }

    return { success: true, message: `Video marked as ${isMikes}` };
  },
});

// Clear all projects (admin only)
export const clearAllProjects = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const projects = await ctx.db.query("projects").collect();
    let deleted = 0;
    for (const project of projects) {
      await ctx.db.delete(project._id);
      deleted++;
    }
    return { success: true, deleted };
  },
});

// Toggle project visibility (admin only)
export const setProjectHidden = mutation({
  args: {
    id: v.id("projects"),
    isHidden: v.boolean(),
  },
  handler: async (ctx, { id, isHidden }) => {
    await requireAuth(ctx);
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");

    await ctx.db.patch(id, { isHidden });
    return { success: true, message: isHidden ? "Project hidden" : "Project visible" };
  },
});

// Update project links (admin only)
export const updateProjectLinks = mutation({
  args: {
    id: v.id("projects"),
    sourceUrl: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, sourceUrl, demoUrl }) => {
    await requireAuth(ctx);
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");

    // Only update fields that are provided (allow clearing with empty string)
    const updates: { sourceUrl?: string; demoUrl?: string } = {};
    if (sourceUrl !== undefined) {
      updates.sourceUrl = sourceUrl || undefined; // Convert empty string to undefined
    }
    if (demoUrl !== undefined) {
      updates.demoUrl = demoUrl || undefined; // Convert empty string to undefined
    }

    await ctx.db.patch(id, updates);
    return { success: true, message: "Project links updated" };
  },
});

// Delete a single project (admin only)
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    await requireAuth(ctx);
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");

    await ctx.db.delete(id);
    return { success: true, message: "Project deleted" };
  },
});
