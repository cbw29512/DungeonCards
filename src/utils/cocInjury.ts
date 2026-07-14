export type CocInjuryOutcome = {
  previousHitPoints: number;
  currentHitPoints: number;
  damage: number;
  majorWoundInflicted: boolean;
  instantDeath: boolean;
  unconsciousAtZeroHitPoints: boolean;
  dying: boolean;
  requiresConsciousnessRoll: boolean;
  majorWoundThreshold: number;
};

const validateWholeNumber = (label: string, value: number, minimum: number): void => {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new Error(`${label} must be a whole number of at least ${minimum}.`);
  }
};

export const resolveCocInjury = (
  maximumHitPoints: number,
  currentHitPoints: number,
  damage: number,
  alreadyHasMajorWound = false
): CocInjuryOutcome => {
  validateWholeNumber("Maximum Hit Points", maximumHitPoints, 1);
  validateWholeNumber("Current Hit Points", currentHitPoints, 0);
  validateWholeNumber("Damage", damage, 0);

  if (currentHitPoints > maximumHitPoints) {
    throw new Error("Current Hit Points cannot exceed Maximum Hit Points.");
  }

  const majorWoundThreshold = Math.ceil(maximumHitPoints / 2);
  const instantDeath = damage >= maximumHitPoints;
  const majorWoundInflicted = damage >= majorWoundThreshold;
  const currentAfterDamage = instantDeath ? 0 : Math.max(0, currentHitPoints - damage);
  const hasMajorWound = alreadyHasMajorWound || majorWoundInflicted;
  const unconsciousAtZeroHitPoints = currentAfterDamage === 0 && !instantDeath;
  const dying = unconsciousAtZeroHitPoints && hasMajorWound;

  return {
    previousHitPoints: currentHitPoints,
    currentHitPoints: currentAfterDamage,
    damage,
    majorWoundInflicted,
    instantDeath,
    unconsciousAtZeroHitPoints,
    dying,
    requiresConsciousnessRoll: majorWoundInflicted && !instantDeath,
    majorWoundThreshold
  };
};