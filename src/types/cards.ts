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

export type DeckState = {
  flippedCardIds: string[];
  rollResults: Record<string, RollResult>;
};
