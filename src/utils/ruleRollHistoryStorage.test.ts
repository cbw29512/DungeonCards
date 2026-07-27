import { describe, expect, it } from "vitest";
import type { DndGameSystemId } from "../types/cardPlatform";
import type { RuleRollHistoryEntry } from "../types/ruleCards";
import { mergeRuleRollHistory } from "./ruleRollHistoryModel";
import {
  clearRuleRollHistory,
  createEmptyRuleHistory,
  loadRuleRollHistory,
  MAX_RULE_ROLL_HISTORY_PER_SYSTEM,
  ruleRollHistoryKey,
  saveRuleRollHistory
} from "./ruleRollHistoryStorage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const entry = (
  gameSystemId: DndGameSystemId,
  id: string,
  rolledAt: string
): RuleRollHistoryEntry => ({
  id,
  cardId: "attack-roll",
  cardName: "Attack Roll",
  gameSystemId,
  ruleset: gameSystemId === "dnd-2014" ? "srd-5.1-2014" : "srd-5.2.1-2024",
  modeLabel: "Attack",
  rolledAt,
  result: {
    formula: "1d20+5",
    dice: [{ sides: 20, results: [12] }],
    modifier: 5,
    total: 17,
    isCritical: false,
    isFailure: false
  }
});

const envelope = (gameSystemId: DndGameSystemId, role: "player" | "dm" = "player") => ({
  ...createEmptyRuleHistory(role, gameSystemId),
  entries: [entry(gameSystemId, `roll-${gameSystemId}`, "2026-07-27T16:00:00.000Z")]
});

describe("rule roll history storage", () => {
  it("isolates role and exact edition keys", () => {
    const storage = new MemoryStorage();
    saveRuleRollHistory(storage, envelope("dnd-2014"));
    saveRuleRollHistory(storage, envelope("dnd-2024"));
    saveRuleRollHistory(storage, envelope("dnd-2024", "dm"));

    expect(ruleRollHistoryKey("player", "dnd-2014")).not.toBe(
      ruleRollHistoryKey("player", "dnd-2024")
    );
    expect(loadRuleRollHistory(storage, "player", "dnd-2014").entries[0]?.gameSystemId)
      .toBe("dnd-2014");
    expect(loadRuleRollHistory(storage, "player", "dnd-2024").entries[0]?.gameSystemId)
      .toBe("dnd-2024");
    expect(loadRuleRollHistory(storage, "dm", "dnd-2024").entries).toHaveLength(1);
  });

  it("rejects mismatched envelopes, rulesets, and history limits", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      ruleRollHistoryKey("player", "dnd-2014"),
      JSON.stringify(envelope("dnd-2024"))
    );
    expect(() => loadRuleRollHistory(storage, "player", "dnd-2014")).toThrow("invalid shape");

    const wrongRuleset = envelope("dnd-2014");
    wrongRuleset.entries[0] = { ...wrongRuleset.entries[0]!, ruleset: "srd-5.2.1-2024" };
    expect(() => saveRuleRollHistory(storage, wrongRuleset)).toThrow("invalid shape");

    const oversized = envelope("dnd-2024");
    oversized.entries = Array.from(
      { length: MAX_RULE_ROLL_HISTORY_PER_SYSTEM + 1 },
      (_, index) => entry("dnd-2024", `roll-${index}`, "2026-07-27T16:00:00.000Z")
    );
    expect(() => saveRuleRollHistory(storage, oversized)).toThrow("invalid shape");
  });

  it("merges editions chronologically without losing identity", () => {
    const older = {
      ...createEmptyRuleHistory("player", "dnd-2014"),
      entries: [entry("dnd-2014", "older", "2026-07-27T15:00:00.000Z")]
    };
    const newer = {
      ...createEmptyRuleHistory("player", "dnd-2024"),
      entries: [entry("dnd-2024", "newer", "2026-07-27T16:00:00.000Z")]
    };

    expect(mergeRuleRollHistory([older, newer]).map((item) => [item.id, item.gameSystemId]))
      .toEqual([["newer", "dnd-2024"], ["older", "dnd-2014"]]);
  });

  it("clears both editions for one role without touching the other role", () => {
    const storage = new MemoryStorage();
    saveRuleRollHistory(storage, envelope("dnd-2014"));
    saveRuleRollHistory(storage, envelope("dnd-2024"));
    saveRuleRollHistory(storage, envelope("dnd-2024", "dm"));

    clearRuleRollHistory(storage, "player");

    expect(loadRuleRollHistory(storage, "player", "dnd-2014").entries).toEqual([]);
    expect(loadRuleRollHistory(storage, "player", "dnd-2024").entries).toEqual([]);
    expect(loadRuleRollHistory(storage, "dm", "dnd-2024").entries).toHaveLength(1);
  });
});
