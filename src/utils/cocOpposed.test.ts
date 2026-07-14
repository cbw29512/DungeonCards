import { describe, expect, it } from "vitest";
import type { CocPercentileResult, CocSuccessLevel } from "../types/coc";
import {
  resolveCocCloseCombat,
  resolveCocGenericOpposed,
  type CocOpposedSide
} from "./cocOpposed";

const result = (successLevel: CocSuccessLevel, roll = 40, skillValue = 60): CocPercentileResult => ({
  roll,
  unitDie: roll % 10,
  tensDice: [Math.floor(roll / 10)],
  candidates: [roll],
  skillValue,
  difficulty: "regular",
  mode: "normal",
  successLevel,
  meetsDifficulty: !["failure", "fumble"].includes(successLevel)
});

const side = (
  label: string,
  skillValue: number,
  successLevel: CocSuccessLevel,
  roll = 40
): CocOpposedSide => ({
  label,
  skillValue,
  result: result(successLevel, roll, skillValue)
});

describe("resolveCocGenericOpposed", () => {
  it("awards the opposed roll to the higher success level", () => {
    expect(resolveCocGenericOpposed(
      side("A", 40, "hard"),
      side("B", 80, "regular")
    ).winner).toBe("side-a");
  });

  it("awards matching success levels to the higher skill", () => {
    const resolution = resolveCocGenericOpposed(
      side("A", 70, "regular"),
      side("B", 50, "regular")
    );

    expect(resolution.winner).toBe("side-a");
    expect(resolution.reason).toContain("higher skill");
  });

  it("requires a separate tie-break when skills and success levels match", () => {
    expect(resolveCocGenericOpposed(
      side("A", 50, "hard"),
      side("B", 50, "hard")
    ).outcome).toBe("tie-break-required");
  });

  it("uses the lower separate D100 tie-break roll", () => {
    const resolution = resolveCocGenericOpposed(
      side("A", 50, "hard"),
      side("B", 50, "hard"),
      { sideARoll: 61, sideBRoll: 18 }
    );

    expect(resolution.winner).toBe("side-b");
  });

  it("asks for another tie-break when both tie-break rolls match", () => {
    expect(resolveCocGenericOpposed(
      side("A", 50, "regular"),
      side("B", 50, "regular"),
      { sideARoll: 22, sideBRoll: 22 }
    ).outcome).toBe("tie-break-tied");
  });

  it("returns no winner when both sides fail", () => {
    expect(resolveCocGenericOpposed(
      side("A", 50, "failure"),
      side("B", 50, "fumble")
    ).outcome).toBe("no-winner");
  });
});

describe("resolveCocCloseCombat", () => {
  it("lets Dodge win an equal success level", () => {
    expect(resolveCocCloseCombat(
      result("hard"),
      result("hard"),
      "dodge"
    ).outcome).toBe("defender-dodges");
  });

  it("requires the attacker to beat the Dodge success level", () => {
    expect(resolveCocCloseCombat(
      result("extreme"),
      result("hard"),
      "dodge"
    ).outcome).toBe("attacker-hits");
  });

  it("lets the initiating attacker win an equal Fight Back result", () => {
    expect(resolveCocCloseCombat(
      result("regular"),
      result("regular"),
      "fight-back"
    ).outcome).toBe("attacker-hits");
  });

  it("lets a higher Fight Back success level damage the attacker", () => {
    expect(resolveCocCloseCombat(
      result("regular"),
      result("hard"),
      "fight-back"
    ).outcome).toBe("defender-fights-back");
  });

  it("deals no damage when both combat rolls fail", () => {
    expect(resolveCocCloseCombat(
      result("failure"),
      result("failure"),
      "fight-back"
    ).outcome).toBe("no-damage");
  });
});