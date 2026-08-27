import type {
  FightBattleState,
  FightEffectState,
  FightEffectTickTiming,
  FightSide
} from "../types/fightBattle";

const normalizeEffect = (effect: FightEffectState): FightEffectState => ({
  ...effect,
  id: effect.id.trim(),
  name: effect.name.trim(),
  remainingRounds: effect.remainingRounds === undefined ? undefined : Math.max(1, Math.trunc(effect.remainingRounds)),
  saveDc: effect.saveDc === undefined ? undefined : Math.max(1, Math.trunc(effect.saveDc))
});

export const applyFightEffect = (
  state: FightBattleState,
  side: FightSide,
  effect: FightEffectState
): FightBattleState => {
  const normalized = normalizeEffect(effect);
  if (!normalized.id || !normalized.name) return state;
  const effects = state[side].effects.filter((candidate) => candidate.id !== normalized.id);
  return {
    ...state,
    [side]: { ...state[side], effects: [...effects, normalized] }
  };
};

export const removeFightEffect = (
  state: FightBattleState,
  side: FightSide,
  effectId: string
): FightBattleState => ({
  ...state,
  [side]: { ...state[side], effects: state[side].effects.filter((effect) => effect.id !== effectId) }
});

export const tickFightEffects = (
  state: FightBattleState,
  side: FightSide,
  timing: Exclude<FightEffectTickTiming, "manual">
): FightBattleState => {
  const effects = state[side].effects
    .map((effect) => effect.tickTiming === timing && effect.remainingRounds !== undefined
      ? { ...effect, remainingRounds: Math.max(0, effect.remainingRounds - 1) }
      : effect)
    .filter((effect) => effect.remainingRounds === undefined || effect.remainingRounds > 0);
  return { ...state, [side]: { ...state[side], effects } };
};

export const resolveFightEffectSave = ({
  state,
  side,
  effectId,
  naturalRoll,
  saveBonus
}: {
  state: FightBattleState;
  side: FightSide;
  effectId: string;
  naturalRoll: number;
  saveBonus: number;
}): { state: FightBattleState; total: number; succeeded: boolean } => {
  const effect = state[side].effects.find((candidate) => candidate.id === effectId);
  const roll = Math.min(20, Math.max(1, Math.trunc(naturalRoll)));
  const total = roll + Math.trunc(saveBonus);
  if (!effect?.saveDc) return { state, total, succeeded: false };
  const succeeded = total >= effect.saveDc;
  return {
    state: succeeded ? removeFightEffect(state, side, effectId) : state,
    total,
    succeeded
  };
};
