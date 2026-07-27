import type {
  DndCharacterVaultAuthGateway,
  DndCharacterVaultRepository
} from "./dndCharacterVaultGateway";
import { SupabaseDndVaultAuthGateway } from "./supabase/supabaseAuthGateway";
import { createBrowserDndVaultAuthRuntime } from "./supabase/supabaseBrowserRuntime";
import { SupabaseDndCharacterRepository } from "./supabase/supabaseCharacterRepository";
import {
  getDndVaultSupabaseConfig,
  type DndVaultSupabaseConfig
} from "./supabase/supabaseConfig";

export type DndCharacterVaultServices = {
  auth: DndCharacterVaultAuthGateway;
  repository: DndCharacterVaultRepository;
};

export const createDndCharacterVaultServices = (
  config: DndVaultSupabaseConfig,
  fetcher: typeof fetch = window.fetch.bind(window)
): DndCharacterVaultServices => {
  const auth = new SupabaseDndVaultAuthGateway(
    config,
    createBrowserDndVaultAuthRuntime(fetcher)
  );
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
