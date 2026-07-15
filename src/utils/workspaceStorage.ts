import type {
  CardWorkspace,
  WorkspaceLoadInput,
  WorkspaceMoveDirection,
  WorkspaceRepository,
  WorkspaceRole
} from "../types/workspaces";

const STORAGE_PREFIX = "dungeon-cards-workspace-v1";
const unique = (values: string[]): string[] => [...new Set(values)];
const now = (): string => new Date().toISOString();
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const workspaceName = (role: WorkspaceRole): string => {
  if (role === "player") return "Player Table";
  if (role === "dm") return "DM Table";
  return "Monster Encounter";
};

export const createDefaultWorkspace = (
  role: WorkspaceRole,
  defaultCardIds: string[]
): CardWorkspace => ({
  schemaVersion: 1,
  id: `local-${role}`,
  ownerKey: "anonymous-local",
  name: workspaceName(role),
  role,
  activeCardIds: unique(defaultCardIds),
  pinnedCardIds: [],
  cardOrder: unique(defaultCardIds),
  updatedAt: now()
});

export const normalizeWorkspace = (
  workspace: CardWorkspace,
  allowedCardIds: string[]
): CardWorkspace => {
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

export const addWorkspaceCard = (workspace: CardWorkspace, cardId: string): CardWorkspace => {
  if (workspace.activeCardIds.includes(cardId)) return workspace;

  return {
    ...workspace,
    activeCardIds: [...workspace.activeCardIds, cardId],
    cardOrder: [...workspace.cardOrder, cardId],
    updatedAt: now()
  };
};

export const removeWorkspaceCard = (workspace: CardWorkspace, cardId: string): CardWorkspace => ({
  ...workspace,
  activeCardIds: workspace.activeCardIds.filter((id) => id !== cardId),
  pinnedCardIds: workspace.pinnedCardIds.filter((id) => id !== cardId),
  cardOrder: workspace.cardOrder.filter((id) => id !== cardId),
  updatedAt: now()
});

export const toggleWorkspacePin = (workspace: CardWorkspace, cardId: string): CardWorkspace => {
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

const isWorkspace = (value: unknown): value is CardWorkspace => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CardWorkspace>;
  return item.schemaVersion === 1
    && typeof item.id === "string"
    && typeof item.ownerKey === "string"
    && typeof item.name === "string"
    && typeof item.updatedAt === "string"
    && (item.role === "player" || item.role === "dm" || item.role === "monster")
    && isStringArray(item.activeCardIds)
    && isStringArray(item.pinnedCardIds)
    && isStringArray(item.cardOrder);
};

export const createLocalWorkspaceRepository = (storage: Storage): WorkspaceRepository => ({
  load: ({ role, allowedCardIds, defaultCardIds }: WorkspaceLoadInput) => {
    const fallback = createDefaultWorkspace(role, defaultCardIds);

    try {
      const raw = storage.getItem(`${STORAGE_PREFIX}-${role}`);
      if (!raw) return normalizeWorkspace(fallback, allowedCardIds);
      const parsed: unknown = JSON.parse(raw);
      return isWorkspace(parsed) && parsed.role === role
        ? normalizeWorkspace(parsed, allowedCardIds)
        : normalizeWorkspace(fallback, allowedCardIds);
    } catch {
      return normalizeWorkspace(fallback, allowedCardIds);
    }
  },
  save: (workspace) => {
    storage.setItem(`${STORAGE_PREFIX}-${workspace.role}`, JSON.stringify(workspace));
  },
  clear: (role) => storage.removeItem(`${STORAGE_PREFIX}-${role}`)
});