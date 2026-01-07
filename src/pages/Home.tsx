import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header } from "../components/Header";
import { ContentGrid } from "../components/ContentGrid";
import { FilterBar } from "../components/FilterBar";
import { VideoStatsCards } from "../components/VideoStatsCards";
import { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import type { Id } from "../../convex/_generated/dataModel";

export type ContentType = "all" | "videos" | "articles" | "projects";

export function Home() {
  const [filter, setFilter] = useState<ContentType>("all");
  const { isAdmin } = useAdmin();
  const videos = useQuery(api.videos.list);
  const articles = useQuery(api.articles.list);
  const projects = useQuery(api.projects.list);
  const videoStats = useQuery(api.videos.stats);

  const hideVideo = useMutation(api.admin.setVideoHidden);
  const hideArticle = useMutation(api.admin.setArticleHidden);
  const hideProject = useMutation(api.admin.setProjectHidden);

  const handleHideVideo = (id: Id<"videos">) => {
    hideVideo({ id, isHidden: true });
  };

  const handleHideArticle = (id: Id<"articles">) => {
    hideArticle({ id, isHidden: true });
  };

  const handleHideProject = (id: Id<"projects">) => {
    hideProject({ id, isHidden: true });
  };

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
          isAdmin={isAdmin}
          onHideVideo={handleHideVideo}
          onHideArticle={handleHideArticle}
          onHideProject={handleHideProject}
        />
      </main>
    </div>
  );
}
