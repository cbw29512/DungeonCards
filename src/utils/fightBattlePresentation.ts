import type { FightBattleState, FightSide } from "../types/fightBattle";
import type {
  FightPixelFrame,
  FightPixelIdentity,
  FightPixelScene,
  FightPixelSceneInput,
  FightVisualArchetype,
  FightVisualCue
} from "../types/fightBattlePresentation";

const ARCHETYPE_GLYPHS: Record<FightVisualArchetype, string> = {
  hero: "⚔",
  humanoid: "♟",
  beast: "🐾",
  dragon: "🐉",
  undead: "☠",
  fiend: "♨",
  construct: "⚙",
  ooze: "●",
  plant: "♣",
  aberration: "◉",
  giant: "▲",
  monstrosity: "◆",
  celestial: "✦",
  fey: "✧",
  elemental: "◇",
  swarm: "⁙",
  unknown: "?"
};

const normalizeKey = (value: string): string => value
  .normalize("NFKC")
  .toLocaleLowerCase("en-US")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "unknown";

export const monsterVisualArchetype = (type: string): FightVisualArchetype => {
  const normalized = type.toLocaleLowerCase("en-US");
  const known: FightVisualArchetype[] = [
    "beast", "dragon", "undead", "fiend", "construct", "ooze", "plant",
    "aberration", "giant", "monstrosity", "celestial", "fey", "elemental", "swarm"
  ];
  return known.find((candidate) => normalized.includes(candidate))
    ?? (normalized.includes("humanoid") ? "humanoid" : "unknown");
};

export const characterPixelIdentity = (className: string): FightPixelIdentity => ({
  spriteKey: `hero-${normalizeKey(className)}`,
  archetype: "hero",
  label: className,
  fallbackGlyph: ARCHETYPE_GLYPHS.hero
});

export const monsterPixelIdentity = (name: string, type: string): FightPixelIdentity => {
  const archetype = monsterVisualArchetype(type);
  return {
    spriteKey: `${archetype}-${normalizeKey(name)}`,
    archetype,
    label: type || "Monster",
    fallbackGlyph: ARCHETYPE_GLYPHS[archetype]
  };
};

const cueForSide = (
  state: FightBattleState,
  side: FightSide,
  latest = state.events.at(-1)
): FightVisualCue => {
  if (state.status === "complete") {
    if (state.winner === side) return "victory";
    return "ko";
  }
  if (!latest) return state.status === "ready" || state.status === "initiative-tie" ? "initiative" : "idle";
  if (latest.attacker === side) {
    if (latest.outcome === "critical") return "critical";
    if (latest.outcome === "hit") return "attack";
    return "miss";
  }
  if (latest.target === side && latest.damage > 0) return "hurt";
  return "idle";
};

const headline = (state: FightBattleState): string => {
  if (state.status === "complete" && state.winner) return `${state[state.winner].profile.name} WINS!`;
  if (state.status === "initiative-tie") return "INITIATIVE TIE!";
  const latest = state.events.at(-1);
  if (!latest) return state.status === "ready" ? "READY!" : "ROLL INITIATIVE!";
  if (latest.outcome === "critical") return "CRITICAL HIT!";
  if (latest.outcome === "hit") return `${latest.damage} DAMAGE!`;
  return "MISS!";
};

export const deriveFightPixelFrame = (state: FightBattleState): FightPixelFrame => {
  const latest = state.events.at(-1);
  const order = state.initiative?.order;
  const activeSide = state.status === "active" && order ? order[state.activeIndex] : undefined;
  return {
    round: state.round,
    activeSide,
    characterCue: cueForSide(state, "character", latest),
    monsterCue: cueForSide(state, "monster", latest),
    latestEvent: latest,
    headline: headline(state),
    damageNumber: latest?.damage || undefined,
    damageTarget: latest && latest.damage > 0 ? latest.target : undefined
  };
};

export const deriveFightPixelScene = ({
  state,
  characterIdentity,
  monsterIdentity
}: FightPixelSceneInput): FightPixelScene => ({
  character: characterIdentity,
  monster: monsterIdentity,
  frame: deriveFightPixelFrame(state)
});
