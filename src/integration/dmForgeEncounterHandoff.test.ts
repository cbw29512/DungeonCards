import { afterEach, describe, expect, it } from "vitest";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import {
  DM_FORGE_ENCOUNTER_HANDOFF_KEY,
  DM_FORGE_ENCOUNTER_HANDOFF_MAX_COMBATANTS,
  DM_FORGE_ENCOUNTER_HANDOFF_VERSION,
  buildDmForgeEncounterHandoff
} from "./dmForgeEncounterHandoff";

const originalWindow = globalThis.window;

function installWindow(campaign = "Test Campaign") {
  const values = new Map<string, string>();
  values.set("dmforge-shared-v1", JSON.stringify({
    activeCampaignId: "campaign-1",
    campaigns: [{ id: "campaign-1", name: campaign }]
  }));
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value)
      }
    }
  });
}

function entry(overrides: Partial<EncounterMonsterEntry> = {}): EncounterMonsterEntry {
  return {
    id: "srd51-goblin",
    kind: "reference",
    name: "Goblin",
    ruleset: "srd-5.1-2014",
    cr: "1/4",
    type: "Humanoid",
    size: "Small",
    source: "SRD 5.1 p. 375",
    monster: {} as never,
    ...overrides
  } as EncounterMonsterEntry;
}

afterEach(() => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
});

describe("DM Forge encounter handoff", () => {
  it("preserves the stable key, schema, campaign, source ID, and one ruleset", () => {
    installWindow("Crooked Moon");
    const payload = buildDmForgeEncounterHandoff([entry()]);
    expect(DM_FORGE_ENCOUNTER_HANDOFF_KEY).toBe("dmforge-dungeoncards-encounter-handoff-v1");
    expect(payload.version).toBe(DM_FORGE_ENCOUNTER_HANDOFF_VERSION);
    expect(payload.campaign).toBe("Crooked Moon");
    expect(payload.ruleset).toBe("2014");
    expect(payload.monsters).toEqual([{ sourceRecordId: "srd51-goblin", name: "Goblin", ruleset: "2014", quantity: 1 }]);
  });

  it("aggregates independent repeated instances into an accurate transfer quantity", () => {
    installWindow();
    const payload = buildDmForgeEncounterHandoff([
      entry(),
      entry(),
      entry(),
      entry({ id: "srd51-ogre", name: "Ogre", cr: "2", size: "Large" })
    ]);
    expect(payload.monsters).toEqual([
      { sourceRecordId: "srd51-goblin", name: "Goblin", ruleset: "2014", quantity: 3 },
      { sourceRecordId: "srd51-ogre", name: "Ogre", ruleset: "2014", quantity: 1 }
    ]);
  });

  it("rejects empty encounters instead of producing an undefined ruleset payload", () => {
    installWindow();
    expect(() => buildDmForgeEncounterHandoff([])).toThrow(/at least one monster/i);
  });

  it("rejects encounters above the transfer limit instead of silently truncating combatants", () => {
    installWindow();
    const entries = Array.from({ length: DM_FORGE_ENCOUNTER_HANDOFF_MAX_COMBATANTS + 1 }, (_, index) => (
      entry({ id: `srd51-goblin-${index}`, name: `Goblin ${index + 1}` })
    ));
    expect(() => buildDmForgeEncounterHandoff(entries)).toThrow(/up to 100 combatants/i);
  });

  it("rejects records without stable source identity", () => {
    installWindow();
    expect(() => buildDmForgeEncounterHandoff([entry({ id: "", name: "" })])).toThrow(/stable source id and display name/i);
  });

  it("rejects mixed-edition encounters before encounter math is selected", () => {
    installWindow();
    expect(() => buildDmForgeEncounterHandoff([
      entry(),
      entry({ id: "srd521-ogre", name: "Ogre", ruleset: "srd-5.2.1-2024" })
    ])).toThrow(/one ruleset/i);
  });

  it("rejects homebrew until the full versioned homebrew schema exists", () => {
    installWindow();
    expect(() => buildDmForgeEncounterHandoff([
      entry({ id: "homebrew-bog-warden", name: "Bog Warden", ruleset: "homebrew" })
    ])).toThrow(/homebrew/i);
  });
});