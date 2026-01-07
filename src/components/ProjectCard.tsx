import type { Doc, Id } from "../../convex/_generated/dataModel";

interface ProjectCardProps {
  project: Doc<"projects">;
  isAdmin?: boolean;
  onHide?: (id: Id<"projects">) => void;
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

export function ProjectCard({ project, isAdmin = false, onHide }: ProjectCardProps) {
  const formattedDate = new Date(project.extractedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-800 bg-[#111] transition-all hover:border-accent-500/50 hover:shadow-lg hover:shadow-accent-500/10">
      {project.thumbnailUrl && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-2 top-2">
            <span className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white">
              Project
            </span>
          </div>
          {isAdmin && onHide && (
            <HideButton onClick={() => onHide(project._id)} />
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-white">{project.name}</h3>
        {project.description && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-400">
            {project.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              Source Code
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded bg-accent-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-500"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Live Demo
            </a>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">From {project.sourceType}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
