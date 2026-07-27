import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [sheet, workspace, card, archive, cardCss, workspaceCss, standard] = await Promise.all([
  readFile(new URL("../../src/components/DndPregenCharacterSheet.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/dndCharacterVault/DndVaultCardDeck.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cardPlatform/CardPlatformDefinitionCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndVaultCardArchive.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/card-platform-card.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-vault-card-deck.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/card-size-standard.css", import.meta.url), "utf8")
]);

describe("Character Vault generated card deck integration", () => {
  it("adds a keyboard-accessible Cards tab without replacing current sheet tabs", () => {
    expect(sheet).toContain('{ id: "cards", label: "Cards" }');
    expect(sheet).toContain('id="vault-panel-cards"');
    expect(sheet).toContain("<DndVaultCardDeck profile={profile}");
    expect(sheet).toContain('event.key === "ArrowRight"');
    expect(sheet).toContain('event.key === "ArrowLeft"');
    expect(sheet).toContain("<DndVaultActions");
    expect(sheet).toContain("<DndVaultSpells");
  });

  it("provides search, category counts, and exact-edition archive download", () => {
    expect(workspace).toContain("filterDndVaultCards");
    expect(workspace).toContain("countDndVaultCardCategories");
    expect(workspace).toContain("buildDndVaultCardArchiveDownload");
    expect(workspace).toContain("downloadTextFile");
    expect(archive).toContain("buildCardPlatformArchive");
    expect(archive).toContain("definitions: bundle.definitions");
    expect(archive).toContain("decks: [bundle.deck]");
  });

  it("keeps controls outside the universal card and exposes card metadata", () => {
    expect(card).toContain('className={`card-platform-card');
    expect(card).toContain("card.review.status");
    expect(card).toContain("card.actions");
    expect(card).toContain("card.resources");
    expect(card).toContain("card.source.title");
    expect(workspace.indexOf("vault-card-deck__controls")).toBeLessThan(workspace.indexOf("card-platform-grid"));
    expect(standard).toContain(".card-platform-card");
    expect(cardCss).not.toMatch(/width:\s*\d+px|height:\s*\d+px/);
  });

  it("supports responsive controls and physical-size printing", () => {
    expect(workspaceCss).toContain("@media (max-width: 620px)");
    expect(workspaceCss).toContain("@media print");
    expect(workspaceCss).toContain("var(--dm-card-print-width)");
    expect(cardCss).toContain("@media print");
  });
});
