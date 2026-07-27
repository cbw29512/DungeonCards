import type { CardDefinition } from "../types/cardPlatform";
import type {
  CardRuntimeInstance,
  DeckDefinition,
  DeckRuntimeState
} from "../types/cardPlatformRuntime";
import { validateCardRuntimeInstance } from "./cardPlatformRuntimeValidation";

export type CardInstanceOptions = {
  ownerId?: string;
  customName?: string;
  notes?: string;
};

export const createCardRuntimeInstance = (
  definition: CardDefinition,
  id: string,
  options: CardInstanceOptions = {},
  now = new Date().toISOString()
): CardRuntimeInstance => {
  const instance: CardRuntimeInstance = {
    schemaVersion: 2,
    id,
    definitionId: definition.id,
    gameSystemId: definition.gameSystemId,
    ...(options.ownerId ? { ownerId: options.ownerId } : {}),
    ...(options.customName ? { customName: options.customName } : {}),
    resourceState: Object.fromEntries(definition.resources.map((resource) => [
      resource.id,
      resource.initial
    ])),
    conditions: [],
    notes: options.notes ?? "",
    isArchived: false,
    createdAt: now,
    updatedAt: now
  };
  const issues = validateCardRuntimeInstance(instance, definition);
  if (issues.length) throw new Error(`Card instance failed validation: ${issues.join(" ")}`);
  return instance;
};

export const createDeckRuntimeState = (
  deck: DeckDefinition,
  id: string,
  cardInstanceIds: string[] = [],
  now = new Date().toISOString()
): DeckRuntimeState => ({
  schemaVersion: 2,
  id,
  deckDefinitionId: deck.id,
  gameSystemId: deck.gameSystemId,
  cardInstanceIds: [...cardInstanceIds],
  notes: "",
  updatedAt: now
});
