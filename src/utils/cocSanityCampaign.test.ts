import { describe, expect, it } from "vitest";
import {
  addSanityCampaignEffect,
  resolveMonthlyPsychoanalysis,
  rollIndefiniteCareMonths,
  toggleSanityCampaignEffect
} from "./cocSanityCampaign";

describe("Call of Cthulhu sanity campaign state", () => {
  it("rolls institutional care duration as 1D6 months", () => {
    expect(rollIndefiniteCareMonths(() => 1)).toBe(1);
    expect(rollIndefiniteCareMonths(() => 6)).toBe(6);
  });

  it("regains 1D3 Sanity on successful monthly Psychoanalysis", () => {
    expect(resolveMonthlyPsychoanalysis(40, 60, 35, () => 3)).toMatchObject({
      sanityChange: 3,
      nextSanity: 43,
      treatmentConcludes: false
    });
  });

  it("makes no change on failure", () => {
    expect(resolveMonthlyPsychoanalysis(40, 60, 75, () => 3)).toMatchObject({
      sanityChange: 0,
      nextSanity: 40,
      treatmentConcludes: false
    });
  });

  it("loses 1D6 Sanity and concludes treatment on a fumble", () => {
    expect(resolveMonthlyPsychoanalysis(40, 45, 98, () => 4)).toMatchObject({
      sanityChange: -4,
      nextSanity: 36,
      treatmentConcludes: true
    });
  });

  it("caps regained Sanity at 99 without inventing negative values", () => {
    expect(resolveMonthlyPsychoanalysis(98, 80, 20, () => 3).nextSanity).toBe(99);
    expect(resolveMonthlyPsychoanalysis(2, 45, 98, () => 6).nextSanity).toBe(0);
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
