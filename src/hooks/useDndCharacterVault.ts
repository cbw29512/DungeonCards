import { useCallback, useEffect, useMemo, useState } from "react";
import { getDndCharacterVaultServices } from "../services/dndCharacterVaultServices";
import type { DndVaultSession } from "../services/dndCharacterVaultGateway";
import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../types/dndCharacterVault";
import {
  createDndSavedCharacterState,
  validateDndSavedCharacterState
} from "../utils/dndSavedCharacterState";

export type DndCharacterVaultState = {
  configured: boolean;
  session: DndVaultSession | null;
  savedCharacters: DndSavedCharacterState[];
  busy: boolean;
  feedback: string;
  error: string;
  signInWithMagicLink(email: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  saveProfile(profile: DndOptimizedBuildProfile): Promise<void>;
  archiveCharacter(character: DndSavedCharacterState): Promise<void>;
  deleteCharacter(character: DndSavedCharacterState): Promise<void>;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "The Character Vault operation failed.";

export const useDndCharacterVault = (): DndCharacterVaultState => {
  const services = useMemo(() => getDndCharacterVaultServices(), []);
  const [session, setSession] = useState<DndVaultSession | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<DndSavedCharacterState[]>([]);
  const [busy, setBusy] = useState(Boolean(services));
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

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
        if (active) setError(errorMessage(caught));
      } finally {
        if (active) setBusy(false);
      }
    };
    const unsubscribe = services.auth.onSessionChanged((next) => { void applySession(next); });
    void services.auth.getSession().then(applySession).catch((caught) => {
      console.error("Failed to initialize Character Vault", { caught });
      if (active) { setError(errorMessage(caught)); setBusy(false); }
    });
    return () => { active = false; unsubscribe(); };
  }, [loadCharacters, services]);

  const run = useCallback(async (operation: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await operation();
    } catch (caught) {
      console.error("Character Vault operation failed", { caught });
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
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
    setFeedback("Signed out of Character Vault.");
  }), [run, services]);

  const saveProfile = useCallback(async (profile: DndOptimizedBuildProfile) => run(async () => {
    if (!services || !session) throw new Error("Sign in before saving a character.");
    const state = createDndSavedCharacterState(profile, session.user.id, crypto.randomUUID());
    const issues = validateDndSavedCharacterState(state, profile);
    if (issues.length) throw new Error(`Character save failed validation: ${issues.join(" ")}`);
    const created = await services.repository.create(state);
    setSavedCharacters((current) => [created, ...current]);
    setFeedback(`${created.displayName} was saved to Character Vault.`);
  }), [run, services, session]);

  const archiveCharacter = useCallback(async (character: DndSavedCharacterState) => run(async () => {
    if (!services) throw new Error("Account services are not configured.");
    const updated = await services.repository.update({
      ...character,
      isArchived: true,
      updatedAt: new Date().toISOString()
    });
    setSavedCharacters((current) => current.filter((entry) => entry.id !== updated.id));
    setFeedback(`${updated.displayName} was archived.`);
  }), [run, services]);

  const deleteCharacter = useCallback(async (character: DndSavedCharacterState) => run(async () => {
    if (!services) throw new Error("Account services are not configured.");
    await services.repository.remove(character.ownerId, character.id);
    setSavedCharacters((current) => current.filter((entry) => entry.id !== character.id));
    setFeedback(`${character.displayName} was deleted.`);
  }), [run, services]);

  return {
    configured: Boolean(services), session, savedCharacters, busy, feedback, error,
    signInWithMagicLink, signInWithGoogle, signOut, saveProfile, archiveCharacter, deleteCharacter
  };
};
