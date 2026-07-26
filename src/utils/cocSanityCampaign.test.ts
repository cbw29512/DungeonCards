import { describe, expect, it } from "vitest";
import {
  addSanityCampaignEffect,
  calculateMaximumSanity,
  resolveMonthlyPsychoanalysis,
  rollIndefiniteCareMonths,
  toggleSanityCampaignEffect
} from "./cocSanityCampaign";

describe("Call of Cthulhu sanity campaign state", () => {
  it("rolls institutional care duration as 1D6 months", () => {
    expect(rollIndefiniteCareMonths(() => 1)).toBe(1);
    expect(rollIndefiniteCareMonths(() => 6)).toBe(6);
  });

  it("calculates maximum Sanity from Cthulhu Mythos", () => {
    expect(calculateMaximumSanity(0)).toBe(99);
    expect(calculateMaximumSanity(24)).toBe(75);
    expect(calculateMaximumSanity(150)).toBe(0);
  });

  it("regains 1D3 Sanity on successful monthly Psychoanalysis", () => {
    expect(resolveMonthlyPsychoanalysis(40, 60, 35, 99, () => 3)).toMatchObject({
      sanityChange: 3,
      nextSanity: 43,
      treatmentConcludes: false
    });
  });

  it("makes no change on failure", () => {
    expect(resolveMonthlyPsychoanalysis(40, 60, 75, 99, () => 3)).toMatchObject({
      sanityChange: 0,
      nextSanity: 40,
      treatmentConcludes: false
    });
  });

  it("loses 1D6 Sanity and concludes treatment on a fumble", () => {
    expect(resolveMonthlyPsychoanalysis(40, 45, 98, 99, () => 4)).toMatchObject({
      sanityChange: -4,
      nextSanity: 36,
      treatmentConcludes: true
    });
  });

  it("respects maximum Sanity and never records a negative value", () => {
    expect(resolveMonthlyPsychoanalysis(74, 80, 20, 75, () => 3).nextSanity).toBe(75);
    expect(resolveMonthlyPsychoanalysis(2, 45, 98, 99, () => 6).nextSanity).toBe(0);
  });

  it("adds and resolves persistent campaign effects", () => {
    const effects = addSanityCampaignEffect([], {
      id: "effect-1",
      type: "phobia",
      description: " Fear of mirrors ",
      active: true
    });
    expect(effects[0].description).toBe("Fear of mirrors");
    expect(toggleSanityCampaignEffect(effects, "effect-1")[0].active).toBe(false);
    expect(addSanityCampaignEffect(effects, {
      id: "empty",
      type: "other",
      description: "   ",
      active: true
    })).toHaveLength(1);
  });
});
