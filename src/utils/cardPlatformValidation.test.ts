import { describe, expect, it } from "vitest";
import type { CardDefinition } from "../types/cardPlatform";
import type {
  CardRuntimeInstance,
  DeckDefinition,
  DeckRuntimeState
} from "../types/cardPlatformRuntime";
import { validateCardRuntimeInstance, validateDeckRuntimeState } from "./cardPlatformRuntimeValidation";
import { validateCardDefinition } from "./cardPlatformValidation";

const card = (overrides: Partial<CardDefinition> = {}): CardDefinition => ({
  schemaVersion: 2,
  id: "coc-7e:sanity-check",
  gameSystemId: "coc-7e",
  family: "procedure",
  visibility: "player-safe",
  content: {
    title: "Sanity Check",
    summary: "Resolve a player-safe Sanity check procedure.",
    tags: ["sanity", "procedure"]
  },
  source: {
    kind: "original",
    title: "DM Forge original summary",
    publicDistributionAllowed: true
  },
  review: { status: "verified", reviewedAt: "2026-07-27" },
  actions: [{
    id: "resolve",
    kind: "procedure",
    label: "Resolve check",
    steps: ["Roll percentile dice.", "Apply the listed loss formula."]
  }],
  resources: [{
    id: "sanity",
    label: "Sanity",
    maximum: 99,
    initial: 60,
    refresh: "manual"
  }],
  linkedCardIds: [],
  print: { format: "standard-card", sizeId: "poker-2.5x3.5", faces: "front-back" },
  ...overrides
});

const instance = (definition: CardDefinition): CardRuntimeInstance => ({
  schemaVersion: 2,
  id: "instance:sanity-check:1",
  definitionId: definition.id,
  gameSystemId: definition.gameSystemId,
  ownerId: "user-1",
  resourceState: { sanity: 54 },
  conditions: [],
  notes: "",
  isArchived: false,
  createdAt: "2026-07-27T12:00:00.000Z",
  updatedAt: "2026-07-27T12:00:00.000Z"
});

describe("Card Platform v2 validation", () => {
  it("accepts a complete CoC card and tracked runtime instance", () => {
    const definition = card();
    expect(validateCardDefinition(definition)).toEqual([]);
    expect(validateCardRuntimeInstance(instance(definition), definition)).toEqual([]);
  });

  it("rejects unsafe public sources and malformed definition state", () => {
    const invalid = card({
      id: "Unsafe Card ID",
      source: {
        kind: "user-owned-private",
        title: "Owned rulebook notes",
        publicDistributionAllowed: true
      },
      content: {
        title: "Sanity Check",
        summary: "Summary",
        tags: ["sanity", "sanity"]
      },
      actions: [
        { id: "roll", kind: "roll", label: "Roll", rollSystem: "dice-formula" },
        { id: "roll", kind: "procedure", label: "Procedure", steps: [] }
      ],
      linkedCardIds: ["Unsafe Card ID"]
    });
    expect(validateCardDefinition(invalid)).toEqual(expect.arrayContaining([
      "Card ID is not safe for storage or URLs.",
      "Card tags must be unique.",
      "User-owned private sources cannot be marked distributable.",
      "Card action IDs must be unique.",
      "Roll needs a dice formula.",
      "Procedure needs at least one procedure step.",
      "A card cannot link to itself."
    ]));
  });

  it("rejects cross-system and incomplete runtime resource state", () => {
    const definition = card();
    expect(validateCardRuntimeInstance({
      ...instance(definition),
      gameSystemId: "dnd-2024",
      resourceState: { unknown: 1 }
    }, definition)).toEqual(expect.arrayContaining([
      "Card instance game system does not match its definition.",
      "Missing runtime resource: Sanity",
      "Unknown runtime resource: unknown"
    ]));
  });

  it("rejects cross-system instances inside a deck", () => {
    const deck: DeckDefinition = {
      schemaVersion: 2,
      id: "keeper-deck",
      gameSystemId: "coc-7e",
      kind: "game-master",
      name: "Keeper Deck",
      visibility: "game-master-only",
      cardDefinitionIds: [card().id]
    };
    const state: DeckRuntimeState = {
      schemaVersion: 2,
      id: "keeper-deck-state",
      deckDefinitionId: deck.id,
      gameSystemId: "coc-7e",
      cardInstanceIds: ["dnd-card-instance"],
      notes: "",
      updatedAt: "2026-07-27T12:00:00.000Z"
    };
    const foreign = { ...instance(card()), id: "dnd-card-instance", gameSystemId: "dnd-2014" as const };
    expect(validateDeckRuntimeState(state, deck, [foreign])).toContain(
      "Deck card instance dnd-card-instance belongs to another game system."
    );
  });
});
