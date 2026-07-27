import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [
  deckGrid,
  homebrewWorkspace,
  diceStateHook,
  diceStorage,
  rulesDeck,
  ruleStateHook,
  ruleStorage,
  cardStyles,
  actionStyles
] = await Promise.all([
  readFile(new URL("../../src/components/DeckGrid.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndHomebrewWorkspace.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/hooks/useDiceDeckState.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/diceDeckStateStorage.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/RulesDeck.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/hooks/useRuleCardState.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/ruleRollHistoryStorage.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/cards.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/deck-actions.css", import.meta.url), "utf8")
]);

describe("exact-system deck state", () => {
  it("scopes Dice favorites and history by system and deck", () => {
    expect(deckGrid).toContain("gameSystemId: GameSystemId");
    expect(deckGrid).toContain("deckId: string");
    expect(deckGrid).toContain("useDiceDeckState(cards, gameSystemId, deckId)");
    expect(homebrewWorkspace).toContain('deckId="homebrew"');
    expect(homebrewWorkspace).toContain("gameSystemId={gameSystemId}");
    expect(diceStorage).toContain("${STORAGE_PREFIX}.${gameSystemId}.${deckId}");
    expect(diceStorage).toContain('"dnd-2014", "dnd-2024", "coc-7e"');
  });

  it("keeps persistent state separate from temporary flip animation", () => {
    expect(diceStateHook).toContain("favoriteCardIds: persisted.favoriteCardIds");
    expect(diceStateHook).toContain("rollHistory: persisted.rollHistory");
    expect(diceStateHook).toContain("setActiveFlippedCardId(null)");
    expect(diceStateHook).toContain("setRollResults({})");
  });

  it("stores mixed-edition rule rolls in exact edition envelopes", () => {
    expect(ruleStateHook).toContain("gameSystemId: gameSystemIdForRuleset(ruleset)");
    expect(rulesDeck).toContain("useRuleRollHistory(role)");
    expect(rulesDeck).toContain("history.addEntry");
    expect(ruleStorage).toContain("${STORAGE_PREFIX}.${role}.${gameSystemId}");
    expect(ruleStorage).toContain('entry.ruleset === expectedRuleset(gameSystemId)');
  });

  it("keeps actions outside the universal card footprint", () => {
    expect(deckGrid.indexOf("<DiceCard")).toBeLessThan(deckGrid.indexOf('className="deck-card-actions"'));
    expect(actionStyles).toContain(".deck-card-actions");
    expect(cardStyles).toContain("width: var(--dm-card-screen-width)");
    expect(cardStyles).toContain("height: var(--dm-card-screen-height)");
  });
});
