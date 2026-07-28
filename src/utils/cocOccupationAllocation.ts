import type { CocOccupationRecord } from "../types/cocInvestigatorCatalog";
import { COC_OCCUPATION_VALUES } from "./cocInvestigator";

export type CocOccupationValueAllocation = {
  skillValues: number[];
  creditRating: number;
};

export const buildCocOccupationValueAllocation = (
  occupation: CocOccupationRecord
): CocOccupationValueAllocation => {
  const [minimum, maximum] = occupation.creditRatingRange;
  const creditRating = [...new Set(COC_OCCUPATION_VALUES)]
    .sort((left, right) => left - right)
    .find((value) => value >= minimum && value <= maximum);
  if (creditRating === undefined) {
    throw new Error(`${occupation.name} has no Credit Rating value compatible with the public fixed allocation.`);
  }

  const remaining = [...COC_OCCUPATION_VALUES];
  const creditIndex = remaining.indexOf(creditRating);
  remaining.splice(creditIndex, 1);
  return {
    creditRating,
    skillValues: remaining
  };
};

export const isCocOccupationCreditRatingValid = (
  occupation: CocOccupationRecord,
  value: number
): boolean => value >= occupation.creditRatingRange[0] && value <= occupation.creditRatingRange[1];