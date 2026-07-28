import type { DndGameSystemId } from "./cardPlatform";
import type { EncounterMonsterEntry } from "./encounterMonsters";
import type { WorkspaceMoveDirection } from "./workspaces";

export type MonsterEncounterInstance = {
  instanceId: string;
  monsterId: string;
  label: string;
  pinned: boolean;
  currentHitPoints: number;
  maximumHitPoints: number;
  initiative: number | null;
  conditions: string[];
  reactionAvailable: boolean;
  rechargeReady: boolean;
  legendaryActionsMaximum: number;
  legendaryActionsRemaining: number;
};

export type MonsterEncounterWorkspace = {
  schemaVersion: 3;
  gameSystemId: DndGameSystemId;
  name: string;
  instances: MonsterEncounterInstance[];
  updatedAt: string;
};

export type ResolvedMonsterEncounterInstance = MonsterEncounterInstance & {
  monster: EncounterMonsterEntry;
};

export type MonsterEncounterWorkspaceLoadInput = {
  gameSystemId: DndGameSystemId;
  entries: EncounterMonsterEntry[];
  createInstanceId(): string;
};

export interface MonsterEncounterWorkspaceRepository {
  load(input: MonsterEncounterWorkspaceLoadInput): MonsterEncounterWorkspace;
  save(workspace: MonsterEncounterWorkspace): void;
  clear(gameSystemId: DndGameSystemId): void;
}

export type MonsterEncounterInstanceMove = {
  instanceId: string;
  direction: WorkspaceMoveDirection;
};