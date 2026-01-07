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

export function Admin() {
  const { isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("videos");

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
        <ContentManager activeTab={activeTab} />
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

function ContentManager({ activeTab }: { activeTab: TabType }) {
  const content = useQuery(api.admin.getAllContent);
  const setVideoHidden = useMutation(api.admin.setVideoHidden);
  const setArticleHidden = useMutation(api.admin.setArticleHidden);
  const setProjectHidden = useMutation(api.admin.setProjectHidden);

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

  const items =
    activeTab === "videos"
      ? content.videos
      : activeTab === "articles"
        ? content.articles
        : content.projects;

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No {activeTab} found.</p>
      ) : (
        items.map((item) => (
          <ContentRow
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

function ContentRow({
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
      className={`flex items-center gap-4 p-4 rounded-lg ${
        isHidden ? "bg-gray-900/50 opacity-60" : "bg-gray-900"
      }`}
    >
      {item.thumbnailUrl && (
        <img
          src={item.thumbnailUrl}
          alt={title}
          className="w-16 h-12 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-medium truncate ${isHidden ? "text-gray-500 line-through" : "text-white"}`}
        >
          {title}
        </h3>
        <span
          className={`text-xs ${isHidden ? "text-red-400" : "text-green-400"}`}
        >
          {isHidden ? "Hidden" : "Visible"}
        </span>
      </div>
      <button
        onClick={() => onToggle(type, item._id, isHidden)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isHidden
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        {isHidden ? "Show" : "Hide"}
      </button>
    </div>
  );
}
