import { describe, expect, it } from "vitest";
import type { CardActionHistoryEntry } from "../types/cardActionExecution";
import { buildNextCardActionHistory } from "./cardActionHistoryState";
import {
  MAX_CARD_ACTION_HISTORY_ENTRIES,
  cardActionHistoryKey,
  createEmptyCardActionHistory,
  loadCardActionHistory,
  parseCardActionHistory
} from "./cardActionHistoryStorage";
import {
  CARD_ACTION_HISTORY_PAGE_SIZE,
  EMPTY_CARD_ACTION_HISTORY_FILTERS,
  filterCardActionHistory,
  paginateCardActionHistory
} from "./cardActionHistoryFilters";

const entry = (id: string, overrides: Partial<CardActionHistoryEntry> = {}): CardActionHistoryEntry => ({
  schemaVersion: 1,
  id,
  gameSystemId: "dnd-2024",
  executedAt: "2026-07-27T19:20:00.000Z",
  deckId: "deck:history",
  cardInstanceId: "instance:history",
  definitionId: "definition:history",
  actionId: "action:history",
  actionKind: "roll",
  label: "Attack roll",
  summary: "Attack roll: 17.",
  roll: { rollSystem: "d20", formula: "1d20+5", total: 17 },
  resourceChanges: [],
  ...overrides
});

describe("exact-system card action history", () => {
  it("uses separate storage keys and rejects cross-system history", () => {
    expect(cardActionHistoryKey("dnd-2014")).not.toBe(cardActionHistoryKey("dnd-2024"));
    expect(cardActionHistoryKey("coc-7e")).not.toBe(cardActionHistoryKey("dnd-2024"));
    const text = JSON.stringify({
      ...createEmptyCardActionHistory("dnd-2024"),
      entries: [entry("history:one")]
    });
    expect(() => parseCardActionHistory(text, "dnd-2014")).toThrow(/another game system/i);
  });

  it("falls back safely when stored history is corrupt", () => {
    const loaded = loadCardActionHistory({ getItem: () => "{not-json" }, "dnd-2024");
    expect(loaded.history.entries).toEqual([]);
    expect(loaded.error).toMatch(/could not|invalid|JSON/i);
  });

  it("rejects duplicate IDs and overlong operational text", () => {
    const duplicate = {
      ...createEmptyCardActionHistory("dnd-2024"),
      entries: [entry("history:duplicate"), entry("history:duplicate")]
    };
    expect(() => parseCardActionHistory(JSON.stringify(duplicate), "dnd-2024")).toThrow(/duplicate/i);
    const tooLong = {
      ...createEmptyCardActionHistory("dnd-2024"),
      entries: [entry("history:long", { summary: "x".repeat(1_001) })]
    };
    expect(() => parseCardActionHistory(JSON.stringify(tooLong), "dnd-2024")).toThrow(/invalid/i);
  });

  it("retains only the newest capped entries", () => {
    let history = createEmptyCardActionHistory("dnd-2024");
    for (let index = 0; index < MAX_CARD_ACTION_HISTORY_ENTRIES + 5; index += 1) {
      history = buildNextCardActionHistory(history, entry(`history:${index}`));
    }
    expect(history.entries).toHaveLength(MAX_CARD_ACTION_HISTORY_ENTRIES);
    expect(history.entries[0]?.id).toBe(`history:${MAX_CARD_ACTION_HISTORY_ENTRIES + 4}`);
    expect(history.entries.at(-1)?.id).toBe("history:5");
  });

  it("filters and paginates history without mounting every entry", () => {
    const entries = Array.from({ length: CARD_ACTION_HISTORY_PAGE_SIZE + 3 }, (_, index) => entry(`history:filter-${index}`, {
      deckId: index % 2 === 0 ? "deck:alpha" : "deck:beta",
      actionKind: index % 3 === 0 ? "procedure" : "roll",
      label: index === 6 ? "Open the ancient gate" : `Action ${index}`,
      summary: index === 6 ? "The gate procedure completed." : `Result ${index}`
    }));
    const filtered = filterCardActionHistory(entries, {
      ...EMPTY_CARD_ACTION_HISTORY_FILTERS,
      deckId: "deck:alpha",
      actionKind: "procedure",
      query: "gate"
    });
    expect(filtered.map((item) => item.id)).toEqual(["history:filter-6"]);
    const page = paginateCardActionHistory(entries, 1);
    expect(page.entries).toHaveLength(CARD_ACTION_HISTORY_PAGE_SIZE);
    expect(page.pageCount).toBe(2);
  });
});
