import type { FightEffectState, FightPresentationEvent } from "../types/fightBattle";

const STATUS_GLYPHS: Record<string, string> = {
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
  unconscious: "Z",
  concentration: "◎",
  "temporary-hit-points": "◇",
  healing: "+",
  blessed: "✚",
  bless: "✚",
  bane: "−",
  hasted: "»",
  haste: "»",
  hex: "⌾",
  "hunters-mark": "⌖",
  shielded: "▣",
  shield: "▣",
  resistant: "◈",
  resistance: "◈",
  immune: "◆",
  vulnerable: "▽",
  vulnerability: "▽",
  recharge: "↻",
  movement: "→",
  resource: "◆",
  reroll: "↺",
  downed: "☓"
};

const normalize = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

const glyphForKey = (value?: string): string | undefined => value ? STATUS_GLYPHS[normalize(value)] : undefined;

export const fightEffectGlyph = (effect: FightEffectState): string => {
  const known = glyphForKey(effect.iconKey || effect.name);
  if (known) return known;
  if (effect.kind === "buff") return "↑";
  if (effect.kind === "debuff") return "↓";
  return "✧";
};

export const fightEffectLabel = (effect: FightEffectState): string => {
  const duration = effect.remainingRounds !== undefined ? ` · ${effect.remainingRounds}r` : "";
  const save = effect.saveAbility && effect.saveDc ? ` · ${effect.saveAbility} DC ${effect.saveDc}` : "";
  const source = effect.sourceName ? ` · ${effect.sourceName}` : "";
  return `${effect.name}${duration}${save}${source}`;
};

export const fightPresentationGlyph = (event: FightPresentationEvent): string => {
  const known = glyphForKey(event.iconKey);
  if (known) return known;
  if (event.type === "critical") return "★";
  if (event.type === "miss") return "×";
  if (event.type === "attack-reroll" || event.type === "save-reroll") return "↺";
  if (event.type === "save-success") return "✓";
  if (event.type === "save-failure") return "!";
  if (event.type === "healing") return "+";
  if (event.type === "temporary-hit-points") return "◇";
  if (event.type === "concentration-started") return "◎";
  if (event.type === "concentration-broken") return "◌";
  if (event.type === "damage-resisted") return "◈";
  if (event.type === "damage-immune" || event.type === "effect-immune") return "◆";
  if (event.type === "damage-vulnerable") return "▽";
  if (event.type === "recharge-ready") return "↻";
  if (event.type === "movement") return "→";
  if (event.type === "resource-used" || event.type === "resource-gained") return "◆";
  if (event.type === "downed") return "☓";
  if (event.type === "effect-removed") return "↘";
  if (event.type === "effect-applied") {
    if (event.delivery === "buff") return "↑";
    if (event.delivery === "debuff") return "↓";
    return "✧";
  }
  if (event.delivery === "spell") return "✦";
  return "⚔";
};

export const fightPresentationDetail = (event: FightPresentationEvent): string => {
  if (event.type === "save-success" || event.type === "save-failure") {
    const ability = event.saveAbility ? `${event.saveAbility} ` : "";
    const total = event.saveTotal === undefined ? "" : `${event.saveTotal}`;
    const dc = event.saveDc === undefined ? "" : ` / DC ${event.saveDc}`;
    return `${ability}${total}${dc}`.trim();
  }
  if (event.type === "movement" && event.amount !== undefined) return `${event.amount} ft`;
  if (event.type === "resource-used" && event.amount !== undefined) return `${event.amount} use${event.amount === 1 ? "" : "s"}`;
  if (event.type === "resource-gained" && event.amount !== undefined) return `+${event.amount}`;
  if (event.amount !== undefined) {
    return event.type === "healing" || event.type === "temporary-hit-points"
      ? `+${event.amount}`
      : `-${event.amount}`;
  }
  return event.damageType ?? event.sourceName ?? "";
};