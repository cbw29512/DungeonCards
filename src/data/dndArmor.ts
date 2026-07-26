import type {
  DndArmorDefinition,
  DndArmorEditionRules,
  DndCreatureSize
} from "../types/dndArmor";
import type { RulesetId } from "../types/ruleCards";

export const dndArmorCatalog: DndArmorDefinition[] = [
  { id: "padded", names: { "srd-5.1-2014": "Padded", "srd-5.2.1-2024": "Padded Armor" }, category: "light", baseArmorClass: 11, dexterityMode: "full", stealthDisadvantage: true, weightPounds: 8, costGp: 5 },
  { id: "leather", names: { "srd-5.1-2014": "Leather", "srd-5.2.1-2024": "Leather Armor" }, category: "light", baseArmorClass: 11, dexterityMode: "full", stealthDisadvantage: false, weightPounds: 10, costGp: 10 },
  { id: "studded-leather", names: { "srd-5.1-2014": "Studded Leather", "srd-5.2.1-2024": "Studded Leather Armor" }, category: "light", baseArmorClass: 12, dexterityMode: "full", stealthDisadvantage: false, weightPounds: 13, costGp: 45 },
  { id: "hide", names: { "srd-5.1-2014": "Hide", "srd-5.2.1-2024": "Hide Armor" }, category: "medium", baseArmorClass: 12, dexterityMode: "max-2", stealthDisadvantage: false, weightPounds: 12, costGp: 10 },
  { id: "chain-shirt", names: { "srd-5.1-2014": "Chain Shirt", "srd-5.2.1-2024": "Chain Shirt" }, category: "medium", baseArmorClass: 13, dexterityMode: "max-2", stealthDisadvantage: false, weightPounds: 20, costGp: 50 },
  { id: "scale-mail", names: { "srd-5.1-2014": "Scale Mail", "srd-5.2.1-2024": "Scale Mail" }, category: "medium", baseArmorClass: 14, dexterityMode: "max-2", stealthDisadvantage: true, weightPounds: 45, costGp: 50 },
  { id: "breastplate", names: { "srd-5.1-2014": "Breastplate", "srd-5.2.1-2024": "Breastplate" }, category: "medium", baseArmorClass: 14, dexterityMode: "max-2", stealthDisadvantage: false, weightPounds: 20, costGp: 400 },
  { id: "half-plate", names: { "srd-5.1-2014": "Half Plate", "srd-5.2.1-2024": "Half Plate Armor" }, category: "medium", baseArmorClass: 15, dexterityMode: "max-2", stealthDisadvantage: true, weightPounds: 40, costGp: 750 },
  { id: "ring-mail", names: { "srd-5.1-2014": "Ring Mail", "srd-5.2.1-2024": "Ring Mail" }, category: "heavy", baseArmorClass: 14, dexterityMode: "none", stealthDisadvantage: true, weightPounds: 40, costGp: 30 },
  { id: "chain-mail", names: { "srd-5.1-2014": "Chain Mail", "srd-5.2.1-2024": "Chain Mail" }, category: "heavy", baseArmorClass: 16, dexterityMode: "none", strengthRequirement: 13, stealthDisadvantage: true, weightPounds: 55, costGp: 75 },
  { id: "splint", names: { "srd-5.1-2014": "Splint", "srd-5.2.1-2024": "Splint Armor" }, category: "heavy", baseArmorClass: 17, dexterityMode: "none", strengthRequirement: 15, stealthDisadvantage: true, weightPounds: 60, costGp: 200 },
  { id: "plate", names: { "srd-5.1-2014": "Plate", "srd-5.2.1-2024": "Plate Armor" }, category: "heavy", baseArmorClass: 18, dexterityMode: "none", strengthRequirement: 15, stealthDisadvantage: true, weightPounds: 65, costGp: 1500 }
];

export const dndArmorEditionRules: Record<RulesetId, DndArmorEditionRules> = {
  "srd-5.1-2014": {
    ruleset: "srd-5.1-2014",
    armorSourceUrl: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment",
    carryingSourceUrl: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/using-ability-scores",
    armorSourceReference: "Basic Rules 2014 · Equipment: Armor and Shields",
    carryingSourceReference: "Basic Rules 2014 · Using Ability Scores: Lifting and Carrying",
    categoryTiming: {
      light: { don: "1 minute", doff: "1 minute" },
      medium: { don: "5 minutes", doff: "1 minute" },
      heavy: { don: "10 minutes", doff: "5 minutes" }
    },
    shieldTiming: { don: "1 action", doff: "1 action" },
    armorTrainingSummary: "Without proficiency, you have Disadvantage on Strength- or Dexterity-based ability checks, saving throws, and attack rolls, and you can’t cast spells.",
    shieldTrainingSummary: "A shield uses the same 2014 proficiency penalty. Its listed +2 AC still applies while wielded.",
    doffHelpSummary: "Help removing armor reduces its doffing time by half.",
    supportsVariantEncumbrance: true
  },
  "srd-5.2.1-2024": {
    ruleset: "srd-5.2.1-2024",
    armorSourceUrl: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment",
    carryingSourceUrl: "https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary",
    armorSourceReference: "Free Rules 2024 · Equipment: Armor",
    carryingSourceReference: "Free Rules 2024 · Rules Glossary: Carrying Capacity",
    categoryTiming: {
      light: { don: "1 minute", doff: "1 minute" },
      medium: { don: "5 minutes", doff: "1 minute" },
      heavy: { don: "10 minutes", doff: "5 minutes" }
    },
    shieldTiming: { don: "Utilize action", doff: "Utilize action" },
    armorTrainingSummary: "Without training in Light, Medium, or Heavy armor, you have Disadvantage on D20 Tests involving Strength or Dexterity, and you can’t cast spells.",
    shieldTrainingSummary: "You gain a shield’s +2 AC benefit only if you have Shield training.",
    supportsVariantEncumbrance: false
  }
};

export const dndSizeCarryingMultipliers: Record<DndCreatureSize, { carry: number; pushDragLift: number }> = {
  tiny: { carry: 7.5, pushDragLift: 15 },
  small: { carry: 15, pushDragLift: 30 },
  medium: { carry: 15, pushDragLift: 30 },
  large: { carry: 30, pushDragLift: 60 },
  huge: { carry: 60, pushDragLift: 120 },
  gargantuan: { carry: 120, pushDragLift: 240 }
};

export const getArmorName = (armor: DndArmorDefinition, ruleset: RulesetId): string => armor.names[ruleset];
