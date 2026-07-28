import { useEffect, useMemo, useState } from "react";
import type { DndGameSystemId } from "../types/cardPlatform";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { MonsterEncounterWorkspace } from "../types/monsterEncounterWorkspace";
import type { WorkspaceMoveDirection } from "../types/workspaces";
import { createClientId } from "../utils/clientId";
import {
  addMonsterEncounterCondition,
  addMonsterEncounterInstance,
  moveMonsterEncounterInstance,
  orderMonsterEncounterInstances,
  removeMonsterEncounterCondition,
  removeMonsterEncounterInstance,
  renameMonsterEncounterInstance,
  setMonsterEncounterHitPoints,
  setMonsterEncounterInitiative,
  setMonsterEncounterLegendaryRemaining,
  setMonsterEncounterMaximumHitPoints,
  setMonsterEncounterReaction,
  setMonsterEncounterRecharge,
  sortMonsterEncounterByInitiative,
  startMonsterEncounterTurn,
  toggleMonsterEncounterPin
} from "../utils/monsterEncounterWorkspaceMutations";
import { createEmptyMonsterEncounterWorkspace } from "../utils/monsterEncounterWorkspaceModel";
import { createMonsterEncounterWorkspaceRepository } from "../utils/monsterEncounterWorkspaceRepository";
import { getRuntimeStorage } from "../utils/runtimeStorage";

export const useMonsterEncounterWorkspace = (
  entries: EncounterMonsterEntry[],
  gameSystemId: DndGameSystemId
) => {
  const repository = useMemo(
    () => createMonsterEncounterWorkspaceRepository(getRuntimeStorage()),
    []
  );
  const load = () => repository.load({
    gameSystemId,
    entries,
    createInstanceId: () => createClientId("monster-instance")
  });
  const [workspace, setWorkspace] = useState<MonsterEncounterWorkspace>(load);
  const [storageError, setStorageError] = useState<string>();

  useEffect(() => {
    setWorkspace(load());
  }, [entries, gameSystemId, repository]);

  useEffect(() => {
    try {
      repository.save(workspace);
      setStorageError(undefined);
    } catch (error) {
      console.error("Saving the monster encounter workspace failed", { gameSystemId, error });
      setStorageError("This encounter could not be saved in the current browser.");
    }
  }, [gameSystemId, repository, workspace]);

  const byId = useMemo(() => new Map(entries.map((entry) => [entry.id, entry])), [entries]);
  const activeInstances = useMemo(() => orderMonsterEncounterInstances(workspace.instances)
    .flatMap((instance) => {
      const monster = byId.get(instance.monsterId);
      return monster ? [{ ...instance, monster }] : [];
    }), [byId, workspace.instances]);

  const commit = (mutate: (current: MonsterEncounterWorkspace) => MonsterEncounterWorkspace) => (
    setWorkspace((current) => mutate(current))
  );

  return {
    workspace,
    activeInstances,
    activeEntries: activeInstances.map((instance) => instance.monster),
    storageError,
    countCopies: (monsterId: string) => workspace.instances.filter((instance) => instance.monsterId === monsterId).length,
    addMonster: (monsterId: string) => {
      const entry = byId.get(monsterId);
      if (entry) commit((current) => addMonsterEncounterInstance(current, entry, createClientId("monster-instance")));
    },
    removeInstance: (instanceId: string) => commit((current) => removeMonsterEncounterInstance(current, instanceId)),
    renameInstance: (instanceId: string, label: string) => commit((current) => renameMonsterEncounterInstance(current, instanceId, label)),
    setHitPoints: (instanceId: string, value: number) => commit((current) => setMonsterEncounterHitPoints(current, instanceId, value)),
    setMaximumHitPoints: (instanceId: string, value: number) => commit((current) => setMonsterEncounterMaximumHitPoints(current, instanceId, value)),
    setInitiative: (instanceId: string, value: number | null) => commit((current) => setMonsterEncounterInitiative(current, instanceId, value)),
    addCondition: (instanceId: string, condition: string) => commit((current) => addMonsterEncounterCondition(current, instanceId, condition)),
    removeCondition: (instanceId: string, condition: string) => commit((current) => removeMonsterEncounterCondition(current, instanceId, condition)),
    togglePin: (instanceId: string) => commit((current) => toggleMonsterEncounterPin(current, instanceId)),
    moveInstance: (instanceId: string, direction: WorkspaceMoveDirection) => commit((current) => moveMonsterEncounterInstance(current, instanceId, direction)),
    setReaction: (instanceId: string, available: boolean) => commit((current) => setMonsterEncounterReaction(current, instanceId, available)),
    setRecharge: (instanceId: string, ready: boolean) => commit((current) => setMonsterEncounterRecharge(current, instanceId, ready)),
    setLegendaryRemaining: (instanceId: string, remaining: number) => commit((current) => setMonsterEncounterLegendaryRemaining(current, instanceId, remaining)),
    startTurn: (instanceId: string) => commit((current) => startMonsterEncounterTurn(current, instanceId)),
    sortByInitiative: () => commit(sortMonsterEncounterByInitiative),
    resetWorkspace: () => {
      repository.clear(gameSystemId);
      setWorkspace(createEmptyMonsterEncounterWorkspace(gameSystemId));
    }
  };
};