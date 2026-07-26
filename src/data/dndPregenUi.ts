import type { DndPregenClassDefinition } from "./dndPregenCatalog";
import type { RulesetId } from "../types/ruleCards";

export const dndPregenRulesets: Array<{ id: RulesetId; label: string }> = [
  { id: "srd-5.1-2014", label: "2014 / SRD 5.1" },
  { id: "srd-5.2.1-2024", label: "2024 / SRD 5.2.1" }
];

export const dndPregenLevels = Array.from({ length: 20 }, (_, index) => index + 1);

export const dndPregenDefinitionPath = (definition: DndPregenClassDefinition): string => (
  `${definition.classId}:${definition.subclassId}`
);

export const dndPregenReadyRequirements = [
  "Ability scores, modifiers, proficiency bonus, and saving throws",
  "Species, background, skills, languages, and tool proficiencies",
  "Armor Class, Hit Points, Speed, Initiative, and senses",
  "Attacks, damage, action economy, and class-resource trackers",
  "Prepared or known spells, spell slots, save DC, and spell attacks",
  "Equipment, carried weight, currency, and consumables",
  "Level-earned class, subclass, feat, and advancement choices",
  "Printable quick-play sheet plus full sourced reference"
];

export const dndPregenCategoryLabels: Record<string, string> = {
  identity: "Identity",
  abilities: "Abilities",
  defenses: "Defenses",
  proficiencies: "Proficiencies",
  combat: "Combat",
  resources: "Features & resources",
  spellcasting: "Spellcasting",
  advancement: "Advancement",
  equipment: "Equipment",
  sources: "Sources",
  print: "Print review"
};
