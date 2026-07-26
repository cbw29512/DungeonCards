import type { DndSavedCharacterState } from "../types/dndCharacterVault";

export type DndVaultUser = {
  id: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
};

export type DndVaultSession = {
  user: DndVaultUser;
  expiresAt?: string;
};

export type DndCharacterVaultAuthGateway = {
  getSession(): Promise<DndVaultSession | null>;
  signInWithMagicLink(email: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  onSessionChanged(listener: (session: DndVaultSession | null) => void): () => void;
};

export type DndCharacterVaultRepository = {
  list(ownerId: string, includeArchived?: boolean): Promise<DndSavedCharacterState[]>;
  get(ownerId: string, characterId: string): Promise<DndSavedCharacterState | null>;
  create(state: DndSavedCharacterState): Promise<DndSavedCharacterState>;
  update(state: DndSavedCharacterState): Promise<DndSavedCharacterState>;
  remove(ownerId: string, characterId: string): Promise<void>;
};

export class DndCharacterVaultUnavailableError extends Error {
  constructor(message = "Character Vault account services are not configured.") {
    super(message);
    this.name = "DndCharacterVaultUnavailableError";
  }
}
