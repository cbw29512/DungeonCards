import type {
  DiceCard,
  HomebrewDiceCard
} from "../types/cards";
import { validateDiceFormula } from "./rollDice";

export const HOMEBREW_STORAGE_KEY = "dungeon-cards.homebrew.v2";
export const LEGACY_HOMEBREW_STORAGE_KEY = "dungeon-cards.homebrew.v1";
const MAX_STORED_CARDS = 500;

export type StorageAdapter = Pick<Storage, "getItem" | "setItem">;
export type HomebrewCardLoadResult = {
  cards: HomebrewDiceCard[];
  migratedLegacyCount: number;
};

const isValidString = (value: unknown, maxLength: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
const isOptionalThreshold = (value: unknown): value is number | undefined =>
  value === undefined || (Number.isSafeInteger(value) && Number(value) >= 1 && Number(value) <= 1000);

const isLegacyHomebrewCard = (value: unknown): value is DiceCard => {
  if (!value || typeof value !== "object") return false;
  const card = value as Record<string, unknown>;
  return isValidString(card.id, 100)
    && isValidString(card.name, 60)
    && card.category === "homebrew"
    && isValidString(card.formula, 60)
    && isValidString(card.description, 180)
    && isValidString(card.imageEmoji, 16)
    && typeof card.isFavorite === "boolean"
    && isOptionalThreshold(card.critOn)
    && isOptionalThreshold(card.failOn);
};

const isHomebrewCard = (value: unknown): value is HomebrewDiceCard => {
  if (!isLegacyHomebrewCard(value)) return false;
  const card = value as Partial<HomebrewDiceCard>;
  return card.schemaVersion === 2
    && (card.gameSystemId === "dnd-2014" || card.gameSystemId === "dnd-2024");
};

const validateCardCollection = (cards: unknown): HomebrewDiceCard[] => {
  if (!Array.isArray(cards) || cards.length > MAX_STORED_CARDS || !cards.every(isHomebrewCard)) {
    throw new Error("Saved homebrew card data has an invalid shape.");
  }
  const ids = new Set<string>();
  cards.forEach((card) => {
    if (ids.has(card.id)) throw new Error("Saved homebrew card IDs must be unique.");
    ids.add(card.id);
    validateDiceFormula(card.formula);
  });
  return cards;
};

const migrateLegacyCards = (value: unknown): HomebrewDiceCard[] => {
  if (!Array.isArray(value) || value.length > MAX_STORED_CARDS || !value.every(isLegacyHomebrewCard)) {
    throw new Error("Saved legacy homebrew card data has an invalid shape.");
  }
  return value.map((card) => ({
    ...card,
    schemaVersion: 2 as const,
    gameSystemId: "dnd-2024" as const
  }));
};

export const loadHomebrewCards = (storage: StorageAdapter): HomebrewCardLoadResult => {
  try {
    const current = storage.getItem(HOMEBREW_STORAGE_KEY);
    if (current) {
      const envelope: unknown = JSON.parse(current);
      if (!envelope || typeof envelope !== "object" || (envelope as { schemaVersion?: unknown }).schemaVersion !== 2) {
        throw new Error("Saved homebrew card envelope is invalid.");
      }
      return {
        cards: validateCardCollection((envelope as { cards?: unknown }).cards),
        migratedLegacyCount: 0
      };
    }
    const legacy = storage.getItem(LEGACY_HOMEBREW_STORAGE_KEY);
    if (!legacy) return { cards: [], migratedLegacyCount: 0 };
    const cards = migrateLegacyCards(JSON.parse(legacy));
    cards.forEach((card) => validateDiceFormula(card.formula));
    return { cards, migratedLegacyCount: cards.length };
  } catch (error) {
    console.error("Loading homebrew cards failed", { error });
    throw new Error("Saved homebrew cards could not be loaded.");
  }
};

export const saveHomebrewCards = (
  storage: StorageAdapter,
  cards: HomebrewDiceCard[]
): void => {
  try {
    const validated = validateCardCollection(cards);
    storage.setItem(HOMEBREW_STORAGE_KEY, JSON.stringify({
      schemaVersion: 2,
      cards: validated
    }));
  } catch (error) {
    console.error("Saving homebrew cards failed", { error });
    throw new Error("Homebrew cards could not be saved in this browser.");
  }
};
