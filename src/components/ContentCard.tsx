import type { Doc } from "../../convex/_generated/dataModel";
import type { Id } from "../../convex/_generated/dataModel";

interface ContentCardProps {
  type: "video" | "article";
  data: Doc<"videos"> | Doc<"articles">;
  compact?: boolean;
  isAdmin?: boolean;
  onHide?: (id: Id<"videos"> | Id<"articles">, type: "video" | "article") => void;
}

function HideButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-600 hover:text-white group-hover:opacity-100"
      title="Hide this item"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    </button>
  );
}

export function ContentCard({ type, data, compact = false, isAdmin = false, onHide }: ContentCardProps) {
  const isVideo = type === "video";
  const video = isVideo ? (data as Doc<"videos">) : null;
  const article = !isVideo ? (data as Doc<"articles">) : null;

  const title = isVideo ? video!.title : article!.title;
  const description = isVideo ? video!.description : article!.description;
  const thumbnailUrl = isVideo ? video!.thumbnailUrl : article!.thumbnailUrl;
  const publishedAt = isVideo ? video!.publishedAt : article!.publishedAt;

  const url = isVideo
    ? `https://www.youtube.com/watch?v=${video!.youtubeId}`
    : article!.url;

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Compact view for shorts
  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col overflow-hidden rounded-lg border border-gray-800 bg-[#111] transition-all hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10"
      >
        {thumbnailUrl && (
          <div className="relative aspect-[9/16] overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute left-1.5 top-1.5">
              <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Short
              </span>
            </div>
            {isAdmin && onHide && (
              <HideButton onClick={() => onHide(data._id as Id<"videos">, type)} />
            )}
          </div>
        )}
        <div className="p-2">
          <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-red-400">
            {title}
          </h3>
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-800 bg-[#111] transition-all hover:border-accent-500/50 hover:shadow-lg hover:shadow-accent-500/10"
    >
      {thumbnailUrl && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute left-2 top-2">
            <span
              className={`rounded px-2 py-1 text-xs font-medium ${
                isVideo
                  ? "bg-red-600 text-white"
                  : "bg-accent-500 text-white"
              }`}
            >
              {isVideo ? "Video" : "Article"}
            </span>
          </div>
          {isAdmin && onHide && (
            <HideButton onClick={() => onHide(data._id as Id<"videos"> | Id<"articles">, type)} />
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-white group-hover:text-accent-400">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-400">
          {description}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{formattedDate}</span>
          {isVideo && video?.viewCount && (
            <span>{video.viewCount.toLocaleString()} views</span>
          )}
        </div>
      </div>
    </a>
  );
}
