import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getDndClericPregenRecord } from "../data/dndClericPregens";
import { getDndReadyPregenRecord } from "../data/dndReadyPregens";
import { dndVaultReadyBuilds } from "../data/dndVaultReadyBuilds";
import { createDndSavedCharacterState } from "../utils/dndSavedCharacterState";
import { DndPregenCharacterSheet } from "./DndPregenCharacterSheet";

describe("Character Vault sheet", () => {
  it("renders the complete tab and action structure for a martial character", () => {
    const fighter = getDndReadyPregenRecord("srd-5.2.1-2024", "fighter", "champion", 5);
    if (!fighter) throw new Error("Expected a released Fighter fixture.");
    const html = renderToStaticMarkup(<DndPregenCharacterSheet record={fighter} />);

    for (const label of ["Actions", "Cards", "Spells", "Features", "Inventory", "Notes", "Build Guide"]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("Sign in to save");
    expect(html).toContain("Print packet");
    expect(html).toContain("No spellcasting profile");
    expect(html).toContain("Build migration pending");
    expect(html).toContain("Generated cards require a Vault Ready build profile");
  });

  it("renders spellcasting numbers, slots, cantrips, and prepared spells", () => {
    const cleric = getDndClericPregenRecord("srd-5.2.1-2024", 5);
    if (!cleric) throw new Error("Expected a released Cleric fixture.");
    const html = renderToStaticMarkup(<DndPregenCharacterSheet record={cleric} />);

    expect(html).toContain("Spell Attack");
    expect(html).toContain("Save DC");
    expect(html).toContain("Spell slots");
    expect(html).toContain("Cantrips");
    expect(html).toContain("Prepared spells");
  });

  it("overlays saved state and exposes its exact-edition generated card deck", () => {
    const profile = dndVaultReadyBuilds.find((entry) => (
      entry.ruleset === "srd-5.2.1-2024" && entry.classId === "cleric" && entry.level === 5
    ));
    if (!profile) throw new Error("Expected a Vault Ready Cleric fixture.");
    const state = createDndSavedCharacterState(profile, "user-1", "save-1");
    const firstResource = profile.character.resources.find((resource) => resource.maximum !== "unlimited");
    const firstSlot = Object.keys(state.spellSlotState)[0];
    const savedState = {
      ...state,
      displayName: "Sister Rowan",
      currentHitPoints: profile.character.maximumHitPoints - 3,
      temporaryHitPoints: 4,
      inspiration: true,
      deathSaveSuccesses: 1,
      deathSaveFailures: 2,
      customNotes: "Protect the lantern bearer.",
      resourceState: firstResource ? { ...state.resourceState, [firstResource.id]: 0 } : state.resourceState,
      spellSlotState: firstSlot ? { ...state.spellSlotState, [Number(firstSlot)]: 0 } : state.spellSlotState
    };
    const html = renderToStaticMarkup(
      <DndPregenCharacterSheet profile={profile} record={profile.character} savedState={savedState} saveLabel="Save changes" signedIn />
    );

    expect(html).toContain("Saved Play Mode");
    expect(html).toContain("Sister Rowan");
    expect(html).toContain(`${savedState.currentHitPoints} / ${profile.character.maximumHitPoints}`);
    expect(html).toContain("+4 temporary");
    expect(html).toContain("1 success · 2 failure");
    expect(html).toContain("Protect the lantern bearer.");
    expect(html).toContain("Save changes");
    expect(html).toContain("Download card deck");
    expect(html).toContain("card-platform-card");
    expect(html).toContain("D&amp;D 2024 · Card Platform v2");
    if (firstResource) expect(html).toContain(`0 / ${firstResource.maximum}`);
    if (firstSlot) expect(html).toContain(`0 / ${profile.character.spellcasting.kind === "none" ? 0 : profile.character.spellcasting.slotsByLevel[Number(firstSlot) as keyof typeof profile.character.spellcasting.slotsByLevel]}`);
  });
});
