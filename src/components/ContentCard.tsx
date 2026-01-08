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
        className="group flex flex-col overflow-hidden rounded-lg border border-red-800/50 bg-[#111] transition-all hover:border-red-500/70 hover:shadow-lg hover:shadow-red-500/10"
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

  const borderColor = isVideo
    ? "border-red-800/50 hover:border-red-500/70 hover:shadow-red-500/10"
    : "border-accent-800/50 hover:border-accent-500/70 hover:shadow-accent-500/10";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col overflow-hidden rounded-lg border bg-[#111] transition-all hover:shadow-lg ${borderColor}`}
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
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          {isVideo && video && (
            <div className="flex items-center gap-3">
              {video.viewCount !== undefined && (
                <div className="flex items-center gap-1" title="Views">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{video.viewCount.toLocaleString()}</span>
                </div>
              )}
              {video.likeCount !== undefined && (
                <div className="flex items-center gap-1" title="Likes">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{video.likeCount.toLocaleString()}</span>
                </div>
              )}
              {video.commentCount !== undefined && (
                <div className="flex items-center gap-1" title="Comments">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{video.commentCount.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
