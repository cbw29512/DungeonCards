import type {
  CoverBenefit,
  CoverDegree,
  DndJumpResult,
  MovementMode
} from "../types/dndMovement";

const nonNegative = (value: number): number => Math.max(0, Number.isFinite(value) ? value : 0);

export const calculateMovementCost = (
  distanceFeet: number,
  mode: MovementMode,
  difficultTerrain: boolean,
  hasMatchingSpeed: boolean
): number => {
  const distance = nonNegative(distanceFeet);
  const specialMovementCost = mode !== "walk" && !hasMatchingSpeed ? 1 : 0;
  const difficultTerrainCost = difficultTerrain ? 1 : 0;
  return distance * (1 + specialMovementCost + difficultTerrainCost);
};

export const calculateJumpDistances = (
  strengthScore: number,
  strengthModifier: number
): DndJumpResult => {
  const runningLongJump = nonNegative(Math.trunc(strengthScore));
  const runningHighJump = nonNegative(3 + Math.trunc(strengthModifier));
  return {
    runningLongJump,
    standingLongJump: runningLongJump / 2,
    runningHighJump,
    standingHighJump: runningHighJump / 2
  };
};

export const calculate2024GrappleShoveDc = (
  strengthModifier: number,
  proficiencyBonus: number
): number => 8 + Math.trunc(strengthModifier) + Math.max(0, Math.trunc(proficiencyBonus));

export const getCoverBenefit = (degree: CoverDegree): CoverBenefit => {
  if (degree === "half") {
    return {
      armorClassBonus: 2,
      dexteritySaveBonus: 2,
      canBeTargetedDirectly: true,
      summary: "+2 AC and +2 to Dexterity saving throws."
    };
  }
  if (degree === "three-quarters") {
    return {
      armorClassBonus: 5,
      dexteritySaveBonus: 5,
      canBeTargetedDirectly: true,
      summary: "+5 AC and +5 to Dexterity saving throws."
    };
  }
  if (degree === "total") {
    return {
      armorClassBonus: 0,
      dexteritySaveBonus: 0,
      canBeTargetedDirectly: false,
      summary: "The target cannot be targeted directly by an attack or spell."
    };
  }
  return {
    armorClassBonus: 0,
    dexteritySaveBonus: 0,
    canBeTargetedDirectly: true,
    summary: "No cover benefit."
  };
};
