import type { CocInvestigatorRecord } from "../types/cocInvestigatorCatalog";
import { calculateCocDerivedAttributes } from "./cocInvestigator";
import { calculateMaximumSanity } from "./cocSanityCampaign";

export const COC_INVESTIGATOR_STATE_PREFIX = "dungeon-cards-coc-investigator-state-v1:";

export type StorageAdapter = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

export type CocInvestigatorLiveState = {
  schemaVersion: 1;
  investigatorId: string;
  hitPoints: number;
  sanity: number;
  magicPoints: number;
  luck: number;
  cthulhuMythos: number;
  updatedAt: string;
};

const boundedInteger = (value: unknown, minimum: number, maximum: number): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Math.max(minimum, Math.min(maximum, Math.trunc(Number.isFinite(numeric) ? numeric : minimum)));
};

export const cocInvestigatorStateKey = (investigatorId: string): string => (
  `${COC_INVESTIGATOR_STATE_PREFIX}${investigatorId}`
);

export const createDefaultCocInvestigatorState = (
  investigator: CocInvestigatorRecord,
  updatedAt: string = new Date(0).toISOString()
): CocInvestigatorLiveState => {
  const derived = calculateCocDerivedAttributes(investigator.characteristics);
  const cthulhuMythos = boundedInteger(investigator.cthulhuMythos ?? 0, 0, 99);
  const maximumSanity = calculateMaximumSanity(cthulhuMythos);
  return {
    schemaVersion: 1,
    investigatorId: investigator.id,
    hitPoints: derived.hitPoints,
    sanity: Math.min(investigator.characteristics.POW, maximumSanity),
    magicPoints: derived.magicPoints,
    luck: boundedInteger(investigator.luck, 0, 99),
    cthulhuMythos,
    updatedAt
  };
};

export const normalizeCocInvestigatorState = (
  investigator: CocInvestigatorRecord,
  value: Partial<CocInvestigatorLiveState>,
  updatedAt: string = new Date().toISOString()
): CocInvestigatorLiveState => {
  const defaults = createDefaultCocInvestigatorState(investigator, updatedAt);
  const derived = calculateCocDerivedAttributes(investigator.characteristics);
  const cthulhuMythos = boundedInteger(value.cthulhuMythos ?? defaults.cthulhuMythos, 0, 99);
  const maximumSanity = calculateMaximumSanity(cthulhuMythos);
  return {
    schemaVersion: 1,
    investigatorId: investigator.id,
    hitPoints: boundedInteger(value.hitPoints ?? defaults.hitPoints, 0, derived.hitPoints),
    sanity: boundedInteger(value.sanity ?? defaults.sanity, 0, maximumSanity),
    magicPoints: boundedInteger(value.magicPoints ?? defaults.magicPoints, 0, derived.magicPoints),
    luck: boundedInteger(value.luck ?? defaults.luck, 0, 99),
    cthulhuMythos,
    updatedAt
  };
};

export const loadCocInvestigatorState = (
  storage: StorageAdapter,
  investigator: CocInvestigatorRecord
): { state: CocInvestigatorLiveState; error?: string } => {
  const fallback = createDefaultCocInvestigatorState(investigator);
  const raw = storage.getItem(cocInvestigatorStateKey(investigator.id));
  if (!raw) return { state: fallback };
  try {
    const parsed = JSON.parse(raw) as Partial<CocInvestigatorLiveState>;
    if (parsed.schemaVersion !== 1 || parsed.investigatorId !== investigator.id) {
      return { state: fallback, error: "Saved Investigator state used an unsupported format and was reset safely." };
    }
    return {
      state: normalizeCocInvestigatorState(
        investigator,
        parsed,
        parsed.updatedAt ?? new Date().toISOString()
      )
    };
  } catch {
    return { state: fallback, error: "Saved Investigator state could not be read and was reset safely." };
  }
};

export const saveCocInvestigatorState = (
  storage: StorageAdapter,
  investigator: CocInvestigatorRecord,
  state: Partial<CocInvestigatorLiveState>,
  updatedAt: string = new Date().toISOString()
): CocInvestigatorLiveState => {
  const normalized = normalizeCocInvestigatorState(investigator, state, updatedAt);
  storage.setItem(cocInvestigatorStateKey(investigator.id), JSON.stringify(normalized));
  return normalized;
};

export const clearCocInvestigatorState = (
  storage: StorageAdapter,
  investigator: CocInvestigatorRecord
): CocInvestigatorLiveState => {
  storage.removeItem?.(cocInvestigatorStateKey(investigator.id));
  return createDefaultCocInvestigatorState(investigator);
};