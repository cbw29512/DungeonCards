import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../types/dndCharacterVault";

const emptySpellSlots = (): DndSavedCharacterState["spellSlotState"] => ({});
const validInteger = (value: number, minimum: number, maximum?: number): boolean => (
  Number.isInteger(value) && value >= minimum && (maximum === undefined || value <= maximum)
);

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

const validateResources = (state: DndSavedCharacterState, profile: DndOptimizedBuildProfile): string[] => {
  const issues: string[] = [];
  const expected = new Map(profile.character.resources.map((resource) => [resource.id, resource]));
  for (const resource of expected.values()) {
    const remaining = state.resourceState[resource.id];
    if (remaining === undefined) issues.push(`Missing tracked resource: ${resource.name}`);
    else if (!validInteger(remaining, 0, resource.maximum === "unlimited" ? 0 : resource.maximum)) {
      issues.push(`${resource.name} remaining uses are outside the valid range.`);
    }
  }
  for (const resourceId of Object.keys(state.resourceState)) {
    if (!expected.has(resourceId)) issues.push(`Unknown tracked resource: ${resourceId}`);
  }
  return issues;
};

const validateSpellSlots = (state: DndSavedCharacterState, profile: DndOptimizedBuildProfile): string[] => {
  const issues: string[] = [];
  const expected = profile.character.spellcasting.kind === "none"
    ? {}
    : profile.character.spellcasting.slotsByLevel;
  for (const [level, maximum] of Object.entries(expected)) {
    const remaining = state.spellSlotState[Number(level) as keyof typeof state.spellSlotState];
    if (remaining === undefined) issues.push(`Missing level ${level} spell-slot state.`);
    else if (!validInteger(remaining, 0, maximum ?? 0)) issues.push(`Level ${level} spell slots are outside the valid range.`);
  }
  for (const level of Object.keys(state.spellSlotState)) {
    if (!(level in expected)) issues.push(`Unknown spell-slot level: ${level}`);
  }
  return issues;
};

const validateMagicItems = (state: DndSavedCharacterState, profile: DndOptimizedBuildProfile): string[] => {
  const issues: string[] = [];
  const items = new Map(profile.magicItems.map((item) => [item.id, item]));
  for (const itemId of state.attunedItemIds) {
    const item = items.get(itemId);
    if (!item) issues.push(`Unknown attuned magic item: ${itemId}`);
    else if (!item.requiresAttunement) issues.push(`${item.name} does not require attunement.`);
  }
  if (new Set(state.attunedItemIds).size !== state.attunedItemIds.length) issues.push("Attuned magic-item IDs must be unique.");
  if (state.attunedItemIds.length > 3) issues.push("A character cannot be attuned to more than three magic items.");

  for (const item of profile.magicItems.filter((entry) => entry.maximumCharges !== undefined)) {
    const remaining = state.itemChargeState[item.id];
    if (remaining === undefined) issues.push(`Missing charge state for ${item.name}.`);
    else if (!validInteger(remaining, 0, item.maximumCharges)) issues.push(`${item.name} charges are outside the valid range.`);
  }
  for (const itemId of Object.keys(state.itemChargeState)) {
    const item = items.get(itemId);
    if (!item) issues.push(`Unknown charged magic item: ${itemId}`);
    else if (item.maximumCharges === undefined) issues.push(`${item.name} does not use charges.`);
  }
  return issues;
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
    if (!validInteger(state.currentHitPoints, 0, profile.character.maximumHitPoints)) issues.push("Current Hit Points are outside the valid range.");
    if (!validInteger(state.temporaryHitPoints, 0)) issues.push("Temporary Hit Points must be a nonnegative integer.");
    if (!validInteger(state.deathSaveSuccesses, 0, 3) || !validInteger(state.deathSaveFailures, 0, 3)) issues.push("Death Save counts must be integers from 0 through 3.");
    if (state.customNotes.length > 10000) issues.push("Character notes cannot exceed 10,000 characters.");
    issues.push(...validateResources(state, profile));
    issues.push(...validateSpellSlots(state, profile));
    issues.push(...validateMagicItems(state, profile));
    if (Number.isNaN(Date.parse(state.createdAt)) || Number.isNaN(Date.parse(state.updatedAt))) issues.push("Saved character timestamps must be valid ISO dates.");
  } catch (error) {
    console.error("Unexpected saved character validation failure", { stateId: state.id, profileId: profile.id, error });
    issues.push("Saved character validation failed unexpectedly.");
  }
  return issues;
};
