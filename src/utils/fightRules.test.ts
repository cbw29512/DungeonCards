import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle } from "./fightBattle";
import { applyFightEffect } from "./fightBattleEffects";
import {
  combineFightRollModes,
  fightAttackRollMode,
  fightMovementAllowance,
  getFightDamageMultiplier,
  isFightIncapacitated,
  rollFightDamageComponents
} from "./fightRules";

const profile = (name: string, overrides: Partial<FightCombatantProfile> = {}): FightCombatantProfile => ({
  id: name.toLowerCase(),
  name,
  ruleset: "srd-5.1-2014",
  armorClass: 14,
  hitPoints: 40,
  attackBonus: 5,
  averageDamageOnHit: 7,
  attacksPerRound: 1,
  initiativeBonus: 2,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  speedFeet: 30,
  ...overrides
});

describe("Fight Card rules helpers", () => {
  it("cancels advantage and disadvantage instead of stacking either one", () => {
    expect(combineFightRollModes("advantage", "disadvantage")).toBe("normal");
    expect(combineFightRollModes("advantage", "advantage")).toBe("advantage");
    expect(combineFightRollModes("disadvantage")).toBe("disadvantage");
  });

  it("applies immunity, resistance, vulnerability, and resistance-vulnerability cancellation", () => {
    expect(getFightDamageMultiplier(profile("Immune", { damageImmunities: ["fire"] }), "fire")).toBe(0);
    expect(getFightDamageMultiplier(profile("Resistant", { damageResistances: ["fire"] }), "fire")).toBe(0.5);
    expect(getFightDamageMultiplier(profile("Vulnerable", { damageVulnerabilities: ["fire"] }), "fire")).toBe(2);
    expect(getFightDamageMultiplier(profile("Both", { damageResistances: ["fire"], damageVulnerabilities: ["fire"] }), "fire")).toBe(1);
  });

  it("applies save reduction before typed resistance and keeps damage components separate", () => {
    const result = rollFightDamageComponents({
      target: profile("Target", { damageResistances: ["slashing"], damageVulnerabilities: ["fire"] }),
      components: [
        { formula: "1d8+2", damageType: "slashing", criticalBonusFormula: "1d8" },
        { formula: "1d6", damageType: "fire", criticalBonusFormula: "1d6" }
      ],
      critical: false,
      damageFraction: 0.5,
      randomInteger: (_minimum, maximum) => maximum === 8 ? 6 : 4
    });
    expect(result.rawTotal).toBe(12);
    expect(result.components).toEqual([
      { damageType: "slashing", rawDamage: 8, modifiedDamage: 4, appliedDamage: 2, multiplier: 0.5 },
      { damageType: "fire", rawDamage: 4, modifiedDamage: 2, appliedDamage: 4, multiplier: 2 }
    ]);
    expect(result.appliedTotal).toBe(6);
  });

  it("derives standard condition roll consequences from persistent engine state", () => {
    let battle = createFightBattle(profile("Hero"), profile("Monster"));
    battle = applyFightEffect(battle, "character", {
      id: "poisoned",
      name: "Poisoned",
      kind: "condition",
      tickTiming: "manual"
    });
    expect(fightAttackRollMode(battle.character, battle.monster)).toBe("disadvantage");

    battle = applyFightEffect(battle, "monster", {
      id: "restrained",
      name: "Restrained",
      kind: "condition",
      tickTiming: "manual"
    });
    expect(fightAttackRollMode(battle.character, battle.monster)).toBe("normal");
    expect(fightMovementAllowance(battle.monster)).toBe(0);
  });

  it("recognizes incapacitating conditions as action blockers", () => {
    let battle = createFightBattle(profile("Hero"), profile("Monster"));
    battle = applyFightEffect(battle, "character", {
      id: "stunned",
      name: "Stunned",
      kind: "condition",
      tickTiming: "manual"
    });
    expect(isFightIncapacitated(battle.character)).toBe(true);
    expect(fightMovementAllowance(battle.character)).toBe(0);
  });
});