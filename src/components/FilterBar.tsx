import type { ContentType } from "../pages/Home";

interface FilterBarProps {
  currentFilter: ContentType;
  onFilterChange: (filter: ContentType) => void;
  counts: {
    videos: number;
    articles: number;
    tweets: number;
    projects: number;
    codeContributions: number;
  };
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  );
}

function ArticleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );
}

function TweetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ProjectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function CodeContributionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

const filters: { value: ContentType; label: string; icon: typeof GridIcon }[] = [
  { value: "all", label: "All", icon: GridIcon },
  { value: "videos", label: "Videos", icon: VideoIcon },
  { value: "articles", label: "Articles", icon: ArticleIcon },
  { value: "tweets", label: "Tweets", icon: TweetIcon },
  { value: "projects", label: "Projects", icon: ProjectIcon },
  {
    value: "codeContributions",
    label: "Code",
    icon: CodeContributionIcon,
  },
];

export function FilterBar({ currentFilter, onFilterChange, counts }: FilterBarProps) {
  const getCount = (filter: ContentType): number => {
    if (filter === "all") {
      return (
        counts.videos +
        counts.articles +
        counts.tweets +
        counts.projects +
        counts.codeContributions
      );
    }
    return counts[filter];
  };

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const count = getCount(filter.value);
        const isActive = currentFilter === filter.value;

        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {filter.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-gray-700 text-gray-400"
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
