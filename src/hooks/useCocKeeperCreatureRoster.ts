import { useEffect, useMemo, useState } from "react";
import { cocCreatureCatalog } from "../data/cocCreatureCatalog";
import type { CocKeeperCreatureRoster } from "../types/cocKeeperCreatureRoster";
import { createClientId } from "../utils/clientId";
import {
  addCocKeeperCreatureInstance,
  addCocKeeperCreatureStatus,
  clearCocKeeperCreatureRoster,
  loadCocKeeperCreatureRoster,
  removeCocKeeperCreatureInstance,
  removeCocKeeperCreatureStatus,
  renameCocKeeperCreatureInstance,
  restoreCocKeeperCreatureInstance,
  saveCocKeeperCreatureRoster,
  selectCocKeeperCreatureInstance,
  setCocKeeperCreatureHitPoints,
  setCocKeeperCreatureMagicPoints,
  setCocKeeperCreatureMaximumHitPoints,
  setCocKeeperCreatureMaximumMagicPoints,
  setCocKeeperCreatureNotes
} from "../utils/cocKeeperCreatureRoster";
import { getRuntimeStorage } from "../utils/runtimeStorage";

export const useCocKeeperCreatureRoster = () => {
  const storage = useMemo(() => getRuntimeStorage(), []);
  const loaded = useMemo(
    () => loadCocKeeperCreatureRoster(storage, cocCreatureCatalog),
    [storage]
  );
  const [roster, setRoster] = useState<CocKeeperCreatureRoster>(loaded.roster);
  const [storageError, setStorageError] = useState<string | undefined>(loaded.error);
  const creaturesById = useMemo(
    () => new Map(cocCreatureCatalog.map((creature) => [creature.id, creature])),
    []
  );

  useEffect(() => {
    try {
      saveCocKeeperCreatureRoster(storage, roster, cocCreatureCatalog);
      setStorageError(undefined);
    } catch (error) {
      console.error("Saving the Keeper creature roster failed", { error });
      setStorageError("This Keeper roster could not be saved in the current browser.");
    }
  }, [roster, storage]);

  const resolvedInstances = useMemo(() => roster.instances.flatMap((instance) => {
    const creature = creaturesById.get(instance.creatureId);
    return creature ? [{ ...instance, creature }] : [];
  }), [creaturesById, roster.instances]);
  const selectedInstance = resolvedInstances.find((instance) => (
    instance.instanceId === roster.selectedInstanceId
  ));

  const commit = (
    update: (current: CocKeeperCreatureRoster) => CocKeeperCreatureRoster
  ) => setRoster((current) => update(current));

  return {
    roster,
    resolvedInstances,
    selectedInstance,
    storageError,
    countCopies: (creatureId: string): number => roster.instances.filter((instance) => (
      instance.creatureId === creatureId
    )).length,
    addCreature: (creatureId: string) => {
      const creature = creaturesById.get(creatureId);
      if (!creature) return;
      commit((current) => addCocKeeperCreatureInstance(
        current,
        creature,
        createClientId("coc-creature-instance")
      ));
    },
    removeInstance: (instanceId: string) => commit((current) => (
      removeCocKeeperCreatureInstance(current, instanceId)
    )),
    selectInstance: (instanceId: string) => commit((current) => (
      selectCocKeeperCreatureInstance(current, instanceId)
    )),
    renameInstance: (instanceId: string, label: string) => commit((current) => (
      renameCocKeeperCreatureInstance(current, instanceId, label)
    )),
    setHitPoints: (instanceId: string, value: number) => commit((current) => (
      setCocKeeperCreatureHitPoints(current, instanceId, value)
    )),
    setMaximumHitPoints: (instanceId: string, value: number) => commit((current) => (
      setCocKeeperCreatureMaximumHitPoints(current, instanceId, value)
    )),
    setMagicPoints: (instanceId: string, value: number) => commit((current) => (
      setCocKeeperCreatureMagicPoints(current, instanceId, value)
    )),
    setMaximumMagicPoints: (instanceId: string, value: number) => commit((current) => (
      setCocKeeperCreatureMaximumMagicPoints(current, instanceId, value)
    )),
    addStatus: (instanceId: string, status: string) => commit((current) => (
      addCocKeeperCreatureStatus(current, instanceId, status)
    )),
    removeStatus: (instanceId: string, status: string) => commit((current) => (
      removeCocKeeperCreatureStatus(current, instanceId, status)
    )),
    setNotes: (instanceId: string, notes: string) => commit((current) => (
      setCocKeeperCreatureNotes(current, instanceId, notes)
    )),
    restoreInstance: (instanceId: string) => {
      const instance = roster.instances.find((candidate) => candidate.instanceId === instanceId);
      const creature = instance ? creaturesById.get(instance.creatureId) : undefined;
      if (!creature) return;
      commit((current) => restoreCocKeeperCreatureInstance(current, instanceId, creature));
    },
    clearRoster: () => {
      try {
        setRoster(clearCocKeeperCreatureRoster(storage));
        setStorageError(undefined);
      } catch (error) {
        console.error("Clearing the Keeper creature roster failed", { error });
        setStorageError("The Keeper roster could not be cleared in the current browser.");
      }
    }
  };
};
