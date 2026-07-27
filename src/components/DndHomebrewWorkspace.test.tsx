import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { HomebrewDiceCard } from "../types/cards";
import { DndHomebrewWorkspace } from "./DndHomebrewWorkspace";

const card = (
  id: string,
  name: string,
  gameSystemId: "dnd-2014" | "dnd-2024"
): HomebrewDiceCard => ({
  id,
  name,
  category: "homebrew",
  formula: "1d20+5",
  description: `${name} description`,
  imageEmoji: "✨",
  isFavorite: false,
  schemaVersion: 2,
  gameSystemId
});

describe("D&D homebrew card workspace", () => {
  it("defaults to the 2024 library without rendering 2014 saved cards", () => {
    const html = renderToStaticMarkup(
      <DndHomebrewWorkspace
        cards={[
          card("old-card", "2014 Only Card", "dnd-2014"),
          card("new-card", "2024 Only Card", "dnd-2024")
        ]}
        migrationNotice={null}
        onCreate={() => true}
        onDelete={() => true}
        storageError={null}
      />
    );
    expect(html).toContain("2024 Only Card");
    expect(html).not.toContain("2014 Only Card");
    expect(html).toContain("D&amp;D 2024 Homebrew Deck");
    expect(html).toContain("Homebrew card edition");
  });

  it("renders the explicit legacy migration notice", () => {
    const html = renderToStaticMarkup(
      <DndHomebrewWorkspace
        cards={[]}
        migrationNotice="2 legacy homebrew cards were assigned to D&D 2024."
        onCreate={() => true}
        onDelete={() => true}
        storageError={null}
      />
    );
    expect(html).toContain("2 legacy homebrew cards were assigned to D&amp;D 2024.");
    expect(html).toContain("No D&amp;D 2024 homebrew cards yet");
  });
});
