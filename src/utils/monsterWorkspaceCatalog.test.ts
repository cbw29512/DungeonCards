import { describe, expect, it } from "vitest";
import { encounterMonsterCatalog } from "../data/encounterMonsterCatalog";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import {
  filterMonsterWorkspaceEntries,
  monstersForEncounterRuleset,
  monsterTypesForWorkspace
} from "./monsterWorkspaceCatalog";

const monsterFor = (ruleset: "srd-5.1-2014" | "srd-5.2.1-2024") => {
  const monster = encounterMonsterCatalog.find((entry) => entry.ruleset === ruleset);
  if (!monster) throw new Error(`Expected a ${ruleset} monster fixture.`);
  return monster;
};

const monster2014 = monsterFor("srd-5.1-2014");
const monster2024 = monsterFor("srd-5.2.1-2024");
const homebrew: EncounterMonsterEntry = {
  ...monster2014,
  id: "homebrew:test-creature",
  name: "Test Creature",
  ruleset: "homebrew",
  type: "Mythic Beast"
};
const catalog = [monster2014, monster2024, homebrew];

describe("monster workspace catalog boundaries", () => {
  it("keeps 2014 and 2024 SRD entries separate while admitting homebrew", () => {
    expect(monstersForEncounterRuleset(catalog, "srd-5.1-2014").map((entry) => entry.id))
      .toEqual([monster2014.id, homebrew.id]);
    expect(monstersForEncounterRuleset(catalog, "srd-5.2.1-2024").map((entry) => entry.id))
      .toEqual([monster2024.id, homebrew.id]);
  });

  it("derives normalized creature types for the selected workspace", () => {
    expect(monsterTypesForWorkspace([monster2014, homebrew])).toEqual(expect.arrayContaining([
      "all",
      monster2014.type.trim().replace(/\s+/g, " ").toLowerCase(),
      "mythic beast"
    ]));
  });

  it("filters by name and normalized creature type", () => {
    expect(filterMonsterWorkspaceEntries(catalog, "Test", "all")).toEqual([homebrew]);
    expect(filterMonsterWorkspaceEntries(catalog, "", "mythic beast")).toEqual([homebrew]);
  });
});
