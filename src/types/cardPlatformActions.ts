export type CardRollSystem = "dice-formula" | "d20" | "percentile";

export type CardRollActionDefinition = {
  id: string;
  kind: "roll";
  label: string;
  rollSystem: CardRollSystem;
  formula?: string;
  allowsAdvantage?: boolean;
  criticalAt?: number;
  failureAt?: number;
  notes?: string;
};

export type CardProcedureActionDefinition = {
  id: string;
  kind: "procedure";
  label: string;
  steps: string[];
};

export type CardLinkActionDefinition = {
  id: string;
  kind: "link";
  label: string;
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
