import type {
  DndCharacterVaultAuthGateway,
  DndVaultSession
} from "../dndCharacterVaultGateway";
import { SupabaseAuthTransport } from "./supabaseAuthTransport";
import type { DndVaultSupabaseConfig } from "./supabaseConfig";
import {
  clearSupabaseStoredSession,
  DND_VAULT_SESSION_KEY,
  parseSupabaseImplicitSession,
  readSupabaseStoredSession,
  type DndVaultStorage,
  type SupabaseStoredSession,
  writeSupabaseStoredSession
} from "./supabaseSessionStore";

export type DndVaultAuthRuntime = {
  fetcher: typeof fetch;
  storage: DndVaultStorage;
  now: () => number;
  getHash: () => string;
  clearHash: () => void;
  navigate: (url: string) => void;
  subscribeStorage?: (listener: () => void) => () => void;
};

export type DndVaultAuthenticatedClient = DndCharacterVaultAuthGateway & {
  getAccessToken(): Promise<string>;
  getCurrentUserId(): Promise<string>;
};

const browserRuntime = (): DndVaultAuthRuntime => ({
  fetcher: window.fetch.bind(window),
  storage: window.localStorage,
  now: () => Date.now(),
  getHash: () => window.location.hash,
  clearHash: () => window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`),
  navigate: (url) => window.location.assign(url),
  subscribeStorage: (listener) => {
    const handler = (event: StorageEvent) => { if (event.key === DND_VAULT_SESSION_KEY) listener(); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
});

export class SupabaseDndVaultAuthGateway implements DndVaultAuthenticatedClient {
  private readonly listeners = new Set<(session: DndVaultSession | null) => void>();
  private readonly transport: SupabaseAuthTransport;
  private refreshPromise?: Promise<SupabaseStoredSession>;

  constructor(
    config: DndVaultSupabaseConfig,
    private readonly runtime: DndVaultAuthRuntime = browserRuntime()
  ) {
    this.transport = new SupabaseAuthTransport(config, runtime.fetcher);
    runtime.subscribeStorage?.(() => this.emit(this.toPublic(readSupabaseStoredSession(runtime.storage))));
  }

  private toPublic(stored: SupabaseStoredSession | null): DndVaultSession | null {
    return stored?.user ? { user: stored.user, expiresAt: new Date(stored.expiresAtMs).toISOString() } : null;
  }

  private emit(session: DndVaultSession | null): void {
    for (const listener of this.listeners) listener(session);
  }

  private async hydrateUser(session: SupabaseStoredSession): Promise<SupabaseStoredSession> {
    if (session.user) return session;
    const hydrated = { ...session, user: await this.transport.getUser(session.accessToken) };
    writeSupabaseStoredSession(this.runtime.storage, hydrated);
    return hydrated;
  }

  private async refresh(session: SupabaseStoredSession): Promise<SupabaseStoredSession> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      const payload = await this.transport.refresh(session.refreshToken);
      return this.hydrateUser({
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
        expiresAtMs: this.runtime.now() + (payload.expires_in * 1000)
      });
    })().finally(() => { this.refreshPromise = undefined; });
    const refreshed = await this.refreshPromise;
    writeSupabaseStoredSession(this.runtime.storage, refreshed);
    this.emit(this.toPublic(refreshed));
    return refreshed;
  }

  async getSession(): Promise<DndVaultSession | null> {
    try {
      const callback = parseSupabaseImplicitSession(this.runtime.getHash(), this.runtime.now());
      let stored = callback ?? readSupabaseStoredSession(this.runtime.storage);
      if (!stored) return null;
      if (callback) this.runtime.clearHash();
      if (stored.expiresAtMs <= this.runtime.now() + 60_000) stored = await this.refresh(stored);
      stored = await this.hydrateUser(stored);
      writeSupabaseStoredSession(this.runtime.storage, stored);
      const session = this.toPublic(stored);
      if (callback) this.emit(session);
      return session;
    } catch (error) {
      console.error("Failed to restore Character Vault session", { error });
      clearSupabaseStoredSession(this.runtime.storage);
      throw new Error("The Character Vault session could not be restored.", { cause: error });
    }
  }

  async getAccessToken(): Promise<string> {
    const session = await this.getSession();
    const stored = readSupabaseStoredSession(this.runtime.storage);
    if (!session || !stored) throw new Error("Sign in is required to access saved characters.");
    return stored.accessToken;
  }

  async getCurrentUserId(): Promise<string> {
    const session = await this.getSession();
    if (!session) throw new Error("Sign in is required to access saved characters.");
    return session.user.id;
  }

  async signInWithMagicLink(email: string): Promise<void> {
    try {
      const normalized = email.trim().toLowerCase();
      if (!normalized.includes("@")) throw new Error("Enter a valid email address.");
      await this.transport.sendMagicLink(normalized);
    } catch (error) {
      console.error("Failed to send Character Vault magic link", { email, error });
      throw new Error("The sign-in link could not be sent.", { cause: error });
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.runtime.navigate(this.transport.googleAuthorizationUrl());
  }

  async signOut(): Promise<void> {
    const stored = readSupabaseStoredSession(this.runtime.storage);
    try {
      if (stored) await this.transport.signOut(stored.accessToken);
    } catch (error) {
      console.error("Remote Character Vault sign-out failed", { error });
    } finally {
      clearSupabaseStoredSession(this.runtime.storage);
      this.emit(null);
    }
  }

  onSessionChanged(listener: (session: DndVaultSession | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
