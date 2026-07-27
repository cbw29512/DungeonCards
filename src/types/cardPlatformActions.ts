export type CardRollSystem = "dice-formula" | "d20" | "percentile";

export type CardActionResourceCost = {
  resourceId: string;
  amount: number;
};

type CardActionBase = {
  id: string;
  label: string;
  resourceCosts?: CardActionResourceCost[];
};

export type CardRollActionDefinition = CardActionBase & {
  kind: "roll";
  rollSystem: CardRollSystem;
  formula?: string;
  allowsAdvantage?: boolean;
  criticalAt?: number;
  failureAt?: number;
  percentileTarget?: number;
  percentileDifficulty?: "regular" | "hard" | "extreme";
  notes?: string;
};

export type CardProcedureActionDefinition = CardActionBase & {
  kind: "procedure";
  steps: string[];
};

export type CardLinkActionDefinition = CardActionBase & {
  kind: "link";
  targetCardIds: string[];
};

export type CardActionDefinition =
  | CardRollActionDefinition
  | CardProcedureActionDefinition
  | CardLinkActionDefinition;

export type CardResourceRefresh =
  | "none"
  | "turn"
  | "round"
  | "short-rest"
  | "long-rest"
  | "daily"
  | "session"
  | "manual";

export type CardResourceDefinition = {
  id: string;
  label: string;
  maximum: number | "unlimited";
  initial: number;
  refresh: CardResourceRefresh;
  unit?: string;
  notes?: string;
};
