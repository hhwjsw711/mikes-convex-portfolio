import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header } from "../components/Header";
import { ContentGrid } from "../components/ContentGrid";
import { FilterBar } from "../components/FilterBar";
import { VideoStatsCards } from "../components/VideoStatsCards";
import { useState } from "react";

export type ContentType = "all" | "videos" | "articles" | "projects";

export function Home() {
  const [filter, setFilter] = useState<ContentType>("all");
  const videos = useQuery(api.videos.list);
  const articles = useQuery(api.articles.list);
  const projects = useQuery(api.projects.list);
  const videoStats = useQuery(api.videos.stats);

  const isLoading =
    videos === undefined || articles === undefined || projects === undefined;

  const counts = {
    videos: videos?.length ?? 0,
    articles: articles?.length ?? 0,
    projects: projects?.length ?? 0,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FilterBar currentFilter={filter} onFilterChange={setFilter} counts={counts} />
        {filter === "videos" && videoStats && (
          <VideoStatsCards
            totalViews={videoStats.totalViews}
            totalLikes={videoStats.totalLikes}
            totalComments={videoStats.totalComments}
            videoCount={videoStats.videoCount}
          />
        )}
        <ContentGrid
          videos={videos ?? []}
          articles={articles ?? []}
          projects={projects ?? []}
          filter={filter}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
