import { afterEach, describe, expect, it } from "vitest";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import {
  DM_FORGE_ENCOUNTER_HANDOFF_KEY,
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
