import { describe, expect, it, vi } from "vitest";
import { hearthglowPack } from "../data/hearthglowPack";
import { createAdventureState } from "./adventureRuntime";
import {
  advanceAdventureTurn,
  rollRoomInitiative,
  toggleTurnResource
} from "./adventureInitiative";

describe("adventure initiative", () => {
  it("puts a natural 20 first and marks its free opening turn", () => {
    const state = {
      ...createAdventureState(hearthglowPack),
      roomId: "foundry",
      claimedCharacterId: "PC-001"
    };
    const rolls = [10, 20, 12];
    const result = rollRoomInitiative(hearthglowPack, state, () => rolls.shift() ?? 1);
    expect(result.initiative[0]?.openingTurn).toBe(true);
    expect(result.initiative[0]?.roll).toBe(20);
    expect(result.round).toBe(0);
    const roundOne = advanceAdventureTurn(result);
    expect(roundOne.round).toBe(1);
    expect(roundOne.initiative[roundOne.activeTurn]?.cardId).toBe(result.initiative[0]?.cardId);
  });

  it("uses the canonical secure RNG instead of Math.random by default", () => {
    const random = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used for live dice.");
    });
    const state = {
      ...createAdventureState(hearthglowPack),
      roomId: "foundry",
      claimedCharacterId: "PC-001"
    };
    const result = rollRoomInitiative(hearthglowPack, state);
    expect(result.initiative.length).toBeGreaterThan(0);
    expect(result.initiative.every((entry) => entry.roll >= 1 && entry.roll <= 20)).toBe(true);
    random.mockRestore();
  });

  it("uses the full ability chain to resolve equal totals", () => {
    const state = {
      ...createAdventureState(hearthglowPack),
      roomId: "foundry",
      claimedCharacterId: "PC-001"
    };
    const result = rollRoomInitiative(hearthglowPack, state, () => 10);
    expect(result.initiative[0]?.cardId).toBe("PC-001");
  });

  it("advances to the next round after the last participant", () => {
    const rolled = rollRoomInitiative(
      hearthglowPack,
      { ...createAdventureState(hearthglowPack), roomId: "foundry" },
      () => 10
    );
    let result = rolled;
    rolled.initiative.forEach(() => { result = advanceAdventureTurn(result); });
    expect(result.round).toBe(2);
    expect(result.activeTurn).toBe(0);
  });

  it("tracks resources and clears them for the next turn", () => {
    const rolled = rollRoomInitiative(
      hearthglowPack,
      { ...createAdventureState(hearthglowPack), roomId: "foundry" },
      () => 10
    );
    const used = toggleTurnResource(rolled, "action");
    expect(used.usedTurnResources).toEqual(["action"]);
    expect(advanceAdventureTurn(used).usedTurnResources).toEqual([]);
  });
});
