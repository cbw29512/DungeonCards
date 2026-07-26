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

const encounter = () => startDndEncounter("srd-5.2.1-2024", [
  createDndCombatant({
    id: "caster",
    name: "Caster",
    side: "player",
    initiative: 15,
    dexterityModifier: 2,
    speedFeet: 30,
    surprised: false,
    ruleset: "srd-5.2.1-2024",
    maximumHitPoints: 20,
    currentHitPoints: 20
  })
]);

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
