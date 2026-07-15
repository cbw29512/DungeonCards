import { describe, expect, it } from "vitest";
import { getAttackRollImpact } from "./ruleRollImpact";

describe("rule roll impact", () => {
  it("creates a critical-hit impact for a natural 20 attack result", () => {
    expect(getAttackRollImpact({ isCritical: true, isFailure: false })).toEqual({
      kind: "critical-hit",
      title: "Natural 20!",
      subtitle: "Critical Hit"
    });
  });

  it("creates an automatic-miss impact for a natural 1 attack result", () => {
    expect(getAttackRollImpact({ isCritical: false, isFailure: true })).toEqual({
      kind: "automatic-miss",
      title: "Natural 1!",
      subtitle: "Automatic Miss"
    });
  });

  it("does not create an impact for ordinary rolls", () => {
    expect(getAttackRollImpact({ isCritical: false, isFailure: false })).toBeNull();
    expect(getAttackRollImpact()).toBeNull();
  });

  it("gives critical hits precedence over invalid conflicting flags", () => {
    expect(getAttackRollImpact({ isCritical: true, isFailure: true })?.kind).toBe("critical-hit");
  });
});
