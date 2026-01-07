import { describe, expect, it } from "vitest";
import { extractProjectLinks } from "../model/projects";

describe("extractProjectLinks", () => {
  it("extracts GitHub URL from text", () => {
    const text = "Check out the source code: https://github.com/mikecann/my-project";
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://github.com/mikecann/my-project");
    expect(result.projectName).toBe("my-project");
  });

  it("extracts GitLab URL from text", () => {
    const text = "Source available at https://gitlab.com/user/cool-project";
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://gitlab.com/user/cool-project");
    expect(result.projectName).toBe("cool-project");
  });

  it("extracts Bitbucket URL from text", () => {
    const text = "Code: https://bitbucket.org/team/awesome-lib";
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://bitbucket.org/team/awesome-lib");
    expect(result.projectName).toBe("awesome-lib");
  });

  it("extracts Vercel demo URL", () => {
    const text = `
      Check out my project:
      Source: https://github.com/user/app
      Demo: https://my-app.vercel.app
    `;
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://github.com/user/app");
    expect(result.demoUrl).toBe("https://my-app.vercel.app");
  });

  it("extracts Netlify demo URL", () => {
    const text = `
      GitHub: https://github.com/dev/site
      Live at https://cool-site.netlify.app
    `;
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://github.com/dev/site");
    expect(result.demoUrl).toBe("https://cool-site.netlify.app");
  });

  it("extracts demo URL with 'try it' keyword", () => {
    const text = `
      Source code: https://github.com/user/tool
      Try it out: https://tool-demo.com
    `;
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://github.com/user/tool");
    expect(result.demoUrl).toBe("https://tool-demo.com");
  });

  it("extracts demo URL with 'live' keyword", () => {
    const text = `
      https://github.com/user/webapp
      Live demo: https://webapp.example.com
    `;
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://github.com/user/webapp");
    expect(result.demoUrl).toBe("https://webapp.example.com");
  });

  it("handles text without any links", () => {
    const text = "This is just some text without any URLs";
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBeUndefined();
    expect(result.demoUrl).toBeUndefined();
    expect(result.projectName).toBeUndefined();
  });

  it("handles text with only source URL", () => {
    const text = "Check out https://github.com/user/project for more info";
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://github.com/user/project");
    expect(result.demoUrl).toBeUndefined();
  });

  it("removes .git suffix from GitHub URLs", () => {
    const text = "Clone: https://github.com/user/repo.git";
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://github.com/user/repo");
  });

  it("does not use source URL as demo URL", () => {
    const text = `
      Try the demo: https://github.com/user/demo-project
    `;
    const result = extractProjectLinks(text);

    // Since the only URL is a GitHub URL, it should be the source, not demo
    expect(result.sourceUrl).toBe("https://github.com/user/demo-project");
    expect(result.demoUrl).toBeUndefined();
  });

  it("handles complex video description", () => {
    const text = `
      In this video, I show you how to build an amazing app!

      Links:
      - Source Code: https://github.com/mikecann/amazing-app
      - Live Demo: https://amazing-app.vercel.app
      - My Website: https://mikecann.co.uk

      Subscribe for more content!
    `;
    const result = extractProjectLinks(text);

    expect(result.sourceUrl).toBe("https://github.com/mikecann/amazing-app");
    expect(result.demoUrl).toBe("https://amazing-app.vercel.app");
    expect(result.projectName).toBe("amazing-app");
  });
});
