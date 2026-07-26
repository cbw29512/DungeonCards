import type { ArmorDefinition, ArmorRuleset } from "../data/armorCatalog";

export type CreatureSize = "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";

export type ArmorOutcome = {
  armorClass: number;
  speedPenalty: number;
  stealthDisadvantage: boolean;
  trainingWarning?: string;
  shieldBonusApplied: boolean;
};

export type CarryingOutcome = {
  carryingCapacity: number;
  pushDragLift: number;
  loadStatus: "within-capacity" | "encumbered" | "heavily-encumbered" | "over-capacity";
  speedPenalty: number;
  pushDragSpeedLimitedToFive: boolean;
  disadvantageOnPhysicalTests: boolean;
};

const sizeMultiplier: Record<CreatureSize, number> = {
  Tiny: 0.5,
  Small: 1,
  Medium: 1,
  Large: 2,
  Huge: 4,
  Gargantuan: 8
};

const clampInteger = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, Math.trunc(value) || 0));

export const calculateArmorClass = (
  armor: ArmorDefinition,
  dexterityModifier: number
): number => {
  if (armor.category === "Shield") return 2;
  const dexterity = clampInteger(dexterityModifier, -10, 20);
  if (armor.dexterity === "full") return armor.baseAc + dexterity;
  if (armor.dexterity === "max-2") return armor.baseAc + Math.min(2, dexterity);
  return armor.baseAc;
};

export const resolveArmorOutcome = ({
  ruleset,
  armor,
  dexterityModifier,
  strengthScore,
  armorTrained,
  shieldEquipped,
  shieldTrained
}: {
  ruleset: ArmorRuleset;
  armor: ArmorDefinition;
  dexterityModifier: number;
  strengthScore: number;
  armorTrained: boolean;
  shieldEquipped: boolean;
  shieldTrained: boolean;
}): ArmorOutcome => {
  const strength = clampInteger(strengthScore, 1, 30);
  const shieldBonusApplied = shieldEquipped && (ruleset === "dnd-2014" || shieldTrained);
  const armorClass = calculateArmorClass(armor, dexterityModifier) + (shieldBonusApplied ? 2 : 0);
  const speedPenalty = armor.strengthRequired && strength < armor.strengthRequired ? 10 : 0;

  let trainingWarning: string | undefined;
  if (!armorTrained) {
    trainingWarning = ruleset === "dnd-2014"
      ? "No proficiency: Disadvantage on Strength- or Dexterity-based ability checks, saving throws, and attack rolls; spellcasting is unavailable."
      : "No armor training: Disadvantage on D20 Tests involving Strength or Dexterity; spellcasting is unavailable.";
  } else if (ruleset === "dnd-2024" && shieldEquipped && !shieldTrained) {
    trainingWarning = "No Shield training: the Shield provides no AC bonus.";
  }

  return {
    armorClass,
    speedPenalty,
    stealthDisadvantage: armor.stealthDisadvantage,
    trainingWarning,
    shieldBonusApplied
  };
};

export const calculateCarryingOutcome = ({
  ruleset,
  strengthScore,
  size,
  carriedWeight,
  use2014VariantEncumbrance = false,
  pushingDraggingOrLifting = false
}: {
  ruleset: ArmorRuleset;
  strengthScore: number;
  size: CreatureSize;
  carriedWeight: number;
  use2014VariantEncumbrance?: boolean;
  pushingDraggingOrLifting?: boolean;
}): CarryingOutcome => {
  const strength = clampInteger(strengthScore, 1, 30);
  const weight = Math.max(0, Number.isFinite(carriedWeight) ? carriedWeight : 0);
  const multiplier = sizeMultiplier[size];
  const carryingCapacity = strength * 15 * multiplier;
  const pushDragLift = strength * 30 * multiplier;
  const variantEnabled = ruleset === "dnd-2014" && use2014VariantEncumbrance;
  const encumberedThreshold = strength * 5;
  const heavilyEncumberedThreshold = strength * 10;

  let loadStatus: CarryingOutcome["loadStatus"] = "within-capacity";
  let speedPenalty = 0;
  let disadvantageOnPhysicalTests = false;

  if (weight > carryingCapacity) {
    loadStatus = "over-capacity";
  } else if (variantEnabled && weight > heavilyEncumberedThreshold) {
    loadStatus = "heavily-encumbered";
    speedPenalty = 20;
    disadvantageOnPhysicalTests = true;
  } else if (variantEnabled && weight > encumberedThreshold) {
    loadStatus = "encumbered";
    speedPenalty = 10;
  }

  return {
    carryingCapacity,
    pushDragLift,
    loadStatus,
    speedPenalty,
    pushDragSpeedLimitedToFive: pushingDraggingOrLifting && weight > carryingCapacity && weight <= pushDragLift,
    disadvantageOnPhysicalTests
  };
};
