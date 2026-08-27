import { describe, expect, it } from "vitest";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import { buildDndMonsterLiveReference } from "./dndMonsterLiveReference";
import { buildMonsterCombatReference } from "./monsterCombatReference";
import { uniqueMonsterActions } from "./monsterActionCanonicalization";

const srdMonster: SrdMonsterRecord = {
  id: "test-hunter",
  edition: "srd-5.1-2014",
  sourceVersion: "test",
  name: "Test Hunter",
  size: "Medium",
  type: "monstrosity",
  alignment: "unaligned",
  armorClass: "14",
  hitPoints: "45 (6d8 + 18)",
  speed: "30 ft.",
  challenge: "2",
  traits: "",
  actions: "Multiattack. The hunter makes two Claw attacks.\nPoison Cloud (Recharge 5–6). Each creature in a 10-foot radius must make a DC 13 CON saving throw.\nClaw (Hybrid Form Only). Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 slashing damage.",
  bonusActions: "",
  reactions: "",
  legendaryActions: "",
  rawText: "STR 16 (+3) DEX 14 (+2) CON 16 (+3) INT 4 (-3) WIS 12 (+1) CHA 6 (-2)",
  sourcePage: 1,
  sourceReference: "Test SRD p. 1"
};

const formattedEntry: EncounterMonsterEntry = {
  id: "formatted-guard",
  name: "Test Guard",
  ruleset: "srd-5.2.1-2024",
  cr: "1",
  type: "humanoid",
  size: "Medium",
  source: "Test Free Rules",
  kind: "formatted",
  monster: {
    id: "formatted-guard",
    ruleset: "srd-5.2.1-2024",
    source: "Test Free Rules",
    name: "Test Guard",
    cr: "1",
    type: "humanoid",
    size: "Medium",
    layoutHint: "standard",
    ac: "15",
    hp: "22",
    speed: "30 ft.",
    abilities: { str: 12, dex: 14, con: 12, int: 10, wis: 12, cha: 10 },
    saves: [],
    skills: [],
    senses: "passive Perception 11",
    languages: "Common",
    resistances: [],
    immunities: [],
    conditionImmunities: [],
    traits: [],
    actions: [{ name: "Tail Guard", text: "The guard adds 2 to its AC against one attack." }],
    bonusActions: [],
    reactions: [{ name: "Tail Guard", text: "The guard adds 2 to its AC against one attack." }],
    legendaryActions: [],
    spellcasting: null,
    lairActions: [],
    regionalEffects: []
  }
};

describe("monster action canonicalization", () => {
  it("collapses exact duplicates while preserving distinct actions", () => {
    const actions = uniqueMonsterActions([
      { name: "Roar", summary: "Creatures make a save." },
      { name: "Roar", summary: "Creatures make a save." },
      { name: "Roar", summary: "Allies gain advantage." }
    ]);

    expect(actions).toHaveLength(2);
  });

  it("selects qualified attacks named by Multiattack before unrelated recharge actions", () => {
    const reference = buildMonsterCombatReference(srdMonster);

    expect(reference.actions.map((action) => action.name)).toEqual([
      "Multiattack",
      "Claw (Hybrid Form Only)",
      "Poison Cloud (Recharge 5–6)"
    ]);
  });

  it("keeps one canonical reaction when identical content appears in two action sections", () => {
    const reference = buildDndMonsterLiveReference(formattedEntry);
    const tailGuard = reference.actions.filter((action) => action.name === "Tail Guard");

    expect(tailGuard).toHaveLength(1);
    expect(tailGuard[0].kind).toBe("reaction");
  });
});
