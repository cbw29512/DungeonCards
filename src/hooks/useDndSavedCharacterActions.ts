import { useCallback, type Dispatch, type SetStateAction } from "react";
import { getDndVaultReadyBuildById } from "../data/dndVaultReadyBuilds";
import type { DndCharacterVaultServices } from "../services/dndCharacterVaultServices";
import type { DndVaultSession } from "../services/dndCharacterVaultGateway";
import type { DndSavedCharacterState } from "../types/dndCharacterVault";
import { validateDndSavedCharacterState } from "../utils/dndSavedCharacterState";

type RunOperation = (operation: () => Promise<void>) => Promise<void>;

export const useDndSavedCharacterActions = ({
  services,
  session,
  activeCharacter,
  run,
  setSavedCharacters,
  setActiveCharacter,
  setFeedback,
  setOperationError
}: {
  services: DndCharacterVaultServices | null;
  session: DndVaultSession | null;
  activeCharacter: DndSavedCharacterState | null;
  run: RunOperation;
  setSavedCharacters: Dispatch<SetStateAction<DndSavedCharacterState[]>>;
  setActiveCharacter: Dispatch<SetStateAction<DndSavedCharacterState | null>>;
  setFeedback: Dispatch<SetStateAction<string>>;
  setOperationError: Dispatch<SetStateAction<string>>;
}) => {
  const openCharacter = useCallback((character: DndSavedCharacterState) => {
    setOperationError("");
    setFeedback(`${character.displayName} opened in Play Mode.`);
    setActiveCharacter(character);
  }, [setActiveCharacter, setFeedback, setOperationError]);

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
  }), [run, services, session, setActiveCharacter, setFeedback, setSavedCharacters]);

  const archiveCharacter = useCallback(async (character: DndSavedCharacterState) => run(async () => {
    if (!services) throw new Error("Account services are not configured.");
    const updated = await services.repository.update({ ...character, isArchived: true, updatedAt: new Date().toISOString() });
    setSavedCharacters((current) => current.filter((entry) => entry.id !== updated.id));
    if (activeCharacter?.id === updated.id) setActiveCharacter(null);
    setFeedback(`${updated.displayName} was archived.`);
  }), [activeCharacter, run, services, setActiveCharacter, setFeedback, setSavedCharacters]);

  const deleteCharacter = useCallback(async (character: DndSavedCharacterState) => run(async () => {
    if (!services) throw new Error("Account services are not configured.");
    await services.repository.remove(character.ownerId, character.id);
    setSavedCharacters((current) => current.filter((entry) => entry.id !== character.id));
    if (activeCharacter?.id === character.id) setActiveCharacter(null);
    setFeedback(`${character.displayName} was deleted.`);
  }), [activeCharacter, run, services, setActiveCharacter, setFeedback, setSavedCharacters]);

  return { openCharacter, closeCharacter, updateCharacter, archiveCharacter, deleteCharacter };
};
