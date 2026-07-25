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
  it("requires an involuntary action whenever a successful Sanity roll still loses SAN", () => {
    const state = applyCocSanityLoss(60, 1, false);

    expect(state.currentSanity).toBe(59);
    expect(state.sanityRollFailed).toBe(false);
    expect(state.involuntaryActionRequired).toBe(true);
  });

  it("does not require an involuntary action when no Sanity is lost", () => {
    const state = applyCocSanityLoss(60, 0, true);

    expect(state.currentSanity).toBe(60);
    expect(state.sanityRollFailed).toBe(true);
    expect(state.involuntaryActionRequired).toBe(false);
  });

  it("requires the temporary-insanity INT check at 5 SAN loss", () => {
    expect(applyCocSanityLoss(60, 4, true).temporaryInsanityCheckRequired).toBe(false);
    expect(applyCocSanityLoss(60, 5, false).temporaryInsanityCheckRequired).toBe(true);
  });

  it("does not reduce Sanity below zero", () => {
    expect(applyCocSanityLoss(3, 10, true).currentSanity).toBe(0);
  });
});
