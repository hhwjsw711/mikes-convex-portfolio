import {
  SignInButton,
  SignOutButton,
  useUser,
  UserButton,
} from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

type TabType = "videos" | "articles" | "projects";
type SortOrder = "newest" | "oldest";
type VisibilityFilter = "all" | "visible" | "hidden";

export function Admin() {
  const { isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("videos");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <AdminHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-6">Admin Access Required</h2>
          <p className="text-gray-400 mb-8">
            Please sign in to access the admin dashboard.
          </p>
          <SignInButton mode="modal">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Sign In
            </button>
          </SignInButton>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <RefreshButtons />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <FilterControls
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          visibilityFilter={visibilityFilter}
          onVisibilityFilterChange={setVisibilityFilter}
        />
        <ContentManager
          activeTab={activeTab}
          sortOrder={sortOrder}
          visibilityFilter={visibilityFilter}
        />
      </main>
    </div>
  );
}

function AdminHeader() {
  const { isSignedIn } = useUser();

  return (
    <header className="border-b border-gray-800 bg-[#111111]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            &larr; Back to Site
          </Link>
          <h1 className="text-xl font-bold text-orange-500">Admin Dashboard</h1>
        </div>
        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/admin" />
            <SignOutButton>
              <button className="text-gray-400 hover:text-white transition-colors text-sm">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function RefreshButtons() {
  const triggerYouTubeRefresh = useMutation(api.admin.triggerYouTubeRefresh);
  const triggerStackRefresh = useMutation(api.admin.triggerStackRefresh);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [stackLoading, setStackLoading] = useState(false);

  const handleYouTubeRefresh = async () => {
    setYoutubeLoading(true);
    try {
      await triggerYouTubeRefresh();
    } finally {
      setYoutubeLoading(false);
    }
  };

  const handleStackRefresh = async () => {
    setStackLoading(true);
    try {
      await triggerStackRefresh();
    } finally {
      setStackLoading(false);
    }
  };

  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={handleYouTubeRefresh}
        disabled={youtubeLoading}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {youtubeLoading ? (
          <span className="animate-spin">&#9696;</span>
        ) : (
          <span>&#9654;</span>
        )}
        Refresh YouTube
      </button>
      <button
        onClick={handleStackRefresh}
        disabled={stackLoading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {stackLoading ? (
          <span className="animate-spin">&#9696;</span>
        ) : (
          <span>&#128196;</span>
        )}
        Refresh Stack
      </button>
    </div>
  );
}

function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  const tabs: { id: TabType; label: string }[] = [
    { id: "videos", label: "Videos" },
    { id: "articles", label: "Articles" },
    { id: "projects", label: "Projects" },
  ];

  return (
    <div className="flex gap-1 mb-6 border-b border-gray-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === tab.id
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function FilterControls({
  sortOrder,
  onSortOrderChange,
  visibilityFilter,
  onVisibilityFilterChange,
}: {
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  visibilityFilter: VisibilityFilter;
  onVisibilityFilterChange: (filter: VisibilityFilter) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Sort:</label>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white focus:border-orange-500 focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Show:</label>
        <select
          value={visibilityFilter}
          onChange={(e) => onVisibilityFilterChange(e.target.value as VisibilityFilter)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white focus:border-orange-500 focus:outline-none"
        >
          <option value="all">All items</option>
          <option value="visible">Visible only</option>
          <option value="hidden">Hidden only</option>
        </select>
      </div>
    </div>
  );
}

function ContentManager({
  activeTab,
  sortOrder,
  visibilityFilter,
}: {
  activeTab: TabType;
  sortOrder: SortOrder;
  visibilityFilter: VisibilityFilter;
}) {
  const content = useQuery(api.admin.getAllContent);

  // Optimistic update for videos
  const setVideoHidden = useMutation(
    api.admin.setVideoHidden
  ).withOptimisticUpdate((localStore, args) => {
    const currentContent = localStore.getQuery(api.admin.getAllContent, {});
    if (currentContent) {
      const updatedVideos = currentContent.videos.map((v) =>
        v._id === args.id ? { ...v, isHidden: args.isHidden } : v
      );
      localStore.setQuery(api.admin.getAllContent, {}, {
        ...currentContent,
        videos: updatedVideos,
      });
    }
  });

  // Optimistic update for articles
  const setArticleHidden = useMutation(
    api.admin.setArticleHidden
  ).withOptimisticUpdate((localStore, args) => {
    const currentContent = localStore.getQuery(api.admin.getAllContent, {});
    if (currentContent) {
      const updatedArticles = currentContent.articles.map((a) =>
        a._id === args.id ? { ...a, isHidden: args.isHidden } : a
      );
      localStore.setQuery(api.admin.getAllContent, {}, {
        ...currentContent,
        articles: updatedArticles,
      });
    }
  });

  // Optimistic update for projects
  const setProjectHidden = useMutation(
    api.admin.setProjectHidden
  ).withOptimisticUpdate((localStore, args) => {
    const currentContent = localStore.getQuery(api.admin.getAllContent, {});
    if (currentContent) {
      const updatedProjects = currentContent.projects.map((p) =>
        p._id === args.id ? { ...p, isHidden: args.isHidden } : p
      );
      localStore.setQuery(api.admin.getAllContent, {}, {
        ...currentContent,
        projects: updatedProjects,
      });
    }
  });

  if (!content) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const handleToggle = async (
    type: TabType,
    id: string,
    currentHidden: boolean
  ) => {
    const newHidden = !currentHidden;
    if (type === "videos") {
      await setVideoHidden({ id: id as Id<"videos">, isHidden: newHidden });
    } else if (type === "articles") {
      await setArticleHidden({ id: id as Id<"articles">, isHidden: newHidden });
    } else {
      await setProjectHidden({ id: id as Id<"projects">, isHidden: newHidden });
    }
  };

  // Get items for active tab and apply filtering/sorting
  type ContentItem = {
    _id: string;
    _creationTime: number;
    title?: string;
    name?: string;
    isHidden?: boolean;
    thumbnailUrl?: string;
  };

  const rawItems: ContentItem[] =
    activeTab === "videos"
      ? content.videos
      : activeTab === "articles"
        ? content.articles
        : content.projects;

  // Apply visibility filter
  let items = rawItems.filter((item) => {
    if (visibilityFilter === "visible") return !item.isHidden;
    if (visibilityFilter === "hidden") return item.isHidden;
    return true;
  });

  // Apply sort order (using _creationTime)
  items = items.sort((a, b) => {
    return sortOrder === "newest"
      ? b._creationTime - a._creationTime
      : a._creationTime - b._creationTime;
  });

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.length === 0 ? (
        <p className="col-span-full text-gray-400 text-center py-8">No {activeTab} found.</p>
      ) : (
        items.map((item) => (
          <ContentCard
            key={item._id}
            item={item}
            type={activeTab}
            onToggle={handleToggle}
          />
        ))
      )}
    </div>
  );
}

function ContentCard({
  item,
  type,
  onToggle,
}: {
  item: {
    _id: string;
    title?: string;
    name?: string;
    isHidden?: boolean;
    thumbnailUrl?: string;
  };
  type: TabType;
  onToggle: (type: TabType, id: string, currentHidden: boolean) => void;
}) {
  const title = item.title || item.name || "Untitled";
  const isHidden = item.isHidden ?? false;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border transition-all ${
        isHidden
          ? "border-gray-800 bg-gray-900/50 opacity-60"
          : "border-gray-700 bg-gray-900"
      }`}
    >
      {item.thumbnailUrl ? (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={item.thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div
            className={`absolute right-2 top-2 rounded px-2 py-1 text-xs font-medium ${
              isHidden ? "bg-red-600 text-white" : "bg-green-600 text-white"
            }`}
          >
            {isHidden ? "Hidden" : "Visible"}
          </div>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-gray-800">
          <span className="text-gray-500">No thumbnail</span>
        </div>
      )}
      <div className="flex flex-col gap-3 p-3">
        <h3
          className={`line-clamp-2 text-sm font-medium ${
            isHidden ? "text-gray-500 line-through" : "text-white"
          }`}
        >
          {title}
        </h3>
        <button
          onClick={() => onToggle(type, item._id, isHidden)}
          className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${
            isHidden
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isHidden ? "Show" : "Hide"}
        </button>
      </div>
    </div>
  );
}
