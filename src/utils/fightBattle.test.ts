import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import {
  createFightBattle,
  resolveFightInitiativeTie,
  resolveFightTurn,
  rollFightInitiative,
  runFightToCompletion
} from "./fightBattle";
import { applyFightEffect, grantFightTemporaryHitPoints, startFightConcentration } from "./fightBattleEffects";

const fighter: FightCombatantProfile = {
  id: "fighter",
  name: "Carnar",
  ruleset: "srd-5.1-2014",
  armorClass: 15,
  hitPoints: 20,
  attackBonus: 5,
  attacksPerRound: 1,
  averageDamageOnHit: 7.5,
  averageCriticalBonusDamage: 4.5,
  initiativeBonus: 2,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  attackDelivery: "weapon",
  level: 3
};

const monster: FightCombatantProfile = {
  id: "monster",
  name: "Bob",
  ruleset: "srd-5.1-2014",
  armorClass: 12,
  hitPoints: 20,
  attackBonus: 4,
  attacksPerRound: 1,
  averageDamageOnHit: 5.5,
  averageCriticalBonusDamage: 3.5,
  initiativeBonus: 1,
  attackDamageFormula: "1d6+2",
  criticalBonusFormula: "1d6",
  sourceActionName: "Greataxe",
  attackDelivery: "weapon",
  challengeRating: 3
};

const sequence = (...values: number[]) => {
  let index = 0;
  return (minimum: number, maximum: number): number => {
    const value = values[index++];
    if (value === undefined || value < minimum || value > maximum) throw new Error("Test random sequence exhausted or invalid.");
    return value;
  };
};

describe("fight battle engine", () => {
  it("rolls initiative and requires an explicit choice when totals tie", () => {
    const tied = rollFightInitiative(createFightBattle(fighter, monster), sequence(10, 11));
    expect(tied.status).toBe("initiative-tie");
    expect(tied.initiative?.characterTotal).toBe(12);
    expect(tied.initiative?.monsterTotal).toBe(12);

    const resolved = resolveFightInitiativeTie(tied, "monster");
    expect(resolved.status).toBe("active");
    expect(resolved.initiative?.order).toEqual(["monster", "character"]);
  });

  it("honors natural 1 misses and natural 20 Heroic Crits and emits matching presentation events", () => {
    let state = rollFightInitiative(createFightBattle(fighter, monster), sequence(10, 8));
    state = resolveFightTurn(state, sequence(1));
    expect(state.monster.currentHitPoints).toBe(20);
    expect(state.events[0].outcome).toBe("miss");
    expect(state.presentationEvents?.at(-1)).toMatchObject({ type: "miss", delivery: "weapon", side: "monster" });

    state = resolveFightTurn(state, sequence(20, 4));
    expect(state.character.currentHitPoints).toBe(8);
    expect(state.events[1]).toMatchObject({ outcome: "critical", damage: 12, naturalRoll: 20 });
    expect(state.presentationEvents?.at(-1)).toMatchObject({ type: "critical", amount: 12, side: "character" });
    expect(state.round).toBe(2);
  });

  it("spends temporary HP before real HP while preserving total incoming damage", () => {
    let state = rollFightInitiative(createFightBattle(fighter, monster), sequence(10, 8));
    state = grantFightTemporaryHitPoints(state, "monster", 5, "Heroism");
    state = resolveFightTurn(state, sequence(15, 5));

    expect(state.monster.temporaryHitPoints).toBe(0);
    expect(state.monster.currentHitPoints).toBe(17);
    expect(state.events.at(-1)).toMatchObject({ damage: 8, temporaryHitPointsAbsorbed: 5, targetHitPointsAfter: 17 });
    expect(state.presentationEvents?.at(-1)).toMatchObject({ type: "hit", amount: 8 });
  });

  it("stops remaining attacks immediately when the target reaches 0 HP and emits downed", () => {
    const multi = { ...fighter, attacksPerRound: 2 };
    const fragile = { ...monster, hitPoints: 5 };
    let state = rollFightInitiative(createFightBattle(multi, fragile), sequence(18, 2));
    state = resolveFightTurn(state, sequence(15, 5));

    expect(state.status).toBe("complete");
    expect(state.winner).toBe("character");
    expect(state.monster.currentHitPoints).toBe(0);
    expect(state.events).toHaveLength(1);
    expect(state.presentationEvents?.at(-1)).toMatchObject({ type: "downed", side: "monster" });
  });

  it("breaks a downed combatant's concentration and clears linked effects before declaring downed", () => {
    const fragileCaster = { ...monster, hitPoints: 5 };
    let state = createFightBattle(fighter, fragileCaster);
    state = startFightConcentration(state, "monster", "Concentration Test");
    state = applyFightEffect(state, "character", {
      id: "concentration-link",
      name: "Concentration Link",
      kind: "buff",
      iconKey: "concentration",
      tickTiming: "manual",
      concentrationOwner: "monster"
    });
    state = rollFightInitiative(state, sequence(18, 2));
    state = resolveFightTurn(state, sequence(15, 5));

    expect(state.monster.currentHitPoints).toBe(0);
    expect(state.monster.concentration).toBeUndefined();
    expect(state.character.effects).toEqual([]);
    expect(state.presentationEvents?.slice(-3).map((event) => event.type)).toEqual([
      "effect-removed",
      "concentration-broken",
      "downed"
    ]);
  });

  it("can auto-resolve an active fight to a victor", () => {
    let state = rollFightInitiative(createFightBattle(fighter, monster), (_minimum, maximum) => maximum);
    state = runFightToCompletion(state, (_minimum, maximum) => maximum);

    expect(state.status).toBe("complete");
    expect(state.winner).toBe("character");
    expect(state.monster.currentHitPoints).toBe(0);
    expect(state.events.some((event) => event.outcome === "critical")).toBe(true);
    expect(state.presentationEvents?.at(-1)?.type).toBe("downed");
  });

  it("fails closed when a profile lacks executable attack data", () => {
    expect(() => createFightBattle({ ...fighter, attackDamageFormula: undefined }, monster))
      .toThrow(/missing an executable canonical attack/i);
  });
});
