import { monsterHomebrewExample } from "../data/monsterCatalog";
import type {
  MonsterCardData,
  MonsterItem,
  MonsterSpellcasting
} from "../types/monsters";

export const MONSTER_HOMEBREW_STORAGE_KEY = "dungeon-cards-monster-homebrew-v1";

export type MonsterDraftStorageAdapter = Pick<Storage, "getItem" | "setItem">;

const abilityKeys: Array<keyof MonsterCardData["abilities"]> = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha"
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isBoundedString = (value: unknown, maxLength: number): value is string =>
  typeof value === "string" && value.length <= maxLength;

const isStringList = (value: unknown, maxItems = 100): value is string[] =>
  Array.isArray(value)
  && value.length <= maxItems
  && value.every((item) => isBoundedString(item, 300));

const isMonsterItem = (value: unknown): value is MonsterItem => {
  if (!isRecord(value) || !isBoundedString(value.name, 120)) {
    return false;
  }

  return ["text", "hit", "reach", "damage"].every((field) => {
    const fieldValue = value[field];
    return fieldValue === undefined || isBoundedString(fieldValue, 1000);
  });
};

const isMonsterItemList = (value: unknown): value is MonsterItem[] =>
  Array.isArray(value)
  && value.length <= 100
  && value.every(isMonsterItem);

const isAbilityScores = (value: unknown): value is MonsterCardData["abilities"] => {
  if (!isRecord(value)) {
    return false;
  }

  return abilityKeys.every((ability) => {
    const score = value[ability];
    return Number.isSafeInteger(score) && Number(score) >= 1 && Number(score) <= 30;
  });
};

const isSpellcasting = (value: unknown): value is MonsterSpellcasting | null => {
  if (value === null) {
    return true;
  }

  if (!isRecord(value) || !isBoundedString(value.header, 1000) || !isRecord(value.levels)) {
    return false;
  }

  const levels = Object.entries(value.levels);
  return levels.length <= 30
    && levels.every(([level, spells]) => (
      level.length <= 60
      && Array.isArray(spells)
      && spells.length <= 100
      && spells.every((spell) => isBoundedString(spell, 120))
    ));
};

export const isMonsterHomebrewDraft = (value: unknown): value is MonsterCardData => {
  if (!isRecord(value)) {
    return false;
  }

  const validRuleset = value.ruleset === "homebrew";
  const validLayout = value.layoutHint === "standard"
    || value.layoutHint === "accordion"
    || value.layoutHint === "auto";

  const validTextFields = [
    ["id", 100],
    ["source", 160],
    ["name", 100],
    ["cr", 30],
    ["type", 80],
    ["size", 40],
    ["ac", 120],
    ["hp", 120],
    ["speed", 200],
    ["senses", 500],
    ["languages", 500]
  ].every(([field, maxLength]) => isBoundedString(value[String(field)], Number(maxLength)));

  return validRuleset
    && validLayout
    && validTextFields
    && isAbilityScores(value.abilities)
    && isStringList(value.saves)
    && isStringList(value.skills)
    && isStringList(value.resistances)
    && isStringList(value.immunities)
    && isStringList(value.conditionImmunities)
    && isMonsterItemList(value.traits)
    && isMonsterItemList(value.actions)
    && isMonsterItemList(value.bonusActions)
    && isMonsterItemList(value.reactions)
    && isMonsterItemList(value.legendaryActions)
    && isSpellcasting(value.spellcasting)
    && isMonsterItemList(value.lairActions)
    && isMonsterItemList(value.regionalEffects);
};

export const cloneMonsterHomebrewExample = (): MonsterCardData =>
  JSON.parse(JSON.stringify(monsterHomebrewExample)) as MonsterCardData;

export const loadMonsterHomebrewDraft = (
  storage: MonsterDraftStorageAdapter
): MonsterCardData => {
  try {
    const rawDraft = storage.getItem(MONSTER_HOMEBREW_STORAGE_KEY);
    if (!rawDraft) {
      return cloneMonsterHomebrewExample();
    }

    const parsedDraft: unknown = JSON.parse(rawDraft);
    if (!isMonsterHomebrewDraft(parsedDraft)) {
      throw new Error("Saved monster draft has an invalid shape.");
    }

    return {
      ...parsedDraft,
      ruleset: "homebrew",
      source: "Local homebrew draft"
    };
  } catch (error) {
    console.error("Loading monster homebrew draft failed", { error });
    throw new Error("Saved monster draft could not be loaded.");
  }
};

export const saveMonsterHomebrewDraft = (
  storage: MonsterDraftStorageAdapter,
  monster: MonsterCardData
): void => {
  try {
    if (!isMonsterHomebrewDraft(monster)) {
      throw new Error("Monster draft has an invalid shape.");
    }

    storage.setItem(MONSTER_HOMEBREW_STORAGE_KEY, JSON.stringify(monster));
  } catch (error) {
    console.error("Saving monster homebrew draft failed", { error });
    throw new Error("Monster draft could not be saved in this browser.");
  }
};
