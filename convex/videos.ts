import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getVisibleVideos, upsertVideo } from "./model/videos";
import { getVideoStats, getVideoStatsByType } from "./videoAggregates";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await getVisibleVideos(ctx);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    return await getVideoStats(ctx);
  },
});

export const statsByType = query({
  args: { videoType: v.union(v.literal("longform"), v.literal("shorts")) },
  handler: async (ctx, { videoType }) => {
    return await getVideoStatsByType(ctx, videoType);
  },
});

export const upsert = internalMutation({
  args: {
    youtubeId: v.string(),
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    publishedAt: v.string(),
    viewCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    commentCount: v.optional(v.number()),
    duration: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertVideo(ctx, args);
  },
});

// Public mutation for testing purposes
export const add = mutation({
  args: {
    youtubeId: v.string(),
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    publishedAt: v.string(),
    viewCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    commentCount: v.optional(v.number()),
    duration: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertVideo(ctx, args);
  },
});
