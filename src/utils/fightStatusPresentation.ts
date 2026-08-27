import type { FightEffectState } from "../types/fightBattle";

const CONDITION_GLYPHS: Record<string, string> = {
  blinded: "◉̸",
  charmed: "♥",
  deafened: "♪̸",
  frightened: "!",
  grappled: "⌁",
  incapacitated: "×",
  invisible: "◌",
  paralyzed: "╫",
  petrified: "◆",
  poisoned: "☠",
  prone: "▼",
  restrained: "⊠",
  stunned: "✦",
  unconscious: "Z"
};

const normalize = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const fightEffectGlyph = (effect: FightEffectState): string => {
  const key = normalize(effect.iconKey || effect.name);
  if (CONDITION_GLYPHS[key]) return CONDITION_GLYPHS[key];
  if (effect.kind === "buff") return "↑";
  if (effect.kind === "debuff") return "↓";
  return "✧";
};

export const fightEffectLabel = (effect: FightEffectState): string => {
  const duration = effect.remainingRounds !== undefined ? ` · ${effect.remainingRounds}r` : "";
  const save = effect.saveAbility && effect.saveDc ? ` · ${effect.saveAbility} DC ${effect.saveDc}` : "";
  return `${effect.name}${duration}${save}`;
};
