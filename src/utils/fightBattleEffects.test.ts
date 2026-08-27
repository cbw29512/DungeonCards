import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle } from "./fightBattle";
import { applyFightEffect, resolveFightEffectSave, tickFightEffects } from "./fightBattleEffects";

const profile = (name: string): FightCombatantProfile => ({
  id: name.toLowerCase(),
  name,
  ruleset: "srd-5.1-2014",
  armorClass: 14,
  hitPoints: 20,
  attackBonus: 5,
  averageDamageOnHit: 7,
  attacksPerRound: 1,
  initiativeBonus: 2,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword"
});

describe("Fight Cards status lifecycle", () => {
  it("applies one canonical effect without duplicate IDs", () => {
    let state = createFightBattle(profile("Hero"), profile("Monster"));
    state = applyFightEffect(state, "character", {
      id: "poisoned",
      name: "Poisoned",
      kind: "condition",
      iconKey: "poisoned",
      tickTiming: "manual"
    });
    state = applyFightEffect(state, "character", {
      id: "poisoned",
      name: "Poisoned",
      kind: "condition",
      iconKey: "poisoned",
      tickTiming: "manual",
      sourceName: "Venom"
    });
    expect(state.character.effects).toHaveLength(1);
    expect(state.character.effects[0].sourceName).toBe("Venom");
  });

  it("removes a timed status only when its rules duration expires", () => {
    let state = createFightBattle(profile("Hero"), profile("Monster"));
    state = applyFightEffect(state, "monster", {
      id: "frightened",
      name: "Frightened",
      kind: "condition",
      iconKey: "frightened",
      remainingRounds: 2,
      tickTiming: "end"
    });
    state = tickFightEffects(state, "monster", "end");
    expect(state.monster.effects[0].remainingRounds).toBe(1);
    state = tickFightEffects(state, "monster", "end");
    expect(state.monster.effects).toEqual([]);
  });

  it("keeps a failed save effect and removes it on a successful save", () => {
    let state = createFightBattle(profile("Hero"), profile("Monster"));
    state = applyFightEffect(state, "character", {
      id: "poisoned",
      name: "Poisoned",
      kind: "condition",
      iconKey: "poisoned",
      tickTiming: "manual",
      saveAbility: "CON",
      saveDc: 14
    });
    const failed = resolveFightEffectSave({ state, side: "character", effectId: "poisoned", naturalRoll: 8, saveBonus: 3 });
    expect(failed.succeeded).toBe(false);
    expect(failed.state.character.effects).toHaveLength(1);
    const passed = resolveFightEffectSave({ state: failed.state, side: "character", effectId: "poisoned", naturalRoll: 12, saveBonus: 3 });
    expect(passed.succeeded).toBe(true);
    expect(passed.state.character.effects).toEqual([]);
  });
});
