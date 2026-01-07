import { QueryCtx, MutationCtx } from "../_generated/server";

export interface ProjectData {
  name: string;
  description?: string;
  sourceUrl?: string;
  demoUrl?: string;
  thumbnailUrl?: string;
  sourceType: "video" | "article";
  sourceId: string;
  extractedAt: string;
}

export async function getProjectBySourceId(ctx: QueryCtx, sourceId: string) {
  return await ctx.db
    .query("projects")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
    .first();
}

export async function getAllProjects(ctx: QueryCtx) {
  return await ctx.db.query("projects").order("desc").collect();
}

export async function getVisibleProjects(ctx: QueryCtx) {
  const projects = await getAllProjects(ctx);
  return projects.filter((p) => !p.isHidden);
}

export async function upsertProject(ctx: MutationCtx, projectData: ProjectData) {
  const existing = await getProjectBySourceId(ctx, projectData.sourceId);
  if (existing) {
    await ctx.db.patch(existing._id, projectData);
    return existing._id;
  }
  return await ctx.db.insert("projects", projectData);
}

export async function deleteProjectsBySourceId(
  ctx: MutationCtx,
  sourceId: string
) {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
    .collect();
  for (const project of projects) {
    await ctx.db.delete(project._id);
  }
}

/**
 * Extract project links from text content (video description or article content)
 * Returns an object with sourceUrl (GitHub/GitLab) and demoUrl
 */
export function extractProjectLinks(text: string): {
  sourceUrl?: string;
  demoUrl?: string;
  projectName?: string;
} {
  const result: { sourceUrl?: string; demoUrl?: string; projectName?: string } =
    {};

  // Regex patterns for source code repositories
  const sourcePatterns = [
    /https?:\/\/github\.com\/[\w-]+\/[\w.-]+/gi,
    /https?:\/\/gitlab\.com\/[\w-]+\/[\w.-]+/gi,
    /https?:\/\/bitbucket\.org\/[\w-]+\/[\w.-]+/gi,
  ];

  // Find source code URL
  for (const pattern of sourcePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.sourceUrl = match[0].replace(/\.git$/, "");
      // Extract project name from GitHub URL
      const nameMatch = result.sourceUrl.match(/\/([^/]+)$/);
      if (nameMatch) {
        result.projectName = nameMatch[1];
      }
      break;
    }
  }

  // Find demo URL - look for common patterns
  const demoPatterns = [
    // Vercel deployments
    /https?:\/\/[\w-]+\.vercel\.app\/?/gi,
    // Netlify deployments
    /https?:\/\/[\w-]+\.netlify\.app\/?/gi,
    // GitHub Pages
    /https?:\/\/[\w-]+\.github\.io\/[\w-]+\/?/gi,
    // Custom domains mentioned near "demo", "live", "try"
    /(?:demo|live|try(?:\s+it)?(?:\s+out)?|check(?:\s+it)?(?:\s+out)?)[:\s]+\n?\s*(https?:\/\/[^\s\n]+)/gi,
  ];

  for (const pattern of demoPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Extract just the URL if it's a pattern with label
      const urlMatch = match[0].match(/(https?:\/\/[^\s\n]+)/);
      if (urlMatch) {
        // Don't use the source URL as demo
        if (
          urlMatch[1] !== result.sourceUrl &&
          !urlMatch[1].includes("github.com") &&
          !urlMatch[1].includes("gitlab.com") &&
          !urlMatch[1].includes("bitbucket.org")
        ) {
          result.demoUrl = urlMatch[1];
          break;
        }
      }
    }
  }

  return result;
}
