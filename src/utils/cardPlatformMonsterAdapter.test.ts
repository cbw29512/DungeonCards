import { describe, expect, it } from "vitest";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import { adaptEncounterMonster } from "./cardPlatformMonsterAdapter";
import { validateCardDefinition } from "./cardPlatformValidation";

const formatted: EncounterMonsterEntry = {
  id: "ash-hound",
  name: "Ash Hound",
  ruleset: "homebrew",
  cr: "3",
  type: "fiend",
  size: "Medium",
  source: "Private Ash Hound",
  kind: "formatted",
  monster: {
    id: "ash-hound",
    ruleset: "homebrew",
    source: "Private Ash Hound",
    name: "Ash Hound",
    cr: "3",
    type: "fiend",
    size: "Medium",
    layoutHint: "standard",
    ac: "14",
    hp: "45 (6d8 + 18)",
    speed: "40 ft.",
    abilities: { str: 16, dex: 14, con: 16, int: 5, wis: 12, cha: 8 },
    saves: [],
    skills: ["Perception +3"],
    senses: "darkvision 60 ft.",
    languages: "understands Infernal",
    resistances: ["fire"],
    immunities: [],
    conditionImmunities: [],
    traits: [{ name: "Cinder Trail", text: "The hound leaves burning ground behind it." }],
    actions: [{ name: "Bite", hit: "+5 to hit", reach: "5 ft.", damage: "10 (2d6 + 3) fire damage" }],
    bonusActions: [],
    reactions: [],
    legendaryActions: [],
    spellcasting: null,
    lairActions: [],
    regionalEffects: []
  }
};

const reference: EncounterMonsterEntry = {
  id: "srd-5.1-2014-owlbear",
  name: "Owlbear",
  ruleset: "srd-5.1-2014",
  cr: "3",
  type: "monstrosity",
  size: "Large",
  source: "SRD 5.1 Owlbear",
  kind: "reference",
  monster: {
    id: "srd-5.1-2014-owlbear",
    edition: "srd-5.1-2014",
    sourceVersion: "5.1",
    name: "Owlbear",
    size: "Large",
    type: "monstrosity",
    alignment: "unaligned",
    armorClass: "13",
    hitPoints: "59 (7d10 + 21)",
    speed: "40 ft.",
    challenge: "3",
    traits: "Keen Sight and Smell.",
    actions: "Multiattack. The owlbear makes two attacks.",
    bonusActions: "",
    reactions: "",
    legendaryActions: "",
    rawText: "Owlbear reference text.",
    sourcePage: 326,
    sourceReference: "SRD 5.1"
  }
};

describe("monster Card Platform adapter", () => {
  it("requires an exact edition for neutral homebrew monsters", () => {
    expect(() => adaptEncounterMonster(formatted)).toThrow(/exact D&D edition/i);
    const card = adaptEncounterMonster(formatted, { homebrewGameSystemId: "dnd-2024" });
    expect(card).toMatchObject({
      gameSystemId: "dnd-2024",
      family: "creature",
      visibility: "private",
      source: { kind: "user-owned-private", publicDistributionAllowed: false },
      print: { sizeId: "poker-2.5x3.5" }
    });
    expect(card.resources[0]).toMatchObject({ id: "hit-points", maximum: 45, initial: 45 });
    expect(card.actions[0]).toMatchObject({ label: "Bite", formula: "2d6+3" });
    expect(validateCardDefinition(card)).toEqual([]);
  });

  it("infers exact identity and source boundaries for SRD monsters", () => {
    const card = adaptEncounterMonster(reference);
    expect(card.id).toBe("legacy-monster:dnd-2014:srd-5.1-2014-owlbear");
    expect(card).toMatchObject({
      gameSystemId: "dnd-2014",
      visibility: "game-master-only",
      source: { kind: "srd", license: "CC BY 4.0", publicDistributionAllowed: true }
    });
    expect(card.actions[0]).toMatchObject({ kind: "procedure", label: "Actions" });
    expect(card.resources[0]).toMatchObject({ maximum: 59, initial: 59 });
    expect(validateCardDefinition(card)).toEqual([]);
  });
});
