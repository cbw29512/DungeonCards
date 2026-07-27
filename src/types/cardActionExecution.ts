import type { GameSystemId } from "./cardPlatform";
import type { AdvantageMode } from "./ruleCards";
import type { CocDifficulty, CocRollMode, CocSuccessLevel } from "./coc";

export type CardActionResourceChange = {
  resourceId: string;
  before: number;
  after: number;
  amount: number;
};

export type CardActionRollDetails = {
  rollSystem: "dice-formula" | "d20" | "percentile";
  formula?: string;
  total?: number;
  dice?: Array<{ sides: number; results: number[]; keptResults?: number[] }>;
  isCritical?: boolean;
  isFailure?: boolean;
  percentileRoll?: number;
  percentileTarget?: number;
  percentileDifficulty?: CocDifficulty;
  percentileMode?: CocRollMode;
  successLevel?: CocSuccessLevel;
  meetsDifficulty?: boolean;
};

export type CardActionExecutionResult = {
  actionKind: "roll" | "procedure" | "link";
  summary: string;
  resourceState: Record<string, number>;
  resourceChanges: CardActionResourceChange[];
  roll?: CardActionRollDetails;
  procedureSteps?: string[];
  targetCardIds?: string[];
};

export type CardActionExecutionOptions = {
  advantageMode?: AdvantageMode;
  percentileTarget?: number;
  percentileDifficulty?: CocDifficulty;
  bonusDice?: number;
  penaltyDice?: number;
  randomInteger?: (minimum: number, maximum: number) => number;
};

export type CardActionHistoryEntry = {
  schemaVersion: 1;
  id: string;
  gameSystemId: GameSystemId;
  executedAt: string;
  deckId: string;
  cardInstanceId: string;
  definitionId: string;
  actionId: string;
  actionKind: "roll" | "procedure" | "link";
  label: string;
  summary: string;
  roll?: CardActionRollDetails;
  resourceChanges: CardActionResourceChange[];
};

export type CardActionHistoryEnvelope = {
  format: "dm-forge-card-action-history";
  schemaVersion: 1;
  gameSystemId: GameSystemId;
  entries: CardActionHistoryEntry[];
};

export type CardActionHistoryLoad = {
  history: CardActionHistoryEnvelope;
  error?: string;
};
