import {
  DND_VAULT_SESSION_KEY,
  type DndVaultStorage
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

export const createBrowserDndVaultAuthRuntime = (
  fetcher: typeof fetch = window.fetch.bind(window)
): DndVaultAuthRuntime => ({
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
