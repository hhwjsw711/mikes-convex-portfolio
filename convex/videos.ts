import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getVisibleVideos, upsertVideo } from "./model/videos";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await getVisibleVideos(ctx);
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
    duration: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertVideo(ctx, args);
  },
});
