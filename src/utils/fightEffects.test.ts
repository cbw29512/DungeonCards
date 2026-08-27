import { describe, expect, it } from "vitest";
import type { FightActiveEffect } from "../types/fightBattle";
import { createFightBattle } from "./fightBattle";
import { applyFightEffect, expireRoundEffects, fightEffectVisual, removeFightEffect } from "./fightEffects";

const fighter = {
  id: "fighter",
  name: "Fighter",
  ruleset: "srd-5.1-2014" as const,
  armorClass: 16,
  hitPoints: 20,
  attackBonus: 5,
  averageDamageOnHit: 7.5,
  attacksPerRound: 1,
  initiativeBonus: 2,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword"
};

const goblin = {
  ...fighter,
  id: "goblin",
  name: "Goblin",
  hitPoints: 7,
  armorClass: 15,
  attackBonus: 4,
  attackDamageFormula: "1d6+2",
  criticalBonusFormula: "1d6",
  sourceActionName: "Scimitar"
};

const poison: FightActiveEffect = {
  id: "poison-1",
  rulesKey: "poisoned",
  label: "Poisoned",
  kind: "condition",
  sourceName: "Poison Spray",
  sourceSide: "character",
  appliedRound: 1,
  expiry: { type: "round", expiresAfterRound: 2 }
};

describe("fight effect state", () => {
  it("applies and removes persistent effects from the canonical combatant state", () => {
    const battle = createFightBattle(fighter, goblin);
    const poisoned = applyFightEffect(battle, "monster", poison);
    expect(poisoned.monster.activeEffects).toEqual([poison]);
    expect(removeFightEffect(poisoned, "monster", poison.id).monster.activeEffects).toEqual([]);
  });

  it("expires round effects only after their rules duration ends", () => {
    const battle = applyFightEffect(createFightBattle(fighter, goblin), "monster", poison);
    expect(expireRoundEffects({ ...battle, round: 2 }).monster.activeEffects).toHaveLength(1);
    expect(expireRoundEffects({ ...battle, round: 3 }).monster.activeEffects).toHaveLength(0);
  });

  it("uses stable visuals for D&D conditions and safe generic fallbacks", () => {
    expect(fightEffectVisual(poison)).toMatchObject({ symbol: "☠", category: "debuff" });
    expect(fightEffectVisual({ ...poison, id: "custom", rulesKey: "battle-focus", label: "Battle Focus", kind: "buff" })).toMatchObject({ symbol: "+", category: "buff" });
  });
});
