import { useCallback, useState } from "react";
import type { DndVaultSession } from "../services/dndCharacterVaultGateway";
import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../types/dndCharacterVault";
import { useDndCharacterVaultSession } from "./useDndCharacterVaultSession";
import { useDndSavedCharacterActions } from "./useDndSavedCharacterActions";
import { useDndVaultAuthActions } from "./useDndVaultAuthActions";

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
  saveProfile(profile: DndOptimizedBuildProfile): Promise<void>;
  openCharacter(character: DndSavedCharacterState): void;
  closeCharacter(): void;
  updateCharacter(character: DndSavedCharacterState): Promise<void>;
  archiveCharacter(character: DndSavedCharacterState): Promise<void>;
  deleteCharacter(character: DndSavedCharacterState): Promise<void>;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "The Character Vault operation failed.";

export const useDndCharacterVault = (): DndCharacterVaultState => {
  const vaultSession = useDndCharacterVaultSession();
  const {
    services,
    session,
    setSession,
    savedCharacters,
    setSavedCharacters,
    activeCharacter,
    setActiveCharacter,
    initializing,
    initializationError
  } = vaultSession;
  const [operationBusy, setOperationBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [operationError, setOperationError] = useState("");

  const run = useCallback(async (operation: () => Promise<void>) => {
    setOperationBusy(true);
    setOperationError("");
    setFeedback("");
    try {
      await operation();
    } catch (caught) {
      console.error("Character Vault operation failed", { caught });
      setOperationError(errorMessage(caught));
    } finally {
      setOperationBusy(false);
    }
  }, []);

  const authActions = useDndVaultAuthActions({
    services,
    session,
    run,
    setSession,
    setSavedCharacters,
    setActiveCharacter,
    setFeedback
  });
  const savedActions = useDndSavedCharacterActions({
    services,
    session,
    activeCharacter,
    run,
    setSavedCharacters,
    setActiveCharacter,
    setFeedback,
    setOperationError
  });

  return {
    configured: Boolean(services),
    session,
    savedCharacters,
    activeCharacter,
    busy: initializing || operationBusy,
    feedback,
    error: operationError || initializationError,
    ...authActions,
    ...savedActions
  };
};
