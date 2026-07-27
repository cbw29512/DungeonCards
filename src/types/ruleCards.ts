import type { DndGameSystemId } from "./cardPlatform";
import type { RollResult } from "./cards";

export type RulesetId = "srd-5.1-2014" | "srd-5.2.1-2024";
export type RuleSource = "srd" | "homebrew";
export type RuleCardKind =
  | "attack"
  | "saving-throw"
  | "ability-check"
  | "weapon-damage"
  | "spell-damage"
  | "spell-healing"
  | "quick-roll"
  | "spell"
  | "trap"
  | "magic-item"
  | "dm-table";
export type RuleRollKind = "attack" | "damage" | "healing" | "save" | "check" | "table";
export type AdvantageMode = "normal" | "advantage" | "disadvantage";
export type NaturalRollRule = "attack" | "none";

export const RULESET_LABELS: Record<RulesetId, string> = {
  "srd-5.1-2014": "2014",
  "srd-5.2.1-2024": "2024"
};

export type RuleTableEntry = {
  min: number;
  max: number;
  result: string;
};

export type FormulaChoice = {
  id: string;
  label: string;
  formula: string;
  note?: string;
  table?: RuleTableEntry[];
};

export type SlotDiceScaling = {
  kind: "slot-dice";
  baseLevel: number;
  maxLevel: number;
  dicePerLevel: number;
  dieSides: number;
  modifierPerLevel?: number;
};

export type CharacterFormulaScaling = {
  kind: "character-formula";
  tiers: Array<{ level: number; formula: string }>;
};

export type RuleScaling = SlotDiceScaling | CharacterFormulaScaling;

export type ModifierControl = {
  label: string;
  defaultValue: number;
  minimum: number;
  maximum: number;
};

export type RuleRollPart = {
  label: string;
  kind: RuleRollKind;
  formula: string;
  allowsAdvantage?: boolean;
  naturalRollRule?: NaturalRollRule;
  modifierControl?: ModifierControl;
  scaling?: RuleScaling;
  choices?: FormulaChoice[];
};

export type RuleRollMode = RuleRollPart & {
  id: string;
  secondaryRoll?: RuleRollPart;
};

export type RuleCardVariant = {
  ruleset: RulesetId;
  source: RuleSource;
  sourceReference: string;
  summary: string;
  detail: string;
  tags: string[];
  modes: RuleRollMode[];
};

export type RuleCard = {
  id: string;
  name: string;
  kind: RuleCardKind;
  imageEmoji: string;
  variants: Partial<Record<RulesetId, RuleCardVariant>>;
};

export type RuleRollRequest = {
  cardId: string;
  cardName: string;
  ruleset: RulesetId;
  source: RuleSource;
  modeLabel: string;
  formula: string;
  advantageMode: AdvantageMode;
  naturalRollRule: NaturalRollRule;
  table?: RuleTableEntry[];
};

export type SecondaryRuleRollResult = {
  label: string;
  formula: string;
  result: RollResult;
  tableResult?: string;
};

export type RuleRollResult = RollResult & {
  tableResult?: string;
  secondary?: SecondaryRuleRollResult;
};

export type RuleRollHistoryEntry = {
  id: string;
  cardId: string;
  cardName: string;
  ruleset: RulesetId;
  gameSystemId: DndGameSystemId;
  modeLabel: string;
  result: RuleRollResult;
  rolledAt: string;
};
