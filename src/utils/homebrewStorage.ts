import type { DiceCard } from "../types/cards";
import { validateDiceFormula } from "./rollDice";

export const HOMEBREW_STORAGE_KEY = "dungeon-cards.homebrew.v1";
const MAX_STORED_CARDS = 500;

export type StorageAdapter = Pick<Storage, "getItem" | "setItem">;

const isValidString = (value: unknown, maxLength: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;

const isOptionalThreshold = (value: unknown): value is number | undefined =>
  value === undefined || (Number.isSafeInteger(value) && Number(value) >= 1 && Number(value) <= 1000);

const isHomebrewCard = (value: unknown): value is DiceCard => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const card = value as Record<string, unknown>;

  return (
    isValidString(card.id, 100) &&
    isValidString(card.name, 60) &&
    card.category === "homebrew" &&
    isValidString(card.formula, 60) &&
    isValidString(card.description, 180) &&
    isValidString(card.imageEmoji, 16) &&
    typeof card.isFavorite === "boolean" &&
    isOptionalThreshold(card.critOn) &&
    isOptionalThreshold(card.failOn)
  );
};

function validateCardCollection(cards: unknown): asserts cards is DiceCard[] {
  if (!Array.isArray(cards) || cards.length > MAX_STORED_CARDS || !cards.every(isHomebrewCard)) {
    throw new Error("Saved homebrew card data has an invalid shape.");
  }

  cards.forEach((card) => validateDiceFormula(card.formula));
}

export const loadHomebrewCards = (storage: StorageAdapter): DiceCard[] => {
  try {
    const rawCards = storage.getItem(HOMEBREW_STORAGE_KEY);

    if (!rawCards) {
      return [];
    }

    const parsedCards: unknown = JSON.parse(rawCards);
    validateCardCollection(parsedCards);
    return parsedCards;
  } catch (error) {
    console.error("Loading homebrew cards failed", { error });
    throw new Error("Saved homebrew cards could not be loaded.");
  }
};

export const saveHomebrewCards = (storage: StorageAdapter, cards: DiceCard[]): void => {
  try {
    validateCardCollection(cards);
    storage.setItem(HOMEBREW_STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error("Saving homebrew cards failed", { error });
    throw new Error("Homebrew cards could not be saved in this browser.");
  }
};
