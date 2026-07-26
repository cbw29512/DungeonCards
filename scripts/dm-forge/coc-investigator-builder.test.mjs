import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [builder, improvement, audit, coverage, css] = await Promise.all([
  readFile(new URL("../../src/components/CocInvestigatorBuilder.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocImprovementCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocRulesAudit.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageCoc.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/coc-investigator-builder.css", import.meta.url), "utf8")
]);

describe("Cthulhu investigator creation product integration", () => {
  it("places the source-safe builder in the Investigator workspace", () => {
    expect(improvement).toContain("<CocInvestigatorBuilder");
    expect(builder).toContain("Build an Investigator");
    expect(builder).toContain("Shuffle fixed array");
    expect(builder).toContain("Credit Rating");
    expect(builder).toContain("Cthulhu Mythos");
  });

  it("keeps paid-book creation details outside the public workflow", () => {
    expect(builder).toContain("paid-book catalogs");
    expect(builder).toContain("Keeper Rulebook or Investigator Handbook");
    expect(coverage).toContain('id: "coc-7e-expanded-creation"');
    expect(coverage).toContain('status: "requires-owned-source"');
  });

  it("includes creation records in the visible source audit", () => {
    expect(audit).toContain("cocInvestigatorRuleSources");
    expect(coverage).toContain('id: "coc-7e-investigator-creation"');
    expect(coverage).toContain('status: "automation-complete"');
  });

  it("supports responsive and printable layouts", () => {
    expect(css).toContain("@media (max-width: 620px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
