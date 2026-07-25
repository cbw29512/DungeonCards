import { describe, expect, it } from "vitest";
import type { SrdSpellRecord } from "../types/srdCompendium";
import { describeSrdSpellCasting, getSpellSlotOptions } from "./srdSpellCasting";

const spell = (overrides: Partial<SrdSpellRecord> = {}): SrdSpellRecord => ({
  id: "srd-5.2.1-2024-spell-fireball",
  edition: "srd-5.2.1-2024",
  sourceVersion: "5.2.1",
  name: "Fireball",
  level: 3,
  school: "Evocation",
  classes: ["Sorcerer", "Wizard"],
  castingTime: "Action",
  range: "150 feet",
  components: "V, S, M",
  duration: "Instantaneous",
  description: "A bright streak flashes from you.",
  higherLevels: "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3.",
  sourcePage: 0,
  sourceReference: "SRD 5.2.1",
  ...overrides
});

describe("universal SRD spell casting levels", () => {
  it("offers every legal slot from the spell's base level through 9", () => {
    expect(getSpellSlotOptions(3)).toEqual([3, 4, 5, 6, 7, 8, 9]);
    expect(getSpellSlotOptions(9)).toEqual([9]);
    expect(getSpellSlotOptions(0)).toEqual([]);
  });

  it("describes an enhanced higher-level casting without inventing the result", () => {
    const state = describeSrdSpellCasting(spell(), 5);
    expect(state.castingLevel).toBe(5);
    expect(state.extraSlotLevels).toBe(2);
    expect(state.hasEnhancedEffect).toBe(true);
    expect(state.status).toContain("Apply the exact higher-slot rule");
  });

  it("explains that a non-scaling spell still takes on the selected level", () => {
    const state = describeSrdSpellCasting(spell({ name: "Alarm", level: 1, higherLevels: "" }), 4);
    expect(state.castingLevel).toBe(4);
    expect(state.extraSlotLevels).toBe(3);
    expect(state.hasEnhancedEffect).toBe(false);
    expect(state.status).toContain("still has that level for this casting");
  });

  it("keeps cantrips out of the slot selector", () => {
    const state = describeSrdSpellCasting(spell({ name: "Fire Bolt", level: 0, higherLevels: "" }), 9);
    expect(state.isCantrip).toBe(true);
    expect(state.castingLevel).toBe(0);
    expect(state.status).toContain("do not use spell slots");
  });

  it("clamps invalid requested levels to the legal spell range", () => {
    expect(describeSrdSpellCasting(spell(), 1).castingLevel).toBe(3);
    expect(describeSrdSpellCasting(spell(), 99).castingLevel).toBe(9);
  });
});
