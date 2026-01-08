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

  describe("real video descriptions", () => {
    it("extracts from EffectSim video description", () => {
      // Real description from Mike's EffectSim video
      const text = `EffectSim is a custom, Convex-powered control and simulation app built to design, preview, and run a Christmas light show before committing to the real-world installation. The video walks through the end-to-end engineering: selecting 12V individually addressable outdoor LEDs for long runs, validating power budgets and voltage drop limits, and scaling to 10x 20-meter strings (200 pixels each) driven by ESP32s.

On the software side, it covers the control strategy and protocols used to hit real-time animation targets, including why a JSON API approach doesn't scale to 60 FPS and how switching to WLED's DDP over UDP enables low-latency pixel streaming. It also digs into deployment realities like Wi-Fi reliability across a yard, access point placement, and designing sequences that work for a fast-moving audience.

Timestamps

[00:00:00] EffectSim overview and goal
[00:00:23] The real display setup: 10x 20m addressable strings + smart plugs
[00:00:54] What the video covers: hardware, software, issues, fixes

Resources

- Effect Sim Source: https://github.com/mikecann/effect-sim
- Vote for me: https://convex.link/YRsgHIj

Hashtags

#EffectSim #ESP32 #WLED #DDP #UDP #LEDs #AddressableLEDs #IoT #HomeAutomation #Convex #Firmware #Networking #WiFi #EmbeddedSystems #ChristmasLights`;

      const result = extractProjectLinks(text);

      expect(result.sourceUrl).toBe("https://github.com/mikecann/effect-sim");
      expect(result.projectName).toBe("effect-sim");
      // convex.link is not a recognized demo URL pattern, so should be undefined
      expect(result.demoUrl).toBeUndefined();
    });

    it("extracts first GitHub link when multiple are present", () => {
      const text = `
        Main project: https://github.com/mikecann/main-project
        Related lib: https://github.com/other/lib
        Another repo: https://github.com/other/another
      `;
      const result = extractProjectLinks(text);

      expect(result.sourceUrl).toBe("https://github.com/mikecann/main-project");
      expect(result.projectName).toBe("main-project");
    });

    it("handles very long description (8000+ chars)", () => {
      // Create a very long description with the important links at the end
      const filler = "Lorem ipsum dolor sit amet. ".repeat(300); // ~8400 chars
      const text = `${filler}
        Source: https://github.com/user/long-project
        Demo: https://long-project.vercel.app
      `;

      const result = extractProjectLinks(text);

      expect(result.sourceUrl).toBe("https://github.com/user/long-project");
      expect(result.demoUrl).toBe("https://long-project.vercel.app");
    });

    it("extracts only demo URL when no source URL present", () => {
      const text = `
        Check out the live app at https://my-demo.vercel.app
        Built with React and Convex!
      `;
      const result = extractProjectLinks(text);

      expect(result.sourceUrl).toBeUndefined();
      expect(result.demoUrl).toBe("https://my-demo.vercel.app");
    });

    it("extracts GitHub Pages demo URL", () => {
      const text = `
        Source: https://github.com/user/docs-site
        Documentation: https://user.github.io/docs-site/
      `;
      const result = extractProjectLinks(text);

      expect(result.sourceUrl).toBe("https://github.com/user/docs-site");
      expect(result.demoUrl).toBe("https://user.github.io/docs-site/");
    });

    it("handles description with timestamps and chapters", () => {
      const text = `
        [0:00] Intro
        [1:30] Getting started
        [5:00] Advanced features
        [10:00] Conclusion

        Links:
        GitHub: https://github.com/mikecann/timestamp-project
        Try it: https://timestamp.netlify.app

        Thanks for watching!
      `;
      const result = extractProjectLinks(text);

      expect(result.sourceUrl).toBe("https://github.com/mikecann/timestamp-project");
      expect(result.demoUrl).toBe("https://timestamp.netlify.app");
    });

    it("handles URLs with query parameters", () => {
      const text = `
        Source: https://github.com/user/project
        Demo: https://demo.vercel.app?ref=youtube
      `;
      const result = extractProjectLinks(text);

      expect(result.sourceUrl).toBe("https://github.com/user/project");
      // Note: query params may or may not be included depending on regex
      expect(result.demoUrl).toContain("demo.vercel.app");
    });
  });
});
