import { useEffect, useMemo, useState } from "react";
import type { RuleCard, RulesetId } from "../types/ruleCards";
import type {
  ResolvedRuleCardInstance,
  RuleCardRulesetMap,
  RuleCardWorkspaceRole
} from "../types/ruleCardWorkspaces";
import type { WorkspaceMoveDirection } from "../types/workspaces";
import { getRuntimeStorage } from "../utils/runtimeStorage";
import {
  addRuleCardInstance,
  changeRuleCardInstanceRuleset,
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
const DEFAULT_RULESET: RulesetId = "srd-5.2.1-2024";

export const useRuleCardWorkspace = (
  role: RuleCardWorkspaceRole,
  cards: RuleCard[]
) => {
  const cardRulesets = useMemo<RuleCardRulesetMap>(() => Object.fromEntries(
    cards.map((card) => [card.id, Object.keys(card.variants) as RulesetId[]])
  ), [cards]);
  const defaultCardIds = useMemo(
    () => cards.map((card) => card.id).slice(0, STARTER_CARD_COUNT),
    [cards]
  );
  const repository = useMemo(
    () => createRuleCardWorkspaceRepository(getRuntimeStorage()),
    []
  );
  const [storageError, setStorageError] = useState<string>();
  const [workspace, setWorkspace] = useState(() => repository.load({
    role,
    cardRulesets,
    defaultCardIds,
    defaultRuleset: DEFAULT_RULESET
  }));

  useEffect(() => {
    setWorkspace((current) => normalizeRuleCardWorkspace(current, cardRulesets));
  }, [cardRulesets]);

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
  const addCard = (cardId: string, ruleset: RulesetId) => setWorkspace((current) =>
    addRuleCardInstance(current, cardId, ruleset)
  );
  const changeRuleset = (instanceId: string, ruleset: RulesetId) => setWorkspace((current) =>
    changeRuleCardInstanceRuleset(current, instanceId, ruleset)
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
    setWorkspace(createDefaultRuleCardWorkspace(
      role,
      defaultCardIds,
      cardRulesets,
      DEFAULT_RULESET
    ));
  };

  return {
    workspace,
    activeCards,
    storageError,
    countCopies,
    addCard,
    changeRuleset,
    removeCard,
    renameCard,
    togglePin,
    moveCard,
    resetWorkspace
  };
};