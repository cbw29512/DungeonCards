import type { EncounterMonsterEntry } from "../types/encounterMonsters";

export const DM_FORGE_ENCOUNTER_URL = "https://cbw29512.github.io/monstercardforge/encounter-forge.html";
export const DM_FORGE_ENCOUNTER_HANDOFF_KEY = "dmforge-dungeoncards-encounter-handoff-v1";
export const DM_FORGE_ENCOUNTER_HANDOFF_VERSION = 1;
export const DM_FORGE_ENCOUNTER_HANDOFF_MAX_COMBATANTS = 100;

export type DmForgeEncounterHandoffMonster = {
  sourceRecordId: string;
  name: string;
  ruleset: "2014" | "2024";
  quantity: number;
};

export type DmForgeEncounterHandoff = {
  version: 1;
  createdAt: string;
  campaign: string;
  ruleset: "2014" | "2024";
  monsters: DmForgeEncounterHandoffMonster[];
};

const publicRuleset = (value: EncounterMonsterEntry["ruleset"]): DmForgeEncounterHandoffMonster["ruleset"] => {
  if (value === "srd-5.1-2014") return "2014";
  if (value === "srd-5.2.1-2024") return "2024";
  throw new Error("Homebrew monsters stay in DungeonCards until the versioned homebrew transfer format is complete.");
};

const activeCampaignName = (): string => {
  if (typeof window === "undefined") return "My Campaign";
  try {
    const store = JSON.parse(window.localStorage.getItem("dmforge-shared-v1") || "null") as {
      activeCampaignId?: string;
      campaigns?: Array<{ id?: string; name?: string }>;
    } | null;
    const campaigns = Array.isArray(store?.campaigns) ? store.campaigns : [];
    return campaigns.find((campaign) => campaign.id === store?.activeCampaignId)?.name?.trim()
      || campaigns[0]?.name?.trim()
      || "My Campaign";
  } catch {
    return "My Campaign";
  }
};

const aggregateEncounterEntries = (
  entries: EncounterMonsterEntry[]
): DmForgeEncounterHandoffMonster[] => {
  const grouped = new Map<string, DmForgeEncounterHandoffMonster>();
  for (const entry of entries) {
    const ruleset = publicRuleset(entry.ruleset);
    const sourceRecordId = String(entry.id).trim().slice(0, 180);
    const name = String(entry.name).trim().slice(0, 160);
    if (!sourceRecordId || !name) {
      throw new Error("Every transferred monster must have a stable source ID and display name.");
    }
    const key = `${ruleset}:${sourceRecordId}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.quantity += 1;
      continue;
    }
    grouped.set(key, {
      sourceRecordId,
      name,
      ruleset,
      quantity: 1
    });
  }
  return [...grouped.values()];
};

export const buildDmForgeEncounterHandoff = (
  entries: EncounterMonsterEntry[]
): DmForgeEncounterHandoff => {
  if (entries.length === 0) {
    throw new Error("Add at least one monster to My Encounter first.");
  }
  if (entries.length > DM_FORGE_ENCOUNTER_HANDOFF_MAX_COMBATANTS) {
    throw new Error(`Encounter Forge transfers support up to ${DM_FORGE_ENCOUNTER_HANDOFF_MAX_COMBATANTS} combatants. Remove extras before sending so none are silently omitted.`);
  }
  if (entries.some((entry) => entry.ruleset === "homebrew")) {
    throw new Error("Remove homebrew monsters before sending. Verified SRD monsters can transfer now; homebrew transfer is still being specified.");
  }

  const rulesets = new Set(entries.map((entry) => publicRuleset(entry.ruleset)));
  if (rulesets.size !== 1) {
    throw new Error("Use one ruleset per encounter before sending: either 5e (2014) or 5.5e (2024).");
  }
  const ruleset = [...rulesets][0]!;

  return {
    version: DM_FORGE_ENCOUNTER_HANDOFF_VERSION,
    createdAt: new Date().toISOString(),
    campaign: activeCampaignName().slice(0, 100),
    ruleset,
    monsters: aggregateEncounterEntries(entries)
  };
};

export const sendEncounterToDmForge = (entries: EncounterMonsterEntry[]): void => {
  const payload = buildDmForgeEncounterHandoff(entries);
  window.localStorage.setItem(DM_FORGE_ENCOUNTER_HANDOFF_KEY, JSON.stringify(payload));
  const destination = new URL(DM_FORGE_ENCOUNTER_URL);
  destination.searchParams.set("importDungeonCards", "1");
  destination.searchParams.set("campaign", payload.campaign);
  window.location.assign(destination.toString());
};