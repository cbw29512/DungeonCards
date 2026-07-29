import { describe, expect, it } from "vitest";
import { hearthglowPack } from "../data/hearthglowPack";
import { createAdventureState } from "./adventureRuntime";
import { advanceAdventureTurn, rollRoomInitiative } from "./adventureInitiative";

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
});
