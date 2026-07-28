import type { DndCharacterSpellcasting } from "../types/dndCharacter";

type SpellSlots = Exclude<DndCharacterSpellcasting, { kind: "none" }>["slotsByLevel"];

const fullCasterSlots: SpellSlots[] = [
  { 1: 2 },
  { 1: 3 },
  { 1: 4, 2: 2 },
  { 1: 4, 2: 3 },
  { 1: 4, 2: 3, 3: 2 },
  { 1: 4, 2: 3, 3: 3 },
  { 1: 4, 2: 3, 3: 3, 4: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 2 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 }
];

const halfCasterSlots2014: SpellSlots[] = [
  {}, { 1: 2 }, { 1: 3 }, { 1: 3 },
  { 1: 4, 2: 2 }, { 1: 4, 2: 2 }, { 1: 4, 2: 3 }, { 1: 4, 2: 3 },
  { 1: 4, 2: 3, 3: 2 }, { 1: 4, 2: 3, 3: 2 }, { 1: 4, 2: 3, 3: 3 }, { 1: 4, 2: 3, 3: 3 },
  { 1: 4, 2: 3, 3: 3, 4: 1 }, { 1: 4, 2: 3, 3: 3, 4: 1 }, { 1: 4, 2: 3, 3: 3, 4: 2 }, { 1: 4, 2: 3, 3: 3, 4: 2 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 }, { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }, { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }
];

const halfCasterSlots2024: SpellSlots[] = [
  { 1: 2 }, ...halfCasterSlots2014.slice(1)
];

const slotsAtLevel = (progression: SpellSlots[], level: number, label: string): SpellSlots => {
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    throw new RangeError(`${label} level must be an integer from 1 through 20.`);
  }
  return { ...progression[level - 1] };
};

export const getDndFullCasterSlots = (level: number): SpellSlots =>
  slotsAtLevel(fullCasterSlots, level, "Full-caster");

export const getDndHalfCasterSlots2014 = (level: number): SpellSlots =>
  slotsAtLevel(halfCasterSlots2014, level, "2014 half-caster");

export const getDndHalfCasterSlots2024 = (level: number): SpellSlots =>
  slotsAtLevel(halfCasterSlots2024, level, "2024 half-caster");
