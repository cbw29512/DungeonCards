import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import type { DndAdvancementChoice } from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndFixedHitPoints } from "../utils/dndCharacterRecord";

const sourceFor = (ruleset: RulesetId, kind: "class" | "feat") => ({
  label: ruleset === "srd-5.1-2014"
    ? `2014 Basic Rules — ${kind === "class" ? "Cleric" : "Customization Options"}`
    : `2024 Free Rules — ${kind === "class" ? "Cleric" : "Feats"}`,
  url: ruleset === "srd-5.1-2014"
    ? "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes"
    : kind === "class"
      ? "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes"
      : "https://www.dndbeyond.com/sources/dnd/br-2024/feats",
  scope: "public-srd" as const
});

const choice = (
  ruleset: RulesetId,
  id: string,
  gainedAtLevel: number,
  kind: DndAdvancementChoice["kind"],
  name: string,
  synergyNote: string,
  abilityChanges?: DndAdvancementChoice["abilityChanges"],
  prerequisiteNote?: string
): DndAdvancementChoice => ({
  id: `${ruleset}-${id}`,
  gainedAtLevel,
  kind,
  name,
  source: sourceFor(ruleset, kind === "feat" ? "feat" : "class"),
  synergyNote,
  abilityChanges,
  prerequisiteNote
});

export const clericChoices2014 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.1-2014", "cleric-4-wisdom", 4, "ability-score", "Wisdom +2", "Improves spell save DC, spell attacks, healing features, perception, and prepared spell count.", { wis: 2 }),
  choice("srd-5.1-2014", "cleric-8-wisdom", 8, "ability-score", "Wisdom +2", "Reaches Wisdom 20 before Spirit Guardians and higher-level control dominate combat.", { wis: 2 }),
  choice("srd-5.1-2014", "cleric-12-constitution", 12, "ability-score", "Constitution +2", "Improves Hit Points and Concentration checks while keeping the shield-healer role intact.", { con: 2 }),
  choice("srd-5.1-2014", "cleric-16-balanced", 16, "ability-score", "Constitution +1, Charisma +1", "Rounds Constitution to 18 and improves social checks and Charisma saves.", { con: 1, cha: 1 }),
  choice("srd-5.1-2014", "cleric-19-constitution", 19, "ability-score", "Constitution +2", "Reaches Constitution 20 for maximum public-SRD durability and Concentration support.", { con: 2 })
].filter((entry) => entry.gainedAtLevel <= level);

export const clericChoices2024 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.2.1-2024", "acolyte-magic-initiate", 1, "feat", "Magic Initiate (Cleric)", "Adds Sacred Flame, Thaumaturgy, and a free Shield of Faith cast using Wisdom."),
  choice("srd-5.2.1-2024", "cleric-4-war-caster", 4, "feat", "War Caster", "Raises Wisdom, protects Concentration, allows Somatic components with occupied hands, and enables a Reactive Spell.", { wis: 1 }, "Level 4+, Spellcasting or Pact Magic"),
  choice("srd-5.2.1-2024", "cleric-8-wisdom", 8, "ability-score", "Wisdom +2", "Reaches Wisdom 20 for maximum spell accuracy and Life Domain effectiveness.", { wis: 2 }),
  choice("srd-5.2.1-2024", "cleric-12-resilient-constitution", 12, "feat", "Resilient (Constitution)", "Adds Constitution-save proficiency to reinforce Concentration and resist debilitating bodily effects.", { con: 1 }, "Choose an ability without saving-throw proficiency"),
  choice("srd-5.2.1-2024", "cleric-16-constitution", 16, "ability-score", "Constitution +2", "Improves Hit Points and raises the Concentration modifier before tier four.", { con: 2 }),
  choice("srd-5.2.1-2024", "boon-fate", 19, "feat", "Boon of Fate", "Raises Constitution and provides a 2d4 intervention that can rescue a crucial d20 Test.", { con: 1 }, "Level 19+")
].filter((entry) => entry.gainedAtLevel <= level);

const scores2014 = (level: number): DndAbilityScores => {
  const scores = { str: 14, dex: 10, con: 15, int: 8, wis: 16, cha: 12 };
  if (level >= 4) scores.wis += 2;
  if (level >= 8) scores.wis += 2;
  if (level >= 12) scores.con += 2;
  if (level >= 16) { scores.con += 1; scores.cha += 1; }
  if (level >= 19) scores.con += 2;
  return scores;
};

const scores2024 = (level: number): DndAbilityScores => {
  const scores = { str: 13, dex: 12, con: 14, int: 8, wis: 17, cha: 11 };
  if (level >= 4) scores.wis += 1;
  if (level >= 8) scores.wis += 2;
  if (level >= 12) scores.con += 1;
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.con += 1;
  return scores;
};

const optimize = (
  character: DndCharacterRecord,
  abilityScores: DndAbilityScores,
  choices: DndAdvancementChoice[],
  extraNotes: string[]
): DndCharacterRecord => ({
  ...character,
  abilityScores,
  maximumHitPoints: dndFixedHitPoints(8, character.level, abilityScores.con) + character.level,
  savingThrowProficiencies: character.ruleset === "srd-5.2.1-2024" && character.level >= 12
    ? ["wis", "cha", "con"]
    : ["wis", "cha"],
  resources: [
    ...character.resources,
    ...(character.ruleset === "srd-5.2.1-2024" && character.level >= 19
      ? [{ id: "boon-fate", name: "Boon of Fate", maximum: 1, refresh: "short-rest" as const, notes: "Add or subtract 2d4 from a d20 Test made within 60 feet." }]
      : [])
  ],
  advancementChoices: choices.map((entry) => `Level ${entry.gainedAtLevel}: ${entry.name} — ${entry.synergyNote}`),
  notes: [...character.notes, ...extraNotes]
});

export const optimizeCleric2014 = (character: DndCharacterRecord): DndCharacterRecord => optimize(
  character,
  scores2014(character.level),
  clericChoices2014(character.level),
  ["Vault v2 redirects post-Wisdom ASIs into Constitution for stronger Hit Points and Concentration."]
);

export const optimizeCleric2024 = (character: DndCharacterRecord): DndCharacterRecord => optimize(
  character,
  scores2024(character.level),
  clericChoices2024(character.level),
  [
    "Vault v2 replaces generic ASIs with War Caster and Resilient (Constitution).",
    ...(character.level >= 12 ? ["Resilient (Constitution) adds Constitution saving throw proficiency."] : [])
  ]
);
