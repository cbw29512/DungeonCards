import { describe, expect, it } from "vitest";
import { encounterMonsterCatalog } from "../data/encounterMonsterCatalog";
import {
  buildDndMonsterEncounterDefaults,
  filterDndEncounterMonsters,
  parseDndWalkingSpeed
} from "./dndMonsterEncounterImport";

describe("D&D SRD monster encounter import", () => {
  it("derives HP, walking speed, and Dexterity for the complete SRD catalog", () => {
    const srdEntries = encounterMonsterCatalog.filter((entry) => entry.ruleset !== "homebrew");
    expect(srdEntries.length).toBeGreaterThan(600);

    const sample2024 = srdEntries.find((entry) => entry.ruleset === "srd-5.2.1-2024" && entry.kind === "generated");
    if (sample2024?.kind === "generated") console.error("MONSTER_2024_RAW", sample2024.monster.rawText);

    const unresolved = srdEntries
      .map((entry) => buildDndMonsterEncounterDefaults(entry))
      .filter((defaults) => defaults.issues.length > 0)
      .map((defaults) => ({ name: defaults.name, ruleset: defaults.ruleset, issues: defaults.issues }));

    expect(unresolved).toEqual([]);
  });

  it("reads only explicit walking speed and never substitutes fly or swim speed", () => {
    expect(parseDndWalkingSpeed("30 ft., fly 60 ft.")).toBe(30);
    expect(parseDndWalkingSpeed("0 ft., fly 50 ft. (hover)")).toBe(0);
    expect(parseDndWalkingSpeed("walking 25 ft., swim 40 ft.")).toBe(25);
    expect(parseDndWalkingSpeed("fly 60 ft.")).toBeUndefined();
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
