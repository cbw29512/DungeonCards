import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import type { DndAdvancementChoice } from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";

const sourceFor = (ruleset: RulesetId, kind: "class" | "feat") => ({
  label: ruleset === "srd-5.1-2014"
    ? `2014 Basic Rules — ${kind === "class" ? "Barbarian" : "Customization Options"}`
    : `2024 Free Rules — ${kind === "class" ? "Barbarian" : "Feats"}`,
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

export const barbarianChoices2014 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.1-2014", "barbarian-4-strength", 4, "ability-score", "Strength +2", "Raises greataxe accuracy, Rage damage delivery, Athletics, and Strength saves.", { str: 2 }),
  choice("srd-5.1-2014", "barbarian-8-balanced", 8, "ability-score", "Strength +1, Constitution +1", "Rounds both primary odd scores and improves Unarmored Defense.", { str: 1, con: 1 }),
  choice("srd-5.1-2014", "barbarian-12-constitution", 12, "ability-score", "Constitution +2", "Adds Hit Points, Armor Class, and Relentless Rage reliability.", { con: 2 }),
  choice("srd-5.1-2014", "barbarian-16-constitution", 16, "ability-score", "Constitution +2", "Reaches Constitution 20 before the Primal Champion capstone.", { con: 2 }),
  choice("srd-5.1-2014", "barbarian-19-dexterity", 19, "ability-score", "Dexterity +2", "Improves Initiative, Dexterity saves, ranged fallback attacks, and Unarmored Defense.", { dex: 2 })
].filter((entry) => entry.gainedAtLevel <= level);

export const barbarianChoices2024 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.2.1-2024", "soldier-savage-attacker", 1, "feat", "Savage Attacker", "Improves one greataxe damage roll each turn without competing for a Bonus Action."),
  choice("srd-5.2.1-2024", "barbarian-4-great-weapon-master", 4, "feat", "Great Weapon Master", "Adds Strength, proficiency-bonus damage on one Heavy-weapon hit each turn, and a follow-up attack after a critical hit or takedown.", { str: 1 }, "Level 4+, Strength 13+"),
  choice("srd-5.2.1-2024", "barbarian-8-strength", 8, "ability-score", "Strength +2", "Reaches Strength 20 before Brutal Strike and tier-three defenses.", { str: 2 }),
  choice("srd-5.2.1-2024", "barbarian-12-constitution", 12, "ability-score", "Constitution +2", "Improves Hit Points, Unarmored Defense, and Relentless Rage.", { con: 2 }),
  choice("srd-5.2.1-2024", "barbarian-16-resilient-wisdom", 16, "feat", "Resilient (Wisdom)", "Adds Wisdom-save proficiency against effects that can disable Rage or remove the Barbarian from melee.", { wis: 1 }, "Choose an ability without saving-throw proficiency"),
  choice("srd-5.2.1-2024", "boon-irresistible-offense", 19, "feat", "Boon of Irresistible Offense", "Raises Constitution, bypasses resistance to physical weapon damage, and rewards natural-20 attacks.", { con: 1 }, "Level 19+")
].filter((entry) => entry.gainedAtLevel <= level);

const rageDamage = (level: number): number => level >= 16 ? 4 : level >= 9 ? 3 : 2;

const optimizedScores2024 = (level: number): DndAbilityScores => {
  const scores = { str: 17, dex: 14, con: 14, int: 10, wis: 12, cha: 8 };
  if (level >= 4) scores.str += 1;
  if (level >= 8) scores.str += 2;
  if (level >= 12) scores.con += 2;
  if (level >= 16) scores.wis += 1;
  if (level >= 19) scores.con += 1;
  if (level >= 20) { scores.str += 4; scores.con += 4; }
  return scores;
};

export const optimizeBarbarian2024 = (character: DndCharacterRecord): DndCharacterRecord => {
  const abilityScores = optimizedScores2024(character.level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const rageBonus = rageDamage(character.level);
  const greatWeaponNote = character.level >= 4
    ? " Great Weapon Master adds Proficiency Bonus damage to one qualifying Heavy-weapon hit each turn; Hew can grant a Bonus Action attack after a critical hit or takedown."
    : "";
  return {
    ...character,
    abilityScores,
    maximumHitPoints: dndFixedHitPoints(12, character.level, abilityScores.con),
    armorClass: 10 + dndAbilityModifier(abilityScores.dex) + dndAbilityModifier(abilityScores.con),
    savingThrowProficiencies: character.level >= 16 ? ["str", "con", "wis"] : ["str", "con"],
    attacks: character.attacks.map((attack) => {
      const damageFormula = attack.id === "greataxe-rage"
        ? `1d12+${strengthModifier + rageBonus}`
        : attack.id === "greataxe"
          ? `1d12+${strengthModifier}`
          : attack.id === "handaxe"
            ? `1d6+${strengthModifier}`
            : attack.damageFormula;
      const notes = attack.id.startsWith("greataxe") ? `${attack.notes ?? ""}${greatWeaponNote}`.trim() : attack.notes;
      return { ...attack, damageFormula, notes };
    }),
    advancementChoices: barbarianChoices2024(character.level).map((entry) => `Level ${entry.gainedAtLevel}: ${entry.name} — ${entry.synergyNote}`),
    notes: [
      ...character.notes,
      "Vault v2 optimization replaces generic ASIs with Great Weapon Master and Resilient (Wisdom).",
      ...(character.level >= 16 ? ["Resilient (Wisdom) adds Wisdom saving throw proficiency."] : [])
    ]
  };
};
