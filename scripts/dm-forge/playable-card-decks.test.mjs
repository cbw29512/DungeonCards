import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const types = read("src/types/cardDeckLibrary.ts");
const storage = read("src/utils/cardDeckLibraryStorage.ts");
const cards = read("src/utils/cardDeckLibraryCards.ts");
const resources = read("src/utils/cardDeckLibraryResources.ts");
const hook = read("src/hooks/useCardDeckLibrary.ts");
const catalogItem = read("src/components/cardPlatform/CardCatalogItem.tsx");
const runtimePanel = read("src/components/cardPlatform/PlayableCardRuntimePanel.tsx");
const printStyles = read("src/styles/playable-deck-responsive-print.css");
const runtimeStyles = read("src/styles/playable-card-runtime.css");

describe("playable exact-system Card Catalog deck architecture", () => {
  it("stores immutable definitions separately from runtime and deck state", () => {
    for (const token of ["definitions: CardDefinition[]", "instances: CardRuntimeInstance[]", "decks: DeckDefinition[]", "deckStates: DeckRuntimeState[]", "activeDeckId", "archivedDeckIds"]) {
      expect(types).toContain(token);
    }
  });

  it("uses an independent versioned key for every exact system", () => {
    expect(storage).toContain("dungeon-cards.card-deck-library.v2");
    expect(storage).toContain("gameSystemId");
    expect(storage).toContain("assertValidCardDeckLibrary");
    expect(storage).toContain("storage.setItem");
  });

  it("creates independent instances and preserves private ownership", () => {
    expect(cards).toContain("createCardRuntimeInstance");
    expect(cards).toContain("ownerId");
    expect(hook).toContain("getOrCreateLocalPrivateLibraryOwner");
    expect(hook).toContain("createClientId(\"card-instance\")");
  });

  it("supports bounded resource state and explicit refresh cadences", () => {
    expect(resources).toContain('resource.maximum === "unlimited"');
    expect(resources).toContain("Math.min(resource.maximum");
    expect(resources).toContain("resource.refresh === refresh");
    expect(runtimePanel).toContain("onAdjustResource");
    expect(runtimePanel).toContain("onResetResource");
  });

  it("keeps add and runtime controls outside the universal card shell", () => {
    expect(catalogItem.indexOf("card-catalog__add")).toBeGreaterThan(catalogItem.indexOf("CardPlatformDefinitionCard"));
    expect(runtimePanel.indexOf("playable-card-runtime__controls")).toBeGreaterThan(runtimePanel.indexOf("CardPlatformDefinitionCard"));
    expect(runtimeStyles).not.toMatch(/250px|350px|2\.5in|3\.5in/);
  });

  it("prints only active deck card faces at shared physical dimensions", () => {
    expect(printStyles).toContain("body.printing-playable-deck");
    expect(printStyles).toContain("var(--dm-card-print-width)");
    expect(printStyles).toContain("playable-card-runtime__controls");
    expect(printStyles).toContain("display: none !important");
  });
});
