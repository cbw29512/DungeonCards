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
    query=""
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
  it("renders clearly named search, edition, type, size, capability, CR, and sort controls in the library", () => {
    const markup = renderFilters("library");
    for (const label of [
      "Search",
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
    expect(markup).toContain("Clear filters");
    expect(markup).toContain("Legendary actions");
    expect(markup).toContain("CR 1/8");
    expect(markup).toContain("CR high to low");
  });

  it("keeps only the exact-edition selector on the active encounter table", () => {
    const markup = renderFilters("table");
    expect(markup).toContain(">Edition<");
    expect(markup).toContain("every saved combatant stays visible");
    for (const libraryOnlyLabel of [
      "Search",
      "Creature type",
      "Size",
      "Capability",
      "Minimum CR",
      "Maximum CR",
      "Sort library",
      "Clear filters"
    ]) {
      expect(markup).not.toContain(`>${libraryOnlyLabel}<`);
    }
  });
});