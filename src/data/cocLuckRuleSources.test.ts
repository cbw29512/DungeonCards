import { describe, expect, it } from "vitest";
import { cocLuckRuleSources } from "./cocLuckRuleSources";

describe("Call of Cthulhu Luck source records", () => {
  it("keeps verified Luck rules traceable to official Chaosium wiki pages", () => {
    expect(cocLuckRuleSources.map((source) => source.id)).toEqual([
      "coc-luck-rolls",
      "coc-starting-luck"
    ]);

    for (const source of cocLuckRuleSources) {
      expect(source.status).toBe("verified");
      expect(source.sourceUrl).toMatch(/^https:\/\/cthulhuwiki\.chaosium\.com\//);
      expect(source.primaryReviewer).toBeTruthy();
      expect(source.verifiedAt).toBe("2026-07-25");
    }
  });

  it("does not present optional Luck spending as a verified free rule", () => {
    const verifiedText = cocLuckRuleSources
      .flatMap((source) => [source.ruleName, source.implementationSummary, ...source.notes])
      .join(" ")
      .toLowerCase();

    expect(verifiedText).toContain("optional luck-spending rules are deliberately excluded");
    expect(cocLuckRuleSources.some((source) => source.id.includes("spending"))).toBe(false);
  });
});
