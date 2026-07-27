import { describe, expect, it, vi } from "vitest";
import {
  DND_VAULT_SESSION_KEY,
  parseSupabaseImplicitSession,
  readSupabaseStoredSession,
  type DndVaultStorage,
  writeSupabaseStoredSession
} from "./supabaseSessionStore";

const memoryStorage = (): DndVaultStorage => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); }
  };
};

describe("Supabase Character Vault session storage", () => {
  it("parses an implicit-flow callback without retaining unrelated hash values", () => {
    expect(parseSupabaseImplicitSession(
      "#access_token=access&refresh_token=refresh&expires_in=3600&type=magiclink",
      1_000
    )).toEqual({ accessToken: "access", refreshToken: "refresh", expiresAtMs: 3_601_000 });
  });

  it("returns null when the location is not an auth callback", () => {
    expect(parseSupabaseImplicitSession("#rules", 1_000)).toBeNull();
  });

  it("round-trips a hydrated session", () => {
    const storage = memoryStorage();
    const session = {
      accessToken: "access",
      refreshToken: "refresh",
      expiresAtMs: 9_999,
      user: { id: "user-1", displayName: "Arden" }
    };
    writeSupabaseStoredSession(storage, session);
    expect(readSupabaseStoredSession(storage)).toEqual(session);
  });

  it("clears malformed session JSON instead of crashing startup", () => {
    const storage = memoryStorage();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    storage.setItem(DND_VAULT_SESSION_KEY, "not-json");
    expect(readSupabaseStoredSession(storage)).toBeNull();
    expect(storage.getItem(DND_VAULT_SESSION_KEY)).toBeNull();
    consoleSpy.mockRestore();
  });
});
