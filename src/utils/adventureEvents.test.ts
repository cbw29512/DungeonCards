import { describe, expect, it, vi } from "vitest";
import { hearthglowPack } from "../data/hearthglowPack";
import { rollAdventureEvent } from "./adventureEvents";
import { createAdventureState } from "./adventureRuntime";

describe("adventure events", () => {
  it("maps a d10 result to the matching event card", () => {
    const state = createAdventureState(hearthglowPack);
    expect(rollAdventureEvent(state, hearthglowPack, () => 7).activeEventCardId)
      .toBe("EVENT-07");
  });

  it("keeps state safe when a roller returns an invalid result", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const state = createAdventureState(hearthglowPack);
    expect(rollAdventureEvent(state, hearthglowPack, () => 11)).toBe(state);
  });
});
