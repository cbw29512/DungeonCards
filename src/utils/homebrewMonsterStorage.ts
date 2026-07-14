import type { MonsterCardData } from "../types/monsters";
import { getMonsterCompletenessWarnings } from "./monsterCards";
import { isMonsterHomebrewDraft } from "./monsterHomebrewStorage";

export const HOMEBREW_MONSTER_STORAGE_KEY = "dungeon-cards.homebrew-monsters.v1";
const MAX_STORED_MONSTERS = 200;

export type HomebrewMonsterStorageAdapter = Pick<Storage, "getItem" | "setItem">;

const validateMonsterCollection = (
  value: unknown
): asserts value is MonsterCardData[] => {
  if (!Array.isArray(value) || value.length > MAX_STORED_MONSTERS) {
    throw new Error("Saved homebrew monster data has an invalid shape.");
  }

  const ids = new Set<string>();

  value.forEach((monster) => {
    if (!isMonsterHomebrewDraft(monster)) {
      throw new Error("Saved homebrew monster data has an invalid shape.");
    }

    if (getMonsterCompletenessWarnings(monster).length > 0) {
      throw new Error("Saved homebrew monster data is incomplete.");
    }

    if (ids.has(monster.id)) {
      throw new Error("Saved homebrew monster IDs must be unique.");
    }

    ids.add(monster.id);
  });
};

export const loadHomebrewMonsters = (
  storage: HomebrewMonsterStorageAdapter
): MonsterCardData[] => {
  try {
    const rawMonsters = storage.getItem(HOMEBREW_MONSTER_STORAGE_KEY);
    if (!rawMonsters) {
      return [];
    }

    const parsedMonsters: unknown = JSON.parse(rawMonsters);
    validateMonsterCollection(parsedMonsters);
    return parsedMonsters;
  } catch (error) {
    console.error("Loading homebrew monsters failed", { error });
    throw new Error("Saved homebrew monsters could not be loaded.");
  }
};

export const saveHomebrewMonsters = (
  storage: HomebrewMonsterStorageAdapter,
  monsters: MonsterCardData[]
): void => {
  try {
    validateMonsterCollection(monsters);
    storage.setItem(HOMEBREW_MONSTER_STORAGE_KEY, JSON.stringify(monsters));
  } catch (error) {
    console.error("Saving homebrew monsters failed", { error });
    throw new Error("Homebrew monsters could not be saved in this browser.");
  }
};
