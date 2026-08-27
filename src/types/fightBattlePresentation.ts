import type { FightAttackEvent, FightBattleState, FightSide } from "./fightBattle";

export type FightVisualArchetype =
  | "hero"
  | "humanoid"
  | "beast"
  | "dragon"
  | "undead"
  | "fiend"
  | "construct"
  | "ooze"
  | "plant"
  | "aberration"
  | "giant"
  | "monstrosity"
  | "celestial"
  | "fey"
  | "elemental"
  | "swarm"
  | "unknown";

export type FightVisualCue =
  | "idle"
  | "initiative"
  | "attack"
  | "miss"
  | "hit"
  | "critical"
  | "hurt"
  | "ko"
  | "victory";

export type FightPixelIdentity = {
  spriteKey: string;
  archetype: FightVisualArchetype;
  label: string;
  fallbackGlyph: string;
};

export type FightPixelFrame = {
  round: number;
  activeSide?: FightSide;
  characterCue: FightVisualCue;
  monsterCue: FightVisualCue;
  latestEvent?: FightAttackEvent;
  headline: string;
  damageNumber?: number;
  damageTarget?: FightSide;
};

export type FightPixelScene = {
  character: FightPixelIdentity;
  monster: FightPixelIdentity;
  frame: FightPixelFrame;
};

export type FightPixelSceneInput = {
  state: FightBattleState;
  characterIdentity: FightPixelIdentity;
  monsterIdentity: FightPixelIdentity;
};
