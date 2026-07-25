import { describe, expect, it } from "vitest";
import { calculateSrdSpellScaling } from "./srdSpellScaling";

describe("structured SRD higher-slot scaling", () => {
  it("calculates additional damage dice", () => {
    const result = calculateSrdSpellScaling(
      "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3.",
      2
    );
    expect(result.status).toBe("calculated");
    expect(result.effects[0]).toMatchObject({
      kind: "dice",
      totalQuantity: 2,
      dieSides: 6,
      summary: "+2d6 to damage"
    });
  });

  it("calculates additional healing dice", () => {
    const result = calculateSrdSpellScaling(
      "Using a Higher-Level Spell Slot. The healing increases by 2d8 for each spell slot level above 1.",
      3
    );
    expect(result.summary).toBe("+6d8 to healing");
  });

  it("calculates additional targets and creatures", () => {
    const targetResult = calculateSrdSpellScaling(
      "At Higher Levels. You can affect one additional beast for each slot level above 1st.",
      3
    );
    const creatureResult = calculateSrdSpellScaling(
      "At Higher Levels. You animate or reassert control over two additional undead creatures for each slot level above 3rd.",
      2
    );
    expect(targetResult.summary).toBe("+3 beast");
    expect(creatureResult.summary).toBe("+4 undead creatures");
  });

  it("calculates duration and hit point increases", () => {
    const duration = calculateSrdSpellScaling(
      "At Higher Levels. The duration of the spell increases by 48 hours for each slot level above 2nd.",
      2
    );
    const hitPoints = calculateSrdSpellScaling(
      "At Higher Levels. A target's hit points increase by an additional 5 for each slot level above 2nd.",
      2
    );
    expect(duration.summary).toBe("+96 hours to duration of the spell");
    expect(hitPoints.summary).toBe("+10 hit points to hit points");
  });

  it("marks irregular or unsupported wording for manual review", () => {
    const result = calculateSrdSpellScaling(
      "At Higher Levels. The maximum challenge rating increases by 1 for every two slot levels above 4th.",
      4
    );
    expect(result.status).toBe("manual-review");
    expect(result.effects).toEqual([]);
  });

  it("does not calculate at the base slot or without a higher-level rule", () => {
    expect(calculateSrdSpellScaling("", 2).status).toBe("none");
    expect(calculateSrdSpellScaling(
      "At Higher Levels. The damage increases by 1d6 for each slot level above 3rd.",
      0
    ).status).toBe("none");
  });
});
