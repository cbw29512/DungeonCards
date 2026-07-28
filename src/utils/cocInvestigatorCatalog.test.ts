import { describe, expect, it } from "vitest";
import { cocInvestigatorCatalog } from "../data/cocInvestigatorCatalog";
import {
  cocOccupationCatalog,
  cocOccupationCategories,
  getCocOccupation
} from "../data/cocOccupationCatalog";
import { cocWeaponCatalog } from "../data/cocWeaponCatalog";
import { adaptCocInvestigator } from "./cardPlatformCocInvestigatorAdapter";
import {
  isCthulhuMythosSkill,
  validateStandardCharacteristicAllocation
} from "./cocInvestigator";
import { validateCardDefinition } from "./cardPlatformValidation";

const normalizedSkill = (value: string): string => value
  .toLowerCase()
  .replace(/\([^)]*\)/g, "")
  .replace(/[^a-z]/g, "");

const skillMatches = (suggested: string, listed: string): boolean => {
  const left = normalizedSkill(suggested);
  const right = normalizedSkill(listed);
  return left === right || left.startsWith(right) || right.startsWith(left);
};

describe("Percentile Horror original occupation and Investigator libraries", () => {
  it("ships 24 unique occupations across every category and both eras", () => {
    expect(cocOccupationCatalog).toHaveLength(24);
    expect(new Set(cocOccupationCatalog.map((occupation) => occupation.id)).size).toBe(cocOccupationCatalog.length);
    expect(new Set(cocOccupationCatalog.map((occupation) => occupation.name)).size).toBe(cocOccupationCatalog.length);
    expect(new Set(cocOccupationCatalog.map((occupation) => occupation.category))).toEqual(new Set(cocOccupationCategories));
    expect(new Set(cocOccupationCatalog.flatMap((occupation) => occupation.eras))).toEqual(new Set(["1920s", "modern"]));
  });

  it("keeps every occupation package complete and public-safe", () => {
    for (const occupation of cocOccupationCatalog) {
      expect(occupation.id).toMatch(/^coc-original-/);
      expect(occupation.summary.length).toBeGreaterThan(80);
      expect(occupation.suggestedSkills).toHaveLength(8);
      expect(new Set(occupation.suggestedSkills.map((skill) => skill.toLowerCase())).size).toBe(8);
      expect(occupation.suggestedSkills.some(isCthulhuMythosSkill)).toBe(false);
      expect(occupation.creditRatingRange[0]).toBeGreaterThanOrEqual(0);
      expect(occupation.creditRatingRange[1]).toBeLessThanOrEqual(99);
      expect(occupation.creditRatingRange[0]).toBeLessThanOrEqual(occupation.creditRatingRange[1]);
      expect(occupation.contacts.length).toBeGreaterThanOrEqual(3);
      expect(occupation.typicalGear.length).toBeGreaterThanOrEqual(3);
      expect(occupation.complication.length).toBeGreaterThan(60);
    }
  });

  it("ships 12 complete premade Investigators split evenly between eras", () => {
    expect(cocInvestigatorCatalog).toHaveLength(12);
    expect(new Set(cocInvestigatorCatalog.map((investigator) => investigator.id)).size).toBe(cocInvestigatorCatalog.length);
    expect(new Set(cocInvestigatorCatalog.map((investigator) => investigator.name)).size).toBe(cocInvestigatorCatalog.length);
    expect(cocInvestigatorCatalog.filter((investigator) => investigator.era === "1920s")).toHaveLength(6);
    expect(cocInvestigatorCatalog.filter((investigator) => investigator.era === "modern")).toHaveLength(6);
  });

  it("keeps each premade sheet valid, linked, and ready for play", () => {
    const weaponIds = new Set(cocWeaponCatalog.map((weapon) => weapon.id));

    for (const investigator of cocInvestigatorCatalog) {
      const occupation = getCocOccupation(investigator.occupationId);
      const listedSkills = Object.entries(investigator.skills);
      const matchedOccupationSkills = occupation.suggestedSkills.filter((suggested) => (
        listedSkills.some(([listed]) => skillMatches(suggested, listed))
      ));

      expect(occupation.eras).toContain(investigator.era);
      expect(validateStandardCharacteristicAllocation(investigator.characteristics)).toBe(true);
      expect(investigator.age).toBeGreaterThanOrEqual(18);
      expect(investigator.luck).toBeGreaterThan(0);
      expect(investigator.luck).toBeLessThanOrEqual(99);
      expect(listedSkills.length).toBeGreaterThanOrEqual(13);
      expect(listedSkills.every(([, value]) => Number.isInteger(value) && value >= 1 && value <= 100)).toBe(true);
      expect(listedSkills.some(([skill]) => isCthulhuMythosSkill(skill))).toBe(false);
      expect(matchedOccupationSkills.length).toBeGreaterThanOrEqual(6);
      expect(investigator.weaponIds.every((weaponId) => weaponIds.has(weaponId))).toBe(true);
      expect(investigator.biography.length).toBeGreaterThan(180);
      expect(investigator.ideology.length).toBeGreaterThan(50);
      expect(investigator.significantPeople.length).toBeGreaterThanOrEqual(2);
      expect(investigator.meaningfulLocations.length).toBeGreaterThanOrEqual(2);
      expect(investigator.treasuredPossessions.length).toBeGreaterThanOrEqual(2);
      expect(investigator.traits.length).toBeGreaterThanOrEqual(3);
      expect(investigator.notes.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("adapts every Investigator into a valid player-safe Card Platform sheet", () => {
    for (const investigator of cocInvestigatorCatalog) {
      const card = adaptCocInvestigator(investigator);
      expect(card).toMatchObject({
        gameSystemId: "coc-7e",
        family: "investigator",
        visibility: "player-safe",
        source: {
          kind: "original",
          publicDistributionAllowed: true
        }
      });
      expect(card.actions).toHaveLength(6);
      expect(card.resources).toHaveLength(4);
      expect(card.resources.map((resource) => resource.id)).toEqual([
        "hit-points",
        "sanity",
        "magic-points",
        "luck"
      ]);
      expect(card.linkedCardIds).toHaveLength(investigator.weaponIds.length);
      expect(validateCardDefinition(card)).toEqual([]);
    }
  });
});
