import { describe, expect, it } from "vitest";
import { createDndCombatant, startDndConcentration, startDndEncounter } from "./dndEncounter";
import {
  applyDndCombatantDamage,
  applyDndCombatantHealing,
  chooseDndCombatantTemporaryHitPoints,
  recoverStableDndCombatant,
  resolveDndCombatantDeathSave,
  stabilizeDndCombatant
} from "./dndEncounterHealth";

const makeCombatant = (id: string, initiative: number, currentHitPoints = 20) => createDndCombatant({
  id,
  name: id,
  side: "player",
  initiative,
  dexterityModifier: 2,
  speedFeet: 30,
  surprised: false,
  ruleset: "srd-5.2.1-2024",
  maximumHitPoints: 20,
  currentHitPoints
});

const encounter = () => startDndEncounter("srd-5.2.1-2024", [makeCombatant("caster", 15)]);

describe("D&D combatant health integration", () => {
  it("creates combatants with normalized health state", () => {
    expect(encounter().combatants[0].health).toMatchObject({
      maximumHitPoints: 20,
      currentHitPoints: 20,
      temporaryHitPoints: 0,
      lifeState: "conscious"
    });
  });

  it("applies Temporary HP before combatant HP", () => {
    let state = encounter();
    state = chooseDndCombatantTemporaryHitPoints(state, "caster", 5, "replace");
    const result = applyDndCombatantDamage(state, "caster", 8);
    expect(result.state.combatants[0].health).toMatchObject({
      currentHitPoints: 17,
      temporaryHitPoints: 0
    });
  });

  it("ends concentration when damage drops a combatant unconscious", () => {
    let state = startDndConcentration(encounter(), "caster", "Bless");
    const result = applyDndCombatantDamage(state, "caster", 20);
    expect(result.state.combatants[0]).toMatchObject({
      concentration: undefined,
      health: { currentHitPoints: 0, lifeState: "unconscious" }
    });
  });

  it("keeps concentration when damage is absorbed or HP remains above zero", () => {
    let state = startDndConcentration(encounter(), "caster", "Bless");
    state = chooseDndCombatantTemporaryHitPoints(state, "caster", 5, "replace");
    state = applyDndCombatantDamage(state, "caster", 4).state;
    expect(state.combatants[0].concentration?.effectName).toBe("Bless");
    expect(state.combatants[0].health).toMatchObject({ currentHitPoints: 20, temporaryHitPoints: 1 });
  });

  it("resolves death saves and clears concentration on death", () => {
    let state = applyDndCombatantDamage(encounter(), "caster", 20).state;
    state = { ...state, combatants: [{ ...state.combatants[0], concentration: { effectName: "Impossible test state" }, health: { ...state.combatants[0].health, deathSaveFailures: 2 } }] };
    const result = resolveDndCombatantDeathSave(state, "caster", 2);
    expect(result.state.combatants[0]).toMatchObject({ concentration: undefined, health: { lifeState: "dead" } });
  });

  it("restores the active turn after a natural 20 Death Save", () => {
    let state = startDndEncounter("srd-5.2.1-2024", [makeCombatant("down", 20, 0), makeCombatant("ally", 10)]);
    state = {
      ...state,
      combatants: state.combatants.map((combatant) => combatant.id === "down"
        ? { ...combatant, actionAvailable: false, bonusActionAvailable: false, reactionAvailable: false, movementRemainingFeet: 0 }
        : combatant)
    };
    const resolved = resolveDndCombatantDeathSave(state, "down", 20).state;
    expect(resolved.combatants[0]).toMatchObject({
      health: { currentHitPoints: 1, lifeState: "conscious" },
      actionAvailable: true,
      bonusActionAvailable: true,
      reactionAvailable: true,
      movementRemainingFeet: 30
    });
  });

  it("does not refresh turn resources when healed outside the combatant's turn", () => {
    let state = startDndEncounter("srd-5.2.1-2024", [makeCombatant("active", 20), makeCombatant("down", 10, 0)]);
    state = {
      ...state,
      combatants: state.combatants.map((combatant) => combatant.id === "down"
        ? { ...combatant, actionAvailable: false, bonusActionAvailable: false, reactionAvailable: false, movementRemainingFeet: 0 }
        : combatant)
    };
    state = applyDndCombatantHealing(state, "down", 5);
    const healed = state.combatants.find((combatant) => combatant.id === "down");
    expect(healed).toMatchObject({
      health: { currentHitPoints: 5, lifeState: "conscious" },
      actionAvailable: false,
      bonusActionAvailable: false,
      reactionAvailable: false,
      movementRemainingFeet: 0
    });
  });

  it("heals a living combatant and resets death saves", () => {
    let state = applyDndCombatantDamage(encounter(), "caster", 20).state;
    state = { ...state, combatants: [{ ...state.combatants[0], health: { ...state.combatants[0].health, deathSaveFailures: 2 } }] };
    state = applyDndCombatantHealing(state, "caster", 7);
    expect(state.combatants[0].health).toMatchObject({
      currentHitPoints: 7,
      lifeState: "conscious",
      deathSaveFailures: 0,
      deathSaveSuccesses: 0
    });
  });

  it("stabilizes and later recovers a combatant", () => {
    let state = applyDndCombatantDamage(encounter(), "caster", 20).state;
    state = stabilizeDndCombatant(state, "caster");
    expect(state.combatants[0].health.lifeState).toBe("stable");
    state = recoverStableDndCombatant(state, "caster");
    expect(state.combatants[0].health).toMatchObject({ currentHitPoints: 1, lifeState: "conscious" });
  });

  it("does not revive a dead combatant through ordinary healing", () => {
    let state = applyDndCombatantDamage(encounter(), "caster", 40).state;
    expect(state.combatants[0].health.lifeState).toBe("dead");
    state = applyDndCombatantHealing(state, "caster", 20);
    expect(state.combatants[0].health).toMatchObject({ currentHitPoints: 0, lifeState: "dead" });
  });
});
