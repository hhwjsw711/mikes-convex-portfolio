import { QueryCtx, MutationCtx } from "../_generated/server";

export interface VideoData {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount?: number;
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
    await ctx.db.patch(existing._id, videoData);
    return existing._id;
  }
  return await ctx.db.insert("videos", videoData);
}

export async function deleteAllVideos(ctx: MutationCtx) {
  const videos = await ctx.db.query("videos").collect();
  for (const video of videos) {
    await ctx.db.delete(video._id);
  }
}
