import { describe, expect, it } from "vitest";
import { resolveCocInjury } from "./cocInjury";

describe("resolveCocInjury", () => {
  it("does not create a Major Wound below half maximum HP in one blow", () => {
    const outcome = resolveCocInjury(12, 12, 5);

    expect(outcome.majorWoundThreshold).toBe(6);
    expect(outcome.majorWoundInflicted).toBe(false);
    expect(outcome.currentHitPoints).toBe(7);
    expect(outcome.requiresConsciousnessRoll).toBe(false);
  });

  it("creates a Major Wound at half maximum HP in one blow", () => {
    const outcome = resolveCocInjury(12, 12, 6);

    expect(outcome.majorWoundInflicted).toBe(true);
    expect(outcome.requiresConsciousnessRoll).toBe(true);
    expect(outcome.currentHitPoints).toBe(6);
  });

  it("rounds the Major Wound threshold up for odd maximum HP", () => {
    expect(resolveCocInjury(11, 11, 5).majorWoundInflicted).toBe(false);
    expect(resolveCocInjury(11, 11, 6).majorWoundInflicted).toBe(true);
  });

  it("marks instant death when one blow equals maximum HP", () => {
    const outcome = resolveCocInjury(10, 10, 10);

    expect(outcome.instantDeath).toBe(true);
    expect(outcome.currentHitPoints).toBe(0);
    expect(outcome.dying).toBe(false);
    expect(outcome.requiresConsciousnessRoll).toBe(false);
  });

  it("marks dying at zero HP when a Major Wound exists", () => {
    const outcome = resolveCocInjury(12, 5, 5, true);

    expect(outcome.instantDeath).toBe(false);
    expect(outcome.unconsciousAtZeroHitPoints).toBe(true);
    expect(outcome.dying).toBe(true);
  });

  it("marks zero HP as unconscious but not dying without a Major Wound", () => {
    const outcome = resolveCocInjury(12, 2, 2);

    expect(outcome.unconsciousAtZeroHitPoints).toBe(true);
    expect(outcome.dying).toBe(false);
  });

  it("never records negative HP", () => {
    expect(resolveCocInjury(12, 2, 5).currentHitPoints).toBe(0);
  });
});