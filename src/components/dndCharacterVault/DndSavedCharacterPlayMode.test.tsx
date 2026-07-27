import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getDndVaultReadyBuild } from "../../data/dndVaultReadyBuilds";
import { createDndSavedCharacterState } from "../../utils/dndSavedCharacterState";
import { DndSavedCharacterPlayMode } from "./DndSavedCharacterPlayMode";

describe("Saved Character Play Mode", () => {
  it("renders editable trackers and the current printable packet", () => {
    const profile = getDndVaultReadyBuild("srd-5.2.1-2024", "fighter", "champion", 5);
    if (!profile) throw new Error("Expected a Vault Fighter fixture.");
    const state = createDndSavedCharacterState(profile, "user-1", "save-1", "2026-07-27T00:00:00.000Z");
    state.displayName = "Kara at the Keep";
    state.currentHitPoints = 12;
    state.temporaryHitPoints = 3;
    state.customNotes = "Action Surge spent before the gate opened.";

    const html = renderToStaticMarkup(
      <DndSavedCharacterPlayMode
        busy={false}
        error=""
        feedback=""
        onClose={() => undefined}
        onSave={async () => undefined}
        profile={profile}
        savedState={state}
      />
    );

    for (const label of [
      "Saved Character Play Mode",
      "Health &amp; survival",
      "Resources &amp; spell slots",
      "Magic items &amp; attunement",
      "Session notes",
      "Save changes",
      "Print packet"
    ]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("Kara at the Keep");
    expect(html).toContain(`12/${profile.character.maximumHitPoints}`);
    expect(html).toContain("Temp 3");
    expect(html).toContain("Action Surge spent before the gate opened.");
  });
});
