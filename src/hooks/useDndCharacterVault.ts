import { useCallback, useMemo, useState } from "react";
import { getDndCharacterVaultServices } from "../services/dndCharacterVaultServices";
import type { DndVaultSession } from "../services/dndCharacterVaultGateway";
import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../types/dndCharacterVault";
import { useDndCharacterVaultSession } from "./useDndCharacterVaultSession";
import { useDndSavedCharacterActions } from "./useDndSavedCharacterActions";
import {
  useDndVaultAuthActions,
  type DndVaultRun
} from "./useDndVaultAuthActions";

export type DndCharacterVaultState = {
  configured: boolean;
  session: DndVaultSession | null;
  savedCharacters: DndSavedCharacterState[];
  activeCharacter: DndSavedCharacterState | null;
  busy: boolean;
  feedback: string;
  error: string;
  signInWithMagicLink(email: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  saveProfile(profile: DndOptimizedBuildProfile): Promise<boolean>;
  openCharacter(character: DndSavedCharacterState): Promise<boolean>;
  updateCharacter(character: DndSavedCharacterState): Promise<boolean>;
  duplicateCharacter(character: DndSavedCharacterState): Promise<boolean>;
  archiveCharacter(character: DndSavedCharacterState): Promise<void>;
  deleteCharacter(character: DndSavedCharacterState): Promise<void>;
  closeCharacter(): void;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "The Character Vault operation failed.";

export const useDndCharacterVault = (): DndCharacterVaultState => {
  const services = useMemo(() => getDndCharacterVaultServices(), []);
  const [operationBusy, setOperationBusy] = useState(false);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const sessionState = useDndCharacterVaultSession(services, setError);

  const run: DndVaultRun = useCallback(async <T,>(operation: () => Promise<T>) => {
    setOperationBusy(true);
    setError("");
    setFeedback("");
    try {
      return { ok: true, value: await operation() };
    } catch (caught) {
      console.error("Character Vault operation failed", { caught });
      setError(errorMessage(caught));
      return { ok: false };
    } finally {
      setOperationBusy(false);
    }
  }, []);

  const authActions = useDndVaultAuthActions({
    services,
    run,
    setSession: sessionState.setSession,
    setSavedCharacters: sessionState.setSavedCharacters,
    setActiveCharacterId,
    setFeedback
  });
  const savedActions = useDndSavedCharacterActions({
    services,
    session: sessionState.session,
    run,
    setSavedCharacters: sessionState.setSavedCharacters,
    setActiveCharacterId,
    setFeedback
  });
  const activeCharacter = sessionState.savedCharacters.find((character) => (
    character.id === activeCharacterId
  )) ?? null;

  return {
    configured: Boolean(services),
    session: sessionState.session,
    savedCharacters: sessionState.savedCharacters,
    activeCharacter,
    busy: sessionState.initializing || operationBusy,
    feedback,
    error,
    ...authActions,
    ...savedActions
  };
};
