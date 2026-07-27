import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { DndCharacterVaultServices } from "../services/dndCharacterVaultServices";
import type { DndVaultSessionState } from "./useDndCharacterVaultSession";

export type DndVaultRun = <T>(operation: () => Promise<T>) => Promise<{
  ok: true;
  value: T;
} | { ok: false }>;

type AuthActionOptions = Pick<DndVaultSessionState, "setSession" | "setSavedCharacters"> & {
  services: DndCharacterVaultServices | null;
  run: DndVaultRun;
  setActiveCharacterId: Dispatch<SetStateAction<string | null>>;
  setFeedback: Dispatch<SetStateAction<string>>;
};

export const useDndVaultAuthActions = ({
  services,
  run,
  setSession,
  setSavedCharacters,
  setActiveCharacterId,
  setFeedback
}: AuthActionOptions) => {
  const signInWithMagicLink = useCallback(async (email: string) => {
    await run(async () => {
      if (!services) throw new Error("Account services are not configured.");
      await services.auth.signInWithMagicLink(email);
      setFeedback("Check your email for the secure Character Vault sign-in link.");
    });
  }, [run, services, setFeedback]);

  const signInWithGoogle = useCallback(async () => {
    await run(async () => {
      if (!services) throw new Error("Account services are not configured.");
      await services.auth.signInWithGoogle();
    });
  }, [run, services]);

  const signOut = useCallback(async () => {
    await run(async () => {
      if (services) await services.auth.signOut();
      setSession(null);
      setSavedCharacters([]);
      setActiveCharacterId(null);
      setFeedback("Signed out of Character Vault.");
    });
  }, [run, services, setActiveCharacterId, setFeedback, setSavedCharacters, setSession]);

  return { signInWithMagicLink, signInWithGoogle, signOut };
};
