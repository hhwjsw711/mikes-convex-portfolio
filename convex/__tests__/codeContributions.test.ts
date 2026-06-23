import { describe, expect, it } from "vitest";
import { cleanCommitTitle } from "../model/codeContributions";

describe("cleanCommitTitle", () => {
  it("removes internal pull request suffixes", () => {
    expect(
      cleanCommitTitle("Use copy mode for Convex AI skill installs (#52356)")
    ).toBe("Use copy mode for Convex AI skill installs");
  });

  it("leaves normal titles unchanged", () => {
    expect(cleanCommitTitle("Fix ai-files re-prompting on fresh checkouts")).toBe(
      "Fix ai-files re-prompting on fresh checkouts"
    );
  });
});
