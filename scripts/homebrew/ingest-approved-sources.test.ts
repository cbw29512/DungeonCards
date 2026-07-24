import { describe, expect, it } from "vitest";
import {
  ALLOWED_LICENSES,
  htmlToText,
  robotsAllows,
  titleFromHtml
} from "./ingest-approved-sources.mjs";

describe("approved homebrew source ingestion", () => {
  it("keeps only explicitly accepted reuse bases", () => {
    expect(ALLOWED_LICENSES.has("CC-BY-4.0")).toBe(true);
    expect(ALLOWED_LICENSES.has("CREATOR-PERMISSION")).toBe(true);
    expect(ALLOWED_LICENSES.has("ALL-RIGHTS-RESERVED")).toBe(false);
  });

  it("removes executable and style content from HTML excerpts", () => {
    const text = htmlToText("<h1>Forest Warden</h1><script>alert(1)</script><style>body{}</style><p>CR 5 guardian.</p>");
    expect(text).toContain("Forest Warden");
    expect(text).toContain("CR 5 guardian.");
    expect(text).not.toContain("alert");
    expect(text).not.toContain("body{}");
  });

  it("extracts a readable HTML title", () => {
    expect(titleFromHtml("<title>Open &amp; Sourced Homebrew</title>", "Fallback"))
      .toBe("Open & Sourced Homebrew");
  });

  it("honors the longest matching robots rule", () => {
    const robots = `
User-agent: *
Disallow: /private/
Allow: /private/open/
`;
    expect(robotsAllows(robots, "/public/monster.html")).toBe(true);
    expect(robotsAllows(robots, "/private/draft.html")).toBe(false);
    expect(robotsAllows(robots, "/private/open/released.html")).toBe(true);
  });
});
