import { describe, expect, it } from "vitest";
import type { CardDefinition } from "../types/cardPlatform";
import { privateArchiveCard } from "./cardPlatformArchiveFixtures";
import { addCardToPlayableDeck } from "./cardDeckLibraryCards";
import { createPlayableDeck } from "./cardDeckLibraryDecks";
import {
  cardDeckLibraryKey,
  createEmptyCardDeckLibrary,
  serializeCardDeckLibrary
} from "./cardDeckLibraryStorage";
import { executeCardAction } from "./cardActionExecution";
import { applyCardActionResult, createCardActionHistoryEntry } from "./cardActionDeckState";
import { createEmptyCardActionHistory, cardActionHistoryKey } from "./cardActionHistoryStorage";
import { serializeCardActionHistory } from "./cardActionHistoryState";
import { commitCardActionTransaction } from "./cardActionTransaction";

class FailHistoryOnceStorage {
  readonly values = new Map<string, string>();
  private shouldFail = true;

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (key === cardActionHistoryKey("dnd-2024") && this.shouldFail) {
      this.shouldFail = false;
      throw new Error("Simulated history write failure.");
    }
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const executableCard: CardDefinition = {
  ...privateArchiveCard,
  id: "action-transaction:test-card",
  actions: [{
    id: "spend-use",
    kind: "procedure",
    label: "Spend a use",
    steps: ["Resolve the effect."],
    resourceCosts: [{ resourceId: "uses", amount: 1 }]
  }]
};

describe("card action deck/history transaction", () => {
  it("rolls both storage keys back when the second write fails", () => {
    const created = createPlayableDeck(createEmptyCardDeckLibrary("dnd-2024"), {
      deckId: "deck:transaction",
      stateId: "deck-state:transaction",
      name: "Transaction Test",
      kind: "personal",
      now: "2026-07-27T19:30:00.000Z"
    });
    const currentLibrary = addCardToPlayableDeck(
      created,
      "deck:transaction",
      executableCard,
      "instance:transaction",
      "local-owner-test",
      "2026-07-27T19:31:00.000Z"
    );
    const action = executableCard.actions[0]!;
    const instance = currentLibrary.instances[0]!;
    const result = executeCardAction(executableCard, instance, action);
    const nextLibrary = applyCardActionResult(
      currentLibrary,
      "deck:transaction",
      instance.id,
      result,
      "2026-07-27T19:32:00.000Z"
    );
    const history = createEmptyCardActionHistory("dnd-2024");
    const historyEntry = createCardActionHistoryEntry({
      id: "history:transaction",
      executedAt: "2026-07-27T19:32:00.000Z",
      library: currentLibrary,
      deckId: "deck:transaction",
      instanceId: instance.id,
      action,
      result
    });
    const storage = new FailHistoryOnceStorage();
    const previousLibraryText = serializeCardDeckLibrary(currentLibrary);
    const previousHistoryText = serializeCardActionHistory(history);
    storage.values.set(cardDeckLibraryKey("dnd-2024"), previousLibraryText);
    storage.values.set(cardActionHistoryKey("dnd-2024"), previousHistoryText);

    expect(() => commitCardActionTransaction(storage, nextLibrary, history, historyEntry))
      .toThrow(/history write failure/i);
    expect(storage.getItem(cardDeckLibraryKey("dnd-2024"))).toBe(previousLibraryText);
    expect(storage.getItem(cardActionHistoryKey("dnd-2024"))).toBe(previousHistoryText);

    const committed = commitCardActionTransaction(storage, nextLibrary, history, historyEntry);
    expect(committed.library.instances[0]?.resourceState.uses).toBe(2);
    expect(committed.history.entries.map((entry) => entry.id)).toEqual(["history:transaction"]);
    expect(storage.getItem(cardDeckLibraryKey("dnd-2024"))).not.toBe(previousLibraryText);
    expect(storage.getItem(cardActionHistoryKey("dnd-2024"))).not.toBe(previousHistoryText);
  });
});
