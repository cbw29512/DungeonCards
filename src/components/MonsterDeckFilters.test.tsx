import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MonsterDeckFilters } from "./MonsterDeckFilters";

const noOp = () => {};
const renderFilters = (view: "library" | "table") => renderToStaticMarkup(
  <MonsterDeckFilters
    feature="all"
    maximumChallenge={null}
    minimumChallenge={null}
    onClear={noOp}
    onFeatureChange={noOp}
    onMaximumChallengeChange={noOp}
    onMinimumChallengeChange={noOp}
    onQueryChange={noOp}
    onRulesetChange={noOp}
    onSizeChange={noOp}
    onSortChange={noOp}
    onTypeChange={noOp}
    query="dragon"
    ruleset="srd-5.2.1-2024"
    size="all"
    sizes={["all", "small", "large"]}
    sort="name-asc"
    type="all"
    types={["all", "humanoid", "dragon"]}
    view={view}
  />
);

describe("Monster Library filter controls", () => {
  it("renders clearly named discovery controls in the library", () => {
    const markup = renderFilters("library");
    for (const label of [
      "Search library",
      "Edition",
      "Creature type",
      "Size",
      "Capability",
      "Minimum CR",
      "Maximum CR",
      "Sort library"
    ]) {
      expect(markup).toContain(`>${label}<`);
    }
    expect(markup).toContain('aria-label="Search monster library"');
    expect(markup).toContain("Clear filters");
    expect(markup).toContain("Legendary actions");
    expect(markup).toContain("CR 1/8");
    expect(markup).toContain("CR high to low");
  });

  it("shows only edition selection on the live encounter table", () => {
    const markup = renderFilters("table");
    expect(markup).toContain('aria-label="Encounter edition"');
    expect(markup).not.toContain('aria-label="Search monster library"');
    expect(markup).not.toContain('aria-label="Filter monster type"');
    expect(markup).not.toContain('aria-label="Filter monster size"');
    expect(markup).not.toContain('aria-label="Filter monster capability"');
    expect(markup).not.toContain('aria-label="Minimum challenge rating"');
    expect(markup).not.toContain('aria-label="Maximum challenge rating"');
    expect(markup).not.toContain("Sort library");
    expect(markup).not.toContain("Clear filters");
  });
});