import type { EncounterMonsterEntry } from "../types/encounterMonsters";

export const DM_FORGE_ENCOUNTER_URL = "https://cbw29512.github.io/monstercardforge/encounter-forge.html";
export const DM_FORGE_ENCOUNTER_HANDOFF_KEY = "dmforge-dungeoncards-encounter-handoff-v1";
export const DM_FORGE_ENCOUNTER_HANDOFF_VERSION = 1;

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
  monsters: DmForgeEncounterHandoffMonster[];
};

const publicRuleset = (value: EncounterMonsterEntry["ruleset"]): DmForgeEncounterHandoffMonster["ruleset"] => {
  if (value === "srd-5.1-2014") return "2014";
  if (value === "srd-5.2.1-2024") return "2024";
  throw new Error("Homebrew monsters stay in DungeonCards until the versioned homebrew transfer format is complete.");
};

const activeCampaignName = (): string => {
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

export const buildDmForgeEncounterHandoff = (
  entries: EncounterMonsterEntry[]
): DmForgeEncounterHandoff => {
  if (entries.some((entry) => entry.ruleset === "homebrew")) {
    throw new Error("Remove homebrew monsters before sending. Verified SRD monsters can transfer now; homebrew transfer is still being specified.");
  }

  return {
    version: DM_FORGE_ENCOUNTER_HANDOFF_VERSION,
    createdAt: new Date().toISOString(),
    campaign: activeCampaignName().slice(0, 100),
    monsters: entries.slice(0, 100).map((entry) => ({
      sourceRecordId: String(entry.id).slice(0, 180),
      name: String(entry.name).trim().slice(0, 160),
      ruleset: publicRuleset(entry.ruleset),
      quantity: 1
    }))
  };
};

export const sendEncounterToDmForge = (entries: EncounterMonsterEntry[]): void => {
  if (!entries.length) throw new Error("Add at least one monster to My Encounter first.");
  const payload = buildDmForgeEncounterHandoff(entries);
  window.localStorage.setItem(DM_FORGE_ENCOUNTER_HANDOFF_KEY, JSON.stringify(payload));
  const destination = new URL(DM_FORGE_ENCOUNTER_URL);
  destination.searchParams.set("importDungeonCards", "1");
  destination.searchParams.set("campaign", payload.campaign);
  window.location.assign(destination.toString());
};
