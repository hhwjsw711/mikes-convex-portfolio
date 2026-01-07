"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { extractProjectLinks } from "./model/projects";

interface ParsedArticle {
  slug: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  publishedAt: string;
  url: string;
}

/**
 * Parse the HTML from the Convex Stack author page to extract article data
 */
function parseArticlesFromHtml(html: string): ParsedArticle[] {
  const articles: ParsedArticle[] = [];

  // Pattern for article cards
  const cardPattern =
    /<article[^>]*>[\s\S]*?<a[^>]*href="(\/[a-z0-9-]+)"[\s\S]*?<h[23][^>]*>([^<]+)<\/h[23]>[\s\S]*?(?:<p[^>]*>([^<]*)<\/p>)?[\s\S]*?<\/article>/gi;

  let match;
  while ((match = cardPattern.exec(html)) !== null) {
    const [, path, title, description] = match;
    if (path && title && !path.startsWith("/author")) {
      const slug = path.replace(/^\//, "");
      articles.push({
        slug,
        title: decodeHtmlEntities(title.trim()),
        description: description ? decodeHtmlEntities(description.trim()) : "",
        url: `https://stack.convex.dev${path}`,
        publishedAt: new Date().toISOString(), // Will be updated if we can extract date
      });
    }
  }

  // If no articles found with card pattern, try simpler extraction
  if (articles.length === 0) {
    // Look for links to articles
    const seenSlugs = new Set<string>();
    const linkMatches = html.matchAll(
      /<a[^>]*href="(\/[a-z][a-z0-9-]*)"[^>]*>[\s\S]*?([^<]+)[\s\S]*?<\/a>/gi
    );

    for (const linkMatch of linkMatches) {
      const path = linkMatch[1];
      // Skip author pages, category pages, etc.
      if (
        path.startsWith("/author") ||
        path.startsWith("/tag") ||
        path === "/" ||
        path.includes("#")
      ) {
        continue;
      }

      const slug = path.replace(/^\//, "");
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      articles.push({
        slug,
        title: slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        description: "",
        url: `https://stack.convex.dev${path}`,
        publishedAt: new Date().toISOString(),
      });
    }
  }

  return articles;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export const refresh = internalAction({
  args: {},
  handler: async (ctx) => {
    const authorSlug = process.env.STACK_AUTHOR_SLUG || "mike-cann";

    try {
      // Fetch the author page
      const response = await fetch(
        `https://stack.convex.dev/author/${authorSlug}`
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch Stack author page: ${response.status}`
        );
        return { success: false, error: `HTTP ${response.status}` };
      }

      const html = await response.text();
      const articles = parseArticlesFromHtml(html);

      console.log(`Found ${articles.length} articles on Stack`);

      // Store each article
      let processedCount = 0;
      for (const article of articles) {
        // Fetch individual article page to get more details
        try {
          const articleResponse = await fetch(article.url);
          if (articleResponse.ok) {
            const articleHtml = await articleResponse.text();

            // Try to extract thumbnail
            const ogImageMatch = articleHtml.match(
              /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i
            );
            if (ogImageMatch) {
              article.thumbnailUrl = ogImageMatch[1];
            }

            // Try to extract description if missing
            if (!article.description) {
              const ogDescMatch = articleHtml.match(
                /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i
              );
              if (ogDescMatch) {
                article.description = decodeHtmlEntities(ogDescMatch[1]);
              }
            }

            // Try to extract title if it looks auto-generated
            const ogTitleMatch = articleHtml.match(
              /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i
            );
            if (ogTitleMatch) {
              article.title = decodeHtmlEntities(ogTitleMatch[1]);
            }

            // Try to extract publish date
            const dateMatch = articleHtml.match(
              /<time[^>]*datetime="([^"]+)"/i
            );
            if (dateMatch) {
              article.publishedAt = dateMatch[1];
            }

            // Extract projects from article content
            const projectLinks = extractProjectLinks(articleHtml);
            if (projectLinks.sourceUrl || projectLinks.demoUrl) {
              await ctx.runMutation(internal.projects.upsert, {
                name: projectLinks.projectName || article.title,
                description: article.description.slice(0, 200),
                sourceUrl: projectLinks.sourceUrl,
                demoUrl: projectLinks.demoUrl,
                thumbnailUrl: article.thumbnailUrl,
                sourceType: "article",
                sourceId: article.slug,
                extractedAt: new Date().toISOString(),
              });
            }
          }
        } catch (articleError) {
          console.warn(`Failed to fetch article ${article.slug}:`, articleError);
        }

        // Upsert the article
        await ctx.runMutation(internal.articles.upsert, {
          slug: article.slug,
          title: article.title,
          description: article.description,
          thumbnailUrl: article.thumbnailUrl,
          publishedAt: article.publishedAt,
          url: article.url,
        });

        processedCount++;
      }

      console.log(`Stack refresh complete. Processed ${processedCount} articles.`);
      return { success: true, articlesProcessed: processedCount };
    } catch (error) {
      console.error("Error refreshing Stack articles:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Manual trigger for testing
export const manualRefresh = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; articlesProcessed?: number; error?: string }> => {
    return await ctx.runAction(internal.stack.refresh, {});
  },
});
