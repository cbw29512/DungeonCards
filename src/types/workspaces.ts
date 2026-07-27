import type { GameSystemId } from "./cardPlatform";

export type WorkspaceRole = "player" | "dm" | "monster";
export type WorkspaceView = "table" | "library";
export type WorkspaceMoveDirection = "earlier" | "later";

export type CardWorkspace = {
  schemaVersion: 2;
  id: string;
  ownerKey: string;
  name: string;
  role: WorkspaceRole;
  gameSystemId: GameSystemId;
  activeCardIds: string[];
  pinnedCardIds: string[];
  cardOrder: string[];
  updatedAt: string;
};

export type WorkspaceLoadInput = {
  role: WorkspaceRole;
  gameSystemId: GameSystemId;
  allowedCardIds: string[];
  defaultCardIds: string[];
};

export interface WorkspaceRepository {
  load(input: WorkspaceLoadInput): CardWorkspace;
  save(workspace: CardWorkspace): void;
  clear(role: WorkspaceRole, gameSystemId: GameSystemId): void;
}
