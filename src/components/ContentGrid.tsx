import { useState } from "react";
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
