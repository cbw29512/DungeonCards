import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import type { DndPregenBuildSlot } from "./dndPregenCatalog";

export const isDndSpellcastingExpected = (slot: DndPregenBuildSlot): boolean => {
  if (["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"].includes(slot.classId)) return true;
  if (!["paladin", "ranger"].includes(slot.classId)) return false;
  return slot.ruleset === "srd-5.2.1-2024" || slot.level >= 2;
};

const emptyAbilityScores = (): DndAbilityScores => ({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });

export const createDndCharacterBlueprint = (slot: DndPregenBuildSlot): DndCharacterRecord => ({
  id: `${slot.id}-record`,
  buildSlotId: slot.id,
  ruleset: slot.ruleset,
  name: "",
  classId: slot.classId,
  className: slot.className,
  subclassId: slot.subclassId,
  subclassName: slot.subclassName,
  subclassUnlockLevel: slot.subclassUnlockLevel,
  level: slot.level,
  species: "",
  background: "",
  abilityScores: emptyAbilityScores(),
  hitDie: 10,
  maximumHitPoints: 0,
  armorClass: 0,
  speedFeet: 0,
  savingThrowProficiencies: [],
  skillProficiencies: [],
  languages: [],
  toolProficiencies: [],
  senses: [],
  attacks: [],
  resources: [],
  spellcastingExpected: isDndSpellcastingExpected(slot),
  spellcasting: { kind: "none" },
  classFeatures: [],
  subclassFeatures: [],
  advancementChoices: [],
  equipment: [],
  currencyGp: 0,
  notes: [],
  sources: [{ label: slot.sourceLabel, url: slot.sourceUrl, scope: "public-srd" }],
  printableSummaryReady: false
});
