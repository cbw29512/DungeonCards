import type { DndSavedCharacterState } from "../../types/dndCharacterVault";
import type { DndCharacterVaultRepository } from "../dndCharacterVaultGateway";
import type { DndVaultAuthenticatedClient } from "./supabaseAuthGateway";
import {
  mapSavedCharacterRow,
  mapSavedCharacterState,
  type SavedCharacterRow
} from "./supabaseCharacterRows";
import type { DndVaultSupabaseConfig } from "./supabaseConfig";

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
    const rows = await this.request<SavedCharacterRow[]>(
      `?owner_id=eq.${encodeURIComponent(state.ownerId)}&id=eq.${encodeURIComponent(state.id)}&select=*`, token,
      { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(mapSavedCharacterState(state)) }
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
