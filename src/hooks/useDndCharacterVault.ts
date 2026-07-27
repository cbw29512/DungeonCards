import { useCallback, useState } from "react";
import { getDndVaultReadyBuildById } from "../data/dndVaultReadyBuilds";
import type { DndVaultSession } from "../services/dndCharacterVaultGateway";
import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../types/dndCharacterVault";
import {
  createDndSavedCharacterState,
  validateDndSavedCharacterState
} from "../utils/dndSavedCharacterState";
import { useDndCharacterVaultSession } from "./useDndCharacterVaultSession";

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

  const signInWithMagicLink = useCallback(async (email: string) => run(async () => {
    if (!services) throw new Error("Account services are not configured.");
    await services.auth.signInWithMagicLink(email);
    setFeedback("Check your email for the secure Character Vault sign-in link.");
  }), [run, services]);

  const signInWithGoogle = useCallback(async () => run(async () => {
    if (!services) throw new Error("Account services are not configured.");
    await services.auth.signInWithGoogle();
  }), [run, services]);

  const signOut = useCallback(async () => run(async () => {
    if (!services) return;
    await services.auth.signOut();
    setSession(null);
    setSavedCharacters([]);
    setActiveCharacter(null);
    setFeedback("Signed out of Character Vault.");
  }), [run, services, setActiveCharacter, setSavedCharacters, setSession]);

  const saveProfile = useCallback(async (profile: DndOptimizedBuildProfile) => run(async () => {
    if (!services || !session) throw new Error("Sign in before saving a character.");
    const state = createDndSavedCharacterState(profile, session.user.id, crypto.randomUUID());
    const issues = validateDndSavedCharacterState(state, profile);
    if (issues.length) throw new Error(`Character save failed validation: ${issues.join(" ")}`);
    const created = await services.repository.create(state);
    setSavedCharacters((current) => [created, ...current]);
    setActiveCharacter(created);
    setFeedback(`${created.displayName} was saved and opened in Play Mode.`);
  }), [run, services, session, setActiveCharacter, setSavedCharacters]);

  const openCharacter = useCallback((character: DndSavedCharacterState) => {
    setOperationError("");
    setFeedback(`${character.displayName} opened in Play Mode.`);
    setActiveCharacter(character);
  }, [setActiveCharacter]);

  const closeCharacter = useCallback(() => setActiveCharacter(null), [setActiveCharacter]);

  const updateCharacter = useCallback(async (character: DndSavedCharacterState) => run(async () => {
    if (!services || !session) throw new Error("Sign in before saving changes.");
    if (character.ownerId !== session.user.id) throw new Error("This saved character belongs to another account.");
    const profile = getDndVaultReadyBuildById(character.baseBuildId);
    if (!profile) throw new Error("The optimized build for this saved character is unavailable.");
    const issues = validateDndSavedCharacterState(character, profile);
    if (issues.length) throw new Error(`Saved character failed validation: ${issues.join(" ")}`);
    const updated = await services.repository.update(character);
    setSavedCharacters((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
    setActiveCharacter(updated);
    setFeedback(`${updated.displayName} was updated.`);
  }), [run, services, session, setActiveCharacter, setSavedCharacters]);

  const archiveCharacter = useCallback(async (character: DndSavedCharacterState) => run(async () => {
    if (!services) throw new Error("Account services are not configured.");
    const updated = await services.repository.update({ ...character, isArchived: true, updatedAt: new Date().toISOString() });
    setSavedCharacters((current) => current.filter((entry) => entry.id !== updated.id));
    if (activeCharacter?.id === updated.id) setActiveCharacter(null);
    setFeedback(`${updated.displayName} was archived.`);
  }), [activeCharacter, run, services, setActiveCharacter, setSavedCharacters]);

  const deleteCharacter = useCallback(async (character: DndSavedCharacterState) => run(async () => {
    if (!services) throw new Error("Account services are not configured.");
    await services.repository.remove(character.ownerId, character.id);
    setSavedCharacters((current) => current.filter((entry) => entry.id !== character.id));
    if (activeCharacter?.id === character.id) setActiveCharacter(null);
    setFeedback(`${character.displayName} was deleted.`);
  }), [activeCharacter, run, services, setActiveCharacter, setSavedCharacters]);

  return {
    configured: Boolean(services),
    session,
    savedCharacters,
    activeCharacter,
    busy: initializing || operationBusy,
    feedback,
    error: operationError || initializationError,
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    saveProfile,
    openCharacter,
    closeCharacter,
    updateCharacter,
    archiveCharacter,
    deleteCharacter
  };
};
