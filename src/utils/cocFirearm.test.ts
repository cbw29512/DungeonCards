import { describe, expect, it } from "vitest";
import { resolveCocHandgunProcedure } from "./cocFirearm";

describe("resolveCocHandgunProcedure", () => {
  it("adds 50 DEX for a readied firearm", () => {
    expect(resolveCocHandgunProcedure({
      dexterity: 55,
      distanceFeet: 30,
      shotsThisRound: 1,
      coverDiveResult: "none"
    }).readiedInitiativeDex).toBe(105);
  });

  it("grants one Bonus die within one-fifth DEX feet", () => {
    const atBoundary = resolveCocHandgunProcedure({
      dexterity: 55,
      distanceFeet: 11,
      shotsThisRound: 1,
      coverDiveResult: "none"
    });
    const outsideBoundary = resolveCocHandgunProcedure({
      dexterity: 55,
      distanceFeet: 12,
      shotsThisRound: 1,
      coverDiveResult: "none"
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
      coverDiveResult: "none"
    }).rollMode).toBe("penalty");
    expect(resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 30,
      shotsThisRound: 3,
      coverDiveResult: "none"
    }).penaltyDice).toBe(1);
  });

  it("applies an additional Penalty die only after a successful dive for cover", () => {
    const failedDive = resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 30,
      shotsThisRound: 3,
      coverDiveResult: "failed"
    });
    const successfulDive = resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 30,
      shotsThisRound: 3,
      coverDiveResult: "successful"
    });

    expect(failedDive.penaltyDice).toBe(1);
    expect(successfulDive.penaltyDice).toBe(2);
    expect(successfulDive.rollMode).toBe("double-penalty");
  });

  it("costs the target its next attack on either a failed or successful dive", () => {
    expect(resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 30,
      shotsThisRound: 1,
      coverDiveResult: "failed"
    }).targetForfeitsNextAttack).toBe(true);
    expect(resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 30,
      shotsThisRound: 1,
      coverDiveResult: "successful"
    }).targetForfeitsNextAttack).toBe(true);
    expect(resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 30,
      shotsThisRound: 1,
      coverDiveResult: "none"
    }).targetForfeitsNextAttack).toBe(false);
  });

  it("cancels point-blank Bonus against one multiple-shot Penalty", () => {
    const procedure = resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 12,
      shotsThisRound: 2,
      coverDiveResult: "none"
    });

    expect(procedure.bonusDice).toBe(1);
    expect(procedure.penaltyDice).toBe(1);
    expect(procedure.rollMode).toBe("normal");
  });

  it("leaves one net Penalty when point blank, multiple shots, and successful cover all apply", () => {
    expect(resolveCocHandgunProcedure({
      dexterity: 60,
      distanceFeet: 12,
      shotsThisRound: 3,
      coverDiveResult: "successful"
    }).rollMode).toBe("penalty");
  });
});