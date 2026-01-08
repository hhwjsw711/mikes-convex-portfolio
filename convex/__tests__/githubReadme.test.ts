import { describe, expect, it } from "vitest";
import {
  parseGitHubUrl,
  extractImagesFromMarkdown,
  selectBestImage,
} from "../lib/githubReadme";

describe("parseGitHubUrl", () => {
  it("parses standard GitHub URLs", () => {
    expect(parseGitHubUrl("https://github.com/mikecann/effect-sim")).toEqual({
      owner: "mikecann",
      repo: "effect-sim",
    });
  });

  it("parses GitHub URLs with .git suffix", () => {
    expect(
      parseGitHubUrl("https://github.com/mikecann/effect-sim.git")
    ).toEqual({
      owner: "mikecann",
      repo: "effect-sim",
    });
  });

  it("parses GitHub URLs with tree/branch path", () => {
    expect(
      parseGitHubUrl("https://github.com/mikecann/effect-sim/tree/main")
    ).toEqual({
      owner: "mikecann",
      repo: "effect-sim",
    });
  });

  it("parses GitHub URLs with blob path", () => {
    expect(
      parseGitHubUrl(
        "https://github.com/mikecann/effect-sim/blob/main/README.md"
      )
    ).toEqual({
      owner: "mikecann",
      repo: "effect-sim",
    });
  });

  it("handles repos with dots and hyphens", () => {
    expect(
      parseGitHubUrl("https://github.com/some-user/my.cool-repo.v2")
    ).toEqual({
      owner: "some-user",
      repo: "my.cool-repo.v2",
    });
  });

  it("returns null for non-GitHub URLs", () => {
    expect(parseGitHubUrl("https://gitlab.com/user/repo")).toBeNull();
    expect(parseGitHubUrl("https://example.com")).toBeNull();
    expect(parseGitHubUrl("not a url")).toBeNull();
  });
});

describe("extractImagesFromMarkdown", () => {
  const owner = "mikecann";
  const repo = "test-repo";
  const branch = "main";

  it("extracts markdown image syntax", () => {
    const markdown = `
# My Project

![Screenshot](./screenshot.png)

Some text here.
    `;

    const images = extractImagesFromMarkdown(markdown, owner, repo, branch);
    expect(images).toContain(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/screenshot.png`
    );
  });

  it("extracts HTML img tags", () => {
    const markdown = `
# My Project

<img src="./demo.gif" alt="Demo">
    `;

    const images = extractImagesFromMarkdown(markdown, owner, repo, branch);
    expect(images).toContain(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/demo.gif`
    );
  });

  it("extracts absolute URLs", () => {
    const markdown = `
![Preview](https://example.com/image.png)
    `;

    const images = extractImagesFromMarkdown(markdown, owner, repo, branch);
    expect(images).toContain("https://example.com/image.png");
  });

  it("converts GitHub blob URLs to raw URLs", () => {
    const markdown = `
![Screenshot](https://github.com/mikecann/test-repo/blob/main/docs/image.png)
    `;

    const images = extractImagesFromMarkdown(markdown, owner, repo, branch);
    expect(images).toContain(
      "https://raw.githubusercontent.com/mikecann/test-repo/main/docs/image.png"
    );
  });

  it("filters out badge/shield images", () => {
    const markdown = `
![Build Status](https://img.shields.io/badge/build-passing-green)
![Coverage](https://codecov.io/badge)
![Actual Screenshot](./screenshot.png)
    `;

    const images = extractImagesFromMarkdown(markdown, owner, repo, branch);
    expect(images).toHaveLength(1);
    expect(images[0]).toContain("screenshot.png");
  });

  it("deduplicates images", () => {
    const markdown = `
![Screenshot](./screenshot.png)
![Screenshot again](./screenshot.png)
    `;

    const images = extractImagesFromMarkdown(markdown, owner, repo, branch);
    expect(images).toHaveLength(1);
  });

  it("handles images with title attribute", () => {
    const markdown = `
![Alt text](./image.png "Image title")
    `;

    const images = extractImagesFromMarkdown(markdown, owner, repo, branch);
    expect(images).toHaveLength(1);
    expect(images[0]).toContain("image.png");
    expect(images[0]).not.toContain("title");
  });
});

describe("selectBestImage", () => {
  it("returns undefined for empty array", () => {
    expect(selectBestImage([])).toBeUndefined();
  });

  it("prefers images with 'screenshot' in the name", () => {
    const images = [
      "https://example.com/logo.png",
      "https://example.com/screenshot.png",
      "https://example.com/random.png",
    ];
    expect(selectBestImage(images)).toBe("https://example.com/screenshot.png");
  });

  it("prefers images with 'demo' in the name", () => {
    const images = [
      "https://example.com/logo.png",
      "https://example.com/demo.gif",
      "https://example.com/random.png",
    ];
    expect(selectBestImage(images)).toBe("https://example.com/demo.gif");
  });

  it("prefers images with 'preview' in the name", () => {
    const images = [
      "https://example.com/logo.png",
      "https://example.com/preview.png",
      "https://example.com/random.png",
    ];
    expect(selectBestImage(images)).toBe("https://example.com/preview.png");
  });

  it("returns first image if no preferred keywords found", () => {
    const images = [
      "https://example.com/main-image.png",
      "https://example.com/other.png",
    ];
    expect(selectBestImage(images)).toBe(
      "https://example.com/main-image.png"
    );
  });

  it("filters out icon images when better options exist", () => {
    // selectBestImage filters out URLs containing "icon"
    const images = [
      "https://example.com/my-icon.png",
      "https://example.com/screenshot.png",
    ];
    // Should prefer screenshot over icon
    expect(selectBestImage(images)).toBe("https://example.com/screenshot.png");
  });
});
