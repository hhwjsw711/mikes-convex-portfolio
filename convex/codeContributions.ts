import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  getAllCodeContributions,
  upsertCodeContribution,
} from "./model/codeContributions";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await getAllCodeContributions(ctx);
  },
});

export const upsert = internalMutation({
  args: {
    sha: v.string(),
    shortSha: v.string(),
    title: v.string(),
    rawTitle: v.string(),
    committedAt: v.string(),
    url: v.string(),
    repository: v.string(),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    return await upsertCodeContribution(ctx, args);
  },
});

// Public mutation for testing purposes
export const add = mutation({
  args: {
    sha: v.string(),
    shortSha: v.string(),
    title: v.string(),
    rawTitle: v.string(),
    committedAt: v.string(),
    url: v.string(),
    repository: v.string(),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    return await upsertCodeContribution(ctx, args);
  },
});
