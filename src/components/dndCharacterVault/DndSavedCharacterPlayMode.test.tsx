import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { dndVaultReadyBuilds } from "../../data/dndVaultReadyBuilds";
import { createDndSavedCharacterState } from "../../utils/dndSavedCharacterState";
import { DndSavedCharacterPlayMode } from "./DndSavedCharacterPlayMode";

describe("Saved Character Play Mode", () => {
  it("renders every tracked play-state editor and the current print packet", () => {
    const profile = dndVaultReadyBuilds.find((entry) => (
      entry.ruleset === "srd-5.2.1-2024" && entry.classId === "cleric" && entry.level === 5
    ));
    if (!profile) throw new Error("Expected a Vault Ready Cleric fixture.");
    const character = {
      ...createDndSavedCharacterState(profile, "user-1", "save-1", "2026-07-27T12:00:00.000Z"),
      displayName: "Sister Rowan",
      customNotes: "Keep the party standing."
    };
    const html = renderToStaticMarkup(
      <DndSavedCharacterPlayMode
        busy={false}
        character={character}
        onClose={() => undefined}
        onDuplicate={async () => true}
        onSave={async () => true}
        profile={profile}
      />
    );

    for (const label of [
      "Identity and health",
      "Current HP",
      "Temporary HP",
      "Inspiration",
      "Death Save successes",
      "Resources and spell slots",
      "Magic items",
      "Attunement slots",
      "Play notes",
      "Custom notes"
    ]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("Character Vault · Play Mode");
    expect(html).toContain("Sister Rowan");
    expect(html).toContain("Keep the party standing.");
    expect(html).toContain("Duplicate");
    expect(html).toContain("Save changes");
    expect(html).toContain("Print packet");
  });
});
