import type { DndSavedCharacterState } from "../../types/dndCharacterVault";
import type { DndCharacterVaultRepository } from "../dndCharacterVaultGateway";
import type { DndVaultAuthenticatedClient } from "./supabaseAuthGateway";
import type { DndVaultSupabaseConfig } from "./supabaseConfig";

type SavedCharacterRow = {
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

export class SupabaseDndCharacterRepository implements DndCharacterVaultRepository {
  constructor(
    private readonly config: DndVaultSupabaseConfig,
    private readonly auth: DndVaultAuthenticatedClient,
    private readonly fetcher: typeof fetch = window.fetch.bind(window)
  ) {}

  private async assertOwner(ownerId: string): Promise<string> {
    const currentUserId = await this.auth.getCurrentUserId();
    if (ownerId !== currentUserId) throw new Error("Saved-character owner does not match the signed-in user.");
    return this.auth.getAccessToken();
  }

  private async request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
    try {
      const response = await this.fetcher(`${this.config.url}/rest/v1/saved_characters${path}`, {
        ...init,
        headers: {
          apikey: this.config.publishableKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(init.headers ?? {})
        }
      });
      const raw = await response.text();
      const payload = raw ? JSON.parse(raw) as T & { message?: string; details?: string } : {} as T;
      if (!response.ok) throw new Error(payload.message || payload.details || `HTTP ${response.status}`);
      return payload;
    } catch (error) {
      console.error("Saved character request failed", { path, error });
      throw new Error("The saved character request failed.", { cause: error });
    }
  }

  async list(ownerId: string, includeArchived = false): Promise<DndSavedCharacterState[]> {
    const token = await this.assertOwner(ownerId);
    const archived = includeArchived ? "" : "&is_archived=eq.false";
    const rows = await this.request<SavedCharacterRow[]>(
      `?select=*&owner_id=eq.${encodeURIComponent(ownerId)}${archived}&order=updated_at.desc`, token
    );
    return rows.map(mapSavedCharacterRow);
  }

  async get(ownerId: string, characterId: string): Promise<DndSavedCharacterState | null> {
    const token = await this.assertOwner(ownerId);
    const rows = await this.request<SavedCharacterRow[]>(
      `?select=*&owner_id=eq.${encodeURIComponent(ownerId)}&id=eq.${encodeURIComponent(characterId)}&limit=1`, token
    );
    return rows[0] ? mapSavedCharacterRow(rows[0]) : null;
  }

  async create(state: DndSavedCharacterState): Promise<DndSavedCharacterState> {
    const token = await this.assertOwner(state.ownerId);
    const rows = await this.request<SavedCharacterRow[]>("?select=*", token, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(mapSavedCharacterState(state))
    });
    if (!rows[0]) throw new Error("Saved character create returned no record.");
    return mapSavedCharacterRow(rows[0]);
  }

  async update(state: DndSavedCharacterState): Promise<DndSavedCharacterState> {
    const token = await this.assertOwner(state.ownerId);
    const row = mapSavedCharacterState(state);
    const rows = await this.request<SavedCharacterRow[]>(
      `?owner_id=eq.${encodeURIComponent(state.ownerId)}&id=eq.${encodeURIComponent(state.id)}&select=*`, token,
      { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }
    );
    if (!rows[0]) throw new Error("Saved character update returned no record.");
    return mapSavedCharacterRow(rows[0]);
  }

  async remove(ownerId: string, characterId: string): Promise<void> {
    const token = await this.assertOwner(ownerId);
    await this.request(
      `?owner_id=eq.${encodeURIComponent(ownerId)}&id=eq.${encodeURIComponent(characterId)}`,
      token,
      { method: "DELETE" }
    );
  }
}
