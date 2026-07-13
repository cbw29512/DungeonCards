import { useEffect, useMemo, useState } from "react";
import type { WorkspaceMoveDirection, WorkspaceRole } from "../types/workspaces";
import {
  addWorkspaceCard,
  createDefaultWorkspace,
  createLocalWorkspaceRepository,
  moveWorkspaceCard,
  normalizeWorkspace,
  orderWorkspaceCards,
  removeWorkspaceCard,
  toggleWorkspacePin
} from "../utils/workspaceStorage";

const STARTER_CARD_COUNT = 6;

type WorkspaceItem = { id: string };

export const useCardWorkspace = <T extends WorkspaceItem>(
  role: WorkspaceRole,
  cards: T[]
) => {
  const allowedCardIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const defaultCardIds = useMemo(
    () => allowedCardIds.slice(0, STARTER_CARD_COUNT),
    [allowedCardIds]
  );
  const repository = useMemo(
    () => createLocalWorkspaceRepository(window.localStorage),
    []
  );
  const [storageError, setStorageError] = useState<string>();
  const [workspace, setWorkspace] = useState(() => repository.load({
    role,
    allowedCardIds,
    defaultCardIds
  }));

  useEffect(() => {
    setWorkspace((current) => normalizeWorkspace(current, allowedCardIds));
  }, [allowedCardIds]);

  useEffect(() => {
    try {
      repository.save(workspace);
      setStorageError(undefined);
    } catch {
      setStorageError("This workspace could not be saved in the current browser.");
    }
  }, [repository, workspace]);

  const activeCards = useMemo(() => orderWorkspaceCards(
    cards.filter((card) => workspace.activeCardIds.includes(card.id)),
    workspace
  ), [cards, workspace]);

  const addCard = (cardId: string) => setWorkspace((current) =>
    addWorkspaceCard(current, cardId)
  );
  const removeCard = (cardId: string) => setWorkspace((current) =>
    removeWorkspaceCard(current, cardId)
  );
  const togglePin = (cardId: string) => setWorkspace((current) =>
    toggleWorkspacePin(current, cardId)
  );
  const moveCard = (cardId: string, direction: WorkspaceMoveDirection) =>
    setWorkspace((current) => moveWorkspaceCard(current, cardId, direction));
  const resetWorkspace = () => {
    repository.clear(role);
    setWorkspace(createDefaultWorkspace(role, defaultCardIds));
  };

  return {
    workspace,
    activeCards,
    storageError,
    addCard,
    removeCard,
    togglePin,
    moveCard,
    resetWorkspace
  };
};