"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { extractProjectLinks } from "./model/projects";

interface YouTubeChannelResponse {
  items: Array<{
    contentDetails: {
      relatedPlaylists: {
        uploads: string;
      };
    };
  }>;
}

interface YouTubePlaylistItemsResponse {
  items: Array<{
    snippet: {
      resourceId: {
        videoId: string;
      };
    };
  }>;
  nextPageToken?: string;
}

interface YouTubeVideosResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: {
        high?: { url: string };
        medium?: { url: string };
        default?: { url: string };
      };
    };
    statistics?: {
      viewCount?: string;
    };
    contentDetails?: {
      duration?: string;
    };
  }>;
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export const refresh = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      console.log(
        "YouTube API key or channel ID not configured. Skipping refresh."
      );
      return { success: false, error: "Missing configuration" };
    }

    try {
      // Step 1: Get the uploads playlist ID
      const channelResponse = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
      );
      const channelData: YouTubeChannelResponse = await channelResponse.json();

      if (!channelData.items || channelData.items.length === 0) {
        console.error("Channel not found");
        return { success: false, error: "Channel not found" };
      }

      const uploadsPlaylistId =
        channelData.items[0].contentDetails.relatedPlaylists.uploads;

      // Step 2: Get video IDs from the uploads playlist (up to 50)
      const playlistResponse = await fetch(
        `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
      );
      const playlistData: YouTubePlaylistItemsResponse =
        await playlistResponse.json();

      if (!playlistData.items || playlistData.items.length === 0) {
        console.log("No videos found in playlist");
        return { success: true, videosProcessed: 0 };
      }

      const videoIds = playlistData.items.map(
        (item) => item.snippet.resourceId.videoId
      );

      // Step 3: Get full video details
      const videosResponse = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`
      );
      const videosData: YouTubeVideosResponse = await videosResponse.json();

      // Step 4: Store each video and extract projects
      let processedCount = 0;
      for (const video of videosData.items) {
        const thumbnail =
          video.snippet.thumbnails.high?.url ||
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default?.url ||
          "";

        // Upsert the video
        await ctx.runMutation(internal.videos.upsert, {
          youtubeId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnailUrl: thumbnail,
          publishedAt: video.snippet.publishedAt,
          viewCount: video.statistics?.viewCount
            ? parseInt(video.statistics.viewCount, 10)
            : undefined,
          duration: video.contentDetails?.duration,
        });

        // Extract and store projects from video description
        const projectLinks = extractProjectLinks(video.snippet.description);
        if (projectLinks.sourceUrl || projectLinks.demoUrl) {
          await ctx.runMutation(internal.projects.upsert, {
            name: projectLinks.projectName || video.snippet.title,
            description: video.snippet.description.slice(0, 200),
            sourceUrl: projectLinks.sourceUrl,
            demoUrl: projectLinks.demoUrl,
            thumbnailUrl: thumbnail,
            sourceType: "video",
            sourceId: video.id,
            extractedAt: new Date().toISOString(),
          });
        }

        processedCount++;
      }

      console.log(`YouTube refresh complete. Processed ${processedCount} videos.`);
      return { success: true, videosProcessed: processedCount };
    } catch (error) {
      console.error("Error refreshing YouTube videos:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Manual trigger for testing
export const manualRefresh = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; videosProcessed?: number; error?: string }> => {
    return await ctx.runAction(internal.youtube.refresh, {});
  },
});
