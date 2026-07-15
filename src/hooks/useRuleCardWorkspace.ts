import { useEffect, useMemo, useState } from "react";
import type { RuleCard } from "../types/ruleCards";
import type {
  ResolvedRuleCardInstance,
  RuleCardWorkspaceRole
} from "../types/ruleCardWorkspaces";
import type { WorkspaceMoveDirection } from "../types/workspaces";
import {
  addRuleCardInstance,
  createDefaultRuleCardWorkspace,
  createRuleCardWorkspaceRepository,
  moveRuleCardInstance,
  normalizeRuleCardWorkspace,
  orderRuleCardInstances,
  removeRuleCardInstance,
  renameRuleCardInstance,
  toggleRuleCardInstancePin
} from "../utils/ruleCardWorkspaceStorage";

const STARTER_CARD_COUNT = 6;

export const useRuleCardWorkspace = (
  role: RuleCardWorkspaceRole,
  cards: RuleCard[]
) => {
  const allowedCardIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const defaultCardIds = useMemo(
    () => allowedCardIds.slice(0, STARTER_CARD_COUNT),
    [allowedCardIds]
  );
  const repository = useMemo(
    () => createRuleCardWorkspaceRepository(window.localStorage),
    []
  );
  const [storageError, setStorageError] = useState<string>();
  const [workspace, setWorkspace] = useState(() => repository.load({
    role,
    allowedCardIds,
    defaultCardIds
  }));

  useEffect(() => {
    setWorkspace((current) => normalizeRuleCardWorkspace(current, allowedCardIds));
  }, [allowedCardIds]);

  useEffect(() => {
    try {
      repository.save(workspace);
      setStorageError(undefined);
    } catch (error) {
      console.error("Saving rule card instances failed", { role, error });
      setStorageError("This card table could not be saved in the current browser.");
    }
  }, [repository, role, workspace]);

  const activeCards = useMemo(() => {
    const byId = new Map(cards.map((card) => [card.id, card]));
    return orderRuleCardInstances(workspace.instances)
      .map((instance): ResolvedRuleCardInstance<RuleCard> | undefined => {
        const card = byId.get(instance.cardId);
        return card ? { ...instance, card } : undefined;
      })
      .filter((item): item is ResolvedRuleCardInstance<RuleCard> => Boolean(item));
  }, [cards, workspace.instances]);

  const countCopies = (cardId: string) => workspace.instances.filter(
    (instance) => instance.cardId === cardId
  ).length;

  const addCard = (cardId: string) => setWorkspace((current) =>
    addRuleCardInstance(current, cardId)
  );
  const removeCard = (instanceId: string) => setWorkspace((current) =>
    removeRuleCardInstance(current, instanceId)
  );
  const renameCard = (instanceId: string, label: string) => setWorkspace((current) =>
    renameRuleCardInstance(current, instanceId, label)
  );
  const togglePin = (instanceId: string) => setWorkspace((current) =>
    toggleRuleCardInstancePin(current, instanceId)
  );
  const moveCard = (instanceId: string, direction: WorkspaceMoveDirection) =>
    setWorkspace((current) => moveRuleCardInstance(current, instanceId, direction));
  const resetWorkspace = () => {
    repository.clear(role);
    setWorkspace(createDefaultRuleCardWorkspace(role, defaultCardIds));
  };

  return {
    workspace,
    activeCards,
    storageError,
    countCopies,
    addCard,
    removeCard,
    renameCard,
    togglePin,
    moveCard,
    resetWorkspace
  };
};
