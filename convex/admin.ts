import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const ADMIN_EMAIL = "mike.cann@gmail.com";

// Helper to check if user is authenticated and is admin
async function requireAuth(ctx: QueryCtx | MutationCtx, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session) {
    throw new Error("Unauthorized: Must be logged in");
  }

  // Check if expired (don't try to delete, just throw error)
  if (session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Session expired");
  }

  if (session.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Admin access required");
  }

  return session;
}

// Admin query to get ALL content (including hidden)
export const getAllContent = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAuth(ctx, token);
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
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAuth(ctx, token);
    // Schedule the refresh action
    await ctx.scheduler.runAfter(0, internal.youtube.refreshAll, {});
    return { success: true, message: "YouTube refresh triggered" };
  },
});

// Trigger Stack refresh (admin only)
export const triggerStackRefresh = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAuth(ctx, token);
    // Schedule the refresh action
    await ctx.scheduler.runAfter(0, internal.stack.refresh, {});
    return { success: true, message: "Stack refresh triggered" };
  },
});

// Trigger X refresh (admin only)
export const triggerXRefresh = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAuth(ctx, token);
    // Schedule the refresh action
    await ctx.scheduler.runAfter(0, internal.x.refresh, {});
    return { success: true, message: "X refresh triggered" };
  },
});

// Set video ownership status (mine/notMine)
// When marked as "mine", schedules project extraction
export const setVideoIsMikes = mutation({
  args: {
    token: v.string(),
    id: v.id("videos"),
    isMikes: v.union(v.literal("mine"), v.literal("notMine")),
  },
  handler: async (ctx, { token, id, isMikes }) => {
    await requireAuth(ctx, token);
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
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAuth(ctx, token);
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
    token: v.string(),
    id: v.id("projects"),
    isHidden: v.boolean(),
  },
  handler: async (ctx, { token, id, isHidden }) => {
    await requireAuth(ctx, token);
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");

    await ctx.db.patch(id, { isHidden });
    return { success: true, message: isHidden ? "Project hidden" : "Project visible" };
  },
});

// Update project links (admin only)
export const updateProjectLinks = mutation({
  args: {
    token: v.string(),
    id: v.id("projects"),
    sourceUrl: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
  },
  handler: async (ctx, { token, id, sourceUrl, demoUrl }) => {
    await requireAuth(ctx, token);
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
  args: { token: v.string(), id: v.id("projects") },
  handler: async (ctx, { token, id }) => {
    await requireAuth(ctx, token);
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");

    await ctx.db.delete(id);
    return { success: true, message: "Project deleted" };
  },
});
