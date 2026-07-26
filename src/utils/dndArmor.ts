import { dndSizeCarryingMultipliers } from "../data/dndArmor";
import type {
  DndArmorDefinition,
  DndCreatureSize,
  DndLoadStatus,
  DndVariantEncumbranceStatus
} from "../types/dndArmor";
import type { RulesetId } from "../types/ruleCards";

export type DndArmorCalculation = {
  armorClass: number;
  shieldBonus: number;
  armorDexterityContribution: number;
  speedPenaltyFeet: number;
  stealthDisadvantage: boolean;
  trainingIssue: boolean;
  trainingSummary: string | null;
};

export type DndCapacityCalculation = {
  carryingCapacity: number;
  pushDragLiftMaximum: number;
  loadStatus: DndLoadStatus;
  speedMaximumFeet?: number;
};

const normalizeInteger = (value: number): number => Math.trunc(Number.isFinite(value) ? value : 0);
const normalizeWeight = (value: number): number => Math.max(0, Number.isFinite(value) ? value : 0);

export const calculateArmorDexterityContribution = (
  armor: DndArmorDefinition | undefined,
  dexterityModifier: number
): number => {
  const modifier = normalizeInteger(dexterityModifier);
  if (!armor) return modifier;
  if (armor.dexterityMode === "none") return 0;
  if (armor.dexterityMode === "max-2") return Math.min(2, modifier);
  return modifier;
};

export const calculateDndArmor = ({
  ruleset,
  armor,
  dexterityModifier,
  strengthScore,
  armorTrained,
  shieldEquipped,
  shieldTrained,
  ignoreArmorStrengthRequirement = false
}: {
  ruleset: RulesetId;
  armor?: DndArmorDefinition;
  dexterityModifier: number;
  strengthScore: number;
  armorTrained: boolean;
  shieldEquipped: boolean;
  shieldTrained: boolean;
  ignoreArmorStrengthRequirement?: boolean;
}): DndArmorCalculation => {
  const dexterityContribution = calculateArmorDexterityContribution(armor, dexterityModifier);
  const baseArmorClass = armor ? armor.baseArmorClass : 10;
  const shieldBonus = shieldEquipped && (ruleset === "srd-5.1-2014" || shieldTrained) ? 2 : 0;
  const armorTrainingIssue = Boolean(armor && !armorTrained);
  const shieldTrainingIssue = ruleset === "srd-5.1-2014" && shieldEquipped && !shieldTrained;
  const trainingIssue = armorTrainingIssue || shieldTrainingIssue;
  const strength = Math.max(0, normalizeInteger(strengthScore));
  const speedPenaltyFeet = armor?.strengthRequirement
    && strength < armor.strengthRequirement
    && !ignoreArmorStrengthRequirement
    ? 10
    : 0;

  return {
    armorClass: baseArmorClass + dexterityContribution + shieldBonus,
    shieldBonus,
    armorDexterityContribution: dexterityContribution,
    speedPenaltyFeet,
    stealthDisadvantage: Boolean(armor?.stealthDisadvantage),
    trainingIssue,
    trainingSummary: trainingIssue
      ? ruleset === "srd-5.1-2014"
        ? "Disadvantage applies to Strength- or Dexterity-based ability checks, saving throws, and attack rolls, and you can’t cast spells."
        : "Disadvantage applies to D20 Tests involving Strength or Dexterity, and you can’t cast spells."
      : null
  };
};

export const calculateDndCapacity = (
  strengthScore: number,
  size: DndCreatureSize,
  carriedWeight: number
): DndCapacityCalculation => {
  const strength = Math.max(0, normalizeInteger(strengthScore));
  const weight = normalizeWeight(carriedWeight);
  const multipliers = dndSizeCarryingMultipliers[size];
  const carryingCapacity = strength * multipliers.carry;
  const pushDragLiftMaximum = strength * multipliers.pushDragLift;

  if (weight <= carryingCapacity) {
    return { carryingCapacity, pushDragLiftMaximum, loadStatus: "within-capacity" };
  }
  if (weight <= pushDragLiftMaximum) {
    return {
      carryingCapacity,
      pushDragLiftMaximum,
      loadStatus: "over-carrying-capacity",
      speedMaximumFeet: 5
    };
  }
  return { carryingCapacity, pushDragLiftMaximum, loadStatus: "over-push-drag-lift" };
};

export const calculate2014VariantEncumbrance = (
  strengthScore: number,
  size: DndCreatureSize,
  carriedWeight: number
): DndVariantEncumbranceStatus => {
  const strength = Math.max(0, normalizeInteger(strengthScore));
  const weight = normalizeWeight(carriedWeight);
  const carryingCapacity = strength * dndSizeCarryingMultipliers[size].carry;

  if (weight > carryingCapacity) return "over-capacity";
  if (weight > strength * 10) return "heavily-encumbered";
  if (weight > strength * 5) return "encumbered";
  return "normal";
};

export const calculateLoadoutWeight = (
  armor: DndArmorDefinition | undefined,
  shieldEquipped: boolean,
  otherWeight: number
): number => normalizeWeight(otherWeight) + (armor?.weightPounds ?? 0) + (shieldEquipped ? 6 : 0);
