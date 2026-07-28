import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../../src/components/MonsterDeck.tsx", import.meta.url), "utf8");

describe("monster encounter table composition", () => {
  it("renders every active combatant independently of Monster Library filters", () => {
    expect(source).toContain("activeInstances={workspace.activeInstances}");
    expect(source).not.toContain("filteredInstances");
    expect(source).not.toContain("matchingMonsterIds");
  });

  it("keeps no-results messaging scoped to library filters", () => {
    expect(source).toContain("No monsters match these library filters.");
    expect(source).toContain("visibleCount = view === \"library\"");
  });
});