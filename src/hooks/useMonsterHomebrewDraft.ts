import { useEffect, useState } from "react";
import { monsterHomebrewExample } from "../data/monsterCatalog";
import type { MonsterCardData, MonsterItem } from "../types/monsters";

const STORAGE_KEY = "dungeon-cards-monster-homebrew-v1";
const cloneExample = (): MonsterCardData => JSON.parse(JSON.stringify(monsterHomebrewExample));

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

const loadDraft = (): MonsterCardData => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneExample();
    const parsed = JSON.parse(raw) as Partial<MonsterCardData>;
    return typeof parsed.name === "string" && parsed.abilities && Array.isArray(parsed.actions)
      ? { ...cloneExample(), ...parsed, ruleset: "homebrew", source: "Local homebrew draft" }
      : cloneExample();
  } catch {
    return cloneExample();
  }
};

export const useMonsterHomebrewDraft = () => {
  const [monster, setMonster] = useState<MonsterCardData>(loadDraft);
  const [storageError, setStorageError] = useState<string>();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(monster));
      setStorageError(undefined);
    } catch {
      setStorageError("This monster draft could not be saved in the current browser.");
    }
  }, [monster]);

  const updateField = (field: MonsterTextField, value: string) => {
    setMonster((current) => ({ ...current, [field]: value }));
  };

  const updateAbility = (ability: keyof MonsterCardData["abilities"], value: number) => {
    setMonster((current) => ({
      ...current,
      abilities: { ...current.abilities, [ability]: value }
    }));
  };

  const updatePrimaryAction = (field: keyof MonsterItem, value: string) => {
    setMonster((current) => {
      const actions = [...current.actions];
      const index = actions.length > 1 ? 1 : 0;
      actions[index] = { ...(actions[index] ?? { name: "Primary Attack" }), [field]: value };
      return { ...current, actions };
    });
  };

  const reset = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setMonster(cloneExample());
  };

  return { monster, storageError, updateField, updateAbility, updatePrimaryAction, reset };
};