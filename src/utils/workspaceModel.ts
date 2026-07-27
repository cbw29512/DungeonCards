import type { GameSystemId } from "../types/cardPlatform";
import type {
  CardWorkspace,
  WorkspaceRole
} from "../types/workspaces";

const unique = (values: string[]): string[] => [...new Set(values)];
const now = (): string => new Date().toISOString();
const isStringArray = (value: unknown): value is string[] => (
  Array.isArray(value) && value.every((item) => typeof item === "string")
);

const workspaceName = (role: WorkspaceRole): string => {
  if (role === "player") return "Player Table";
  if (role === "dm") return "DM Table";
  return "Monster Encounter";
};

export const createDefaultWorkspace = (
  role: WorkspaceRole,
  gameSystemId: GameSystemId,
  defaultCardIds: string[]
): CardWorkspace => ({
  schemaVersion: 2,
  id: `local-${gameSystemId}-${role}`,
  ownerKey: "anonymous-local",
  name: workspaceName(role),
  role,
  gameSystemId,
  activeCardIds: unique(defaultCardIds),
  pinnedCardIds: [],
  cardOrder: unique(defaultCardIds),
  updatedAt: now()
});

export const isWorkspace = (value: unknown): value is CardWorkspace => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CardWorkspace>;
  return item.schemaVersion === 2
    && typeof item.id === "string"
    && typeof item.ownerKey === "string"
    && typeof item.name === "string"
    && typeof item.updatedAt === "string"
    && (item.role === "player" || item.role === "dm" || item.role === "monster")
    && (item.gameSystemId === "dnd-2014" || item.gameSystemId === "dnd-2024" || item.gameSystemId === "coc-7e")
    && isStringArray(item.activeCardIds)
    && isStringArray(item.pinnedCardIds)
    && isStringArray(item.cardOrder);
};

export const normalizeWorkspace = (
  workspace: CardWorkspace,
  gameSystemId: GameSystemId,
  allowedCardIds: string[]
): CardWorkspace => {
  if (workspace.gameSystemId !== gameSystemId) {
    return createDefaultWorkspace(workspace.role, gameSystemId, []);
  }
  const allowed = new Set(allowedCardIds);
  const activeCardIds = unique(workspace.activeCardIds).filter((id) => allowed.has(id));
  const active = new Set(activeCardIds);
  const ordered = unique(workspace.cardOrder).filter((id) => active.has(id));
  const missing = activeCardIds.filter((id) => !ordered.includes(id));
  return {
    ...workspace,
    activeCardIds,
    pinnedCardIds: unique(workspace.pinnedCardIds).filter((id) => active.has(id)),
    cardOrder: [...ordered, ...missing]
  };
};
