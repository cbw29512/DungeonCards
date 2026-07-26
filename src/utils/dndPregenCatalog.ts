import { dndPregenClassDefinitions, type DndPregenClassDefinition } from "../data/dndPregenCatalog";
import type { RulesetId } from "../types/ruleCards";

export type DndPregenDeliveryStatus = "blueprint" | "ready-to-play";

export type DndPregenBuildSlot = DndPregenClassDefinition & {
  id: string;
  level: number;
  subclassActive: boolean;
  deliveryStatus: DndPregenDeliveryStatus;
};

const levelRange = Array.from({ length: 20 }, (_, index) => index + 1);

export const dndPregenBuildSlots: DndPregenBuildSlot[] = dndPregenClassDefinitions.flatMap((definition) =>
  levelRange.map((level) => ({
    ...definition,
    id: `${definition.ruleset}-${definition.classId}-${level}`,
    level,
    subclassActive: level >= definition.subclassUnlockLevel,
    deliveryStatus: "blueprint" as const
  }))
);

export const filterDndPregenBuildSlots = (
  ruleset: RulesetId,
  classId: string | "all",
  level: number | "all"
): DndPregenBuildSlot[] => dndPregenBuildSlots.filter((slot) => (
  slot.ruleset === ruleset
  && (classId === "all" || slot.classId === classId)
  && (level === "all" || slot.level === level)
));

export const getDndPregenBuildSlot = (
  ruleset: RulesetId,
  classId: string,
  level: number
): DndPregenBuildSlot | undefined => dndPregenBuildSlots.find((slot) => (
  slot.ruleset === ruleset && slot.classId === classId && slot.level === level
));

export const summarizeDndPregenBuilds = (ruleset: RulesetId) => {
  const slots = dndPregenBuildSlots.filter((slot) => slot.ruleset === ruleset);
  return {
    classes: new Set(slots.map((slot) => slot.classId)).size,
    levels: new Set(slots.map((slot) => slot.level)).size,
    total: slots.length,
    readyToPlay: slots.filter((slot) => slot.deliveryStatus === "ready-to-play").length,
    blueprints: slots.filter((slot) => slot.deliveryStatus === "blueprint").length
  };
};
