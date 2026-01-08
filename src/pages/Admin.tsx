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
type OwnershipFilter = "all" | "undecided" | "mine" | "notMine";
type VisibilityFilter = "all" | "visible" | "hidden";

export function Admin() {
  const { isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("videos");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("visible");

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
          ownershipFilter={ownershipFilter}
          onOwnershipFilterChange={setOwnershipFilter}
          showOwnershipFilter={activeTab === "videos"}
          visibilityFilter={visibilityFilter}
          onVisibilityFilterChange={setVisibilityFilter}
          showVisibilityFilter={activeTab === "projects"}
        />
        <ContentManager
          activeTab={activeTab}
          sortOrder={sortOrder}
          ownershipFilter={ownershipFilter}
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
  ownershipFilter,
  onOwnershipFilterChange,
  showOwnershipFilter,
  visibilityFilter,
  onVisibilityFilterChange,
  showVisibilityFilter,
}: {
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  ownershipFilter: OwnershipFilter;
  onOwnershipFilterChange: (filter: OwnershipFilter) => void;
  showOwnershipFilter: boolean;
  visibilityFilter: VisibilityFilter;
  onVisibilityFilterChange: (filter: VisibilityFilter) => void;
  showVisibilityFilter: boolean;
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
      {showOwnershipFilter && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Ownership:</label>
          <select
            value={ownershipFilter}
            onChange={(e) => onOwnershipFilterChange(e.target.value as OwnershipFilter)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="all">All videos</option>
            <option value="undecided">Undecided</option>
            <option value="mine">Mine</option>
            <option value="notMine">Not Mine</option>
          </select>
        </div>
      )}
      {showVisibilityFilter && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Visibility:</label>
          <select
            value={visibilityFilter}
            onChange={(e) => onVisibilityFilterChange(e.target.value as VisibilityFilter)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="visible">Visible only</option>
            <option value="all">All projects</option>
            <option value="hidden">Hidden only</option>
          </select>
        </div>
      )}
    </div>
  );
}

function ContentManager({
  activeTab,
  sortOrder,
  ownershipFilter,
  visibilityFilter,
}: {
  activeTab: TabType;
  sortOrder: SortOrder;
  ownershipFilter: OwnershipFilter;
  visibilityFilter: VisibilityFilter;
}) {
  const content = useQuery(api.admin.getAllContent);

  // Optimistic update for video ownership
  const setVideoIsMikes = useMutation(
    api.admin.setVideoIsMikes
  ).withOptimisticUpdate((localStore, args) => {
    const currentContent = localStore.getQuery(api.admin.getAllContent, {});
    if (currentContent) {
      const updatedVideos = currentContent.videos.map((v) =>
        v._id === args.id ? { ...v, isMikes: args.isMikes } : v
      );
      localStore.setQuery(api.admin.getAllContent, {}, {
        ...currentContent,
        videos: updatedVideos,
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

  const handleSetOwnership = async (
    id: string,
    isMikes: "mine" | "notMine"
  ) => {
    await setVideoIsMikes({ id: id as Id<"videos">, isMikes });
  };

  if (activeTab === "videos") {
    // Videos have ownership status
    type VideoItem = {
      _id: string;
      _creationTime: number;
      title?: string;
      isMikes?: "undecided" | "mine" | "notMine";
      thumbnailUrl?: string;
      publishedAt: string;
    };

    // Apply ownership filter
    let items: VideoItem[] = content.videos.filter((item) => {
      if (ownershipFilter === "undecided") return item.isMikes === "undecided" || !item.isMikes;
      if (ownershipFilter === "mine") return item.isMikes === "mine";
      if (ownershipFilter === "notMine") return item.isMikes === "notMine";
      return true;
    });

    // Apply sort order by publishedAt date (data comes pre-sorted from backend, but user can change sort order)
    if (sortOrder === "oldest") {
      items = [...items].reverse();
    }

    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.length === 0 ? (
          <p className="col-span-full text-gray-400 text-center py-8">No videos found.</p>
        ) : (
          items.map((item) => (
            <VideoCard
              key={item._id}
              item={item}
              onSetOwnership={handleSetOwnership}
            />
          ))
        )}
      </div>
    );
  }

  if (activeTab === "projects") {
    // Projects have hide/edit capabilities
    type ProjectItem = {
      _id: string;
      _creationTime: number;
      name: string;
      description?: string;
      sourceUrl?: string;
      demoUrl?: string;
      thumbnailUrl?: string;
      isHidden?: boolean;
      sourceType: "video" | "article";
      sourceId: string;
    };

    // Apply visibility filter
    let items: ProjectItem[] = content.projects.filter((item) => {
      if (visibilityFilter === "visible") return !item.isHidden;
      if (visibilityFilter === "hidden") return item.isHidden;
      return true;
    });

    // Apply sort order (create copy to avoid mutating query cache)
    items = [...items].sort((a, b) => {
      return sortOrder === "newest"
        ? b._creationTime - a._creationTime
        : a._creationTime - b._creationTime;
    });

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <p className="col-span-full text-gray-400 text-center py-8">No projects found.</p>
        ) : (
          items.map((item) => (
            <ProjectAdminCard
              key={item._id}
              project={item}
            />
          ))
        )}
      </div>
    );
  }

  // Articles (read-only)
  // Data comes pre-sorted from backend (newest first), reverse if user wants oldest first
  const items = sortOrder === "oldest"
    ? [...content.articles].reverse()
    : content.articles;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.length === 0 ? (
        <p className="col-span-full text-gray-400 text-center py-8">No articles found.</p>
      ) : (
        items.map((item) => (
          <SimpleContentCard
            key={item._id}
            item={item}
          />
        ))
      )}
    </div>
  );
}

