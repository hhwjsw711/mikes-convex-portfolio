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
  const videos = await getAllVideos(ctx);
  return videos.filter((v) => !v.isHidden);
}

export async function upsertVideo(ctx: MutationCtx, videoData: VideoData) {
  const existing = await getVideoByYoutubeId(ctx, videoData.youtubeId);
  if (existing) {
    // Update existing video and sync aggregates
    await ctx.db.patch(existing._id, videoData);
    const newDoc = await ctx.db.get(existing._id);
    if (newDoc) {
      await replaceVideoAggregates(ctx, existing, newDoc);
    }
    return existing._id;
  }
  // Insert new video and sync aggregates
  const id = await ctx.db.insert("videos", videoData);
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
