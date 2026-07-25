import type {
  SrdSpellScalingEffect,
  SrdSpellScalingResult
} from "../types/srdSpellScaling";

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
};

const numberValue = (value: string): number => (
  NUMBER_WORDS[value.toLowerCase()] ?? Number.parseInt(value, 10)
);

const cleanText = (value: string): string => value
  .replace(/^(?:At Higher Levels?|Using a Higher-Level Spell Slot)\.\s*/i, "")
  .replace(/\s+/g, " ")
  .trim();

const cleanLabel = (value: string): string => value
  .replace(/^(?:the|its|a target['’]s|the target['’]s)\s+/i, "")
  .replace(/[.:;,]+$/g, "")
  .trim();

const perSlotClause = /for each (?:spell )?slot level above/i;

const diceEffect = (clause: string, extraLevels: number): SrdSpellScalingEffect | undefined => {
  const match = clause.match(/(?:the|its|a target['’]s|the target['’]s)?\s*(.{1,70}?)\s+increases? by\s+(\d+)d(\d+)\b/i);
  if (!match) return undefined;
  const quantityPerSlot = Number.parseInt(match[2], 10);
  const dieSides = Number.parseInt(match[3], 10);
  const totalQuantity = quantityPerSlot * extraLevels;
  const label = cleanLabel(match[1]);
  return {
    kind: "dice",
    label,
    quantityPerSlot,
    totalQuantity,
    dieSides,
    summary: `+${totalQuantity}d${dieSides} to ${label}`
  };
};

const flatEffect = (clause: string, extraLevels: number): SrdSpellScalingEffect | undefined => {
  const withUnit = clause.match(/(?:the|its|a target['’]s|the target['’]s)?\s*(.{1,70}?)\s+increases? by\s+(?:an additional\s+)?(\d+)\s+(feet|foot|hours?|minutes?|rounds?|miles?|hit points?)\b/i);
  const hitPoints = clause.match(/(?:the|its|a target['’]s|the target['’]s)?\s*(.{1,70}?hit points?)\s+increases? by\s+(?:an additional\s+)?(\d+)\b/i);
  const match = withUnit ?? hitPoints;
  if (!match) return undefined;
  const quantityPerSlot = Number.parseInt(match[2], 10);
  const totalQuantity = quantityPerSlot * extraLevels;
  const label = cleanLabel(match[1]);
  const unit = withUnit ? match[3].replace(/^foot$/i, "feet") : "hit points";
  return {
    kind: "flat",
    label,
    quantityPerSlot,
    totalQuantity,
    unit,
    summary: `+${totalQuantity} ${unit} to ${label}`
  };
};

const countEffect = (clause: string, extraLevels: number): SrdSpellScalingEffect | undefined => {
  const additional = clause.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+) additional ([a-z][a-z -]*?)(?=\s+for each)/i);
  const more = clause.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+) more ([a-z][a-z -]*?)(?=\s+for each)/i);
  const increasedCount = clause.match(/(?:number of )?([a-z][a-z -]*?) increases? by (one|two|three|four|five|six|seven|eight|nine|ten|\d+)(?=\s+for each)/i);
  const match = additional ?? more;
  const quantityText = match?.[1] ?? increasedCount?.[2];
  const labelText = match?.[2] ?? increasedCount?.[1];
  if (!quantityText || !labelText) return undefined;
  const quantityPerSlot = numberValue(quantityText);
  if (!Number.isFinite(quantityPerSlot)) return undefined;
  const totalQuantity = quantityPerSlot * extraLevels;
  const label = cleanLabel(labelText);
  return {
    kind: "count",
    label,
    quantityPerSlot,
    totalQuantity,
    unit: label,
    summary: `+${totalQuantity} ${label}`
  };
};

export const calculateSrdSpellScaling = (
  higherLevels: string,
  extraSlotLevels: number
): SrdSpellScalingResult => {
  const text = cleanText(higherLevels);
  if (!text || extraSlotLevels <= 0) {
    return { status: "none", effects: [], summary: "No higher-slot calculation is active." };
  }

  const scalingSentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => perSlotClause.test(sentence));
  const effects = scalingSentences.flatMap((sentence) => {
    const clause = sentence.split(/,\s*/).at(-1) ?? sentence;
    return diceEffect(clause, extraSlotLevels)
      ?? flatEffect(clause, extraSlotLevels)
      ?? countEffect(clause, extraSlotLevels)
      ?? [];
  });

  if (scalingSentences.length === 0 || effects.length !== scalingSentences.length) {
    return {
      status: "manual-review",
      effects: [],
      summary: "This higher-slot rule is irregular or conditional. Use the exact source instruction below."
    };
  }

  return {
    status: "calculated",
    effects,
    summary: effects.map((effect) => effect.summary).join("; ")
  };
};
