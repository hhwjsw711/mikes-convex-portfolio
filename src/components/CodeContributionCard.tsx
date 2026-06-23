import type { Doc } from "../../convex/_generated/dataModel";

interface CodeContributionCardProps {
  contribution: Doc<"codeContributions">;
}

export function CodeContributionCard({
  contribution,
}: CodeContributionCardProps) {
  const formattedDate = new Date(contribution.committedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <a
      href={contribution.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg border border-emerald-600/25 bg-[#111] p-4 transition-all hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-500/10"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-emerald-300">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-300">
              Convex code
            </span>
            <span>{formattedDate}</span>
          </div>
          <h3 className="mt-3 line-clamp-3 font-semibold text-white group-hover:text-emerald-300">
            {contribution.title}
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>{contribution.repository}</span>
            <span className="font-mono text-gray-400">
              {contribution.shortSha}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
