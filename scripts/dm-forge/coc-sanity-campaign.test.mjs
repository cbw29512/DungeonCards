import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [sanityCard, tracker, audit, coverage, sourceRegistry, css] = await Promise.all([
  readFile(new URL("../../src/components/CocSanityCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocSanityCampaignTracker.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocRulesAudit.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageCoc.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/cocSanityCampaignSources.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/coc-sanity-campaign.css", import.meta.url), "utf8")
]);

describe("Cthulhu sanity campaign product integration", () => {
  it("places the ongoing tracker beside the immediate Sanity procedure", () => {
    expect(sanityCard).toContain("<CocSanityCampaignTracker");
    expect(tracker).toContain("Ongoing Sanity Record");
    expect(tracker).toContain("Roll monthly Psychoanalysis");
    expect(tracker).toContain("Add campaign effect");
  });

  it("keeps the indefinite-insanity trigger behind the owned-source boundary", () => {
    expect(tracker).toContain("The free official wiki does not state the trigger");
    expect(tracker).toContain("according to the owned rules source");
    expect(coverage).toContain('id: "coc-7e-indefinite-trigger"');
    expect(coverage).toContain('status: "requires-owned-source"');
  });

  it("calculates and displays Mythos-based maximum Sanity", () => {
    expect(tracker).toContain("calculateMaximumSanity");
    expect(tracker).toContain("Cthulhu Mythos");
    expect(tracker).toContain("Maximum Sanity");
    expect(sourceRegistry).toContain('id: "coc-maximum-sanity"');
  });

  it("registers campaign sources and honest coverage", () => {
    expect(audit).toContain("cocSanityCampaignSources");
    expect(coverage).toContain('id: "coc-7e-sanity-campaign"');
    expect(coverage).toContain('status: "automation-complete"');
    expect(coverage).toContain('id: "coc-7e-chases"');
    expect(coverage).toContain("dedicated chase procedure");
  });

  it("supports responsive and printable campaign records", () => {
    expect(css).toContain("@media (max-width: 620px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
