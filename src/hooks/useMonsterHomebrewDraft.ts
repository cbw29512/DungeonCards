import { useEffect, useRef, useState } from "react";
import type { MonsterCardData, MonsterItem } from "../types/monsters";
import {
  cloneMonsterHomebrewExample,
  loadMonsterHomebrewDraft,
  saveMonsterHomebrewDraft
} from "../utils/monsterHomebrewStorage";

const ABILITY_MIN = 1;
const ABILITY_MAX = 30;

type MonsterTextField =
  | "name"
  | "cr"
  | "type"
  | "size"
  | "ac"
  | "hp"
  | "speed"
  | "senses"
  | "languages";

type InitialMonsterDraftState = {
  monster: MonsterCardData;
  error: string | null;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "An unexpected monster draft error occurred.";

const loadInitialState = (): InitialMonsterDraftState => {
  if (typeof window === "undefined") {
    return { monster: cloneMonsterHomebrewExample(), error: null };
  }

  try {
    return {
      monster: loadMonsterHomebrewDraft(window.localStorage),
      error: null
    };
  } catch (error) {
    console.error("Initializing monster homebrew draft failed", { error });
    return {
      monster: cloneMonsterHomebrewExample(),
      error: getErrorMessage(error)
    };
  }
};

export const useMonsterHomebrewDraft = () => {
  const [initialState] = useState<InitialMonsterDraftState>(loadInitialState);
  const [monster, setMonster] = useState<MonsterCardData>(initialState.monster);
  const [storageError, setStorageError] = useState<string | null>(initialState.error);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    try {
      saveMonsterHomebrewDraft(window.localStorage, monster);
      setStorageError(null);
    } catch (error) {
      console.error("Persisting monster homebrew draft failed", { error });
      setStorageError(getErrorMessage(error));
    }
  }, [monster]);

  const updateField = (field: MonsterTextField, value: string) => {
    try {
      setMonster((current) => ({ ...current, [field]: value }));
    } catch (error) {
      console.error("Updating monster text field failed", { field, error });
      setStorageError("The monster field could not be updated.");
    }
  };

  const updateAbility = (ability: keyof MonsterCardData["abilities"], value: number) => {
    try {
      if (!Number.isSafeInteger(value) || value < ABILITY_MIN || value > ABILITY_MAX) {
        setStorageError(`Ability scores must be whole numbers from ${ABILITY_MIN} to ${ABILITY_MAX}.`);
        return;
      }

      setMonster((current) => ({
        ...current,
        abilities: { ...current.abilities, [ability]: value }
      }));
    } catch (error) {
      console.error("Updating monster ability score failed", { ability, value, error });
      setStorageError("The ability score could not be updated.");
    }
  };

  const updatePrimaryAction = (field: keyof MonsterItem, value: string) => {
    try {
      setMonster((current) => {
        const actions = [...current.actions];
        const index = actions.length > 1 ? 1 : 0;
        actions[index] = { ...(actions[index] ?? { name: "Primary Attack" }), [field]: value };
        return { ...current, actions };
      });
    } catch (error) {
      console.error("Updating monster primary action failed", { field, error });
      setStorageError("The primary action could not be updated.");
    }
  };

  const reset = () => {
    try {
      setMonster(cloneMonsterHomebrewExample());
      setStorageError(null);
    } catch (error) {
      console.error("Resetting monster homebrew draft failed", { error });
      setStorageError("The Frost Troll example could not be restored.");
    }
  };

  return {
    monster,
    storageError,
    updateField,
    updateAbility,
    updatePrimaryAction,
    reset
  };
};
