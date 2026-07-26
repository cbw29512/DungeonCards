import { dndPregenClassDefinitions, type DndPregenClassDefinition } from "../data/dndPregenCatalog";
import type { RulesetId } from "../types/ruleCards";

export type DndPregenDeliveryStatus = "blueprint" | "ready-to-play";

export type DndPregenBuildSlot = DndPregenClassDefinition & {
  id: string;
  level: number;
  subclassActive: boolean;
  deliveryStatus: DndPregenDeliveryStatus;
};

export type DndPregenBuildFilters = {
  ruleset: RulesetId;
  classId: string | "all";
  subclassId: string | "all";
  level: number | "all";
};

const levelRange = Array.from({ length: 20 }, (_, index) => index + 1);

export const dndPregenBuildSlots: DndPregenBuildSlot[] = dndPregenClassDefinitions.flatMap((definition) =>
  levelRange.map((level) => ({
    ...definition,
    id: `${definition.ruleset}-${definition.classId}-${definition.subclassId}-${level}`,
    level,
    subclassActive: level >= definition.subclassUnlockLevel,
    deliveryStatus: "blueprint" as const
  }))
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
