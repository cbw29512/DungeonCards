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

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, stableValue(entry)])
  );
};

const semanticTags = (definition: CardDefinition): string[] => definition.content.tags
  .filter((tag) => tag !== "character-vault" && !tag.startsWith("vault-"))
  .map(normalizeVisibleText)
  .sort();

const semanticDefinitionKey = (definition: CardDefinition): string => JSON.stringify(stableValue({
  gameSystemId: definition.gameSystemId,
  family: definition.family,
  visibility: definition.visibility,
  content: {
    title: normalizeVisibleText(definition.content.title),
    subtitle: normalizeVisibleText(definition.content.subtitle),
    summary: normalizeVisibleText(definition.content.summary),
    detail: normalizeVisibleText(definition.content.detail),
    tags: semanticTags(definition)
  },
  source: definition.source,
  actions: definition.actions,
  resources: definition.resources,
  linkedCardIds: [...definition.linkedCardIds].sort(),
  print: definition.print
}));

const tagValue = (definition: CardDefinition, prefix: string): string | undefined => (
  definition.content.tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length).trim() || undefined
);

const titleCaseSlug = (value: string): string => value
  .replace(/[-_]+/g, " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const visibleContext = (entry: CardCatalogEntry): string => {
  const character = tagValue(entry.definition, "vault-character-label:");
  const classLabel = tagValue(entry.definition, "vault-class-label:");
  const subclassLabel = tagValue(entry.definition, "vault-subclass-label:");
  const level = tagValue(entry.definition, "vault-level:");
  if (character && level) return `${character} · Level ${level}`;
  if (classLabel && subclassLabel && level) return `${classLabel} / ${subclassLabel} · Level ${level}`;
  if (classLabel && level) return `${classLabel} · Level ${level}`;
  if (level) return `Level ${level}`;
  return entry.privateImported ? "Private Library" : titleCaseSlug(entry.sourceLabel);
};

const disambiguateVisibleCollisions = (catalogEntries: CardCatalogEntry[]): CardCatalogEntry[] => {
  const groups = new Map<string, CardCatalogEntry[]>();
  for (const entry of catalogEntries) {
    const key = normalizedVisibleKey(entry.definition);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }

  return catalogEntries.map((entry) => {
    const group = groups.get(normalizedVisibleKey(entry.definition)) ?? [];
    if (group.length <= 1) return entry;

    const context = visibleContext(entry);
    const sameContextEntries = group.filter((candidate) => visibleContext(candidate) === context);
    const variantIndex = sameContextEntries.findIndex((candidate) => candidate.definition.id === entry.definition.id);
    const resolvedContext = sameContextEntries.length > 1
      ? `${context} · Variant ${variantIndex + 1}`
      : context;
    const baseSubtitle = entry.definition.content.subtitle?.trim();
    return {
      ...entry,
      definition: {
        ...entry.definition,
        content: {
          ...entry.definition.content,
          subtitle: baseSubtitle ? `${baseSubtitle} · ${resolvedContext}` : resolvedContext
        }
      }
    };
  });
};

export const buildCardCatalog = (
  gameSystemId: GameSystemId,
  sources: CardCatalogSource[]
): CardCatalog => {
  const entries = new Map<string, CardCatalogEntry>();
  const semanticEntries = new Map<string, CardCatalogEntry>();
  const issues: CardCatalogIssue[] = [];

  const removeEntry = (entry: CardCatalogEntry) => {
    entries.delete(entry.definition.id);
    const semanticKey = semanticDefinitionKey(entry.definition);
    if (semanticEntries.get(semanticKey)?.definition.id === entry.definition.id) semanticEntries.delete(semanticKey);
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

      const semanticKey = semanticDefinitionKey(definition);
      const existingEquivalent = semanticEntries.get(semanticKey);
      if (existingEquivalent) {
        if (existingEquivalent.privateImported && incoming.privateImported) {
          removeEntry(existingEquivalent);
        } else if (existingEquivalent.privateImported && !incoming.privateImported) {
          removeEntry(existingEquivalent);
        } else if (!existingEquivalent.privateImported && incoming.privateImported) {
          issues.push({
            sourceId: source.id,
            message: `${definition.content.title} exactly duplicates immutable ${existingEquivalent.sourceLabel} content and was excluded.`
          });
          continue;
        } else {
          // Equivalent immutable definitions are one reusable card, not a source-health error.
          continue;
        }
      }

      entries.set(definition.id, incoming);
      semanticEntries.set(semanticKey, incoming);
    }
  }

  const catalogEntries = disambiguateVisibleCollisions([...entries.values()]);
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