import { describe, expect, it } from "vitest";
import { cocOccupationCatalog, getCocOccupation } from "../data/cocOccupationCatalog";
import { validateOccupationValueAllocation } from "./cocInvestigator";
import {
  buildCocOccupationValueAllocation,
  isCocOccupationCreditRatingValid
} from "./cocOccupationAllocation";

describe("original occupation value allocation", () => {
  it("loads every occupation with a legal Credit Rating and the exact public value array", () => {
    for (const occupation of cocOccupationCatalog) {
      const allocation = buildCocOccupationValueAllocation(occupation);
      expect(allocation.skillValues).toHaveLength(8);
      expect(isCocOccupationCreditRatingValid(occupation, allocation.creditRating)).toBe(true);
      expect(validateOccupationValueAllocation([
        ...allocation.skillValues,
        allocation.creditRating
      ])).toBe(true);
    }
  });

  it("does not mark high-credit occupations ready with Credit Rating 40", () => {
    const wealthManager = getCocOccupation("coc-original-wealth-manager");
    const allocation = buildCocOccupationValueAllocation(wealthManager);
    expect(allocation.creditRating).toBe(50);
    expect(isCocOccupationCreditRatingValid(wealthManager, 40)).toBe(false);
  });
});