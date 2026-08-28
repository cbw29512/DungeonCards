import type { FightBattleState } from "../types/fightBattle";

export const FIGHT_WATCHED_STARTING_DISTANCE_FEET = 30;
export const FIGHT_AVERAGE_STARTING_DISTANCES_FEET = [30, 60, 90] as const;

export const normalizeFightStartingDistance = (value: number): number => {
  if (!Number.isFinite(value)) throw new Error("Fight starting distance must be finite.");
  return Math.max(0, Math.min(1000, Math.round(value)));
};

export const normalizeFightStartingDistances = (values: readonly number[] | undefined): number[] => {
  const normalized = (values?.length ? values : FIGHT_AVERAGE_STARTING_DISTANCES_FEET)
    .map(normalizeFightStartingDistance);
  return [...new Set(normalized)];
};

export const fightStartingDistanceForIteration = (
  iteration: number,
  values?: readonly number[]
): number => {
  const distances = normalizeFightStartingDistances(values);
  return distances[Math.abs(Math.trunc(iteration)) % distances.length];
};

export const setFightStartingDistance = (
  state: FightBattleState,
  distanceFeet: number
): FightBattleState => {
  const distance = normalizeFightStartingDistance(distanceFeet);
  return {
    ...state,
    distanceFeet: distance,
    character: { ...state.character, positionFeet: 0 },
    monster: { ...state.monster, positionFeet: distance }
  };
};
