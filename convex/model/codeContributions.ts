import type { MutationCtx, QueryCtx } from "../_generated/server";

export interface CodeContributionData {
  sha: string;
  shortSha: string;
  title: string;
  rawTitle: string;
  committedAt: string;
  url: string;
  repository: string;
  authorName: string;
}

export function cleanCommitTitle(title: string) {
  return title.replace(/\s+\(#\d+\)\s*$/, "").trim();
}

export async function getCodeContributionBySha(ctx: QueryCtx, sha: string) {
  return await ctx.db
    .query("codeContributions")
    .withIndex("by_sha", (q) => q.eq("sha", sha))
    .first();
}

export async function getAllCodeContributions(ctx: QueryCtx) {
  return await ctx.db
    .query("codeContributions")
    .withIndex("by_committedAt")
    .order("desc")
    .collect();
}

export async function upsertCodeContribution(
  ctx: MutationCtx,
  contributionData: CodeContributionData
) {
  const existing = await getCodeContributionBySha(ctx, contributionData.sha);
  if (existing) {
    await ctx.db.patch(existing._id, contributionData);
    return existing._id;
  }
  return await ctx.db.insert("codeContributions", contributionData);
}
