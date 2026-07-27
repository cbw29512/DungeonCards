import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { DndCharacterVaultServices } from "../services/dndCharacterVaultServices";
import type { DndVaultSession } from "../services/dndCharacterVaultGateway";
import type { DndOptimizedBuildProfile, DndSavedCharacterState } from "../types/dndCharacterVault";
import {
  createDndSavedCharacterState,
  validateDndSavedCharacterState
} from "../utils/dndSavedCharacterState";

type RunOperation = (operation: () => Promise<void>) => Promise<void>;

export const useDndVaultAuthActions = ({
  services,
  session,
  run,
  setSession,
  setSavedCharacters,
  setActiveCharacter,
  setFeedback
}: {
  services: DndCharacterVaultServices | null;
  session: DndVaultSession | null;
  run: RunOperation;
  setSession: Dispatch<SetStateAction<DndVaultSession | null>>;
  setSavedCharacters: Dispatch<SetStateAction<DndSavedCharacterState[]>>;
  setActiveCharacter: Dispatch<SetStateAction<DndSavedCharacterState | null>>;
  setFeedback: Dispatch<SetStateAction<string>>;
}) => {
  const signInWithMagicLink = useCallback(async (email: string) => run(async () => {
    if (!services) throw new Error("Account services are not configured.");
    await services.auth.signInWithMagicLink(email);
    setFeedback("Check your email for the secure Character Vault sign-in link.");
  }), [run, services, setFeedback]);

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
  }), [run, services, setActiveCharacter, setFeedback, setSavedCharacters, setSession]);

  const saveProfile = useCallback(async (profile: DndOptimizedBuildProfile) => run(async () => {
    if (!services || !session) throw new Error("Sign in before saving a character.");
    const state = createDndSavedCharacterState(profile, session.user.id, crypto.randomUUID());
    const issues = validateDndSavedCharacterState(state, profile);
    if (issues.length) throw new Error(`Character save failed validation: ${issues.join(" ")}`);
    const created = await services.repository.create(state);
    setSavedCharacters((current) => [created, ...current]);
    setActiveCharacter(created);
    setFeedback(`${created.displayName} was saved and opened in Play Mode.`);
  }), [run, services, session, setActiveCharacter, setFeedback, setSavedCharacters]);

  return { signInWithMagicLink, signInWithGoogle, signOut, saveProfile };
};
