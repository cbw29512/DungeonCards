import { describe, expect, it } from "vitest";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import {
  monsterConditionImmunityText,
  monsterIsImmuneToCondition
} from "./monsterEncounterWorkspaceModel";

const referenceMonster: EncounterMonsterEntry = {
  id: "reference-sentinel",
  kind: "reference",
  name: "Reference Sentinel",
  ruleset: "srd-5.1-2014",
  cr: "5",
  type: "Construct",
  size: "Large",
  source: "SRD 5.1",
  monster: {
    id: "reference-sentinel",
    edition: "srd-5.1-2014",
    sourceVersion: "5.1",
    name: "Reference Sentinel",
    size: "Large",
    type: "Construct",
    alignment: "Unaligned",
    armorClass: "18",
    hitPoints: "85 (10d10 + 30)",
    speed: "30 ft.",
    challenge: "5",
    traits: "Immutable Form.",
    actions: "Slam. Melee Weapon Attack.",
    bonusActions: "",
    reactions: "",
    legendaryActions: "",
    rawText: "Reference Sentinel Condition Immunities Charmed, Frightened Senses darkvision 60 ft. Languages understands Common but can't speak Challenge 5",
    sourcePage: 1,
    sourceReference: "SRD 5.1"
  }
};

const formattedMonster: EncounterMonsterEntry = {
  id: "formatted-sentinel",
  kind: "formatted",
  name: "Formatted Sentinel",
  ruleset: "srd-5.1-2014",
  cr: "5",
  type: "Construct",
  size: "Large",
  source: "Original test record",
  monster: {
    id: "formatted-sentinel",
    ruleset: "srd-5.1-2014",
    source: "Original test record",
    name: "Formatted Sentinel",
    cr: "5",
    type: "Construct",
    size: "Large",
    layoutHint: "standard",
    ac: "18",
    hp: "85 (10d10 + 30)",
    speed: "30 ft.",
    abilities: { str: 18, dex: 10, con: 16, int: 6, wis: 10, cha: 5 },
    saves: [],
    skills: [],
    senses: "darkvision 60 ft.",
    languages: "understands Common but can't speak",
    resistances: [],
    immunities: [],
    conditionImmunities: ["Charmed", "Poisoned"],
    traits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    legendaryActions: [],
    spellcasting: null,
    lairActions: [],
    regionalEffects: []
  }
};

describe("monster condition immunity guidance", () => {
  it("reads exact condition immunities from complete SRD reference text", () => {
    expect(monsterConditionImmunityText(referenceMonster)).toBe("Charmed, Frightened");
    expect(monsterIsImmuneToCondition(referenceMonster, "Charmed")).toBe(true);
    expect(monsterIsImmuneToCondition(referenceMonster, " frightened ")).toBe(true);
    expect(monsterIsImmuneToCondition(referenceMonster, "Prone")).toBe(false);
  });

  it("reads formatted and homebrew-style condition immunity arrays without partial matches", () => {
    expect(monsterConditionImmunityText(formattedMonster)).toBe("Charmed, Poisoned");
    expect(monsterIsImmuneToCondition(formattedMonster, "Poisoned")).toBe(true);
    expect(monsterIsImmuneToCondition(formattedMonster, "Poison")).toBe(false);
    expect(monsterIsImmuneToCondition(formattedMonster, "Stunned")).toBe(false);
  });
});