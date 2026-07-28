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

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)])
    );
  }
  return value;
};

const equivalentDefinitionKey = (definition: CardDefinition): string => JSON.stringify(canonicalize({
  schemaVersion: definition.schemaVersion,
  gameSystemId: definition.gameSystemId,
  family: definition.family,
  visibility: definition.visibility,
  content: {
    ...definition.content,
    title: normalizeVisibleText(definition.content.title),
    subtitle: normalizeVisibleText(definition.content.subtitle)
  },
  source: definition.source,
  review: definition.review,
  actions: definition.actions,
  resources: definition.resources,
  linkedCardIds: definition.linkedCardIds,
  print: definition.print
}));

export const buildCardCatalog = (
  gameSystemId: GameSystemId,
  sources: CardCatalogSource[]
): CardCatalog => {
  const entries = new Map<string, CardCatalogEntry>();
  const equivalentEntries = new Map<string, CardCatalogEntry>();
  const issues: CardCatalogIssue[] = [];

  const removeEntry = (entry: CardCatalogEntry) => {
    entries.delete(entry.definition.id);
    const equivalentKey = equivalentDefinitionKey(entry.definition);
    if (equivalentEntries.get(equivalentKey)?.definition.id === entry.definition.id) {
      equivalentEntries.delete(equivalentKey);
    }
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

      const equivalentKey = equivalentDefinitionKey(definition);
      const existingEquivalent = equivalentEntries.get(equivalentKey);
      if (existingEquivalent) {
        if (existingEquivalent.privateImported && incoming.privateImported) {
          removeEntry(existingEquivalent);
        } else {
          issues.push({
            sourceId: source.id,
            message: `${definition.content.title} exactly duplicates ${existingEquivalent.sourceLabel} content and was excluded.`
          });
          continue;
        }
      }

      entries.set(definition.id, incoming);
      equivalentEntries.set(equivalentKey, incoming);
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