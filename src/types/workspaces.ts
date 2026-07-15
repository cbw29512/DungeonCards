export type WorkspaceRole = "player" | "dm" | "monster";
export type WorkspaceView = "table" | "library";
export type WorkspaceMoveDirection = "earlier" | "later";

export type CardWorkspace = {
  schemaVersion: 1;
  id: string;
  ownerKey: string;
  name: string;
  role: WorkspaceRole;
  activeCardIds: string[];
  pinnedCardIds: string[];
  cardOrder: string[];
  updatedAt: string;
};

export type WorkspaceLoadInput = {
  role: WorkspaceRole;
  allowedCardIds: string[];
  defaultCardIds: string[];
};

export interface WorkspaceRepository {
  load(input: WorkspaceLoadInput): CardWorkspace;
  save(workspace: CardWorkspace): void;
  clear(role: WorkspaceRole): void;
}