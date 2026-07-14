import { describe, expect, it } from "vitest";
import { applyCocSanityLoss, isCocSanityRollSuccessful } from "./cocSanity";

describe("isCocSanityRollSuccessful", () => {
  it("succeeds on a roll equal to current Sanity", () => {
    expect(isCocSanityRollSuccessful(60, 60)).toBe(true);
  });

  it("fails on a roll over current Sanity", () => {
    expect(isCocSanityRollSuccessful(61, 60)).toBe(false);
  });
});

describe("applyCocSanityLoss", () => {
  it("does not require an involuntary action when no SAN is lost", () => {
    const state = applyCocSanityLoss(60, 0);

    expect(state.currentSanity).toBe(60);
    expect(state.involuntaryActionRequired).toBe(false);
    expect(state.temporaryInsanityCheckRequired).toBe(false);
  });

  it("requires an involuntary action for any positive SAN loss", () => {
    expect(applyCocSanityLoss(60, 1).involuntaryActionRequired).toBe(true);
  });

  it("requires the temporary-insanity INT check at 5 SAN loss", () => {
    expect(applyCocSanityLoss(60, 4).temporaryInsanityCheckRequired).toBe(false);
    expect(applyCocSanityLoss(60, 5).temporaryInsanityCheckRequired).toBe(true);
  });

  it("does not reduce Sanity below zero", () => {
    expect(applyCocSanityLoss(3, 10).currentSanity).toBe(0);
  });
});