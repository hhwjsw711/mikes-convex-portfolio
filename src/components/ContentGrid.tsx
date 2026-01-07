import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { ContentType } from "../pages/Home";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { ContentCard } from "./ContentCard";
import { ProjectCard } from "./ProjectCard";
import { LoadingState } from "./LoadingState";

type VideoTab = "longform" | "shorts";

interface ContentGridProps {
  videos: Doc<"videos">[];
  articles: Doc<"articles">[];
  projects: Doc<"projects">[];
  filter: ContentType;
  isLoading: boolean;
  isAdmin?: boolean;
  onHideVideo?: (id: Id<"videos">) => void;
  onHideArticle?: (id: Id<"articles">) => void;
  onHideProject?: (id: Id<"projects">) => void;
}

// Parse ISO 8601 duration (e.g., "PT1M30S") to seconds
function parseDurationToSeconds(duration?: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// YouTube Shorts are less than 3 minutes
function isShort(video: Doc<"videos">): boolean {
  const seconds = parseDurationToSeconds(video.duration);
  return seconds > 0 && seconds < 180;
}

export function ContentGrid({
  videos,
  articles,
  projects,
  filter,
  isLoading,
  isAdmin = false,
  onHideVideo,
  onHideArticle,
  onHideProject,
}: ContentGridProps) {
  const [videoTab, setVideoTab] = useState<VideoTab>("longform");

  const handleHideContent = (id: Id<"videos"> | Id<"articles">, type: "video" | "article") => {
    if (type === "video") {
      onHideVideo?.(id as Id<"videos">);
    } else {
      onHideArticle?.(id as Id<"articles">);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  // Query for sub-category stats using aggregates
  const subCategoryStats = useQuery(api.videos.statsByType, { videoType: videoTab });

  // When filtering by videos only, show tabbed view
  if (filter === "videos") {
    const longForm = videos.filter((v) => !isShort(v));
    const shorts = videos.filter((v) => isShort(v));

    if (videos.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-gray-800">
          <button
            onClick={() => setVideoTab("longform")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              videoTab === "longform"
                ? "border-b-2 border-red-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="text-red-500">&#9654;</span>
            Long-form
            <span className="text-xs text-gray-500">({longForm.length})</span>
          </button>
          <button
            onClick={() => setVideoTab("shorts")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              videoTab === "shorts"
                ? "border-b-2 border-red-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="text-red-500">&#9889;</span>
            Shorts
            <span className="text-xs text-gray-500">({shorts.length})</span>
          </button>
        </div>

        {/* Sub-category stats from aggregates */}
        <div className="flex flex-wrap gap-4 text-sm">
          {subCategoryStats ? (
            <>
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{subCategoryStats.totalViews.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{subCategoryStats.totalLikes.toLocaleString()} likes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{subCategoryStats.totalComments.toLocaleString()} comments</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-700" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-700" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-700" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
              </div>
            </>
          )}
        </div>

        {videoTab === "longform" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {longForm.length > 0 ? (
              longForm.map((video) => (
                <ContentCard
                  key={`video-${video._id}`}
                  type="video"
                  data={video}
                  isAdmin={isAdmin}
                  onHide={handleHideContent}
                />
              ))
            ) : (
              <p className="text-gray-400 col-span-full text-center py-8">
                No long-form videos found
              </p>
            )}
          </div>
        )}

        {videoTab === "shorts" && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {shorts.length > 0 ? (
              shorts.map((video) => (
                <ContentCard
                  key={`video-${video._id}`}
                  type="video"
                  data={video}
                  compact
                  isAdmin={isAdmin}
                  onHide={handleHideContent}
                />
              ))
            ) : (
              <p className="text-gray-400 col-span-full text-center py-8">
                No shorts found
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  const showVideos = filter === "all";
  const showArticles = filter === "all" || filter === "articles";
  const showProjects = filter === "all" || filter === "projects";

  // Combine and sort all content by date
  const allContent: Array<{
    type: "video" | "article" | "project";
    data: Doc<"videos"> | Doc<"articles"> | Doc<"projects">;
    date: string;
  }> = [];

  if (showVideos) {
    videos.forEach((video) => {
      allContent.push({ type: "video", data: video, date: video.publishedAt });
    });
  }

  if (showArticles) {
    articles.forEach((article) => {
      allContent.push({
        type: "article",
        data: article,
        date: article.publishedAt,
      });
    });
  }

  if (showProjects) {
    projects.forEach((project) => {
      allContent.push({
        type: "project",
        data: project,
        date: project.extractedAt,
      });
    });
  }

  // Sort by date descending
  allContent.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (allContent.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {allContent.map((item) => {
        if (item.type === "project") {
          return (
            <ProjectCard
              key={`project-${(item.data as Doc<"projects">)._id}`}
              project={item.data as Doc<"projects">}
              isAdmin={isAdmin}
              onHide={onHideProject}
            />
          );
        }
        return (
          <ContentCard
            key={`${item.type}-${item.data._id}`}
            type={item.type}
            data={item.data as Doc<"videos"> | Doc<"articles">}
            isAdmin={isAdmin}
            onHide={handleHideContent}
          />
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-gray-400">No content found</p>
      <p className="mt-2 text-sm text-gray-500">
        Content will appear here once fetched from YouTube and Convex Stack
      </p>
    </div>
  );
}