function VideoCard({
  item,
  onSetOwnership,
}: {
  item: {
    _id: string;
    title?: string;
    isMikes?: "undecided" | "mine" | "notMine";
    thumbnailUrl?: string;
  };
  onSetOwnership: (id: string, isMikes: "mine" | "notMine") => void;
}) {
  const title = item.title || "Untitled";
  const status = item.isMikes ?? "undecided";

  const statusColors = {
    undecided: "bg-yellow-600",
    mine: "bg-green-600",
    notMine: "bg-red-600",
  };

  const statusLabels = {
    undecided: "Undecided",
    mine: "Mine",
    notMine: "Not Mine",
  };

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border transition-all ${
        status === "notMine"
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
            className={`absolute right-2 top-2 rounded px-2 py-1 text-xs font-medium text-white ${statusColors[status]}`}
          >
            {statusLabels[status]}
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
            status === "notMine" ? "text-gray-500" : "text-white"
          }`}
        >
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onSetOwnership(item._id, "mine")}
            disabled={status === "mine"}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              status === "mine"
                ? "bg-green-800 text-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            Mine
          </button>
          <button
            onClick={() => onSetOwnership(item._id, "notMine")}
            disabled={status === "notMine"}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              status === "notMine"
                ? "bg-red-800 text-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            Not Mine
          </button>
        </div>
      </div>
    </div>
  );
}

function SimpleContentCard({
  item,
}: {
  item: {
    _id: string;
    title?: string;
    name?: string;
    thumbnailUrl?: string;
  };
}) {
  const title = item.title || item.name || "Untitled";

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      {item.thumbnailUrl ? (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={item.thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-gray-800">
          <span className="text-gray-500">No thumbnail</span>
        </div>
      )}
      <div className="flex flex-col gap-3 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-white">
          {title}
        </h3>
      </div>
    </div>
  );
}

function ProjectAdminCard({
  project,
}: {
  project: {
    _id: string;
    name: string;
    description?: string;
    sourceUrl?: string;
    demoUrl?: string;
    thumbnailUrl?: string;
    isHidden?: boolean;
    sourceType: "video" | "article";
    sourceId: string;
  };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(project.sourceUrl || "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  // Generate link to the source video or article
  const sourceContentUrl =
    project.sourceType === "video"
      ? `https://www.youtube.com/watch?v=${project.sourceId}`
      : `https://stack.convex.dev/${project.sourceId}`;

  const setProjectHidden = useMutation(api.admin.setProjectHidden);
  const updateProjectLinks = useMutation(api.admin.updateProjectLinks);
  const deleteProject = useMutation(api.admin.deleteProject);

  const handleToggleHidden = async () => {
    await setProjectHidden({
      id: project._id as Id<"projects">,
      isHidden: !project.isHidden,
    });
  };

  const handleSaveLinks = async () => {
    setIsSaving(true);
    try {
      await updateProjectLinks({
        id: project._id as Id<"projects">,
        sourceUrl: sourceUrl || undefined,
        demoUrl: demoUrl || undefined,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      await deleteProject({ id: project._id as Id<"projects"> });
    }
  };

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border transition-all ${
        project.isHidden
          ? "border-gray-800 bg-gray-900/50 opacity-60"
          : "border-gray-700 bg-gray-900"
      }`}
    >
      {project.thumbnailUrl ? (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="h-full w-full object-cover"
          />
          {project.isHidden && (
            <div className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
              Hidden
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex aspect-video items-center justify-center bg-gray-800">
          <span className="text-gray-500">No thumbnail</span>
          {project.isHidden && (
            <div className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
              Hidden
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-3 p-3">
        <h3
          className={`line-clamp-2 text-sm font-medium ${
            project.isHidden ? "text-gray-500" : "text-white"
          }`}
        >
          {project.name}
        </h3>
        {project.description && (
          <p className="line-clamp-2 text-xs text-gray-400">
            {project.description}
          </p>
        )}

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-xs text-gray-400">Source URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Demo URL</label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveLinks}
                disabled={isSaving}
                className="flex-1 rounded bg-orange-500 px-2 py-1 text-xs font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-800"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSourceUrl(project.sourceUrl || "");
                  setDemoUrl(project.demoUrl || "");
                }}
                className="flex-1 rounded bg-gray-700 px-2 py-1 text-xs font-medium text-white hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-xs">
            <a
              href={sourceContentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-orange-400 hover:text-orange-300"
            >
              <span>{project.sourceType === "video" ? "▶" : "📄"}</span>
              <span className="truncate">
                {project.sourceType === "video" ? "YouTube Video" : "Stack Article"}
              </span>
            </a>
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-blue-400 hover:text-blue-300"
              >
                {project.sourceUrl}
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-green-400 hover:text-green-300"
              >
                {project.demoUrl}
              </a>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex-1 rounded bg-gray-700 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-600"
          >
            {isEditing ? "Cancel Edit" : "Edit Links"}
          </button>
          <button
            onClick={handleToggleHidden}
            className={`flex-1 rounded px-2 py-1.5 text-xs font-medium text-white transition-colors ${
              project.isHidden
                ? "bg-green-600 hover:bg-green-700"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            {project.isHidden ? "Show" : "Hide"}
          </button>
          <button
            onClick={handleDelete}
            className="rounded bg-red-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
