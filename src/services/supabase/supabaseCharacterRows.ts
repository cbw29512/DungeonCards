import type { DndSavedCharacterState } from "../../types/dndCharacterVault";

export type SavedCharacterRow = {
  id: string;
  owner_id: string;
  base_build_id: string;
  display_name: string;
  ruleset: DndSavedCharacterState["ruleset"];
  level: number;
  current_hit_points: number;
  temporary_hit_points: number;
  inspiration: boolean;
  death_save_successes: number;
  death_save_failures: number;
  resource_state: DndSavedCharacterState["resourceState"];
  spell_slot_state: DndSavedCharacterState["spellSlotState"];
  item_charge_state: DndSavedCharacterState["itemChargeState"];
  attuned_item_ids: string[];
  custom_notes: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export const mapSavedCharacterRow = (row: SavedCharacterRow): DndSavedCharacterState => ({
  id: row.id,
  ownerId: row.owner_id,
  baseBuildId: row.base_build_id,
  displayName: row.display_name,
  ruleset: row.ruleset,
  level: row.level,
  currentHitPoints: row.current_hit_points,
  temporaryHitPoints: row.temporary_hit_points,
  inspiration: row.inspiration,
  deathSaveSuccesses: row.death_save_successes,
  deathSaveFailures: row.death_save_failures,
  resourceState: row.resource_state ?? {},
  spellSlotState: row.spell_slot_state ?? {},
  itemChargeState: row.item_charge_state ?? {},
  attunedItemIds: row.attuned_item_ids ?? [],
  customNotes: row.custom_notes,
  isArchived: row.is_archived,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const mapSavedCharacterState = (state: DndSavedCharacterState): SavedCharacterRow => ({
  id: state.id,
  owner_id: state.ownerId,
  base_build_id: state.baseBuildId,
  display_name: state.displayName,
  ruleset: state.ruleset,
  level: state.level,
  current_hit_points: state.currentHitPoints,
  temporary_hit_points: state.temporaryHitPoints,
  inspiration: state.inspiration,
  death_save_successes: state.deathSaveSuccesses,
  death_save_failures: state.deathSaveFailures,
  resource_state: state.resourceState,
  spell_slot_state: state.spellSlotState,
  item_charge_state: state.itemChargeState,
  attuned_item_ids: state.attunedItemIds,
  custom_notes: state.customNotes,
  is_archived: state.isArchived,
  created_at: state.createdAt,
  updated_at: state.updatedAt
});
