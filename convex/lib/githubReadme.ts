/**
 * Utilities for fetching and parsing GitHub README files to extract images
 */

/**
 * Parse a GitHub URL to extract owner and repo
 * Handles formats like:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo/tree/branch
 * - https://github.com/owner/repo/blob/branch/file
 */
export function parseGitHubUrl(
  url: string
): { owner: string; repo: string } | null {
  const match = url.match(
    /github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (!match) return null;

  const owner = match[1];
  // Remove .git suffix if present
  const repo = match[2].replace(/\.git$/, "");

  return { owner, repo };
}

/**
 * Extract image URLs from markdown content
 * Handles:
 * - ![alt](url) markdown images
 * - <img src="url"> HTML images
 * - Relative paths (converted to absolute GitHub URLs)
 */
export function extractImagesFromMarkdown(
  markdown: string,
  owner: string,
  repo: string,
  branch: string = "main"
): string[] {
  const images: string[] = [];
  const seenUrls = new Set<string>();

  // Match markdown images: ![alt](url)
  const mdImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match;

  while ((match = mdImageRegex.exec(markdown)) !== null) {
    let imageUrl = match[1].trim();
    // Remove any title attribute: ![alt](url "title")
    imageUrl = imageUrl.split(/\s+/)[0];
    const resolved = resolveImageUrl(imageUrl, owner, repo, branch);
    if (resolved && !seenUrls.has(resolved)) {
      seenUrls.add(resolved);
      images.push(resolved);
    }
  }

  // Match HTML img tags: <img src="url" or <img src='url'
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;

  while ((match = htmlImageRegex.exec(markdown)) !== null) {
    const imageUrl = match[1].trim();
    const resolved = resolveImageUrl(imageUrl, owner, repo, branch);
    if (resolved && !seenUrls.has(resolved)) {
      seenUrls.add(resolved);
      images.push(resolved);
    }
  }

  return images;
}

/**
 * Resolve an image URL to an absolute URL
 * Converts relative paths to raw.githubusercontent.com URLs
 */
function resolveImageUrl(
  url: string,
  owner: string,
  repo: string,
  branch: string
): string | null {
  // Skip data URLs, badges, and shields
  if (
    url.startsWith("data:") ||
    url.includes("shields.io") ||
    url.includes("badge") ||
    url.includes("img.shields.io") ||
    url.includes("travis-ci") ||
    url.includes("codecov") ||
    url.includes("coveralls") ||
    url.includes("david-dm.org") ||
    url.includes("snyk.io")
  ) {
    return null;
  }

  // Already absolute URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Convert github.com blob URLs to raw URLs
    if (url.includes("github.com") && url.includes("/blob/")) {
      return url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
    }
    return url;
  }

  // Relative path - convert to raw.githubusercontent.com URL
  // Remove leading ./ or /
  const cleanPath = url.replace(/^\.?\//, "");
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;
}

/**
 * Filter images to prefer certain types (screenshots, demos, etc.)
 * Returns the best image or the first one if no preferred type found
 */
export function selectBestImage(images: string[]): string | undefined {
  if (images.length === 0) return undefined;

  // Prefer images with these keywords in the filename/path
  const preferredKeywords = [
    "screenshot",
    "demo",
    "preview",
    "banner",
    "hero",
    "cover",
    "logo",
    "example",
  ];

  // First, look for preferred images
  for (const keyword of preferredKeywords) {
    const found = images.find((url) =>
      url.toLowerCase().includes(keyword)
    );
    if (found) return found;
  }

  // Filter out very small images (likely icons) based on filename
  const filteredImages = images.filter((url) => {
    const lowerUrl = url.toLowerCase();
    // Skip tiny icons
    if (lowerUrl.includes("icon") && !lowerUrl.includes("favicon")) {
      return false;
    }
    // Skip favicons
    if (lowerUrl.includes("favicon")) {
      return false;
    }
    return true;
  });

  // Return first non-icon image, or first image overall
  return filteredImages[0] || images[0];
}

/**
 * Fetch README from a GitHub repository and extract the best image
 * Tries multiple README filenames and branches
 */
export async function fetchReadmeImage(
  githubUrl: string
): Promise<string | undefined> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    console.log(`Could not parse GitHub URL: ${githubUrl}`);
    return undefined;
  }

  const { owner, repo } = parsed;

  // Common README filenames to try
  const readmeNames = ["README.md", "readme.md", "Readme.md", "README.MD"];
  // Common branch names to try
  const branches = ["main", "master"];

  for (const branch of branches) {
    for (const readmeName of readmeNames) {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${readmeName}`;

      try {
        const response = await fetch(rawUrl, {
          headers: {
            Accept: "text/plain",
          },
        });

        if (response.ok) {
          const markdown = await response.text();
          const images = extractImagesFromMarkdown(markdown, owner, repo, branch);

          if (images.length > 0) {
            const bestImage = selectBestImage(images);
            if (bestImage) {
              console.log(
                `Found README image for ${owner}/${repo}: ${bestImage}`
              );
              return bestImage;
            }
          }

          // README found but no images - don't try other README names
          console.log(`README found for ${owner}/${repo} but no images`);
          return undefined;
        }
      } catch (error) {
        // Silently continue to next attempt
      }
    }
  }

  console.log(`No README found for ${owner}/${repo}`);
  return undefined;
}

/**
 * Get the best thumbnail for a project
 * Tries to fetch an image from the GitHub README if a GitHub URL is provided
 * Falls back to the provided fallback thumbnail
 */
export async function getProjectThumbnail(
  sourceUrl: string | undefined,
  fallbackThumbnail: string | undefined
): Promise<string | undefined> {
  // If we have a GitHub URL, try to get an image from the README
  if (sourceUrl && sourceUrl.includes("github.com")) {
    try {
      const readmeImage = await fetchReadmeImage(sourceUrl);
      if (readmeImage) {
        return readmeImage;
      }
    } catch (error) {
      console.warn(`Failed to fetch README image from ${sourceUrl}:`, error);
    }
  }

  // Fall back to the provided thumbnail
  return fallbackThumbnail;
}
