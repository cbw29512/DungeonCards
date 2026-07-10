import type { DiceCard } from "../types/cards";
import { validateDiceFormula } from "./rollDice";

const STORAGE_KEY = "dungeon-cards.homebrew.v1";

export type StorageAdapter = Pick<Storage, "getItem" | "setItem">;

const isOptionalNumber = (value: unknown): value is number | undefined => {
  return value === undefined || typeof value === "number";
};

const isHomebrewCard = (value: unknown): value is DiceCard => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const card = value as Record<string, unknown>;

  return (
    typeof card.id === "string" &&
    typeof card.name === "string" &&
    card.category === "homebrew" &&
    typeof card.formula === "string" &&
    typeof card.description === "string" &&
    typeof card.imageEmoji === "string" &&
    typeof card.isFavorite === "boolean" &&
    isOptionalNumber(card.critOn) &&
    isOptionalNumber(card.failOn)
  );
};

export const loadHomebrewCards = (storage: StorageAdapter): DiceCard[] => {
  try {
    const rawCards = storage.getItem(STORAGE_KEY);

    if (!rawCards) {
      return [];
    }

    const parsedCards: unknown = JSON.parse(rawCards);

    if (!Array.isArray(parsedCards) || !parsedCards.every(isHomebrewCard)) {
      throw new Error("Saved homebrew card data has an invalid shape.");
    }

    parsedCards.forEach((card) => validateDiceFormula(card.formula));
    return parsedCards;
  } catch (error) {
    console.error("Loading homebrew cards failed", { error });
    throw new Error("Saved homebrew cards could not be loaded.");
  }
};

export const saveHomebrewCards = (storage: StorageAdapter, cards: DiceCard[]): void => {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error("Saving homebrew cards failed", { error });
    throw new Error("Homebrew cards could not be saved in this browser.");
  }
};
