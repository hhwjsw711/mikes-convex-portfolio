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

export async function getProjectBySourceUrl(ctx: QueryCtx, sourceUrl: string) {
  return await ctx.db
    .query("projects")
    .withIndex("by_sourceUrl", (q) => q.eq("sourceUrl", sourceUrl))
    .first();
}

export async function getProjectByName(ctx: QueryCtx, name: string) {
  return await ctx.db
    .query("projects")
    .withIndex("by_name", (q) => q.eq("name", name))
    .first();
}

export async function getAllProjects(ctx: QueryCtx) {
  return await ctx.db.query("projects").order("desc").collect();
}

export async function getVisibleProjects(ctx: QueryCtx) {
  const projects = await getAllProjects(ctx);
  return projects.filter((p) => !p.isHidden);
}

/**
 * Upsert a project, checking for duplicates by sourceUrl or name
 * Priority: sourceUrl match > name match > create new
 */
export async function upsertProject(ctx: MutationCtx, projectData: ProjectData) {
  // First, check if a project with the same sourceUrl already exists
  if (projectData.sourceUrl) {
    const existingByUrl = await getProjectBySourceUrl(ctx, projectData.sourceUrl);
    if (existingByUrl) {
      // Update existing project but preserve isHidden status
      const { ...dataWithoutHidden } = projectData;
      await ctx.db.patch(existingByUrl._id, dataWithoutHidden);
      return existingByUrl._id;
    }
  }

  // Check if a project with the same name already exists
  const existingByName = await getProjectByName(ctx, projectData.name);
  if (existingByName) {
    // Update existing project but preserve isHidden status
    const { ...dataWithoutHidden } = projectData;
    await ctx.db.patch(existingByName._id, dataWithoutHidden);
    return existingByName._id;
  }

  // No duplicate found, create new project
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
