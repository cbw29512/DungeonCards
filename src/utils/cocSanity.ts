export type CocSanityLossState = {
  previousSanity: number;
  currentSanity: number;
  sanityLost: number;
  sanityRollFailed: boolean;
  involuntaryActionRequired: boolean;
  temporaryInsanityCheckRequired: boolean;
};

const validateSanity = (value: number): void => {
  if (!Number.isSafeInteger(value) || value < 0 || value > 100) {
    throw new Error("Sanity must be a whole number from 0 to 100.");
  }
};

export const isCocSanityRollSuccessful = (roll: number, currentSanity: number): boolean => {
  validateSanity(currentSanity);
  if (!Number.isSafeInteger(roll) || roll < 1 || roll > 100) {
    throw new Error("A Sanity roll must be a whole number from 1 to 100.");
  }
  return roll <= currentSanity;
};

export const applyCocSanityLoss = (
  currentSanity: number,
  sanityLost: number,
  sanityRollFailed: boolean
): CocSanityLossState => {
  validateSanity(currentSanity);
  if (!Number.isSafeInteger(sanityLost) || sanityLost < 0) {
    throw new Error("Sanity loss must be a non-negative whole number.");
  }

  const currentAfterLoss = Math.max(0, currentSanity - sanityLost);

  return {
    previousSanity: currentSanity,
    currentSanity: currentAfterLoss,
    sanityLost,
    sanityRollFailed,
    involuntaryActionRequired: sanityLost > 0,
    temporaryInsanityCheckRequired: sanityLost >= 5
  };
};
