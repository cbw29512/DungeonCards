import type { RulesetId } from "./ruleCards";

export type DndArmorCategory = "light" | "medium" | "heavy";
export type DndCreatureSize = "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan";
export type DndDexterityMode = "full" | "max-2" | "none";

export type DndArmorDefinition = {
  id: string;
  names: Record<RulesetId, string>;
  category: DndArmorCategory;
  baseArmorClass: number;
  dexterityMode: DndDexterityMode;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
  weightPounds: number;
  costGp: number;
};

export type DndArmorTiming = {
  don: string;
  doff: string;
};

export type DndArmorEditionRules = {
  ruleset: RulesetId;
  armorSourceUrl: string;
  carryingSourceUrl: string;
  armorSourceReference: string;
  carryingSourceReference: string;
  categoryTiming: Record<DndArmorCategory, DndArmorTiming>;
  shieldTiming: DndArmorTiming;
  armorTrainingSummary: string;
  shieldTrainingSummary: string;
  doffHelpSummary?: string;
  supportsVariantEncumbrance: boolean;
};

export type DndLoadStatus = "within-capacity" | "over-carrying-capacity" | "over-push-drag-lift";
export type DndVariantEncumbranceStatus = "normal" | "encumbered" | "heavily-encumbered" | "over-capacity";
