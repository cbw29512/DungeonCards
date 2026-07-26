import { describe, expect, it } from "vitest";
import { cocInvestigatorRuleSources } from "./cocInvestigatorRuleSources";
import { cocLuckRuleSources } from "./cocLuckRuleSources";
import { cocRuleSources } from "./cocRuleSources";

describe("Call of Cthulhu investigator creation sources", () => {
  it("keeps all public creation records verified and source-linked", () => {
    expect(cocInvestigatorRuleSources).toHaveLength(3);
    expect(new Set(cocInvestigatorRuleSources.map((source) => source.id)).size).toBe(3);

    for (const source of cocInvestigatorRuleSources) {
      expect(source.status).toBe("verified");
      expect(source.sourceUrl).toMatch(/^https:\/\/cthulhuwiki\.chaosium\.com\/investigators\//);
      expect(source.verifiedAt).toBe("2026-07-25");
    }
  });

  it("keeps IDs unique across every visible Cthulhu audit registry", () => {
    const sourceIds = [
      ...cocRuleSources,
      ...cocLuckRuleSources,
      ...cocInvestigatorRuleSources
    ].map((source) => source.id);

    expect(new Set(sourceIds).size).toBe(sourceIds.length);
  });

  it("keeps expanded paid-book options outside the public workflow", () => {
    const auditText = cocInvestigatorRuleSources
      .flatMap((source) => [source.implementationSummary, ...source.notes])
      .join(" ")
      .toLowerCase();

    expect(auditText).toContain("paid-book");
    expect(auditText).toContain("owned sources");
  });
});
