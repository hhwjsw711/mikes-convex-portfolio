import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { replaceVideoAggregates } from "./videoAggregates";

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

// Toggle video visibility
export const setVideoHidden = mutation({
  args: { id: v.id("videos"), isHidden: v.boolean() },
  handler: async (ctx, { id, isHidden }) => {
    await requireAuth(ctx);
    const oldDoc = await ctx.db.get(id);
    if (!oldDoc) throw new Error("Video not found");

    await ctx.db.patch(id, { isHidden });
    const newDoc = await ctx.db.get(id);
    if (newDoc) {
      await replaceVideoAggregates(ctx, oldDoc, newDoc);
    }
  },
});

// Toggle article visibility
export const setArticleHidden = mutation({
  args: { id: v.id("articles"), isHidden: v.boolean() },
  handler: async (ctx, { id, isHidden }) => {
    await requireAuth(ctx);
    await ctx.db.patch(id, { isHidden });
  },
});

// Toggle project visibility
export const setProjectHidden = mutation({
  args: { id: v.id("projects"), isHidden: v.boolean() },
  handler: async (ctx, { id, isHidden }) => {
    await requireAuth(ctx);
    await ctx.db.patch(id, { isHidden });
  },
});

// Admin query to get ALL content (including hidden)
export const getAllContent = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return {
      videos: await ctx.db.query("videos").order("desc").collect(),
      articles: await ctx.db.query("articles").order("desc").collect(),
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
    await ctx.scheduler.runAfter(0, "youtube:refresh" as any, {});
    return { success: true, message: "YouTube refresh triggered" };
  },
});

// Trigger Stack refresh (admin only)
export const triggerStackRefresh = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    // Schedule the refresh action
    await ctx.scheduler.runAfter(0, "stack:refresh" as any, {});
    return { success: true, message: "Stack refresh triggered" };
  },
});
