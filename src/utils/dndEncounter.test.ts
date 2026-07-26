import { describe, expect, it } from "vitest";
import {
  addDndCombatantEffect,
  advanceDndTurn,
  calculateDndConcentrationDc,
  createDndCombatant,
  isDndTurnRestrictedBySurprise,
  moveDndCombatant,
  removeDndCombatantEffect,
  resolveDndConcentrationSave,
  resolveDndEffectSave,
  sortDndInitiative,
  spendDndMovement,
  spendDndTurnResource,
  startDndConcentration,
  startDndEncounter
} from "./dndEncounter";

const combatant = (
  id: string,
  initiative: number,
  ruleset: "srd-5.1-2014" | "srd-5.2.1-2024" = "srd-5.2.1-2024",
  surprised = false
) => createDndCombatant({
  id,
  name: id,
  side: id.startsWith("enemy") ? "enemy" : "player",
  initiative,
  dexterityModifier: 2,
  speedFeet: 30,
  surprised,
  ruleset
});

describe("D&D initiative, concentration, and effect engine", () => {
  it("sorts initiative descending while preserving manual tie order", () => {
    const ordered = sortDndInitiative([
      combatant("alpha", 15),
      combatant("bravo", 18),
      combatant("charlie", 15)
    ]);
    expect(ordered.map((item) => item.id)).toEqual(["bravo", "alpha", "charlie"]);
  });

  it("advances turns, rounds, and refreshes turn resources", () => {
    let state = startDndEncounter("srd-5.2.1-2024", [combatant("alpha", 20), combatant("bravo", 10)]);
    state = spendDndTurnResource(state, "alpha", "reaction");
    state = spendDndTurnResource(state, "alpha", "action");
    state = spendDndMovement(state, "alpha", 20);
    expect(state.combatants[0]).toMatchObject({ reactionAvailable: false, actionAvailable: false, movementRemainingFeet: 10 });

    state = advanceDndTurn(state);
    expect(state).toMatchObject({ round: 1, currentIndex: 1 });
    state = advanceDndTurn(state);
    expect(state).toMatchObject({ round: 2, currentIndex: 0 });
    expect(state.combatants[0]).toMatchObject({ reactionAvailable: true, actionAvailable: true, bonusActionAvailable: true, movementRemainingFeet: 30 });
  });

  it("keeps 2014 surprise restrictions through the first turn", () => {
    let state = startDndEncounter("srd-5.1-2014", [combatant("surprised", 20, "srd-5.1-2014", true), combatant("enemy", 10, "srd-5.1-2014")]);
    const active = state.combatants[0];
    expect(isDndTurnRestrictedBySurprise(state, active)).toBe(true);
    expect(active.reactionAvailable).toBe(false);

    state = advanceDndTurn(state);
    expect(state.combatants.find((item) => item.id === "surprised")).toMatchObject({ surprisePending: false, reactionAvailable: true });
  });

  it("does not restrict a surprised 2024 combatant's first turn", () => {
    const state = startDndEncounter("srd-5.2.1-2024", [combatant("surprised", 20, "srd-5.2.1-2024", true)]);
    expect(isDndTurnRestrictedBySurprise(state, state.combatants[0])).toBe(false);
    expect(state.combatants[0].reactionAvailable).toBe(true);
  });

  it("allows manual tie and table-order adjustment without losing the active turn", () => {
    const state = startDndEncounter("srd-5.2.1-2024", [combatant("alpha", 15), combatant("bravo", 15)]);
    const moved = moveDndCombatant(state, "bravo", -1);
    expect(moved.combatants.map((item) => item.id)).toEqual(["bravo", "alpha"]);
    expect(moved.combatants[moved.currentIndex].id).toBe("alpha");
  });

  it("calculates edition-correct concentration DCs", () => {
    expect(calculateDndConcentrationDc("srd-5.1-2014", 1)).toBe(10);
    expect(calculateDndConcentrationDc("srd-5.1-2014", 80)).toBe(40);
    expect(calculateDndConcentrationDc("srd-5.2.1-2024", 80)).toBe(30);
  });

  it("resolves concentration saves and replaces existing concentration", () => {
    let state = startDndEncounter("srd-5.2.1-2024", [combatant("caster", 15)]);
    state = startDndConcentration(state, "caster", "Bless");
    state = startDndConcentration(state, "caster", "Spirit Guardians");
    expect(state.combatants[0].concentration?.effectName).toBe("Spirit Guardians");

    expect(resolveDndConcentrationSave({
      ruleset: "srd-5.2.1-2024",
      damageTaken: 22,
      roll: 8,
      constitutionSaveBonus: 3
    })).toEqual({ dc: 11, total: 11, maintained: true });
  });

  it("expires start-turn and end-turn effects at the correct boundary", () => {
    let state = startDndEncounter("srd-5.2.1-2024", [combatant("alpha", 20), combatant("bravo", 10)]);
    state = addDndCombatantEffect(state, "alpha", {
      id: "end-effect",
      name: "Ends after this turn",
      remainingRounds: 1,
      tickTiming: "end",
      breaksConcentration: false
    });
    state = addDndCombatantEffect(state, "bravo", {
      id: "start-effect",
      name: "Ends when turn begins",
      remainingRounds: 1,
      tickTiming: "start",
      breaksConcentration: false
    });
    state = addDndCombatantEffect(state, "bravo", {
      id: "manual-effect",
      name: "Manual duration",
      remainingRounds: 1,
      tickTiming: "manual",
      breaksConcentration: false
    });

    state = advanceDndTurn(state);
    expect(state.combatants.find((item) => item.id === "alpha")?.effects).toHaveLength(0);
    expect(state.combatants.find((item) => item.id === "bravo")?.effects.map((effect) => effect.id)).toEqual(["manual-effect"]);
  });

  it("removes an effect on a successful save and keeps it on failure", () => {
    let state = startDndEncounter("srd-5.2.1-2024", [combatant("target", 15)]);
    state = addDndCombatantEffect(state, "target", {
      id: "restrained",
      name: "Restrained",
      tickTiming: "manual",
      saveAbility: "Strength",
      saveDc: 14,
      breaksConcentration: false
    });

    const failed = resolveDndEffectSave(state, "target", "restrained", 8, 3);
    expect(failed).toMatchObject({ total: 11, succeeded: false });
    expect(failed.state.combatants[0].effects).toHaveLength(1);

    const succeeded = resolveDndEffectSave(state, "target", "restrained", 12, 3);
    expect(succeeded).toMatchObject({ total: 15, succeeded: true });
    expect(succeeded.state.combatants[0].effects).toHaveLength(0);
  });

  it("breaks concentration when an incapacitating effect is applied", () => {
    let state = startDndEncounter("srd-5.2.1-2024", [combatant("caster", 15)]);
    state = startDndConcentration(state, "caster", "Bless");
    state = addDndCombatantEffect(state, "caster", {
      id: "paralyzed",
      name: "Paralyzed",
      conditionId: "paralyzed-2024",
      tickTiming: "manual",
      breaksConcentration: true
    });
    expect(state.combatants[0].concentration).toBeUndefined();
    expect(state.combatants[0].effects[0].name).toBe("Paralyzed");
  });

  it("removes effects manually", () => {
    let state = startDndEncounter("srd-5.2.1-2024", [combatant("target", 15)]);
    state = addDndCombatantEffect(state, "target", {
      id: "effect",
      name: "Marked",
      tickTiming: "manual",
      breaksConcentration: false
    });
    state = removeDndCombatantEffect(state, "target", "effect");
    expect(state.combatants[0].effects).toHaveLength(0);
  });
});
