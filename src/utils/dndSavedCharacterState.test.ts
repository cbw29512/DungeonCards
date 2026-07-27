import { describe, expect, it } from "vitest";
import { dndFighterPregenRecords } from "../data/dndFighterPregens";
import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import {
  createDndSavedCharacterState,
  validateDndSavedCharacterState
} from "./dndSavedCharacterState";

const character = dndFighterPregenRecords.find((record) => (
  record.ruleset === "srd-5.2.1-2024" && record.level === 5
));

if (!character) throw new Error("Expected a level 5 2024 Fighter fixture.");

const source = {
  label: "SRD 5.2.1",
  url: "https://www.dndbeyond.com/srd",
  scope: "public-srd" as const
};

const profile: DndOptimizedBuildProfile = {
  id: "rowan-ironmark-vault-5",
  buildSlotId: character.buildSlotId,
  ruleset: character.ruleset,
  classId: character.classId,
  subclassId: character.subclassId,
  level: character.level,
  role: "defender",
  complexity: "beginner",
  buildGoal: "Hold the front line.",
  optimizationNotes: ["Prioritize durable melee pressure."],
  tactics: ["Protect vulnerable allies."],
  advancementChoices: [],
  magicItems: [{
    id: "guardian-token",
    name: "Guardian Token",
    rarity: "common",
    category: "wondrous-item",
    source,
    minimumLevel: 1,
    requiresAttunement: false,
    attunedByDefault: false,
    consumable: false,
    effectSummary: "Provides a minor defensive benefit.",
    synergyNote: "Supports the defender role."
  }, {
    id: "warding-emblem",
    name: "Warding Emblem",
    rarity: "uncommon",
    category: "wondrous-item",
    source,
    minimumLevel: 5,
    requiresAttunement: true,
    attunedByDefault: true,
    consumable: false,
    maximumCharges: 3,
    recharge: "Regains all charges at dawn.",
    effectSummary: "Expends charges for a defensive reaction.",
    synergyNote: "Improves frontline survivability."
  }],
  character,
  sheetVersion: 2,
  reviewStatus: "verified",
  reviewedAt: "2026-07-26"
};

describe("saved Character Vault state", () => {
  it("creates deterministic initial play state", () => {
    const state = createDndSavedCharacterState(profile, "user-1", "save-1", "2026-07-26T12:00:00.000Z");
    expect(state).toMatchObject({
      id: "save-1",
      ownerId: "user-1",
      baseBuildId: profile.id,
      currentHitPoints: character.maximumHitPoints,
      temporaryHitPoints: 0,
      attunedItemIds: ["warding-emblem"],
      itemChargeState: { "warding-emblem": 3 }
    });
    expect(validateDndSavedCharacterState(state, profile)).toEqual([]);
  });

  it("rejects invalid HP, attunement, resource, slot, and charge state", () => {
    const state = createDndSavedCharacterState(profile, "user-1", "save-1");
    const firstResource = character.resources[0];
    const resourceState = { ...state.resourceState, unknown: 1 };
    if (firstResource) delete resourceState[firstResource.id];
    const invalid = {
      ...state,
      currentHitPoints: character.maximumHitPoints + 1,
      resourceState,
      spellSlotState: { 1: 1 },
      attunedItemIds: ["guardian-token", "warding-emblem", "warding-emblem", "missing-item"],
      itemChargeState: { "warding-emblem": 4 }
    };
    const issues = validateDndSavedCharacterState(invalid, profile);
    expect(issues).toContain("Current Hit Points are outside the valid range.");
    if (firstResource) expect(issues).toContain(`Missing tracked resource: ${firstResource.name}`);
    expect(issues).toContain("Unknown tracked resource: unknown");
    expect(issues).toContain("Unknown spell-slot level: 1");
    expect(issues).toContain("Guardian Token does not require attunement.");
    expect(issues).toContain("Attuned magic-item IDs must be unique.");
    expect(issues).toContain("A character cannot be attuned to more than three magic items.");
    expect(issues).toContain("Warding Emblem charges are outside the valid range.");
  });

  it("rejects missing item charges and oversized notes", () => {
    const state = createDndSavedCharacterState(profile, "user-1", "save-1");
    expect(validateDndSavedCharacterState({
      ...state,
      itemChargeState: {},
      customNotes: "x".repeat(10001)
    }, profile)).toEqual(expect.arrayContaining([
      "Missing charge state for Warding Emblem.",
      "Character notes cannot exceed 10,000 characters."
    ]));
  });
});
