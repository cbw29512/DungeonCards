import type {
  CardActionDefinition,
  CardResourceDefinition
} from "./cardPlatformActions";

export type GameSystemId = "dnd-2014" | "dnd-2024" | "coc-7e";

export type CardFamily =
  | "rule"
  | "procedure"
  | "roll-action"
  | "spell"
  | "ritual"
  | "weapon"
  | "item"
  | "condition"
  | "creature"
  | "npc"
  | "clue"
  | "handout"
  | "location"
  | "scene"
  | "table"
  | "generator"
  | "character-action"
  | "investigator-action";

export type CardVisibility =
  | "public"
  | "player-safe"
  | "game-master-only"
  | "private";

export type CardSourceKind =
  | "srd"
  | "free-rules"
  | "original"
  | "licensed"
  | "user-owned-private"
  | "reference-only";

export type CardSourceReference = {
  kind: CardSourceKind;
  title: string;
  url?: string;
  edition?: string;
  section?: string;
  page?: number;
  license?: string;
  publicDistributionAllowed: boolean;
  notes?: string;
};

export type CardReviewStatus = "draft" | "rules-reviewed" | "playtested" | "verified";

export type CardReview = {
  status: CardReviewStatus;
  reviewedAt?: string;
  reviewer?: string;
  notes?: string[];
};

export type CardPrintLayout =
  | {
      format: "standard-card";
      sizeId: "poker-2.5x3.5";
      faces: "front" | "front-back";
    }
  | {
      format: "folio-panel";
      sizeId: "poker-2.5x3.5";
      panelIndex: number;
      panelCount: number;
    }
  | {
      format: "workspace-panel";
      sizeId: "responsive";
    };

export type CardContent = {
  title: string;
  subtitle?: string;
  summary: string;
  detail?: string;
  icon?: string;
  tags: string[];
};

export type CardDefinition = {
  schemaVersion: 2;
  id: string;
  gameSystemId: GameSystemId;
  family: CardFamily;
  visibility: CardVisibility;
  content: CardContent;
  source: CardSourceReference;
  review: CardReview;
  actions: CardActionDefinition[];
  resources: CardResourceDefinition[];
  linkedCardIds: string[];
  print: CardPrintLayout;
};
