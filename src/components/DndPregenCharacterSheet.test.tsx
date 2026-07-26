import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getDndClericPregenRecord } from "../data/dndClericPregens";
import { getDndReadyPregenRecord } from "../data/dndReadyPregens";
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
});
