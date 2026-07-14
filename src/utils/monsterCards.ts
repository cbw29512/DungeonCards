import type { MonsterCardData } from "../types/monsters";

export type MonsterLayout = "standard" | "accordion";
export type MonsterPrintLayout = "card" | "folio";

export const abilityModifier = (score: number): string => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

export const listMonsterText = (items: string[]): string =>
  items.length > 0 ? items.join(", ") : "—";

export const estimateMonsterLayout = (monster: MonsterCardData): MonsterLayout => {
  if (monster.layoutHint === "accordion") return "accordion";
  if (monster.layoutHint === "standard") return "standard";

  const sectionCount = [
    monster.traits,
    monster.actions,
    monster.bonusActions,
    monster.reactions,
    monster.legendaryActions,
    monster.lairActions,
    monster.regionalEffects
  ].reduce((total, section) => total + section.length, 0);
  const spellCount = monster.spellcasting
    ? Object.values(monster.spellcasting.levels).flat().length
    : 0;

  return sectionCount + Math.ceil(spellCount / 3) > 8 ? "accordion" : "standard";
};

export const getMonsterPrintLayout = (monster: MonsterCardData): MonsterPrintLayout =>
  estimateMonsterLayout(monster) === "standard" ? "card" : "folio";

export const monsterRulesetLabel = (monster: MonsterCardData): string => {
  if (monster.ruleset === "srd-5.1-2014") return "2014 SRD";
  if (monster.ruleset === "srd-5.2.1-2024") return "2024 SRD";
  return "Homebrew";
};
