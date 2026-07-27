import { useCallback, type Dispatch, type SetStateAction } from "react";
import { getDndVaultReadyBuildById } from "../data/dndVaultReadyBuilds";
import type { DndVaultSession } from "../services/dndCharacterVaultGateway";
import type { DndCharacterVaultServices } from "../services/dndCharacterVaultServices";
import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../types/dndCharacterVault";
import {
  createDndSavedCharacterState,
  validateDndSavedCharacterState
} from "../utils/dndSavedCharacterState";
import type { DndVaultRun } from "./useDndVaultAuthActions";

export type DndSavedCharacterActions = {
  saveProfile(profile: DndOptimizedBuildProfile): Promise<boolean>;
  openCharacter(character: DndSavedCharacterState): Promise<boolean>;
  updateCharacter(character: DndSavedCharacterState): Promise<boolean>;
  duplicateCharacter(character: DndSavedCharacterState): Promise<boolean>;
  archiveCharacter(character: DndSavedCharacterState): Promise<void>;
  deleteCharacter(character: DndSavedCharacterState): Promise<void>;
  closeCharacter(): void;
};

type Options = {
  services: DndCharacterVaultServices | null;
  session: DndVaultSession | null;
  run: DndVaultRun;
  setSavedCharacters: Dispatch<SetStateAction<DndSavedCharacterState[]>>;
  setActiveCharacterId: Dispatch<SetStateAction<string | null>>;
  setFeedback: Dispatch<SetStateAction<string>>;
};

const profileFor = (character: DndSavedCharacterState): DndOptimizedBuildProfile => {
  const profile = getDndVaultReadyBuildById(character.baseBuildId);
  if (!profile) throw new Error("This saved character references a Vault build that is no longer available.");
  const issues = validateDndSavedCharacterState(character, profile);
  if (issues.length) throw new Error(`Saved character failed validation: ${issues.join(" ")}`);
  return profile;
};

export const useDndSavedCharacterActions = ({
  services,
  session,
  run,
  setSavedCharacters,
  setActiveCharacterId,
  setFeedback
}: Options): DndSavedCharacterActions => {
  const saveProfile = useCallback(async (profile: DndOptimizedBuildProfile) => {
    const result = await run(async () => {
      if (!services || !session) throw new Error("Sign in before saving a character.");
      const state = createDndSavedCharacterState(profile, session.user.id, crypto.randomUUID());
      const created = await services.repository.create(state);
      setSavedCharacters((current) => [created, ...current]);
      setActiveCharacterId(created.id);
      setFeedback(`${created.displayName} was saved and opened in Play Mode.`);
      return created;
    });
    return result.ok;
  }, [run, services, session, setActiveCharacterId, setFeedback, setSavedCharacters]);

  const openCharacter = useCallback(async (character: DndSavedCharacterState) => {
    const result = await run(async () => {
      if (!services || !session) throw new Error("Sign in before opening a saved character.");
      const current = await services.repository.get(session.user.id, character.id);
      if (!current) throw new Error("The saved character could not be found.");
      profileFor(current);
      setSavedCharacters((entries) => entries.map((entry) => entry.id === current.id ? current : entry));
      setActiveCharacterId(current.id);
      setFeedback(`${current.displayName} opened in Play Mode.`);
      return current;
    });
    return result.ok;
  }, [run, services, session, setActiveCharacterId, setFeedback, setSavedCharacters]);

  const updateCharacter = useCallback(async (character: DndSavedCharacterState) => {
    const result = await run(async () => {
      if (!services || !session || character.ownerId !== session.user.id) throw new Error("Saved-character owner does not match the signed-in user.");
      profileFor(character);
      const updated = await services.repository.update({ ...character, updatedAt: new Date().toISOString() });
      setSavedCharacters((entries) => entries.map((entry) => entry.id === updated.id ? updated : entry));
      setFeedback(`${updated.displayName} was updated.`);
      return updated;
    });
    return result.ok;
  }, [run, services, session, setFeedback, setSavedCharacters]);

  const duplicateCharacter = useCallback(async (character: DndSavedCharacterState) => {
    const result = await run(async () => {
      if (!services || !session || character.ownerId !== session.user.id) throw new Error("Saved-character owner does not match the signed-in user.");
      const now = new Date().toISOString();
      const duplicate = {
        ...character,
        id: crypto.randomUUID(),
        displayName: `${character.displayName} Copy`,
        isArchived: false,
        createdAt: now,
        updatedAt: now
      };
      profileFor(duplicate);
      const created = await services.repository.create(duplicate);
      setSavedCharacters((entries) => [created, ...entries]);
      setActiveCharacterId(created.id);
      setFeedback(`${created.displayName} was created and opened.`);
      return created;
    });
    return result.ok;
  }, [run, services, session, setActiveCharacterId, setFeedback, setSavedCharacters]);

  const archiveCharacter = useCallback(async (character: DndSavedCharacterState) => {
    await run(async () => {
      if (!services || !session || character.ownerId !== session.user.id) throw new Error("Saved-character owner does not match the signed-in user.");
      const updated = await services.repository.update({ ...character, isArchived: true, updatedAt: new Date().toISOString() });
      setSavedCharacters((entries) => entries.filter((entry) => entry.id !== updated.id));
      setActiveCharacterId((current) => current === updated.id ? null : current);
      setFeedback(`${updated.displayName} was archived.`);
    });
  }, [run, services, session, setActiveCharacterId, setFeedback, setSavedCharacters]);

  const deleteCharacter = useCallback(async (character: DndSavedCharacterState) => {
    await run(async () => {
      if (!services || !session || character.ownerId !== session.user.id) throw new Error("Saved-character owner does not match the signed-in user.");
      await services.repository.remove(character.ownerId, character.id);
      setSavedCharacters((entries) => entries.filter((entry) => entry.id !== character.id));
      setActiveCharacterId((current) => current === character.id ? null : current);
      setFeedback(`${character.displayName} was deleted.`);
    });
  }, [run, services, session, setActiveCharacterId, setFeedback, setSavedCharacters]);

  const closeCharacter = useCallback(() => setActiveCharacterId(null), [setActiveCharacterId]);
  return { saveProfile, openCharacter, updateCharacter, duplicateCharacter, archiveCharacter, deleteCharacter, closeCharacter };
};
