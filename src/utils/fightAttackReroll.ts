import type { FightBattleState, FightSide } from "../types/fightBattle";
import type { FightAttackAction, FightFailedAttackRerollDefinition, FightRollMode } from "../types/fightRules";
import type { RandomIntegerSource } from "./randomInteger";
import { appendFightPresentationEvent } from "./fightPresentationEvents";
import { rollDiceFormula } from "./rollDice";

const attackFormula = (bonus: number): string => `1d20${bonus >= 0 ? "+" : ""}${bonus}`;
const rawD20s = (result: ReturnType<typeof rollDiceFormula>): number[] =>
  result.dice[0]?.results?.length ? [...result.dice[0].results] : [1];

const keptNatural = (mode: FightRollMode, values: number[]): number => {
  if (mode === "advantage") return Math.max(...values);
  if (mode === "disadvantage") return Math.min(...values);
  return values[0] ?? 1;
};

const rerollOneDie = (mode: FightRollMode, original: number[], rerolled: number): number => {
  if (mode === "normal" || original.length < 2) return rerolled;
  const sorted = [...original].sort((left, right) => left - right);
  const preserved = sorted[1] ?? sorted[0] ?? 1;
  return mode === "advantage" ? Math.max(preserved, rerolled) : Math.min(preserved, rerolled);
};

const maximumRecoverableNatural = (mode: FightRollMode, original: number[]): number => {
  if (mode !== "disadvantage" || original.length < 2) return 20;
  const sorted = [...original].sort((left, right) => left - right);
  return sorted[1] ?? 20;
};

export const fightAttackHits = ({
  natural,
  total,
  armorClass,
  criticalAt
}: {
  natural: number;
  total: number;
  armorClass: number;
  criticalAt: number;
}): boolean => natural >= criticalAt || (natural !== 1 && total >= armorClass);

const availableReroll = (
  state: FightBattleState,
  side: FightSide,
  action: FightAttackAction,
  armorClass: number,
  criticalAt: number,
  mode: FightRollMode,
  original: number[]
): FightFailedAttackRerollDefinition | undefined =>
  (state[side].profile.failedAttackRerolls ?? []).find((definition) => {
    if ((state[side].resources[definition.resourceId] ?? 0) <= 0) return false;
    if (definition.autoUse === "always") return true;
    const maximumNatural = maximumRecoverableNatural(mode, original);
    return fightAttackHits({
      natural: maximumNatural,
      total: maximumNatural + action.attackBonus,
      armorClass,
      criticalAt
    });
  });

const spendReroll = (
  state: FightBattleState,
  side: FightSide,
  definition: FightFailedAttackRerollDefinition
): FightBattleState => {
  const remaining = Math.max(0, (state[side].resources[definition.resourceId] ?? 0) - 1);
  let next: FightBattleState = {
    ...state,
    [side]: {
      ...state[side],
      resources: { ...state[side].resources, [definition.resourceId]: remaining }
    }
  };
  next = appendFightPresentationEvent(next, {
    type: "resource-used",
    delivery: "system",
    side,
    sourceSide: side,
    label: `${definition.name} used`,
    sourceName: definition.name,
    amount: 1,
    iconKey: "resource"
  });
  return appendFightPresentationEvent(next, {
    type: "attack-reroll",
    delivery: "system",
    side,
    sourceSide: side,
    label: `${definition.name}: reroll attack`,
    sourceName: definition.name,
    iconKey: "reroll"
  });
};

export type FightAttackRollResult = {
  state: FightBattleState;
  naturalRoll: number;
  total: number;
  rerollName?: string;
};

export const resolveFightAttackRoll = ({
  state,
  side,
  action,
  armorClass,
  rollMode,
  randomInteger
}: {
  state: FightBattleState;
  side: FightSide;
  action: FightAttackAction;
  armorClass: number;
  rollMode: FightRollMode;
  randomInteger?: RandomIntegerSource;
}): FightAttackRollResult => {
  const criticalAt = Math.min(20, Math.max(2, Math.trunc(action.criticalAt ?? 20)));
  const initial = rollDiceFormula(attackFormula(action.attackBonus), {
    advantageMode: rollMode,
    naturalRollRule: "attack",
    randomInteger
  });
  const original = rawD20s(initial);
  const initialNatural = keptNatural(rollMode, original);
  if (fightAttackHits({ natural: initialNatural, total: initial.total, armorClass, criticalAt })) {
    return { state, naturalRoll: initialNatural, total: initial.total };
  }

  const reroll = availableReroll(state, side, action, armorClass, criticalAt, rollMode, original);
  if (!reroll) return { state, naturalRoll: initialNatural, total: initial.total };

  const replacementRoll = rollDiceFormula("1d20", { randomInteger });
  const replacement = rawD20s(replacementRoll)[0] ?? 1;
  const finalNatural = rerollOneDie(rollMode, original, replacement);
  return {
    state: spendReroll(state, side, reroll),
    naturalRoll: finalNatural,
    total: finalNatural + action.attackBonus,
    rerollName: reroll.name
  };
};
