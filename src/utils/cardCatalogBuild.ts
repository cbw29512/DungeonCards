import type { GameSystemId } from "../types/cardPlatform";
import type {
  CardCatalog,
  CardCatalogEntry,
  CardCatalogIssue,
  CardCatalogSourceId
} from "../types/cardCatalog";
import type { CardDefinition } from "../types/cardPlatform";
import { validateCardDefinition } from "./cardPlatformValidation";

export type CardCatalogSource = {
  id: CardCatalogSourceId;
  label: string;
  definitions: CardDefinition[];
  privateImported?: boolean;
  issues?: string[];
};

export const collectCatalogDefinitions = <T>(
  sourceId: CardCatalogSourceId,
  values: T[],
  adapt: (value: T) => CardDefinition | null
): { definitions: CardDefinition[]; issues: string[] } => {
  const definitions: CardDefinition[] = [];
  const issues: string[] = [];
  values.forEach((value, index) => {
    try {
      const definition = adapt(value);
      if (definition) definitions.push(definition);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown adapter error";
      issues.push(`${sourceId} item ${index + 1}: ${message}`);
    }
  });
  return { definitions, issues };
};

export const buildCardCatalog = (
  gameSystemId: GameSystemId,
  sources: CardCatalogSource[]
): CardCatalog => {
  const entries = new Map<string, CardCatalogEntry>();
  const issues: CardCatalogIssue[] = [];
  for (const source of sources) {
    source.issues?.forEach((message) => issues.push({ sourceId: source.id, message }));
    for (const definition of source.definitions) {
      const validation = definition.gameSystemId === gameSystemId
        ? validateCardDefinition(definition)
        : [`belongs to ${definition.gameSystemId} instead of ${gameSystemId}`];
      if (validation.length > 0) {
        issues.push({ sourceId: source.id, message: `${definition.id}: ${validation.join(" ")}` });
        continue;
      }
      const incoming: CardCatalogEntry = {
        definition,
        sourceId: source.id,
        sourceLabel: source.label,
        privateImported: Boolean(source.privateImported)
      };
      const existing = entries.get(definition.id);
      if (!existing) {
        entries.set(definition.id, incoming);
        continue;
      }
      if (existing.privateImported && incoming.privateImported) {
        entries.set(definition.id, incoming);
        continue;
      }
      issues.push({
        sourceId: source.id,
        message: `${definition.id} conflicts with immutable ${existing.sourceLabel} content and was excluded.`
      });
    }
  }
  const catalogEntries = [...entries.values()];
  const sourceCounts: CardCatalog["sourceCounts"] = {};
  const familyCounts: CardCatalog["familyCounts"] = {};
  catalogEntries.forEach((entry) => {
    sourceCounts[entry.sourceId] = (sourceCounts[entry.sourceId] ?? 0) + 1;
    familyCounts[entry.definition.family] = (familyCounts[entry.definition.family] ?? 0) + 1;
  });
  return {
    gameSystemId,
    entries: catalogEntries,
    issues,
    sourceCounts,
    familyCounts
  };
};
