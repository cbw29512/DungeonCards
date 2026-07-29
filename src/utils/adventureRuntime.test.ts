import { describe, expect, it, vi } from "vitest";
import { hearthglowPack } from "../data/hearthglowPack";
import {
  addTreasure,
  createAdventureState,
  placeAdventureCard,
  removeAdventureCard,
  selectAdventureRoom,
  toggleRevealedCard
} from "./adventureRuntime";

describe("adventure runtime", () => {
  it("starts the DM in the first room with hidden cards", () => {
    const state = createAdventureState(hearthglowPack);
    expect(state.view).toBe("dm");
    expect(state.roomId).toBe("square");
    expect(state.revealedCardIds).toEqual([]);
  });

  it("clears revealed cards when the DM changes rooms", () => {
    const state = { ...createAdventureState(hearthglowPack), revealedCardIds: ["LOC-005"] };
    expect(selectAdventureRoom(state, "inn", hearthglowPack)).toMatchObject({
      roomId: "inn",
      revealedCardIds: []
    });
  });

  it("reveals and hides a card without duplicating it", () => {
    const state = createAdventureState(hearthglowPack);
    const shown = toggleRevealedCard(state, "LOC-005", hearthglowPack);
    const hidden = toggleRevealedCard(shown, "LOC-005", hearthglowPack);
    expect(shown.revealedCardIds).toEqual(["LOC-005"]);
    expect(hidden.revealedCardIds).toEqual([]);
  });

  it("keeps state safe when an unknown room is requested", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const state = createAdventureState(hearthglowPack);
    expect(selectAdventureRoom(state, "missing", hearthglowPack)).toBe(state);
  });

  it("adds only one copy of approved treasure", () => {
    const state = createAdventureState(hearthglowPack);
    const once = addTreasure(state, "ITEM-001");
    expect(addTreasure(once, "ITEM-001").backpackCardIds).toEqual(["ITEM-001"]);
  });

  it("places a library card in only the active room", () => {
    const state = createAdventureState(hearthglowPack);
    const result = placeAdventureCard(state, "MON-002", hearthglowPack);
    expect(result.placedCardIdsByRoom.square).toContain("MON-002");
    expect(result.placedCardIdsByRoom.inn).not.toContain("MON-002");
  });

  it("removes a card from the room and from player reveals", () => {
    const state = {
      ...createAdventureState(hearthglowPack),
      revealedCardIds: ["LOC-005"]
    };
    const result = removeAdventureCard(state, "LOC-005");
    expect(result.placedCardIdsByRoom.square).not.toContain("LOC-005");
    expect(result.revealedCardIds).not.toContain("LOC-005");
  });
});
