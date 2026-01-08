import type { Doc } from "../../convex/_generated/dataModel";

interface ContentCardProps {
  type: "video" | "article";
  data: Doc<"videos"> | Doc<"articles">;
  compact?: boolean;
}

export function ContentCard({ type, data, compact = false }: ContentCardProps) {
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
          {isVideo && video && (
            <div className="flex items-center gap-3">
              {video.viewCount !== undefined && (
                <span title="Views">{video.viewCount.toLocaleString()} views</span>
              )}
              {video.likeCount !== undefined && (
                <span title="Likes">{video.likeCount.toLocaleString()} likes</span>
              )}
              {video.commentCount !== undefined && (
                <span title="Comments">{video.commentCount.toLocaleString()} comments</span>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
