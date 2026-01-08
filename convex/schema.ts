import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  videos: defineTable({
    youtubeId: v.string(),
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    publishedAt: v.string(),
    viewCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    commentCount: v.optional(v.number()),
    duration: v.optional(v.string()),
    // Ownership status: "undecided" for new videos, "mine" or "notMine" after admin review
    // Videos are only visible if isMikes === "mine"
    isMikes: v.optional(
      v.union(v.literal("undecided"), v.literal("mine"), v.literal("notMine"))
    ),
  })
    .index("by_youtubeId", ["youtubeId"])
    .index("by_publishedAt", ["publishedAt"])
    .index("by_isMikes", ["isMikes"]),

  // Articles from stack.convex.dev/author/mike-cann are always "mine" and visible
  articles: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.optional(v.string()),
    publishedAt: v.string(),
    url: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_publishedAt", ["publishedAt"]),

  // Projects are created from "mine" content, can be hidden by admin
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    sourceType: v.union(v.literal("video"), v.literal("article")),
    sourceId: v.string(),
    extractedAt: v.string(),
    // Normalized name for fuzzy duplicate detection (lowercase, hyphenated)
    normalizedName: v.optional(v.string()),
    // Admin can hide projects
    isHidden: v.optional(v.boolean()),
  })
    .index("by_name", ["name"])
    .index("by_sourceType", ["sourceType"])
    .index("by_sourceId", ["sourceId"])
    .index("by_sourceUrl", ["sourceUrl"])
    .index("by_normalizedName", ["normalizedName"]),
});
