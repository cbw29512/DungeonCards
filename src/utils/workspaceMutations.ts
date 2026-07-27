import type {
  CardWorkspace,
  WorkspaceMoveDirection
} from "../types/workspaces";

const now = (): string => new Date().toISOString();

export const addWorkspaceCard = (
  workspace: CardWorkspace,
  cardId: string
): CardWorkspace => {
  if (workspace.activeCardIds.includes(cardId)) return workspace;
  return {
    ...workspace,
    activeCardIds: [...workspace.activeCardIds, cardId],
    cardOrder: [...workspace.cardOrder, cardId],
    updatedAt: now()
  };
};

export const removeWorkspaceCard = (
  workspace: CardWorkspace,
  cardId: string
): CardWorkspace => ({
  ...workspace,
  activeCardIds: workspace.activeCardIds.filter((id) => id !== cardId),
  pinnedCardIds: workspace.pinnedCardIds.filter((id) => id !== cardId),
  cardOrder: workspace.cardOrder.filter((id) => id !== cardId),
  updatedAt: now()
});

export const toggleWorkspacePin = (
  workspace: CardWorkspace,
  cardId: string
): CardWorkspace => {
  if (!workspace.activeCardIds.includes(cardId)) return workspace;
  const pinned = workspace.pinnedCardIds.includes(cardId);
  return {
    ...workspace,
    pinnedCardIds: pinned
      ? workspace.pinnedCardIds.filter((id) => id !== cardId)
      : [...workspace.pinnedCardIds, cardId],
    updatedAt: now()
  };
};

export const moveWorkspaceCard = (
  workspace: CardWorkspace,
  cardId: string,
  direction: WorkspaceMoveDirection
): CardWorkspace => {
  const order = [...workspace.cardOrder];
  const index = order.indexOf(cardId);
  if (index < 0) return workspace;
  const pinned = workspace.pinnedCardIds.includes(cardId);
  const step = direction === "earlier" ? -1 : 1;
  let target = index + step;
  while (
    target >= 0
    && target < order.length
    && workspace.pinnedCardIds.includes(order[target]) !== pinned
  ) {
    target += step;
  }
  if (target < 0 || target >= order.length) return workspace;
  [order[index], order[target]] = [order[target], order[index]];
  return { ...workspace, cardOrder: order, updatedAt: now() };
};

export const orderWorkspaceCards = <T extends { id: string }>(
  cards: T[],
  workspace: CardWorkspace
): T[] => {
  const byId = new Map(cards.map((card) => [card.id, card]));
  const pinned = new Set(workspace.pinnedCardIds);
  const ordered = workspace.cardOrder
    .map((id) => byId.get(id))
    .filter((card): card is T => Boolean(card));
  return [
    ...ordered.filter((card) => pinned.has(card.id)),
    ...ordered.filter((card) => !pinned.has(card.id))
  ];
};
