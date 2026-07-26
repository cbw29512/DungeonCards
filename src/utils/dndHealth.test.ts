import { describe, expect, it } from "vitest";
import {
  applyDndDamage,
  applyDndHealing,
  chooseDndTemporaryHitPoints,
  createDndHealthState,
  isDndBloodied,
  recoverStableDndCreature,
  resolveDndDeathSave,
  stabilizeDndCreature
} from "./dndHealth";

describe("D&D health and death-state engine", () => {
  it("applies temporary HP before normal HP", () => {
    const state = chooseDndTemporaryHitPoints(createDndHealthState("srd-5.2.1-2024", 20), 5, "replace");
    const result = applyDndDamage(state, 8);
    expect(result).toMatchObject({ temporaryHitPointsLost: 5, hitPointsLost: 3 });
    expect(result.state).toMatchObject({ currentHitPoints: 17, temporaryHitPoints: 0, lifeState: "conscious" });
  });

  it("resolves temporary HP before damage consequences at zero HP", () => {
    const protectedState = chooseDndTemporaryHitPoints(createDndHealthState("srd-5.2.1-2024", 20, 0), 5, "replace");
    const fullyAbsorbed = applyDndDamage(protectedState, 5, true);
    expect(fullyAbsorbed.state).toMatchObject({ lifeState: "unconscious", temporaryHitPoints: 0, deathSaveFailures: 0 });
    expect(fullyAbsorbed.deathFailuresAdded).toBe(0);

    const partiallyAbsorbed = applyDndDamage(protectedState, 7);
    expect(partiallyAbsorbed.state).toMatchObject({ temporaryHitPoints: 0, deathSaveFailures: 1 });

    const massiveAfterBuffer = applyDndDamage(protectedState, 24);
    expect(massiveAfterBuffer.state.lifeState).toBe("unconscious");
    const lethalAfterBuffer = applyDndDamage(protectedState, 25);
    expect(lethalAfterBuffer.state.lifeState).toBe("dead");
  });

  it("drops to 0 without going negative and detects massive damage", () => {
    const unconscious = applyDndDamage(createDndHealthState("srd-5.1-2014", 12, 6), 10);
    expect(unconscious.state).toMatchObject({ currentHitPoints: 0, lifeState: "unconscious" });
    expect(unconscious.massiveDamageRemainder).toBe(4);

    const dead = applyDndDamage(createDndHealthState("srd-5.1-2014", 12, 6), 18);
    expect(dead.state.lifeState).toBe("dead");
    expect(dead.massiveDamageRemainder).toBe(12);
  });

  it("records one failure for damage at 0 and two for a critical hit", () => {
    const state = createDndHealthState("srd-5.2.1-2024", 20, 0);
    expect(applyDndDamage(state, 2).state.deathSaveFailures).toBe(1);
    expect(applyDndDamage(state, 2, true).state.deathSaveFailures).toBe(2);
  });

  it("kills immediately when damage at 0 equals the maximum", () => {
    const state = createDndHealthState("srd-5.2.1-2024", 20, 0);
    expect(applyDndDamage(state, 20).state.lifeState).toBe("dead");
  });

  it("resolves ordinary, natural 1, and natural 20 death saves", () => {
    const state = createDndHealthState("srd-5.1-2014", 20, 0);
    expect(resolveDndDeathSave(state, 10).state.deathSaveSuccesses).toBe(1);
    expect(resolveDndDeathSave(state, 9).state.deathSaveFailures).toBe(1);
    expect(resolveDndDeathSave(state, 1).state.deathSaveFailures).toBe(2);
    expect(resolveDndDeathSave(state, 20).state).toMatchObject({ currentHitPoints: 1, lifeState: "conscious", deathSaveSuccesses: 0, deathSaveFailures: 0 });
  });

  it("stabilizes on a third success and dies on a third failure", () => {
    const base = createDndHealthState("srd-5.2.1-2024", 20, 0);
    const twoSuccesses = { ...base, deathSaveSuccesses: 2 };
    expect(resolveDndDeathSave(twoSuccesses, 10).state).toMatchObject({ lifeState: "stable", deathSaveSuccesses: 0, deathSaveFailures: 0 });

    const twoFailures = { ...base, deathSaveFailures: 2 };
    expect(resolveDndDeathSave(twoFailures, 2).state.lifeState).toBe("dead");
  });

  it("healing restores consciousness and resets death saves", () => {
    const state = { ...createDndHealthState("srd-5.2.1-2024", 20, 0), deathSaveSuccesses: 1, deathSaveFailures: 2 };
    expect(applyDndHealing(state, 7)).toMatchObject({ currentHitPoints: 7, lifeState: "conscious", deathSaveSuccesses: 0, deathSaveFailures: 0 });
  });

  it("does not stack temporary HP automatically", () => {
    const state = chooseDndTemporaryHitPoints(createDndHealthState("srd-5.2.1-2024", 20), 8, "replace");
    expect(chooseDndTemporaryHitPoints(state, 5, "keep").temporaryHitPoints).toBe(8);
    expect(chooseDndTemporaryHitPoints(state, 5, "replace").temporaryHitPoints).toBe(5);
  });

  it("supports manual stabilization and 1 HP recovery after 1d4 hours", () => {
    const unconscious = createDndHealthState("srd-5.1-2014", 20, 0);
    const stable = stabilizeDndCreature({ ...unconscious, deathSaveFailures: 2 });
    expect(stable).toMatchObject({ lifeState: "stable", deathSaveFailures: 0 });
    expect(recoverStableDndCreature(stable)).toMatchObject({ currentHitPoints: 1, lifeState: "conscious" });
  });

  it("uses Bloodied as a 2024-only status", () => {
    expect(isDndBloodied(createDndHealthState("srd-5.2.1-2024", 20, 10))).toBe(true);
    expect(isDndBloodied(createDndHealthState("srd-5.1-2014", 20, 10))).toBe(false);
  });
});
