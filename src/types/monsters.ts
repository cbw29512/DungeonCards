import type { RulesetId } from "./ruleCards";

export type MonsterRuleset = RulesetId | "homebrew";
export type MonsterLayoutHint = "standard" | "accordion" | "auto";

export type MonsterItem = {
  name: string;
  text?: string;
  hit?: string;
  reach?: string;
  damage?: string;
};

export type MonsterSpellcasting = {
  header: string;
  levels: Record<string, string[]>;
};

export type MonsterCardData = {
  id: string;
  ruleset: MonsterRuleset;
  source: string;
  name: string;
  cr: string;
  type: string;
  size: string;
  layoutHint: MonsterLayoutHint;
  ac: string;
  hp: string;
  speed: string;
  abilities: Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number>;
  saves: string[];
  skills: string[];
  senses: string;
  languages: string;
  resistances: string[];
  immunities: string[];
  conditionImmunities: string[];
  traits: MonsterItem[];
  actions: MonsterItem[];
  bonusActions: MonsterItem[];
  reactions: MonsterItem[];
  legendaryActions: MonsterItem[];
  spellcasting: MonsterSpellcasting | null;
  lairActions: MonsterItem[];
  regionalEffects: MonsterItem[];
};