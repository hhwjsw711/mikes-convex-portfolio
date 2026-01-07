import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getVisibleArticles, upsertArticle } from "./model/articles";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await getVisibleArticles(ctx);
  },
});

export const upsert = internalMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.optional(v.string()),
    publishedAt: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    return await upsertArticle(ctx, args);
  },
});

// Public mutation for testing purposes
export const add = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.optional(v.string()),
    publishedAt: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    return await upsertArticle(ctx, args);
  },
});
