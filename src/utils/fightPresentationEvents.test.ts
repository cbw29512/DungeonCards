import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle } from "./fightBattle";
import { appendFightPresentationEvent, recordFightAttackPresentation } from "./fightPresentationEvents";

const profile = (name: string): FightCombatantProfile => ({
  id: name.toLowerCase(),
  name,
  ruleset: "srd-5.1-2014",
  armorClass: 14,
  hitPoints: 20,
  attackBonus: 5,
  averageDamageOnHit: 7,
  attacksPerRound: 1,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Attack"
});

describe("Fight Cards presentation event queue", () => {
  it("assigns stable sequential IDs without mutating combat rules state", () => {
    const state = createFightBattle(profile("Hero"), profile("Monster"));
    const first = appendFightPresentationEvent(state, {
      type: "healing",
      delivery: "spell",
      side: "character",
      label: "+4 HP",
      amount: 4
    });
    const second = appendFightPresentationEvent(first, {
      type: "effect-applied",
      delivery: "buff",
      side: "character",
      label: "Bless applied",
      iconKey: "bless"
    });

    expect(second.presentationEvents?.map((event) => event.id)).toEqual([1, 2]);
    expect(second.character.currentHitPoints).toBe(state.character.currentHitPoints);
    expect(second.events).toEqual([]);
  });

  it("can represent weapon and spell attack feedback through the same contract", () => {
    let state = createFightBattle(profile("Hero"), profile("Monster"));
    state = recordFightAttackPresentation({
      state,
      attacker: "character",
      target: "monster",
      sourceName: "Longsword",
      outcome: "hit",
      damage: 7,
      delivery: "weapon"
    });
    state = recordFightAttackPresentation({
      state,
      attacker: "monster",
      target: "character",
      sourceName: "Fire Bolt",
      outcome: "critical",
      damage: 12,
      delivery: "spell"
    });

    expect(state.presentationEvents?.[0]).toMatchObject({ type: "hit", delivery: "weapon", amount: 7 });
    expect(state.presentationEvents?.[1]).toMatchObject({ type: "critical", delivery: "spell", amount: 12 });
  });

  it("supports save, removal, healing, and downed events without special UI schemas", () => {
    let state = createFightBattle(profile("Hero"), profile("Monster"));
    for (const event of [
      { type: "save-failure" as const, delivery: "condition" as const, side: "monster" as const, label: "Poison save fails", saveAbility: "CON", saveDc: 14, saveTotal: 11 },
      { type: "effect-removed" as const, delivery: "condition" as const, side: "monster" as const, label: "Poisoned ended", iconKey: "poisoned" },
      { type: "healing" as const, delivery: "spell" as const, side: "character" as const, label: "+6 HP", amount: 6 },
      { type: "downed" as const, delivery: "system" as const, side: "monster" as const, label: "Monster is down" }
    ]) state = appendFightPresentationEvent(state, event);

    expect(state.presentationEvents?.map((event) => event.type)).toEqual([
      "save-failure",
      "effect-removed",
      "healing",
      "downed"
    ]);
  });
});
