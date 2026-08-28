import type { DndAbilityId } from "../types/dndCharacter";
import type { FightBattleState, FightSide } from "../types/fightBattle";
import type { FightFailedSaveRerollDefinition, FightRollMode } from "../types/fightRules";
import type { RandomIntegerSource } from "./randomInteger";
import { appendFightPresentationEvent } from "./fightPresentationEvents";
import { fightSaveRollMode } from "./fightRules";
import { rollDiceFormula } from "./rollDice";

const saveFormula = (bonus: number): string => `1d20${bonus >= 0 ? "+" : ""}${bonus}`;
const rawD20s = (result: ReturnType<typeof rollDiceFormula>): number[] =>
  result.dice[0]?.results?.length ? [...result.dice[0].results] : [1];

const keptNatural = (mode: FightRollMode, values: number[]): number => {
  if (mode === "advantage") return Math.max(...values);
  if (mode === "disadvantage") return Math.min(...values);
  return values[0] ?? 1;
};

const rerollOneDie = (
  mode: FightRollMode,
  original: number[],
  rerolled: number
): number => {
  if (mode === "normal" || original.length < 2) return rerolled;
  const sorted = [...original].sort((left, right) => left - right);
  const preserved = sorted[1] ?? sorted[0] ?? 1;
  if (mode === "advantage") return Math.max(preserved, rerolled);
  return Math.min(preserved, rerolled);
};

const maximumRecoverableNatural = (mode: FightRollMode, original: number[]): number => {
  if (mode !== "disadvantage" || original.length < 2) return 20;
  const sorted = [...original].sort((left, right) => left - right);
  return sorted[1] ?? 20;
};

const availableReroll = (
  state: FightBattleState,
  side: FightSide,
  baseBonus: number,
  dc: number,
  mode: FightRollMode,
  original: number[]
): FightFailedSaveRerollDefinition | undefined =>
  (state[side].profile.failedSaveRerolls ?? []).find((definition) => {
    if ((state[side].resources[definition.resourceId] ?? 0) <= 0) return false;
    if (definition.autoUse !== "when-can-succeed") return true;
    return maximumRecoverableNatural(mode, original) + baseBonus + definition.bonus >= dc;
  });

const spendReroll = (
  state: FightBattleState,
  side: FightSide,
  definition: FightFailedSaveRerollDefinition
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
    type: "save-reroll",
    delivery: "system",
    side,
    sourceSide: side,
    label: `${definition.name}: reroll saving throw`,
    sourceName: definition.name,
    iconKey: "reroll"
  });
};

export type FightSavingThrowResult = {
  state: FightBattleState;
  naturalRoll: number;
  total: number;
  succeeded: boolean;
  rerollName?: string;
};

export const resolveFightSavingThrow = ({
  state,
  side,
  ability,
  dc,
  randomInteger
}: {
  state: FightBattleState;
  side: FightSide;
  ability: DndAbilityId;
  dc: number;
  randomInteger?: RandomIntegerSource;
}): FightSavingThrowResult => {
  const baseBonus = state[side].profile.savingThrowBonuses?.[ability] ?? 0;
  const mode = fightSaveRollMode(state[side]);
  const initial = rollDiceFormula(saveFormula(baseBonus), {
    advantageMode: mode,
    randomInteger
  });
  const original = rawD20s(initial);
  const initialNatural = keptNatural(mode, original);
  if (initial.total >= dc) {
    return {
      state,
      naturalRoll: initialNatural,
      total: initial.total,
      succeeded: true
    };
  }

  const reroll = availableReroll(state, side, baseBonus, dc, mode, original);
  if (!reroll) {
    return {
      state,
      naturalRoll: initialNatural,
      total: initial.total,
      succeeded: false
    };
  }

  const rerolled = rollDiceFormula("1d20", { randomInteger });
  const replacement = rawD20s(rerolled)[0] ?? 1;
  const finalNatural = rerollOneDie(mode, original, replacement);
  const total = finalNatural + baseBonus + reroll.bonus;
  return {
    state: spendReroll(state, side, reroll),
    naturalRoll: finalNatural,
    total,
    succeeded: total >= dc,
    rerollName: reroll.name
  };
};
