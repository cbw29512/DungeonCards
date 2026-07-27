import { dndVaultReadyBuilds, getDndVaultReadyBuildById } from "./dndVaultReadyBuilds";
import type { DndCharacterCardBundle } from "../types/dndCharacterCards";
import { generateDndCharacterCardBundle } from "../utils/dndCharacterCardGeneration";

export const getDndVaultCardBundleByBuildId = (
  buildId: string
): DndCharacterCardBundle | undefined => {
  const profile = getDndVaultReadyBuildById(buildId);
  return profile ? generateDndCharacterCardBundle(profile) : undefined;
};

export const generateDndVaultCardLibrary = (): DndCharacterCardBundle[] => (
  dndVaultReadyBuilds.map(generateDndCharacterCardBundle)
);

export const countGeneratedDndVaultCards = (): number => (
  generateDndVaultCardLibrary().reduce((total, bundle) => total + bundle.definitions.length, 0)
);
