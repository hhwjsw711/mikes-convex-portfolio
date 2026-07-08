import type { Doc } from "../../convex/_generated/dataModel";

interface TweetCardProps {
  tweet: Doc<"tweets">;
}

function formatNumber(value?: number) {
  if (value === undefined) return undefined;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatTweetText(text: string) {
  return text.split(/(https?:\/\/\S+|@\w+|#\w+)/g).map((part, index) => {
    if (part.startsWith("http")) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          {part}
        </a>
      );
    }

    if (part.startsWith("@")) {
      const username = part.slice(1);
      return (
        <a
          key={index}
          href={`https://x.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          {part}
        </a>
      );
    }

    if (part.startsWith("#")) {
      const hashtag = part.slice(1);
      return (
        <a
          key={index}
          href={`https://x.com/hashtag/${hashtag}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          {part}
        </a>
      );
    }

    return part;
  });
}

export function TweetCard({ tweet }: TweetCardProps) {
  const formattedDate = new Date(tweet.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const likeCount = formatNumber(tweet.likeCount);
  const replyCount = formatNumber(tweet.replyCount);
  const retweetCount = formatNumber(tweet.retweetCount);
  const viewCount = formatNumber(tweet.viewCount);

  return (
    <article className="group block overflow-hidden rounded-lg border border-blue-600/20 bg-[#111] p-4 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex items-start gap-3">
        <img
          src="/me_400x400.jpg"
          alt="Hu Hongwei"
          className="h-10 w-10 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-semibold text-white">Hu Hongwei</span>
            <span className="text-gray-500">@hhwjsw711</span>
            <span className="text-gray-600">.</span>
            <span className="text-gray-500">{formattedDate}</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-200">
            {formatTweetText(tweet.text)}
          </p>
        </div>
      </div>

      {tweet.mediaUrls && tweet.mediaUrls.length > 0 && (
        <div
          className={`mt-4 grid overflow-hidden rounded-lg border border-gray-800 ${
            tweet.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {tweet.mediaUrls.slice(0, 4).map((url, index) => (
            <img
              key={`${url}-${index}`}
              src={url}
              alt=""
              className="aspect-video h-full w-full object-cover"
              loading="lazy"
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        {replyCount && (
          <span className="flex items-center gap-1" title="Replies">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h8m-8 4h5m8-4c0 4.418-4.03 8-9 8a9.9 9.9 0 01-4.255-.949L3 20l1.395-3.72A7.45 7.45 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {replyCount}
          </span>
        )}
        {retweetCount && (
          <span className="flex items-center gap-1" title="Reposts">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h11m0 0l-3-3m3 3l-3 3M17 17H6m0 0l3 3m-3-3l3-3"
              />
            </svg>
            {retweetCount}
          </span>
        )}
        {likeCount && (
          <span className="flex items-center gap-1" title="Likes">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {likeCount}
          </span>
        )}
        {viewCount && (
          <span className="flex items-center gap-1" title="Views">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {viewCount}
          </span>
        )}
        <a
          href={tweet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-blue-400 hover:text-blue-300"
        >
          View on X
        </a>
      </div>
    </article>
  );
}
