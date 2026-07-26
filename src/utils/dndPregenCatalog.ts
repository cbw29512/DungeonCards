import { dndPregenClassDefinitions, type DndPregenClassDefinition } from "../data/dndPregenCatalog";
import { dndPregenCharacters } from "../data/dndPregenCharacters";
import type { DndPregenCharacterRecord } from "../types/dndPregenCharacter";
import type { RulesetId } from "../types/ruleCards";
import {
  isDndPregenReadyToPlay,
  validateDndPregenCharacter
} from "./dndPregenCharacter";

export type DndPregenDeliveryStatus = "blueprint" | "ready-to-play";

export type DndPregenBuildSlot = DndPregenClassDefinition & {
  id: string;
  level: number;
  subclassActive: boolean;
  deliveryStatus: DndPregenDeliveryStatus;
  characterId?: string;
};

export type DndPregenBuildFilters = {
  ruleset: RulesetId;
  classId: string | "all";
  subclassId: string | "all";
  level: number | "all";
};

const levelRange = Array.from({ length: 20 }, (_, index) => index + 1);

const groupCharactersBySlot = (
  records: DndPregenCharacterRecord[]
): Map<string, DndPregenCharacterRecord[]> => {
  const grouped = new Map<string, DndPregenCharacterRecord[]>();
  for (const record of records) {
    const existing = grouped.get(record.slotId) ?? [];
    grouped.set(record.slotId, [...existing, record]);
  }
  return grouped;
};

const readyCharactersBySlot = groupCharactersBySlot(
  dndPregenCharacters.filter(isDndPregenReadyToPlay)
);

export const dndPregenBuildSlots: DndPregenBuildSlot[] = dndPregenClassDefinitions.flatMap((definition) =>
  levelRange.map((level) => {
    const id = `${definition.ruleset}-${definition.classId}-${definition.subclassId}-${level}`;
    const matches = readyCharactersBySlot.get(id) ?? [];
    const character = matches.length === 1 ? matches[0] : undefined;
    return {
      ...definition,
      id,
      level,
      subclassActive: level >= definition.subclassUnlockLevel,
      deliveryStatus: character ? "ready-to-play" as const : "blueprint" as const,
      characterId: character?.id
    };
  })
);

export const filterDndPregenBuildSlots = (
  filters: DndPregenBuildFilters
): DndPregenBuildSlot[] => dndPregenBuildSlots.filter((slot) => (
  slot.ruleset === filters.ruleset
  && (filters.classId === "all" || slot.classId === filters.classId)
  && (filters.subclassId === "all" || slot.subclassId === filters.subclassId)
  && (filters.level === "all" || slot.level === filters.level)
));

export const getDndPregenBuildSlot = (
  ruleset: RulesetId,
  classId: string,
  subclassId: string,
  level: number
): DndPregenBuildSlot | undefined => dndPregenBuildSlots.find((slot) => (
  slot.ruleset === ruleset
  && slot.classId === classId
  && slot.subclassId === subclassId
  && slot.level === level
));

export const auditDndPregenCharacterCatalog = (
  records: DndPregenCharacterRecord[] = dndPregenCharacters
): string[] => {
  const issues = records.flatMap((record) => (
    validateDndPregenCharacter(record).map((issue) => `${record.id || "missing-id"}: ${issue}`)
  ));
  const ids = new Set<string>();
  const slots = new Set<string>();

  for (const record of records) {
    if (ids.has(record.id)) issues.push(`Duplicate character id: ${record.id}`);
    if (slots.has(record.slotId)) issues.push(`Duplicate character slot: ${record.slotId}`);
    ids.add(record.id);
    slots.add(record.slotId);
    if (!dndPregenBuildSlots.some((slot) => slot.id === record.slotId)) {
      issues.push(`${record.id}: Character references an unknown build slot.`);
    }
  }
  return issues;
};

export const summarizeDndPregenBuilds = (ruleset: RulesetId) => {
  const slots = dndPregenBuildSlots.filter((slot) => slot.ruleset === ruleset);
  return {
    classes: new Set(slots.map((slot) => slot.classId)).size,
    subclasses: new Set(slots.map((slot) => slot.subclassId)).size,
    levels: new Set(slots.map((slot) => slot.level)).size,
    total: slots.length,
    readyToPlay: slots.filter((slot) => slot.deliveryStatus === "ready-to-play").length,
    blueprints: slots.filter((slot) => slot.deliveryStatus === "blueprint").length
  };
};
