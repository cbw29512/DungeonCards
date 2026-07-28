import type { CardWorkspace } from "../types/workspaces";
import type {
  MonsterEncounterWorkspace,
  MonsterEncounterWorkspaceLoadInput,
  MonsterEncounterWorkspaceRepository
} from "../types/monsterEncounterWorkspace";
import {
  createEmptyMonsterEncounterWorkspace,
  createMonsterEncounterInstance,
  isMonsterEncounterWorkspace,
  normalizeMonsterEncounterWorkspace
} from "./monsterEncounterWorkspaceModel";

const STORAGE_PREFIX = "dungeon-monster-encounter-v3";
const LEGACY_V2_PREFIX = "dungeon-cards-workspace-v2-monster";

const storageKey = (gameSystemId: MonsterEncounterWorkspace["gameSystemId"]): string => (
  `${STORAGE_PREFIX}-${gameSystemId}`
);

const readJson = (storage: Storage, key: string): unknown => {
  const raw = storage.getItem(key);
  return raw ? JSON.parse(raw) : undefined;
};

const isLegacyMonsterWorkspace = (value: unknown): value is CardWorkspace => {
  if (!value || typeof value !== "object") return false;
  const workspace = value as Partial<CardWorkspace>;
  return workspace.schemaVersion === 2
    && workspace.role === "monster"
    && Array.isArray(workspace.activeCardIds)
    && Array.isArray(workspace.pinnedCardIds)
    && Array.isArray(workspace.cardOrder);
};

const migrateLegacyWorkspace = (
  storage: Storage,
  input: MonsterEncounterWorkspaceLoadInput
): MonsterEncounterWorkspace | undefined => {
  const raw = readJson(storage, `${LEGACY_V2_PREFIX}-${input.gameSystemId}`);
  if (!isLegacyMonsterWorkspace(raw) || raw.gameSystemId !== input.gameSystemId) return undefined;
  const byId = new Map(input.entries.map((entry) => [entry.id, entry]));
  const active = new Set(raw.activeCardIds.filter((id) => byId.has(id)));
  const ordered = [
    ...raw.cardOrder.filter((id) => active.has(id)),
    ...raw.activeCardIds.filter((id) => active.has(id) && !raw.cardOrder.includes(id))
  ];
  const seen = new Set<string>();
  const instances = ordered.flatMap((monsterId) => {
    if (seen.has(monsterId)) return [];
    seen.add(monsterId);
    const entry = byId.get(monsterId);
    if (!entry) return [];
    return [{
      ...createMonsterEncounterInstance(entry, input.createInstanceId(), `${entry.name} 1`),
      pinned: raw.pinnedCardIds.includes(monsterId)
    }];
  });
  return {
    schemaVersion: 3,
    gameSystemId: input.gameSystemId,
    name: "Monster Encounter",
    instances,
    updatedAt: new Date().toISOString()
  };
};

export const createMonsterEncounterWorkspaceRepository = (
  storage: Storage
): MonsterEncounterWorkspaceRepository => ({
  load: (input) => {
    const fallback = createEmptyMonsterEncounterWorkspace(input.gameSystemId);
    try {
      const current = readJson(storage, storageKey(input.gameSystemId));
      if (isMonsterEncounterWorkspace(current)) {
        return normalizeMonsterEncounterWorkspace(current, input.gameSystemId, input.entries);
      }
      const migrated = migrateLegacyWorkspace(storage, input);
      return normalizeMonsterEncounterWorkspace(migrated ?? fallback, input.gameSystemId, input.entries);
    } catch (error) {
      console.error("Loading the monster encounter workspace failed", {
        gameSystemId: input.gameSystemId,
        error
      });
      return fallback;
    }
  },
  save: (workspace) => storage.setItem(storageKey(workspace.gameSystemId), JSON.stringify(workspace)),
  clear: (gameSystemId) => storage.removeItem(storageKey(gameSystemId))
});