import type {
  DndCharacterVaultAuthGateway,
  DndCharacterVaultRepository
} from "./dndCharacterVaultGateway";
import { SupabaseDndVaultAuthGateway } from "./supabase/supabaseAuthGateway";
import { SupabaseDndCharacterRepository } from "./supabase/supabaseCharacterRepository";
import {
  getDndVaultSupabaseConfig,
  type DndVaultSupabaseConfig
} from "./supabase/supabaseConfig";
import { DND_VAULT_SESSION_KEY } from "./supabase/supabaseSessionStore";

export type DndCharacterVaultServices = {
  auth: DndCharacterVaultAuthGateway;
  repository: DndCharacterVaultRepository;
};

export const createDndCharacterVaultServices = (
  config: DndVaultSupabaseConfig,
  fetcher: typeof fetch = window.fetch.bind(window)
): DndCharacterVaultServices => {
  const auth = new SupabaseDndVaultAuthGateway(config, {
    fetcher,
    storage: window.localStorage,
    now: () => Date.now(),
    getHash: () => window.location.hash,
    clearHash: () => window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`),
    navigate: (url) => window.location.assign(url),
    subscribeStorage: (listener) => {
      const handler = (event: StorageEvent) => {
        if (event.storageArea === window.localStorage && event.key === DND_VAULT_SESSION_KEY) listener();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }
  });
  return {
    auth,
    repository: new SupabaseDndCharacterRepository(config, auth, fetcher)
  };
};

let cachedServices: DndCharacterVaultServices | null | undefined;

export const getDndCharacterVaultServices = (): DndCharacterVaultServices | null => {
  if (cachedServices !== undefined) return cachedServices;
  const config = getDndVaultSupabaseConfig();
  cachedServices = config ? createDndCharacterVaultServices(config) : null;
  return cachedServices;
};
