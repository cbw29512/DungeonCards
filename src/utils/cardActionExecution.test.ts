import { describe, expect, it } from "vitest";
import type { CardDefinition } from "../types/cardPlatform";
import type { CardActionDefinition } from "../types/cardPlatformActions";
import { createCardRuntimeInstance } from "./cardPlatformRuntimeState";
import { executeCardAction } from "./cardActionExecution";

const baseCard = (actions: CardActionDefinition[], system: CardDefinition["gameSystemId"] = "dnd-2024"): CardDefinition => ({
  schemaVersion: 2,
  id: `action-test:${system}`,
  gameSystemId: system,
  family: "roll-action",
  visibility: "player-safe",
  content: { title: "Action Test", summary: "Exercises executable card actions.", tags: ["test"] },
  source: { kind: "original", title: "DM Forge action tests", publicDistributionAllowed: true },
  review: { status: "draft" },
  actions,
  resources: [{ id: "uses", label: "Uses", maximum: 2, initial: 2, refresh: "long-rest" }],
  linkedCardIds: ["linked:present", "linked:missing"],
  print: { format: "standard-card", sizeId: "poker-2.5x3.5", faces: "front-back" }
});

const sequence = (...values: number[]) => {
  let index = 0;
  return (minimum: number, maximum: number): number => {
    const value = values[index++];
    if (value === undefined || value < minimum || value > maximum) throw new Error("Deterministic random value is out of range.");
    return value;
  };
};

describe("playable Card Platform action execution", () => {
  it("rolls d20 actions deterministically and applies canonical resource costs", () => {
    const action: CardActionDefinition = {
      id: "strike",
      kind: "roll",
      label: "Strike",
      rollSystem: "d20",
      formula: "1d20+5",
      allowsAdvantage: true,
      criticalAt: 20,
      failureAt: 1,
      resourceCosts: [{ resourceId: "uses", amount: 1 }]
    };
    const definition = baseCard([action]);
    const instance = createCardRuntimeInstance(definition, "instance:action", {}, "2026-07-27T19:10:00.000Z");
    const result = executeCardAction(definition, instance, action, {
      advantageMode: "advantage",
      randomInteger: sequence(20, 7)
    });
    expect(result.roll?.total).toBe(25);
    expect(result.roll?.isCritical).toBe(true);
    expect(result.roll?.dice?.[0]?.results).toEqual([20, 7]);
    expect(result.resourceState.uses).toBe(1);
    expect(result.resourceChanges).toEqual([{ resourceId: "uses", before: 2, after: 1, amount: 1 }]);
    expect(instance.resourceState.uses).toBe(2);
  });

  it("uses the immutable definition action rather than caller-supplied changes", () => {
    const canonical: CardActionDefinition = {
      id: "spend",
      kind: "procedure",
      label: "Spend a use",
      steps: ["Spend one use."],
      resourceCosts: [{ resourceId: "uses", amount: 1 }]
    };
    const definition = baseCard([canonical]);
    const instance = createCardRuntimeInstance(definition, "instance:canonical");
    const tampered = { ...canonical, resourceCosts: [] };
    const result = executeCardAction(definition, instance, tampered);
    expect(result.resourceState.uses).toBe(1);
    expect(result.resourceChanges).toHaveLength(1);
  });

  it("rejects failed rolls without mutating resources", () => {
    const action: CardActionDefinition = {
      id: "unsafe",
      kind: "roll",
      label: "Unsafe roll",
      rollSystem: "dice-formula",
      formula: "not-a-formula",
      resourceCosts: [{ resourceId: "uses", amount: 1 }]
    };
    const definition = baseCard([action]);
    const instance = createCardRuntimeInstance(definition, "instance:unsafe");
    expect(() => executeCardAction(definition, instance, action)).toThrow();
    expect(instance.resourceState.uses).toBe(2);
  });

  it("reports complete CoC percentile outcomes with injected randomness", () => {
    const action: CardActionDefinition = {
      id: "spot-hidden",
      kind: "roll",
      label: "Spot Hidden",
      rollSystem: "percentile",
      percentileTarget: 60,
      percentileDifficulty: "hard"
    };
    const definition = baseCard([action], "coc-7e");
    const instance = createCardRuntimeInstance(definition, "instance:coc");
    const result = executeCardAction(definition, instance, action, { randomInteger: sequence(5, 2) });
    expect(result.roll?.percentileRoll).toBe(25);
    expect(result.roll?.successLevel).toBe("hard");
    expect(result.roll?.meetsDifficulty).toBe(true);
    expect(result.summary).toContain("hard success");
  });

  it("returns available and missing linked definitions without changing state", () => {
    const action: CardActionDefinition = {
      id: "open-links",
      kind: "link",
      label: "Open linked cards",
      targetCardIds: ["linked:present", "linked:missing"]
    };
    const definition = baseCard([action]);
    const instance = createCardRuntimeInstance(definition, "instance:links");
    const result = executeCardAction(definition, instance, action, {
      availableDefinitionIds: new Set(["linked:present"])
    });
    expect(result.targetCardIds).toEqual(["linked:present"]);
    expect(result.missingTargetCardIds).toEqual(["linked:missing"]);
    expect(result.resourceState).toEqual(instance.resourceState);
  });
});
