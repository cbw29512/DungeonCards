import type { DndCharacterCardBundle } from "../types/dndCharacterCards";
import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import { validateDeckDefinition } from "./cardPlatformRuntimeValidation";
import { validateCardDefinition } from "./cardPlatformValidation";
import { generateDndAttackCards, generateDndResourceCards } from "./dndCharacterActionCards";
import { generateDndFeatureCards } from "./dndCharacterFeatureCards";
import { generateDndEquipmentCards, generateDndMagicItemCards } from "./dndCharacterItemCards";
import { generateDndSpellCards, generateDndSpellSlotCards } from "./dndCharacterSpellCards";
import { safeVaultCardId, vaultGameSystemId } from "./dndCharacterCardShared";

export const generateDndCharacterCardBundle = (
  profile: DndOptimizedBuildProfile
): DndCharacterCardBundle => {
  const gameSystemId = vaultGameSystemId(profile);
  const definitions = [
    ...generateDndAttackCards(profile),
    ...generateDndResourceCards(profile),
    ...generateDndSpellCards(profile),
    ...generateDndSpellSlotCards(profile),
    ...generateDndFeatureCards(profile),
    ...generateDndEquipmentCards(profile),
    ...generateDndMagicItemCards(profile)
  ];
  const ids = definitions.map((card) => card.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(`Character Vault build ${profile.id} generated duplicate card IDs.`);
  }
  const definitionIssues = definitions.flatMap((card) => (
    card.gameSystemId === gameSystemId
      ? validateCardDefinition(card)
      : [`${card.id} belongs to ${card.gameSystemId} instead of ${gameSystemId}.`]
  ));
  if (definitionIssues.length > 0) {
    throw new Error(`Character Vault card generation failed for ${profile.id}: ${definitionIssues.join(" ")}`);
  }
  const deck = {
    schemaVersion: 2 as const,
    id: `vault-deck:${gameSystemId}:${safeVaultCardId(profile.id)}`,
    gameSystemId,
    kind: "character" as const,
    name: `${profile.character.name} Card Deck`,
    description: `Generated from immutable Character Vault build ${profile.id}.`,
    visibility: definitions.some((card) => card.visibility === "private") ? "private" as const : "player-safe" as const,
    cardDefinitionIds: ids
  };
  const deckIssues = validateDeckDefinition(deck);
  if (deckIssues.length > 0) {
    throw new Error(`Character Vault deck generation failed for ${profile.id}: ${deckIssues.join(" ")}`);
  }
  return {
    schemaVersion: 1,
    buildId: profile.id,
    gameSystemId,
    definitions,
    deck
  };
};
