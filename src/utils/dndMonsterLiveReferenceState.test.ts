import { describe, expect, it } from "vitest";
import type { DndMonsterLiveReference } from "./dndMonsterLiveReference";
import { resolveDndMonsterRechargeInReferences } from "./dndMonsterLiveReferenceState";

const reference = (): DndMonsterLiveReference => ({
  monsterId: "two-breath-dragon",
  sourceReference: "Test source",
  size: "Huge",
  armorClass: "20",
  savingThrows: "Dex +7, Con +12",
  senses: "blindsight 60 ft.",
  actions: [
    {
      id: "action-fire-breath",
      kind: "action",
      name: "Fire Breath (Recharge 5–6)",
      summary: "Fire damage in a cone.",
      rechargeLabel: "Recharge 5–6",
      rechargeMinimum: 5,
      rechargeReady: false
    },
    {
      id: "action-sleep-breath",
      kind: "action",
      name: "Sleep Breath (Recharge 6)",
      summary: "Creatures may fall unconscious.",
      rechargeLabel: "Recharge 6",
      rechargeMinimum: 6,
      rechargeReady: true
    }
  ]
});

describe("latest-state monster recharge updates", () => {
  it("preserves a newer sibling recharge state while resolving another action", () => {
    const latest = reference();
    latest.actions[1] = { ...latest.actions[1]!, rechargeReady: false };

    const updated = resolveDndMonsterRechargeInReferences(
      { "dragon-1": latest },
      "dragon-1",
      "action-fire-breath",
      5
    );

    expect(updated["dragon-1"]?.actions).toEqual([
      expect.objectContaining({ id: "action-fire-breath", rechargeReady: true }),
      expect.objectContaining({ id: "action-sleep-breath", rechargeReady: false })
    ]);
  });

  it("returns the original map when the combatant no longer exists", () => {
    const references = { "dragon-1": reference() };
    expect(resolveDndMonsterRechargeInReferences(
      references,
      "removed-dragon",
      "action-fire-breath",
      6
    )).toBe(references);
  });
});