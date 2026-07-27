import type { DndVaultUser } from "../dndCharacterVaultGateway";

export const DND_VAULT_SESSION_KEY = "dm-forge:dnd-character-vault-session:v1";

export type SupabaseStoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAtMs: number;
  user?: DndVaultUser;
};

export type DndVaultStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const isStoredSession = (value: unknown): value is SupabaseStoredSession => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SupabaseStoredSession>;
  return typeof candidate.accessToken === "string"
    && typeof candidate.refreshToken === "string"
    && typeof candidate.expiresAtMs === "number";
};

export const readSupabaseStoredSession = (
  storage: DndVaultStorage
): SupabaseStoredSession | null => {
  try {
    const raw = storage.getItem(DND_VAULT_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredSession(parsed)) {
      storage.removeItem(DND_VAULT_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Failed to read Character Vault session", { error });
    storage.removeItem(DND_VAULT_SESSION_KEY);
    return null;
  }
};

export const writeSupabaseStoredSession = (
  storage: DndVaultStorage,
  session: SupabaseStoredSession
): void => {
  try {
    storage.setItem(DND_VAULT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to persist Character Vault session", { error });
    throw new Error("The browser could not save the Character Vault session.", { cause: error });
  }
};

export const clearSupabaseStoredSession = (storage: DndVaultStorage): void => {
  try {
    storage.removeItem(DND_VAULT_SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear Character Vault session", { error });
  }
};

export const parseSupabaseImplicitSession = (
  hash: string,
  nowMs: number
): SupabaseStoredSession | null => {
  try {
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const callbackError = params.get("error_description") || params.get("error");
    if (callbackError) throw new Error(callbackError);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return null;
    const expiresIn = Number(params.get("expires_in") ?? 3600);
    if (!Number.isFinite(expiresIn) || expiresIn < 1) throw new Error("Invalid session expiry.");
    return { accessToken, refreshToken, expiresAtMs: nowMs + (expiresIn * 1000) };
  } catch (error) {
    console.error("Failed to parse Supabase authentication callback", { error });
    throw new Error("The sign-in callback could not be processed.", { cause: error });
  }
};
