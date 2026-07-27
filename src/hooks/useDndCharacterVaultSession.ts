import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { DndVaultSession } from "../services/dndCharacterVaultGateway";
import type { DndCharacterVaultServices } from "../services/dndCharacterVaultServices";
import type { DndSavedCharacterState } from "../types/dndCharacterVault";

export type DndVaultSessionState = {
  session: DndVaultSession | null;
  setSession: Dispatch<SetStateAction<DndVaultSession | null>>;
  savedCharacters: DndSavedCharacterState[];
  setSavedCharacters: Dispatch<SetStateAction<DndSavedCharacterState[]>>;
  initializing: boolean;
};

const message = (error: unknown): string =>
  error instanceof Error ? error.message : "The Character Vault session failed.";

export const useDndCharacterVaultSession = (
  services: DndCharacterVaultServices | null,
  setError: Dispatch<SetStateAction<string>>
): DndVaultSessionState => {
  const [session, setSession] = useState<DndVaultSession | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<DndSavedCharacterState[]>([]);
  const [initializing, setInitializing] = useState(Boolean(services));

  const loadCharacters = useCallback(async (nextSession: DndVaultSession | null) => {
    if (!services || !nextSession) {
      setSavedCharacters([]);
      return;
    }
    setSavedCharacters(await services.repository.list(nextSession.user.id));
  }, [services]);

  useEffect(() => {
    if (!services) return;
    let active = true;
    const applySession = async (nextSession: DndVaultSession | null) => {
      if (!active) return;
      setSession(nextSession);
      try {
        await loadCharacters(nextSession);
        if (active) setError("");
      } catch (caught) {
        console.error("Failed to load saved characters", { caught });
        if (active) setError(message(caught));
      } finally {
        if (active) setInitializing(false);
      }
    };
    const unsubscribe = services.auth.onSessionChanged((next) => { void applySession(next); });
    void services.auth.getSession().then(applySession).catch((caught) => {
      console.error("Failed to initialize Character Vault", { caught });
      if (active) { setError(message(caught)); setInitializing(false); }
    });
    return () => { active = false; unsubscribe(); };
  }, [loadCharacters, services, setError]);

  return { session, setSession, savedCharacters, setSavedCharacters, initializing };
};
