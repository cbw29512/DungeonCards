import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import {
  createFightBattle,
  fightBattleDistanceFeet,
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

  it("tracks combatant positions and synchronizes distance after movement", () => {
    let state = rollFightInitiative(createFightBattle(fighter, monster), sequence(18, 2));
    expect(state.character.positionFeet).toBe(0);
    expect(state.monster.positionFeet).toBe(30);
    expect(fightBattleDistanceFeet(state)).toBe(30);

    state = resolveFightTurn(state, sequence(15, 5));

    expect(state.character.positionFeet).toBe(25);
    expect(state.monster.positionFeet).toBe(30);
    expect(state.character.economy.movementRemainingFeet).toBe(5);
    expect(state.distanceFeet).toBe(5);
    expect(fightBattleDistanceFeet(state)).toBe(5);
    expect(state.presentationEvents?.some((event) => event.type === "movement" && event.amount === 25)).toBe(true);
  });

  it("keeps legacy distance-only battle state executable when positions are absent", () => {
    let state = createFightBattle(fighter, monster);
    const { positionFeet: _characterPosition, ...character } = state.character;
    const { positionFeet: _monsterPosition, ...legacyMonster } = state.monster;
    state = {
      ...state,
      status: "active",
      distanceFeet: 20,
      activeIndex: 0,
      initiative: {
        characterNaturalRoll: 18,
        characterTotal: 20,
        monsterNaturalRoll: 2,
        monsterTotal: 3,
        order: ["character", "monster"]
      },
      character,
      monster: legacyMonster
    };

    const resolved = resolveFightTurn(state, sequence(15, 5));
    expect(resolved.character.positionFeet).toBeUndefined();
    expect(resolved.monster.positionFeet).toBeUndefined();
    expect(resolved.distanceFeet).toBe(5);
    expect(resolved.character.economy.movementRemainingFeet).toBe(15);
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

  it("retargets remaining Multiattack strikes to a replacement position without restarting turn effects", () => {
    const fragile = { ...fighter, id: "fragile", name: "Fragile Hero", armorClass: 10, hitPoints: 5 };
    const backup = { ...fighter, id: "backup", name: "Backup Hero", armorClass: 10, hitPoints: 20 };
    const hunter: FightCombatantProfile = {
      ...monster,
      id: "hunter",
      name: "Hunter",
      attackBonus: 8,
      attacksPerRound: 2,
      actions: [
        {
          id: "claw",
          name: "Claw",
          kind: "attack",
          economy: "action",
          delivery: "weapon",
          attackBonus: 8,
          rangeFeet: 5,
          damage: [{ formula: "1d4+5", damageType: "slashing", criticalBonusFormula: "1d4" }]
        },
        {
          id: "multiattack",
          name: "Multiattack",
          kind: "multiattack",
          economy: "action",
          delivery: "weapon",
          rangeFeet: 5,
          sequence: [{ actionId: "claw", count: 2 }]
        }
      ]
    };

    let state = createFightBattle(fragile, hunter);
    state = {
      ...state,
      status: "active",
      activeIndex: 0,
      initiative: {
        characterNaturalRoll: 1,
        characterTotal: 1,
        monsterNaturalRoll: 20,
        monsterTotal: 20,
        order: ["monster", "character"]
      },
      character: { ...state.character, combatantId: "hero:fragile", positionFeet: 0 },
      monster: { ...state.monster, combatantId: "monster:hunter", positionFeet: 30 }
    };
    state = applyFightEffect(state, "monster", {
      id: "turn-clock",
      name: "Turn Clock",
      kind: "buff",
      remainingRounds: 2,
      tickTiming: "end"
    });
    const replacement = {
      ...createFightBattle(backup, hunter).character,
      combatantId: "hero:backup",
      positionFeet: 15
    };
    const downed: string[] = [];

    const resolved = resolveFightTurn(state, sequence(15, 1, 15, 1), {
      onOpponentDowned: (downedState, attacker, target) => {
        expect(attacker).toBe("monster");
        expect(target).toBe("character");
        expect(downedState.monster.positionFeet).toBe(5);
        downed.push(downedState.character.combatantId ?? "missing");
        return replacement;
      }
    });

    expect(downed).toEqual(["hero:fragile"]);
    expect(resolved.status).toBe("active");
    expect(resolved.winner).toBeUndefined();
    expect(resolved.character.combatantId).toBe("hero:backup");
    expect(resolved.character.currentHitPoints).toBe(14);
    expect(resolved.monster.positionFeet).toBe(10);
    expect(resolved.monster.economy.movementRemainingFeet).toBe(0);
    expect(fightBattleDistanceFeet(resolved)).toBe(5);
    expect(resolved.events).toHaveLength(2);
    expect(resolved.events.map((event) => event.damage)).toEqual([6, 6]);
    expect(resolved.monster.effects.find((effect) => effect.id === "turn-clock")?.remainingRounds).toBe(1);
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
