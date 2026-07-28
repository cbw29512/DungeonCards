import { describe, expect, it } from "vitest";
import { encounterMonsterCatalog } from "../data/encounterMonsterCatalog";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import {
  filterMonsterWorkspaceEntries,
  monsterArmorClassNumber,
  monsterChallengeNumber,
  monsterHitPointNumber,
  monsterIsLegendary,
  monsterIsSpellcaster,
  monstersForEncounterRuleset,
  monsterSizesForWorkspace,
  monsterTypesForWorkspace,
  sortMonsterWorkspaceEntries
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

const entry = (
  id: string,
  name: string,
  patch: Partial<SrdMonsterRecord>
): EncounterMonsterEntry => ({
  id,
  kind: "reference",
  name,
  ruleset: "srd-5.2.1-2024",
  cr: patch.challenge ?? "1",
  type: patch.type ?? "Humanoid",
  size: patch.size ?? "Medium",
  source: "SRD 5.2.1",
  monster: {
    id,
    edition: "srd-5.2.1-2024",
    sourceVersion: "5.2.1",
    name,
    size: patch.size ?? "Medium",
    type: patch.type ?? "Humanoid",
    alignment: patch.alignment ?? "Neutral",
    armorClass: patch.armorClass ?? "10",
    hitPoints: patch.hitPoints ?? "10 (3d6)",
    speed: patch.speed ?? "30 ft.",
    challenge: patch.challenge ?? "1",
    traits: patch.traits ?? "",
    actions: patch.actions ?? "",
    bonusActions: patch.bonusActions ?? "",
    reactions: patch.reactions ?? "",
    legendaryActions: patch.legendaryActions ?? "",
    rawText: patch.rawText ?? `${name} complete source record`,
    sourcePage: patch.sourcePage ?? 1,
    sourceReference: patch.sourceReference ?? "SRD 5.2.1"
  }
});

const goblin = entry("goblin", "Goblin", {
  size: "Small",
  type: "Humanoid",
  challenge: "1/4 (50 XP)",
  armorClass: "15",
  hitPoints: "7 (2d6)",
  actions: "Scimitar. Melee Attack."
});
const dragon = entry("dragon", "Ancient Ember Dragon", {
  size: "Gargantuan",
  type: "Dragon",
  challenge: "17",
  armorClass: "22",
  hitPoints: "367 (21d20 + 147)",
  actions: "Fire Breath (Recharge 5–6). The dragon exhales fire.",
  reactions: "Tail Deflection. The dragon adds 2 to its Armor Class.",
  legendaryActions: "The dragon can take 3 Legendary Actions."
});
const mage = entry("mage", "Archive Mage", {
  size: "Medium",
  type: "Humanoid",
  challenge: "6",
  armorClass: "12",
  hitPoints: "40 (9d8)",
  traits: "Spellcasting. The mage uses Intelligence as its spellcasting ability.",
  actions: "Arcane Bolt. Ranged Spell Attack."
});
const samples = [dragon, goblin, mage];

describe("monster workspace catalog boundaries", () => {
  it("keeps 2014 and 2024 SRD entries separate while admitting homebrew", () => {
    const catalog = [monster2014, monster2024, homebrew];
    expect(monstersForEncounterRuleset(catalog, "srd-5.1-2014").map((record) => record.id))
      .toEqual([monster2014.id, homebrew.id]);
    expect(monstersForEncounterRuleset(catalog, "srd-5.2.1-2024").map((record) => record.id))
      .toEqual([monster2024.id, homebrew.id]);
  });

  it("derives normalized type and size choices for the selected workspace", () => {
    expect(monsterTypesForWorkspace([monster2014, homebrew])).toEqual(expect.arrayContaining([
      "all",
      monster2014.type.trim().replace(/\s+/g, " ").toLowerCase(),
      "mythic beast"
    ]));
    expect(monsterSizesForWorkspace(samples)).toEqual(["all", "gargantuan", "small", "medium"]);
  });
});

describe("Monster Library filtering and sorting", () => {
  it("parses integer and fractional Challenge Ratings accurately", () => {
    expect(monsterChallengeNumber("1/8")).toBe(0.125);
    expect(monsterChallengeNumber("1/4 (50 XP)")).toBe(0.25);
    expect(monsterChallengeNumber("12")).toBe(12);
    expect(monsterChallengeNumber("—")).toBeNull();
  });

  it("reads quick numeric AC and HP values from source records", () => {
    expect(monsterArmorClassNumber(dragon)).toBe(22);
    expect(monsterHitPointNumber(dragon)).toBe(367);
  });

  it("detects legendary and spellcasting capabilities from the stat block", () => {
    expect(monsterIsLegendary(dragon)).toBe(true);
    expect(monsterIsLegendary(goblin)).toBe(false);
    expect(monsterIsSpellcaster(mage)).toBe(true);
    expect(monsterIsSpellcaster(goblin)).toBe(false);
  });

  it("filters by type, size, CR range, and capability together", () => {
    expect(filterMonsterWorkspaceEntries(samples, "", "dragon", {
      size: "gargantuan",
      minimumChallenge: 15,
      maximumChallenge: 20,
      feature: "legendary"
    }).map((monster) => monster.id)).toEqual(["dragon"]);
  });

  it("searches name, action, trait, and source text", () => {
    expect(filterMonsterWorkspaceEntries(samples, "Goblin", "all").map((monster) => monster.id)).toEqual(["goblin"]);
    expect(filterMonsterWorkspaceEntries(samples, "fire breath", "all").map((monster) => monster.id)).toEqual(["dragon"]);
    expect(filterMonsterWorkspaceEntries(samples, "spellcasting ability", "all").map((monster) => monster.id)).toEqual(["mage"]);
    expect(filterMonsterWorkspaceEntries(samples, "SRD 5.2.1", "all")).toHaveLength(3);
  });

  it("filters special reactions, recharge abilities, and spellcasters separately", () => {
    expect(filterMonsterWorkspaceEntries(samples, "", "all", { feature: "special-reaction" }).map((monster) => monster.id)).toEqual(["dragon"]);
    expect(filterMonsterWorkspaceEntries(samples, "", "all", { feature: "recharge" }).map((monster) => monster.id)).toEqual(["dragon"]);
    expect(filterMonsterWorkspaceEntries(samples, "", "all", { feature: "spellcaster" }).map((monster) => monster.id)).toEqual(["mage"]);
  });

  it("sorts numerically by CR, HP, and AC rather than lexicographically", () => {
    expect(sortMonsterWorkspaceEntries(samples, "cr-asc").map((monster) => monster.id)).toEqual(["goblin", "mage", "dragon"]);
    expect(sortMonsterWorkspaceEntries(samples, "cr-desc").map((monster) => monster.id)).toEqual(["dragon", "mage", "goblin"]);
    expect(sortMonsterWorkspaceEntries(samples, "hp-desc").map((monster) => monster.id)).toEqual(["dragon", "mage", "goblin"]);
    expect(sortMonsterWorkspaceEntries(samples, "ac-desc").map((monster) => monster.id)).toEqual(["dragon", "goblin", "mage"]);
  });
});