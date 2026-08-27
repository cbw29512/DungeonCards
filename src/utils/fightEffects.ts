import type { FightActiveEffect, FightBattleState, FightSide } from "../types/fightBattle";

export type FightEffectVisual = {
  symbol: string;
  category: "condition" | "buff" | "debuff" | "damage" | "healing" | "ward" | "mark" | "custom";
  ariaLabel: string;
};

const EFFECT_VISUALS: Record<string, FightEffectVisual> = {
  poisoned: { symbol: "☠", category: "debuff", ariaLabel: "Poisoned" },
  frightened: { symbol: "!", category: "debuff", ariaLabel: "Frightened" },
  blinded: { symbol: "◉̸", category: "debuff", ariaLabel: "Blinded" },
  charmed: { symbol: "♥", category: "debuff", ariaLabel: "Charmed" },
  deafened: { symbol: "♪̸", category: "debuff", ariaLabel: "Deafened" },
  grappled: { symbol: "⛓", category: "debuff", ariaLabel: "Grappled" },
  incapacitated: { symbol: "✕", category: "debuff", ariaLabel: "Incapacitated" },
  invisible: { symbol: "◌", category: "buff", ariaLabel: "Invisible" },
  paralyzed: { symbol: "⚡", category: "debuff", ariaLabel: "Paralyzed" },
  petrified: { symbol: "◆", category: "debuff", ariaLabel: "Petrified" },
  prone: { symbol: "↘", category: "debuff", ariaLabel: "Prone" },
  restrained: { symbol: "⌗", category: "debuff", ariaLabel: "Restrained" },
  stunned: { symbol: "✦", category: "debuff", ariaLabel: "Stunned" },
  unconscious: { symbol: "Z", category: "debuff", ariaLabel: "Unconscious" },
  concentration: { symbol: "◇", category: "buff", ariaLabel: "Concentrating" },
  blessed: { symbol: "+", category: "buff", ariaLabel: "Blessed" },
  hasted: { symbol: "»", category: "buff", ariaLabel: "Hasted" },
  slowed: { symbol: "«", category: "debuff", ariaLabel: "Slowed" },
  burning: { symbol: "♨", category: "damage", ariaLabel: "Burning" },
  bleeding: { symbol: "♦", category: "damage", ariaLabel: "Bleeding" },
  regeneration: { symbol: "✚", category: "healing", ariaLabel: "Regenerating" },
  warded: { symbol: "⬡", category: "ward", ariaLabel: "Warded" },
  marked: { symbol: "◎", category: "mark", ariaLabel: "Marked" }
};

export const fightEffectVisual = (effect: FightActiveEffect): FightEffectVisual =>
  EFFECT_VISUALS[effect.rulesKey.toLowerCase()] ?? {
    symbol: effect.kind === "buff" ? "+" : effect.kind === "debuff" ? "−" : "•",
    category: effect.kind === "buff" ? "buff" : effect.kind === "debuff" ? "debuff" : "custom",
    ariaLabel: effect.label
  };

export const applyFightEffect = (state: FightBattleState, side: FightSide, effect: FightActiveEffect): FightBattleState => {
  const existing = state[side].activeEffects.filter((item) => item.id !== effect.id);
  return { ...state, [side]: { ...state[side], activeEffects: [...existing, effect] } };
};

export const removeFightEffect = (state: FightBattleState, side: FightSide, effectId: string): FightBattleState => ({
  ...state,
  [side]: { ...state[side], activeEffects: state[side].activeEffects.filter((effect) => effect.id !== effectId) }
});

export const expireRoundEffects = (state: FightBattleState): FightBattleState => {
  const expire = (side: FightSide) => state[side].activeEffects.filter((effect) =>
    effect.expiry.type !== "round" || effect.expiry.expiresAfterRound >= state.round
  );
  return {
    ...state,
    character: { ...state.character, activeEffects: expire("character") },
    monster: { ...state.monster, activeEffects: expire("monster") }
  };
};
