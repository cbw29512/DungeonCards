import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../types/dndCharacterVault";

const emptySpellSlots = (): DndSavedCharacterState["spellSlotState"] => ({});

export const createDndSavedCharacterState = (
  profile: DndOptimizedBuildProfile,
  ownerId: string,
  id: string,
  now = new Date().toISOString()
): DndSavedCharacterState => {
  try {
    const resourceState = Object.fromEntries(profile.character.resources.map((resource) => [
      resource.id,
      resource.maximum === "unlimited" ? 0 : resource.maximum
    ]));
    const spellSlotState = profile.character.spellcasting.kind === "none"
      ? emptySpellSlots()
      : { ...profile.character.spellcasting.slotsByLevel };
    const itemChargeState = Object.fromEntries(profile.magicItems
      .filter((item) => item.maximumCharges !== undefined)
      .map((item) => [item.id, item.maximumCharges as number]));

    return {
      id,
      ownerId,
      baseBuildId: profile.id,
      displayName: profile.character.name,
      ruleset: profile.ruleset,
      level: profile.level,
      currentHitPoints: profile.character.maximumHitPoints,
      temporaryHitPoints: 0,
      inspiration: false,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      resourceState,
      spellSlotState,
      itemChargeState,
      attunedItemIds: profile.magicItems.filter((item) => item.attunedByDefault).map((item) => item.id),
      customNotes: "",
      isArchived: false,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error("Failed to create saved character state", { profileId: profile.id, ownerId, error });
    throw new Error("Could not create a saved character from this build.", { cause: error });
  }
};

export const validateDndSavedCharacterState = (
  state: DndSavedCharacterState,
  profile: DndOptimizedBuildProfile
): string[] => {
  const issues: string[] = [];

  try {
    if (!state.id.trim() || !state.ownerId.trim()) issues.push("Saved character and owner IDs are required.");
    if (state.baseBuildId !== profile.id) issues.push("Saved character references the wrong optimized build.");
    if (state.ruleset !== profile.ruleset || state.level !== profile.level) issues.push("Saved character edition or level does not match its optimized build.");
    if (!state.displayName.trim()) issues.push("Saved character display name is required.");
    if (state.currentHitPoints < 0 || state.currentHitPoints > profile.character.maximumHitPoints) issues.push("Current Hit Points are outside the valid range.");
    if (state.temporaryHitPoints < 0) issues.push("Temporary Hit Points cannot be negative.");
    if (![state.deathSaveSuccesses, state.deathSaveFailures].every((value) => Number.isInteger(value) && value >= 0 && value <= 3)) issues.push("Death Save counts must be integers from 0 through 3.");

    const resources = new Map(profile.character.resources.map((resource) => [resource.id, resource]));
    for (const [resourceId, remaining] of Object.entries(state.resourceState)) {
      const resource = resources.get(resourceId);
      if (!resource) issues.push(`Unknown tracked resource: ${resourceId}`);
      else if (!Number.isInteger(remaining) || remaining < 0) issues.push(`${resource.name} remaining uses are invalid.`);
      else if (resource.maximum !== "unlimited" && remaining > resource.maximum) issues.push(`${resource.name} exceeds its maximum uses.`);
    }

    const magicItems = new Map(profile.magicItems.map((item) => [item.id, item]));
    for (const itemId of state.attunedItemIds) {
      const item = magicItems.get(itemId);
      if (!item) issues.push(`Unknown attuned magic item: ${itemId}`);
      else if (!item.requiresAttunement) issues.push(`${item.name} does not require attunement.`);
    }
    if (new Set(state.attunedItemIds).size !== state.attunedItemIds.length) issues.push("Attuned magic-item IDs must be unique.");
    if (state.attunedItemIds.length > 3) issues.push("A character cannot be attuned to more than three magic items.");

    for (const [itemId, remaining] of Object.entries(state.itemChargeState)) {
      const item = magicItems.get(itemId);
      if (!item) issues.push(`Unknown charged magic item: ${itemId}`);
      else if (item.maximumCharges === undefined) issues.push(`${item.name} does not use charges.`);
      else if (!Number.isInteger(remaining) || remaining < 0 || remaining > item.maximumCharges) issues.push(`${item.name} charges are outside the valid range.`);
    }

    if (Number.isNaN(Date.parse(state.createdAt)) || Number.isNaN(Date.parse(state.updatedAt))) issues.push("Saved character timestamps must be valid ISO dates.");
  } catch (error) {
    console.error("Unexpected saved character validation failure", { stateId: state.id, profileId: profile.id, error });
    issues.push("Saved character validation failed unexpectedly.");
  }

  return issues;
};
