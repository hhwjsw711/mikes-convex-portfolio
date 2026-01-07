import { QueryCtx, MutationCtx } from "../_generated/server";

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  publishedAt: string;
  url: string;
}

export async function getArticleBySlug(ctx: QueryCtx, slug: string) {
  return await ctx.db
    .query("articles")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
}

export async function getAllArticles(ctx: QueryCtx) {
  return await ctx.db
    .query("articles")
    .withIndex("by_publishedAt")
    .order("desc")
    .collect();
}

export async function getVisibleArticles(ctx: QueryCtx) {
  const articles = await getAllArticles(ctx);
  return articles.filter((a) => !a.isHidden);
}

export async function upsertArticle(ctx: MutationCtx, articleData: ArticleData) {
  const existing = await getArticleBySlug(ctx, articleData.slug);
  if (existing) {
    await ctx.db.patch(existing._id, articleData);
    return existing._id;
  }
  return await ctx.db.insert("articles", articleData);
}

export async function deleteAllArticles(ctx: MutationCtx) {
  const articles = await ctx.db.query("articles").collect();
  for (const article of articles) {
    await ctx.db.delete(article._id);
  }
}
