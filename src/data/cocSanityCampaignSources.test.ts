import { describe, expect, it } from "vitest";
import { cocInvestigatorRuleSources } from "./cocInvestigatorRuleSources";
import { cocLuckRuleSources } from "./cocLuckRuleSources";
import { cocRuleSources } from "./cocRuleSources";
import { cocSanityCampaignSources } from "./cocSanityCampaignSources";

describe("Call of Cthulhu sanity campaign sources", () => {
  it("keeps the public campaign procedures verified and source-linked", () => {
    expect(cocSanityCampaignSources).toHaveLength(2);
    for (const source of cocSanityCampaignSources) {
      expect(source.status).toBe("verified");
      expect(source.sourceUrl).toMatch(/^https:\/\/cthulhuwiki\.chaosium\.com\//);
      expect(source.verifiedAt).toBe("2026-07-25");
    }
  });

  it("keeps source IDs unique across the visible audit ledger", () => {
    const ids = [
      ...cocRuleSources,
      ...cocLuckRuleSources,
      ...cocInvestigatorRuleSources,
      ...cocSanityCampaignSources
    ].map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not claim the indefinite-insanity trigger is publicly verified", () => {
    const text = cocSanityCampaignSources
      .flatMap((source) => [source.implementationSummary, ...source.notes])
      .join(" ")
      .toLowerCase();
    expect(text).toContain("must be determined from the user's owned rules source");
    expect(cocSanityCampaignSources.some((source) => source.id.includes("trigger"))).toBe(false);
  });
});
