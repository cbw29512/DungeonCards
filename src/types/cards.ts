export type CardCategory =
  | "attack"
  | "damage"
  | "spell"
  | "save"
  | "skill"
  | "dm"
  | "homebrew";

export type DiceCard = {
  id: string;
  name: string;
  category: CardCategory;
  formula: string;
  description: string;
  imageEmoji: string;
  critOn?: number;
  failOn?: number;
  isFavorite: boolean;
};

export type HomebrewCardDraft = Omit<DiceCard, "id" | "category">;

export type DieRoll = {
  sides: number;
  results: number[];
};

export type RollResult = {
  formula: string;
  dice: DieRoll[];
  modifier: number;
  total: number;
  isCritical: boolean;
  isFailure: boolean;
};

export type RollHistoryEntry = {
  id: string;
  cardId: string;
  cardName: string;
  category: CardCategory;
  formula: string;
  result: RollResult;
  rolledAt: string;
};

export type DeckState = {
  activeFlippedCardId: string | null;
  rollResults: Record<string, RollResult>;
  rollHistory: RollHistoryEntry[];
};
