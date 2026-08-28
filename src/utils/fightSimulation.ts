import type { FightCombatantProfile } from "../types/fightMatchmaker";
import {
  createFightBattle,
  resolveFightInitiativeTie,
  rollFightInitiative,
  runFightToCompletion
} from "./fightBattle";
import type { RandomIntegerSource } from "./randomInteger";

export type FightSimulationSummary = {
  iterations: number;
  seed: number;
  characterWins: number;
  monsterWins: number;
  unresolved: number;
  characterWinRate: number;
  monsterWinRate: number;
  medianRounds: number;
  averageRounds: number;
  averageCharacterHitPointsOnWin: number;
  averageMonsterHitPointsOnWin: number;
};

const clampIterations = (value: number): number => Math.min(5000, Math.max(1, Math.trunc(value)));
const roundOne = (value: number): number => Math.round(value * 10) / 10;
const average = (values: number[]): number => values.length
  ? values.reduce((sum, value) => sum + value, 0) / values.length
  : 0;

const median = (values: number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

export const stableFightSimulationSeed = (...values: string[]): number => {
  let hash = 2166136261;
  for (const character of values.join("|")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const createSeededFightRandomInteger = (seed: number): RandomIntegerSource => {
  let state = (Math.trunc(seed) >>> 0) || 0x6d2b79f5;
  return (minimum, maximum) => {
    if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) || maximum < minimum) {
      throw new Error("Random integer bounds must be safe integers in ascending order.");
    }
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const span = maximum - minimum + 1;
    return minimum + Math.floor((state / 0x100000000) * span);
  };
};

export const simulateFightMatchup = ({
  character,
  monster,
  iterations = 500,
  seed = stableFightSimulationSeed(character.id, monster.id, character.ruleset)
}: {
  character: FightCombatantProfile;
  monster: FightCombatantProfile;
  iterations?: number;
  seed?: number;
}): FightSimulationSummary => {
  const sampleSize = clampIterations(iterations);
  const randomInteger = createSeededFightRandomInteger(seed);
  const rounds: number[] = [];
  const characterWinHitPoints: number[] = [];
  const monsterWinHitPoints: number[] = [];
  let characterWins = 0;
  let monsterWins = 0;
  let unresolved = 0;

  for (let index = 0; index < sampleSize; index += 1) {
    let fight = rollFightInitiative(createFightBattle(character, monster), randomInteger);
    if (fight.status === "initiative-tie") {
      fight = resolveFightInitiativeTie(fight, randomInteger(0, 1) === 0 ? "character" : "monster");
    }
    fight = runFightToCompletion(fight, randomInteger);
    rounds.push(fight.round);

    if (fight.status !== "complete" || !fight.winner) {
      unresolved += 1;
      continue;
    }
    if (fight.winner === "character") {
      characterWins += 1;
      characterWinHitPoints.push(fight.character.currentHitPoints);
    } else {
      monsterWins += 1;
      monsterWinHitPoints.push(fight.monster.currentHitPoints);
    }
  }

  return {
    iterations: sampleSize,
    seed: seed >>> 0,
    characterWins,
    monsterWins,
    unresolved,
    characterWinRate: roundOne((characterWins / sampleSize) * 100),
    monsterWinRate: roundOne((monsterWins / sampleSize) * 100),
    medianRounds: roundOne(median(rounds)),
    averageRounds: roundOne(average(rounds)),
    averageCharacterHitPointsOnWin: roundOne(average(characterWinHitPoints)),
    averageMonsterHitPointsOnWin: roundOne(average(monsterWinHitPoints))
  };
};
