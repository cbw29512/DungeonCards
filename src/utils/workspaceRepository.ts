import type {
  CardWorkspace,
  WorkspaceLoadInput,
  WorkspaceRepository
} from "../types/workspaces";
import {
  createDefaultWorkspace,
  isWorkspace,
  normalizeWorkspace
} from "./workspaceModel";

const STORAGE_PREFIX = "dungeon-cards-workspace-v2";
const LEGACY_PREFIX = "dungeon-cards-workspace-v1";

const storageKey = (
  role: WorkspaceLoadInput["role"],
  gameSystemId: WorkspaceLoadInput["gameSystemId"]
): string => `${STORAGE_PREFIX}-${role}-${gameSystemId}`;

const readJson = (storage: Storage, key: string): unknown => {
  const raw = storage.getItem(key);
  return raw ? JSON.parse(raw) : undefined;
};

const migrateLegacy = (
  storage: Storage,
  input: WorkspaceLoadInput
): CardWorkspace | undefined => {
  const parsed = readJson(storage, `${LEGACY_PREFIX}-${input.role}`);
  if (!parsed || typeof parsed !== "object") return undefined;
  const item = parsed as {
    activeCardIds?: unknown;
    pinnedCardIds?: unknown;
    cardOrder?: unknown;
  };
  if (!Array.isArray(item.activeCardIds)) return undefined;
  const allowed = new Set(input.allowedCardIds);
  const activeCardIds = item.activeCardIds.filter(
    (value): value is string => typeof value === "string" && allowed.has(value)
  );
  const workspace = createDefaultWorkspace(
    input.role,
    input.gameSystemId,
    activeCardIds
  );
  const pinnedCardIds = Array.isArray(item.pinnedCardIds)
    ? item.pinnedCardIds.filter(
        (value): value is string => typeof value === "string" && activeCardIds.includes(value)
      )
    : [];
  const ordered = Array.isArray(item.cardOrder)
    ? item.cardOrder.filter(
        (value): value is string => typeof value === "string" && activeCardIds.includes(value)
      )
    : [];
  return normalizeWorkspace({
    ...workspace,
    pinnedCardIds,
    cardOrder: [...new Set([...ordered, ...activeCardIds])]
  }, input.gameSystemId, input.allowedCardIds);
};

export const createLocalWorkspaceRepository = (
  storage: Storage
): WorkspaceRepository => ({
  load: (input) => {
    const fallback = createDefaultWorkspace(
      input.role,
      input.gameSystemId,
      input.defaultCardIds
    );
    try {
      const parsed = readJson(storage, storageKey(input.role, input.gameSystemId));
      if (isWorkspace(parsed)
        && parsed.role === input.role
        && parsed.gameSystemId === input.gameSystemId) {
        return normalizeWorkspace(parsed, input.gameSystemId, input.allowedCardIds);
      }
      return migrateLegacy(storage, input) ?? normalizeWorkspace(
        fallback,
        input.gameSystemId,
        input.allowedCardIds
      );
    } catch (error) {
      console.error("Loading the local workspace failed", {
        role: input.role,
        gameSystemId: input.gameSystemId,
        error
      });
      return normalizeWorkspace(fallback, input.gameSystemId, input.allowedCardIds);
    }
  },
  save: (workspace) => storage.setItem(
    storageKey(workspace.role, workspace.gameSystemId),
    JSON.stringify(workspace)
  ),
  clear: (role, gameSystemId) => storage.removeItem(storageKey(role, gameSystemId))
});
