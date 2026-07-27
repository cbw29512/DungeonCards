import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getDndClericPregenRecord } from "../data/dndClericPregens";
import { getDndReadyPregenRecord } from "../data/dndReadyPregens";
import { getDndVaultReadyBuild } from "../data/dndVaultReadyBuilds";
import { createDndSavedCharacterState } from "../utils/dndSavedCharacterState";
import { DndPregenCharacterSheet } from "./DndPregenCharacterSheet";

describe("Character Vault sheet", () => {
  it("renders the complete tab and action structure for a martial character", () => {
    const fighter = getDndReadyPregenRecord("srd-5.2.1-2024", "fighter", "champion", 5);
    if (!fighter) throw new Error("Expected a released Fighter fixture.");
    const html = renderToStaticMarkup(<DndPregenCharacterSheet record={fighter} />);

    for (const label of ["Actions", "Spells", "Features", "Inventory", "Notes", "Build Guide"]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("Sign in to save");
    expect(html).toContain("Print packet");
    expect(html).toContain("No spellcasting profile");
    expect(html).toContain("Build migration pending");
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

  it("renders current saved HP, resources, slots, items, attunement, and notes", () => {
    const profile = getDndVaultReadyBuild("srd-5.2.1-2024", "cleric", "life-domain", 10);
    if (!profile || profile.character.spellcasting.kind === "none") throw new Error("Expected a Vault Cleric fixture.");
    const state = createDndSavedCharacterState(profile, "user-1", "save-1", "2026-07-27T00:00:00.000Z");
    const limitedResource = profile.character.resources.find((resource) => resource.maximum !== "unlimited");
    const chargedItem = profile.magicItems.find((item) => item.maximumCharges !== undefined);
    state.displayName = "Arden the Restored";
    state.currentHitPoints = 7;
    state.temporaryHitPoints = 2;
    state.inspiration = true;
    state.customNotes = "Moonlit altar secured.";
    state.spellSlotState[1] = 1;
    state.attunedItemIds = [];
    if (limitedResource && limitedResource.maximum !== "unlimited") state.resourceState[limitedResource.id] = 0;
    if (chargedItem?.maximumCharges !== undefined) state.itemChargeState[chargedItem.id] = 1;

    const html = renderToStaticMarkup(
      <DndPregenCharacterSheet profile={profile} record={profile.character} savedState={state} signedIn />
    );

    expect(html).toContain("Arden the Restored");
    expect(html).toContain(`7/${profile.character.maximumHitPoints}`);
    expect(html).toContain("Temp 2");
    expect(html).toContain("Inspiration");
    expect(html).toContain("1 / 4");
    expect(html).toContain("Not attuned");
    expect(html).toContain("Moonlit altar secured.");
    if (limitedResource && limitedResource.maximum !== "unlimited") {
      expect(html).toContain(`0 / ${limitedResource.maximum}`);
    }
    if (chargedItem?.maximumCharges !== undefined) {
      expect(html).toContain(`1/${chargedItem.maximumCharges} charges`);
    }
  });
});
