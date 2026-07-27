import { describe, expect, it } from "vitest";
import type { CardDefinition } from "../types/cardPlatform";
import type { DeckDefinition } from "../types/cardPlatformRuntime";
import {
  createCardRuntimeInstance,
  createDeckRuntimeState
} from "./cardPlatformRuntimeState";

const definition: CardDefinition = {
  schemaVersion: 2,
  id: "dnd-2024:wand-of-testing",
  gameSystemId: "dnd-2024",
  family: "item",
  visibility: "private",
  content: {
    title: "Wand of Testing",
    summary: "A private tracked item fixture.",
    tags: ["wand", "charges"]
  },
  source: {
    kind: "user-owned-private",
    title: "Owned content fixture",
    publicDistributionAllowed: false
  },
  review: { status: "draft" },
  actions: [],
  resources: [{
    id: "charges",
    label: "Charges",
    maximum: 7,
    initial: 7,
    refresh: "daily"
  }],
  linkedCardIds: [],
  print: { format: "standard-card", sizeId: "poker-2.5x3.5", faces: "front-back" }
};

const deck: DeckDefinition = {
  schemaVersion: 2,
  id: "character-deck",
  gameSystemId: "dnd-2024",
  kind: "character",
  name: "Character Deck",
  visibility: "private",
  cardDefinitionIds: [definition.id]
};

describe("Card Platform runtime factories", () => {
  it("creates an independent runtime copy with initial resources", () => {
    const instance = createCardRuntimeInstance(
      definition,
      "instance:wand:1",
      { ownerId: "user-1", customName: "Rowan's Wand" },
      "2026-07-27T12:00:00.000Z"
    );
    expect(instance).toMatchObject({
      definitionId: definition.id,
      gameSystemId: "dnd-2024",
      ownerId: "user-1",
      customName: "Rowan's Wand",
      resourceState: { charges: 7 }
    });
  });

  it("requires an owner when creating a private runtime copy", () => {
    expect(() => createCardRuntimeInstance(definition, "instance:wand:2")).toThrow(
      "Private card instances require an owner."
    );
  });

  it("creates deck runtime state without mutating the supplied instance list", () => {
    const instanceIds = ["instance:wand:1"];
    const state = createDeckRuntimeState(deck, "deck-state:1", instanceIds, "2026-07-27T12:00:00.000Z");
    instanceIds.push("later-instance");
    expect(state.cardInstanceIds).toEqual(["instance:wand:1"]);
    expect(state.gameSystemId).toBe("dnd-2024");
  });
});
