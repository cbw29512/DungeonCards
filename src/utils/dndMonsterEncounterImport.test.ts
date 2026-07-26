import { describe, expect, it } from "vitest";
import { encounterMonsterCatalog } from "../data/encounterMonsterCatalog";
import {
  buildDndMonsterEncounterDefaults,
  filterDndEncounterMonsters
} from "./dndMonsterEncounterImport";

describe("D&D SRD monster encounter import", () => {
  it("derives HP, walking speed, and Dexterity for the complete SRD catalog", () => {
    const srdEntries = encounterMonsterCatalog.filter((entry) => entry.ruleset !== "homebrew");
    expect(srdEntries.length).toBeGreaterThan(600);

    const unresolved = srdEntries
      .map((entry) => buildDndMonsterEncounterDefaults(entry))
      .filter((defaults) => defaults.issues.length > 0)
      .map((defaults) => ({ name: defaults.name, ruleset: defaults.ruleset, issues: defaults.issues }));

    expect(unresolved).toEqual([]);
  });

  it("preserves source identity and monster metadata", () => {
    const entry = encounterMonsterCatalog.find((candidate) => candidate.ruleset === "srd-5.2.1-2024");
    expect(entry).toBeTruthy();
    const defaults = buildDndMonsterEncounterDefaults(entry!);
    expect(defaults).toMatchObject({
      monsterId: entry!.id,
      name: entry!.name,
      ruleset: "srd-5.2.1-2024",
      sourceReference: entry!.source,
      challenge: entry!.cr,
      type: entry!.type,
      size: entry!.size
    });
  });

  it("filters by edition and searchable monster metadata", () => {
    const dragons2024 = filterDndEncounterMonsters(encounterMonsterCatalog, "srd-5.2.1-2024", "dragon");
    expect(dragons2024.length).toBeGreaterThan(0);
    expect(dragons2024.every((entry) => entry.ruleset === "srd-5.2.1-2024")).toBe(true);
    expect(dragons2024.every((entry) => `${entry.name} ${entry.type} ${entry.size} ${entry.cr}`.toLowerCase().includes("dragon"))).toBe(true);

    expect(filterDndEncounterMonsters(encounterMonsterCatalog, "srd-5.1-2014", "definitely-not-a-monster")).toEqual([]);
  });
});
