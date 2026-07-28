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

const normalizeVisibleText = (value: string | undefined): string => (value ?? "")
  .normalize("NFKC")
  .toLocaleLowerCase("en-US")
  .replace(/[‘’]/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const normalizedVisibleKey = (definition: CardDefinition): string => [
  definition.family,
  normalizeVisibleText(definition.content.title),
  normalizeVisibleText(definition.content.subtitle)
].join(":");

export const buildCardCatalog = (
  gameSystemId: GameSystemId,
  sources: CardCatalogSource[]
): CardCatalog => {
  const entries = new Map<string, CardCatalogEntry>();
  const visibleEntries = new Map<string, CardCatalogEntry>();
  const issues: CardCatalogIssue[] = [];

  const removeEntry = (entry: CardCatalogEntry) => {
    entries.delete(entry.definition.id);
    const visibleKey = normalizedVisibleKey(entry.definition);
    if (visibleEntries.get(visibleKey)?.definition.id === entry.definition.id) visibleEntries.delete(visibleKey);
  };

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

      const existingById = entries.get(definition.id);
      if (existingById) {
        if (existingById.privateImported && incoming.privateImported) {
          removeEntry(existingById);
        } else {
          issues.push({
            sourceId: source.id,
            message: `${definition.id} conflicts with immutable ${existingById.sourceLabel} content and was excluded.`
          });
          continue;
        }
      }

      const visibleKey = normalizedVisibleKey(definition);
      const existingByVisibleIdentity = visibleEntries.get(visibleKey);
      if (existingByVisibleIdentity) {
        if (existingByVisibleIdentity.privateImported && incoming.privateImported) {
          removeEntry(existingByVisibleIdentity);
        } else {
          issues.push({
            sourceId: source.id,
            message: `${definition.content.title} duplicates an existing visible ${definition.family} card from ${existingByVisibleIdentity.sourceLabel} and was excluded.`
          });
          continue;
        }
      }

      entries.set(definition.id, incoming);
      visibleEntries.set(visibleKey, incoming);
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
