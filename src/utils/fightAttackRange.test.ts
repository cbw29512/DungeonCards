import { describe, expect, it } from "vitest";
import type { FightBattleCombatantState } from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import type { FightAttackAction } from "../types/fightRules";
import { fightActionMaximumRangeFeet, fightAttackDistanceRollMode } from "./fightAttackRange";
import { fightAttackRollMode } from "./fightRules";

const profile = (name: string): FightCombatantProfile => ({
  id: name.toLowerCase(),
  name,
  ruleset: "srd-5.2.1-2024",
  armorClass: 14,
  hitPoints: 30,
  attackBonus: 5,
  attacksPerRound: 1,
  averageDamageOnHit: 7.5,
  initiativeBonus: 2,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Attack",
  speedFeet: 30
});

const combatant = (name: string): FightBattleCombatantState => ({
  profile: profile(name),
  currentHitPoints: 30,
  effects: [],
  resources: {},
  rechargeReady: {},
  economy: { actionsAvailable: 1, bonusActionsAvailable: 1, reactionAvailable: true, movementRemainingFeet: 30 }
});

const longbow: FightAttackAction = {
  id: "longbow",
  name: "Longbow",
  kind: "attack",
  economy: "action",
  delivery: "weapon",
  attackMode: "ranged",
  rangeFeet: 150,
  longRangeFeet: 600,
  attackBonus: 7,
  damage: [{ formula: "1d8+4", damageType: "piercing", criticalBonusFormula: "1d8" }]
};

describe("Fight Cards ranged attack bands", () => {
  it("uses normal range normally and long range with Disadvantage", () => {
    const target = combatant("Target");
    expect(fightAttackDistanceRollMode(longbow, 150, target)).toBe("normal");
    expect(fightAttackDistanceRollMode(longbow, 151, target)).toBe("disadvantage");
    expect(fightAttackDistanceRollMode(longbow, 600, target)).toBe("disadvantage");
    expect(fightActionMaximumRangeFeet(longbow)).toBe(600);
  });

  it("applies the 5-foot ranged attack penalty against an active opponent", () => {
    expect(fightAttackDistanceRollMode(longbow, 5, combatant("Target"))).toBe("disadvantage");
  });

  it("does not impose the adjacent-enemy penalty when that opponent is incapacitated", () => {
    const target = combatant("Target");
    target.effects.push({ id: "stunned", name: "Stunned", kind: "condition", tickTiming: "manual" });
    expect(fightAttackDistanceRollMode(longbow, 5, target)).toBe("normal");
  });

  it("lets canonical Advantage cancel long-range Disadvantage", () => {
    const attacker = combatant("Archer");
    attacker.effects.push({
      id: "advantage",
      name: "Advantage",
      kind: "buff",
      tickTiming: "manual",
      attackRollMode: "advantage"
    });
    const target = combatant("Target");
    const rangeMode = fightAttackDistanceRollMode(longbow, 300, target);
    expect(rangeMode).toBe("disadvantage");
    expect(fightAttackRollMode(attacker, target, rangeMode, 300)).toBe("normal");
  });

  it("does not invent a long range for a single-range spell attack", () => {
    const spell: FightAttackAction = {
      ...longbow,
      id: "fire-bolt",
      name: "Fire Bolt",
      delivery: "spell",
      rangeFeet: 120,
      longRangeFeet: undefined
    };
    expect(fightActionMaximumRangeFeet(spell)).toBe(120);
    expect(fightAttackDistanceRollMode(spell, 100, combatant("Target"))).toBe("normal");
  });
});