import type { CardDefinition } from "../types/cardPlatform";
import type { DndCharacterCardCategory } from "../types/dndCharacterCards";

export type DndVaultCardFilter = "all" | DndCharacterCardCategory;

export const DND_VAULT_CARD_FILTERS: Array<{ id: DndVaultCardFilter; label: string }> = [
  { id: "all", label: "All Cards" },
  { id: "attack", label: "Attacks" },
  { id: "resource", label: "Resources" },
  { id: "spell", label: "Spells" },
  { id: "feature", label: "Features" },
  { id: "item", label: "Items" }
];

export const dndVaultCardCategory = (
  card: CardDefinition
): DndCharacterCardCategory => {
  if (card.family === "spell") return "spell";
  if (card.content.tags.includes("attack")) return "attack";
  if (card.content.tags.includes("resource")) return "resource";
  if (card.family === "item" || card.family === "weapon" || card.content.tags.includes("equipment")) return "item";
  return "feature";
};

export const countDndVaultCardCategories = (
  cards: CardDefinition[]
): Record<DndVaultCardFilter, number> => {
  const counts: Record<DndVaultCardFilter, number> = {
    all: cards.length,
    attack: 0,
    resource: 0,
    spell: 0,
    feature: 0,
    item: 0
  };
  cards.forEach((card) => { counts[dndVaultCardCategory(card)] += 1; });
  return counts;
};

export const filterDndVaultCards = (
  cards: CardDefinition[],
  filter: DndVaultCardFilter,
  query: string
): CardDefinition[] => {
  const normalized = query.trim().toLowerCase();
  return cards.filter((card) => {
    if (filter !== "all" && dndVaultCardCategory(card) !== filter) return false;
    if (!normalized) return true;
    const text = [
      card.content.title,
      card.content.subtitle,
      card.content.summary,
      card.family,
      ...card.content.tags,
      ...card.actions.map((action) => action.label),
      card.source.title
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes(normalized);
  });
};
