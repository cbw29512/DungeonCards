import { describe, expect, it } from "vitest";
import type { DndSavedCharacterState } from "../../types/dndCharacterVault";
import {
  mapSavedCharacterRow,
  mapSavedCharacterState
} from "./supabaseCharacterRows";

const state: DndSavedCharacterState = {
  id: "character-1",
  ownerId: "owner-1",
  baseBuildId: "vault-v2-build",
  displayName: "Sister Arden",
  ruleset: "srd-5.2.1-2024",
  level: 11,
  currentHitPoints: 88,
  temporaryHitPoints: 5,
  inspiration: true,
  deathSaveSuccesses: 1,
  deathSaveFailures: 0,
  resourceState: { "channel-divinity": 2 },
  spellSlotState: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  itemChargeState: { "staff-healing": 7 },
  attunedItemIds: ["staff-healing"],
  customNotes: "Protect concentration.",
  isArchived: false,
  createdAt: "2026-07-27T00:00:00.000Z",
  updatedAt: "2026-07-27T01:00:00.000Z"
};

describe("saved character row mapping", () => {
  it("round-trips every mutable play-state field", () => {
    expect(mapSavedCharacterRow(mapSavedCharacterState(state))).toEqual(state);
  });

  it("uses snake_case database columns", () => {
    expect(mapSavedCharacterState(state)).toMatchObject({
      owner_id: "owner-1",
      base_build_id: "vault-v2-build",
      current_hit_points: 88,
      spell_slot_state: { 6: 1 },
      item_charge_state: { "staff-healing": 7 },
      attuned_item_ids: ["staff-healing"]
    });
  });
});
