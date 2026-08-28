import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle } from "./fightBattle";
import {
  applyFightEffect,
  breakFightConcentration,
  grantFightTemporaryHitPoints,
  healFightCombatant,
  resolveFightEffectSave,
  startFightConcentration,
  tickFightEffects
} from "./fightBattleEffects";

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
  it("applies one canonical effect without duplicate IDs and emits one current-state event", () => {
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
    expect(state.presentationEvents?.at(-1)).toMatchObject({
      type: "effect-applied",
      delivery: "condition",
      side: "character",
      iconKey: "poisoned"
    });
  });

  it("removes a timed status only when its rules duration expires and emits removal", () => {
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
    expect(state.presentationEvents?.at(-1)).toMatchObject({ type: "effect-removed", side: "monster" });
  });

  it("keeps a failed save effect, then removes it only after a successful save", () => {
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
    expect(failed.state.presentationEvents?.at(-1)).toMatchObject({ type: "save-failure", saveTotal: 11 });

    const passed = resolveFightEffectSave({ state: failed.state, side: "character", effectId: "poisoned", naturalRoll: 12, saveBonus: 3 });
    expect(passed.succeeded).toBe(true);
    expect(passed.state.character.effects).toEqual([]);
    expect(passed.state.presentationEvents?.slice(-2).map((event) => event.type)).toEqual(["save-success", "effect-removed"]);
  });

  it("breaks concentration and clears every linked effect across both cards", () => {
    let state = createFightBattle(profile("Hero"), profile("Monster"));
    state = startFightConcentration(state, "character", "Hold Person");
    state = applyFightEffect(state, "monster", {
      id: "paralyzed",
      name: "Paralyzed",
      kind: "condition",
      iconKey: "paralyzed",
      tickTiming: "manual",
      concentrationOwner: "character"
    });
    state = applyFightEffect(state, "character", {
      id: "ward",
      name: "Arcane Ward",
      kind: "buff",
      tickTiming: "manual",
      concentrationOwner: "character"
    });
    state = breakFightConcentration(state, "character");

    expect(state.character.concentration).toBeUndefined();
    expect(state.character.effects).toEqual([]);
    expect(state.monster.effects).toEqual([]);
    expect(state.presentationEvents?.slice(-3).map((event) => event.type)).toEqual([
      "effect-removed",
      "effect-removed",
      "concentration-broken"
    ]);
  });

  it("starting new concentration ends the previous concentration-backed effect first", () => {
    let state = createFightBattle(profile("Hero"), profile("Monster"));
    state = startFightConcentration(state, "character", "Hex");
    state = applyFightEffect(state, "monster", {
      id: "hex",
      name: "Hex",
      kind: "debuff",
      iconKey: "hex",
      tickTiming: "manual",
      concentrationOwner: "character"
    });
    state = startFightConcentration(state, "character", "Bless");

    expect(state.monster.effects).toEqual([]);
    expect(state.character.concentration?.sourceName).toBe("Bless");
    expect(state.presentationEvents?.at(-1)).toMatchObject({ type: "concentration-started", sourceName: "Bless" });
  });

  it("heals only missing HP and records the actual amount restored", () => {
    let state = createFightBattle(profile("Hero"), profile("Monster"));
    state = { ...state, character: { ...state.character, currentHitPoints: 13 } };
    state = healFightCombatant(state, "character", 12, "Cure Wounds");
    expect(state.character.currentHitPoints).toBe(20);
    expect(state.presentationEvents?.at(-1)).toMatchObject({ type: "healing", amount: 7, sourceName: "Cure Wounds" });
  });

  it("keeps only the larger temporary HP grant and records it as a persistent resource", () => {
    let state = createFightBattle(profile("Hero"), profile("Monster"));
    state = grantFightTemporaryHitPoints(state, "character", 5, "Heroism");
    const eventCount = state.presentationEvents?.length;
    state = grantFightTemporaryHitPoints(state, "character", 3, "False Life");
    expect(state.character.temporaryHitPoints).toBe(5);
    expect(state.presentationEvents?.length).toBe(eventCount);
    state = grantFightTemporaryHitPoints(state, "character", 8, "False Life");
    expect(state.character.temporaryHitPoints).toBe(8);
    expect(state.presentationEvents?.at(-1)).toMatchObject({ type: "temporary-hit-points", amount: 8 });
  });
});
