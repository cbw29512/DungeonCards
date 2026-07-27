import { createClientId } from "./createId";

const OWNER_KEY = "dungeon-cards.private-library-owner.v1";
const SAFE_OWNER_ID = /^[A-Za-z0-9._:@-]{1,200}$/;

export const getOrCreateLocalPrivateLibraryOwner = (
  storage: Pick<Storage, "getItem" | "setItem">
): string => {
  const existing = storage.getItem(OWNER_KEY);
  if (existing && SAFE_OWNER_ID.test(existing)) return existing;
  const ownerId = createClientId("local-owner");
  storage.setItem(OWNER_KEY, ownerId);
  return ownerId;
};
