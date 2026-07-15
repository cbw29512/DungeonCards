import { useRef, useState } from "react";
import type { MonsterCardData } from "../types/monsters";
import { createClientId } from "../utils/createId";
import {
  loadHomebrewMonsters,
  saveHomebrewMonsters
} from "../utils/homebrewMonsterStorage";
import { getMonsterCompletenessWarnings } from "../utils/monsterCards";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "An unexpected homebrew monster error occurred.";

type InitialHomebrewMonsterState = {
  monsters: MonsterCardData[];
  error: string | null;
};

const loadInitialState = (): InitialHomebrewMonsterState => {
  if (typeof window === "undefined") {
    return { monsters: [], error: null };
  }

  try {
    return {
      monsters: loadHomebrewMonsters(window.localStorage),
      error: null
    };
  } catch (error) {
    console.error("Initializing homebrew monster library failed", { error });
    return {
      monsters: [],
      error: getErrorMessage(error)
    };
  }
};

const cloneMonster = (monster: MonsterCardData): MonsterCardData =>
  JSON.parse(JSON.stringify(monster)) as MonsterCardData;

export const useHomebrewMonsters = () => {
  const [initialState] = useState<InitialHomebrewMonsterState>(loadInitialState);
  const [monsters, setMonsters] = useState<MonsterCardData[]>(initialState.monsters);
  const monstersRef = useRef<MonsterCardData[]>(initialState.monsters);
  const [storageError, setStorageError] = useState<string | null>(initialState.error);

  const persistMonsters = (nextMonsters: MonsterCardData[]): boolean => {
    try {
      saveHomebrewMonsters(window.localStorage, nextMonsters);
      monstersRef.current = nextMonsters;
      setMonsters(nextMonsters);
      setStorageError(null);
      return true;
    } catch (error) {
      console.error("Persisting homebrew monster library failed", { error });
      setStorageError(getErrorMessage(error));
      return false;
    }
  };

  const createMonster = (draft: MonsterCardData): boolean => {
    try {
      const warnings = getMonsterCompletenessWarnings(draft);
      if (warnings.length > 0) {
        throw new Error(warnings[0]);
      }

      const monster: MonsterCardData = {
        ...cloneMonster(draft),
        id: createClientId("homebrew-monster"),
        ruleset: "homebrew",
        source: "Local homebrew monster",
        layoutHint: "auto"
      };

      return persistMonsters([monster, ...monstersRef.current]);
    } catch (error) {
      console.error("Creating a homebrew monster failed", { draft, error });
      setStorageError(getErrorMessage(error));
      return false;
    }
  };

  const deleteMonster = (monsterId: string): boolean => {
    try {
      return persistMonsters(
        monstersRef.current.filter((monster) => monster.id !== monsterId)
      );
    } catch (error) {
      console.error("Deleting a homebrew monster failed", { monsterId, error });
      setStorageError(getErrorMessage(error));
      return false;
    }
  };

  return {
    monsters,
    storageError,
    createMonster,
    deleteMonster
  };
};
