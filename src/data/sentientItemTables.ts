import type { RuleTableEntry } from "../types/ruleCards";

export const sentientAlignmentTable: RuleTableEntry[] = [
  { min: 1, max: 15, result: "Lawful Good" },
  { min: 16, max: 35, result: "Neutral Good" },
  { min: 36, max: 50, result: "Chaotic Good" },
  { min: 51, max: 63, result: "Lawful Neutral" },
  { min: 64, max: 73, result: "Neutral" },
  { min: 74, max: 85, result: "Chaotic Neutral" },
  { min: 86, max: 89, result: "Lawful Evil" },
  { min: 90, max: 96, result: "Neutral Evil" },
  { min: 97, max: 100, result: "Chaotic Evil" }
];

export const sentientCommunicationTable: RuleTableEntry[] = [
  { min: 1, max: 6, result: "Transmits emotion to its bearer." },
  { min: 7, max: 9, result: "Speaks one or more languages." },
  { min: 10, max: 10, result: "Speaks and communicates telepathically with its bearer." }
];

export const sentientSensesTable: RuleTableEntry[] = [
  { min: 1, max: 1, result: "Hearing and standard vision to 30 feet." },
  { min: 2, max: 2, result: "Hearing and standard vision to 60 feet." },
  { min: 3, max: 3, result: "Hearing and standard vision to 120 feet." },
  { min: 4, max: 4, result: "Hearing and Darkvision to 120 feet." }
];

export const sentientPurposeTable: RuleTableEntry[] = [
  { min: 1, max: 1, result: "Aligned: defeat creatures of opposed alignment." },
  { min: 2, max: 2, result: "Bane: thwart or destroy a chosen creature type." },
  { min: 3, max: 3, result: "Creator Seeker: find and understand its creator." },
  { min: 4, max: 4, result: "Destiny Seeker: fulfill a foretold role with its bearer." },
  { min: 5, max: 5, result: "Destroyer: pursue destruction and arbitrary combat." },
  { min: 6, max: 6, result: "Glory Seeker: gain fame or notoriety through its bearer." },
  { min: 7, max: 7, result: "Lore Seeker: uncover knowledge, secrets, or prophecy." },
  { min: 8, max: 8, result: "Protector: defend a particular kind of creature." },
  { min: 9, max: 9, result: "Soulmate Seeker: find another sentient magic item." },
  { min: 10, max: 10, result: "Templar: defend a deity’s servants and interests." }
];