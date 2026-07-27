import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { getDndCharacterVaultServices, type DndCharacterVaultServices } from "../services/dndCharacterVaultServices";
import type { DndVaultSession } from "../services/dndCharacterVaultGateway";
import type { DndSavedCharacterState } from "../types/dndCharacterVault";

export type DndVaultSessionState = {
  services: DndCharacterVaultServices | null;
  session: DndVaultSession | null;
  setSession: Dispatch<SetStateAction<DndVaultSession | null>>;
  savedCharacters: DndSavedCharacterState[];
  setSavedCharacters: Dispatch<SetStateAction<DndSavedCharacterState[]>>;
  activeCharacter: DndSavedCharacterState | null;
  setActiveCharacter: Dispatch<SetStateAction<DndSavedCharacterState | null>>;
  initializing: boolean;
  initializationError: string;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "The Character Vault session could not be initialized.";

export const useDndCharacterVaultSession = (): DndVaultSessionState => {
  const services = useMemo(() => getDndCharacterVaultServices(), []);
  const [session, setSession] = useState<DndVaultSession | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<DndSavedCharacterState[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<DndSavedCharacterState | null>(null);
  const [initializing, setInitializing] = useState(Boolean(services));
  const [initializationError, setInitializationError] = useState("");

  const loadCharacters = useCallback(async (nextSession: DndVaultSession | null) => {
    if (!services || !nextSession) {
      setSavedCharacters([]);
      setActiveCharacter(null);
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
        if (active) setInitializationError("");
      } catch (caught) {
        console.error("Failed to load saved characters", { caught });
        if (active) setInitializationError(errorMessage(caught));
      } finally {
        if (active) setInitializing(false);
      }
    };
    const unsubscribe = services.auth.onSessionChanged((next) => { void applySession(next); });
    void services.auth.getSession().then(applySession).catch((caught) => {
      console.error("Failed to initialize Character Vault", { caught });
      if (active) {
        setInitializationError(errorMessage(caught));
        setInitializing(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadCharacters, services]);

  return {
    services,
    session,
    setSession,
    savedCharacters,
    setSavedCharacters,
    activeCharacter,
    setActiveCharacter,
    initializing,
    initializationError
  };
};
