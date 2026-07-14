import { describe, expect, it } from "vitest";
import { applyCocSanityLoss, isCocSanityRollSuccessful } from "./cocSanity";

describe("isCocSanityRollSuccessful", () => {
  it("succeeds on a roll equal to current Sanity", () => {
    expect(isCocSanityRollSuccessful(60, 60)).toBe(true);
  });

  it("fails on a roll over current Sanity", () => {
    expect(isCocSanityRollSuccessful(61, 60)).toBe(false);
  });

  it("always fails when current Sanity is zero", () => {
    expect(isCocSanityRollSuccessful(1, 0)).toBe(false);
  });
});

describe("applyCocSanityLoss", () => {
  it("does not require an involuntary action after a successful Sanity roll", () => {
    const state = applyCocSanityLoss(60, 1, false);

    expect(state.currentSanity).toBe(59);
    expect(state.involuntaryActionRequired).toBe(false);
  });

  it("requires an involuntary action after a failed Sanity roll even when loss is zero", () => {
    const state = applyCocSanityLoss(60, 0, true);

    expect(state.currentSanity).toBe(60);
    expect(state.involuntaryActionRequired).toBe(true);
  });

  it("requires the temporary-insanity INT check at 5 SAN loss", () => {
    expect(applyCocSanityLoss(60, 4, true).temporaryInsanityCheckRequired).toBe(false);
    expect(applyCocSanityLoss(60, 5, false).temporaryInsanityCheckRequired).toBe(true);
  });

  it("does not reduce Sanity below zero", () => {
    expect(applyCocSanityLoss(3, 10, true).currentSanity).toBe(0);
  });
});