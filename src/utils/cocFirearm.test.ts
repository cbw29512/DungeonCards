import { describe, expect, it } from "vitest";
import { resolveCocHandgunProcedure } from "./cocFirearm";

describe("resolveCocHandgunProcedure", () => {
  it("adds 50 DEX for a readied firearm", () => {
    expect(resolveCocHandgunProcedure({
      dexterity: 55,
      distanceFeet: 30,
      shotsThisRound: 1,
      targetDivedForCoverSuccessfully: false
    }).readiedInitiativeDex).toBe(105);
  });

  it("grants one Bonus die within one-fifth DEX feet", () => {
    const atBoundary = resolveCocHandgunProcedure({
      dexterity: 55,
      distanceFeet: 11,
      shotsThisRound: 1,
      targetDivedForCoverSuccessfully: false
    });
    const outsideBoundary = resolveCocHandgunProcedure({
      dexterity: 55,
      distanceFeet: 12,
      shotsThisRound: 1,
      targetDivedForCoverSuccessfully: false
    });

    expect(atBoundary.pointBlank).toBe(true);
    expect(atBoundary.rollMode).toBe("bonus");
    expect(outsideBoundary.pointBlank).toBe(false);
    expect(outsideBoundary.rollMode).toBe("normal");
  });

  it("applies one Penalty die to every shot when firing two or three handgun shots", () => {
    expect(resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 30,
      shotsThisRound: 2,
      targetDivedForCoverSuccessfully: false
    }).rollMode).toBe("penalty");
    expect(resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 30,
      shotsThisRound: 3,
      targetDivedForCoverSuccessfully: false
    }).penaltyDice).toBe(1);
  });

  it("applies a second Penalty die after a successful dive for cover", () => {
    const procedure = resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 30,
      shotsThisRound: 3,
      targetDivedForCoverSuccessfully: true
    });

    expect(procedure.penaltyDice).toBe(2);
    expect(procedure.rollMode).toBe("double-penalty");
    expect(procedure.targetForfeitsNextAttack).toBe(true);
  });

  it("cancels point-blank Bonus against one multiple-shot Penalty", () => {
    const procedure = resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 12,
      shotsThisRound: 2,
      targetDivedForCoverSuccessfully: false
    });

    expect(procedure.bonusDice).toBe(1);
    expect(procedure.penaltyDice).toBe(1);
    expect(procedure.rollMode).toBe("normal");
  });

  it("leaves one net Penalty when point blank, multiple shots, and cover all apply", () => {
    expect(resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 12,
      shotsThisRound: 3,
      targetDivedForCoverSuccessfully: true
    }).rollMode).toBe("penalty");
  });
});