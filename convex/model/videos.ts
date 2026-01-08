import { QueryCtx, MutationCtx } from "../_generated/server";
import {
  insertVideoAggregates,
  replaceVideoAggregates,
  deleteVideoAggregates,
} from "../videoAggregates";

export interface VideoData {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  duration?: string;
}

export async function getVideoByYoutubeId(ctx: QueryCtx, youtubeId: string) {
  return await ctx.db
    .query("videos")
    .withIndex("by_youtubeId", (q) => q.eq("youtubeId", youtubeId))
    .first();
}

export async function getAllVideos(ctx: QueryCtx) {
  return await ctx.db
    .query("videos")
    .withIndex("by_publishedAt")
    .order("desc")
    .collect();
}

export async function getVisibleVideos(ctx: QueryCtx) {
  // Only videos marked as "mine" are visible
  return await ctx.db
    .query("videos")
    .withIndex("by_isMikes", (q) => q.eq("isMikes", "mine"))
    .order("desc")
    .collect();
}

export async function upsertVideo(ctx: MutationCtx, videoData: VideoData) {
  const existing = await getVideoByYoutubeId(ctx, videoData.youtubeId);
  if (existing) {
    // Update existing video and sync aggregates
    // Note: We preserve the existing isMikes status
    await ctx.db.patch(existing._id, videoData);
    const newDoc = await ctx.db.get(existing._id);
    if (newDoc) {
      await replaceVideoAggregates(ctx, existing, newDoc);
    }
    return existing._id;
  }
  // Insert new video with isMikes: "undecided" and sync aggregates
  const id = await ctx.db.insert("videos", {
    ...videoData,
    isMikes: "undecided",
  });
  const newDoc = await ctx.db.get(id);
  if (newDoc) {
    await insertVideoAggregates(ctx, newDoc);
  }
  return id;
}

export async function deleteAllVideos(ctx: MutationCtx) {
  const videos = await ctx.db.query("videos").collect();
  for (const video of videos) {
    await deleteVideoAggregates(ctx, video);
    await ctx.db.delete(video._id);
  }
}
