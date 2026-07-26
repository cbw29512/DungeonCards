import type { SrdMonsterRecord } from "../types/srdCompendium";

export type MonsterAbilityReference = {
  name: "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";
  score: number;
  modifier: number;
};

export type MonsterCombatActionReference = {
  name: string;
  summary: string;
  recharge?: string;
};

export type MonsterCombatReference = {
  abilities: MonsterAbilityReference[];
  initiative: string;
  savingThrows: string;
  skills: string;
  vulnerabilities: string;
  resistances: string;
  immunities: string;
  conditionImmunities: string;
  senses: string;
  languages: string;
  actions: MonsterCombatActionReference[];
  hasBonusActions: boolean;
  hasReactions: boolean;
  hasLegendaryActions: boolean;
};

const abilityNames = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

const normalizeLines = (value: string) => String(value || "")
  .replace(/\r/g, "")
  .replace(/[\t ]+/g, " ")
  .replace(/\n[ \t]+/g, "\n")
  .trim();

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const labeledValue = (rawText: string, label: string): string => {
  const match = normalizeLines(rawText).match(new RegExp(`(?:^|\\n)${escapeRegExp(label)}\\s+([^\\n]+)`, "i"));
  return match?.[1]?.trim() || "";
};

const buildAbilities = (values: string[]): MonsterAbilityReference[] => abilityNames.map((name, index) => ({
  name,
  score: Number(values[index * 2]),
  modifier: Number(values[(index * 2) + 1])
}));

const parseSignedInteger = (value: string): number => Number(value.replace(/[−–—]/g, "-"));

const parseLabeledAbilityRows = (normalized: string): MonsterAbilityReference[] => {
  const parsed = abilityNames.map((name) => {
    const match = normalized.match(new RegExp(`\\b${name}\\s+(\\d+)\\s+(?:\\(([+\\-−–—]?\\d+)\\)|([+\\-−–—]\\d+))`, "i"));
    if (!match) return undefined;
    return { name, score: Number(match[1]), modifier: parseSignedInteger(match[2] ?? match[3]) };
  });
  return parsed.every(Boolean) ? parsed as MonsterAbilityReference[] : [];
};

const parseAbilities = (rawText: string): MonsterAbilityReference[] => {
  const normalized = normalizeLines(rawText).replace(/\n/g, " ");
  const interleaved = normalized.match(/STR\s+(\d+)\s+\(([+-]?\d+)\)\s+DEX\s+(\d+)\s+\(([+-]?\d+)\)\s+CON\s+(\d+)\s+\(([+-]?\d+)\)\s+INT\s+(\d+)\s+\(([+-]?\d+)\)\s+WIS\s+(\d+)\s+\(([+-]?\d+)\)\s+CHA\s+(\d+)\s+\(([+-]?\d+)\)/i);
  if (interleaved) return buildAbilities(interleaved.slice(1));

  const headerThenValues = normalized.match(/STR\s+DEX\s+CON\s+INT\s+WIS\s+CHA\s+(\d+)\s+\(([+-]?\d+)\)\s+(\d+)\s+\(([+-]?\d+)\)\s+(\d+)\s+\(([+-]?\d+)\)\s+(\d+)\s+\(([+-]?\d+)\)\s+(\d+)\s+\(([+-]?\d+)\)\s+(\d+)\s+\(([+-]?\d+)\)/i);
  if (headerThenValues) return buildAbilities(headerThenValues.slice(1));

  return parseLabeledAbilityRows(normalized);
};

const compactSentence = (value: string, maximum = 155) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maximum) return normalized;
  return `${normalized.slice(0, maximum - 1).trimEnd()}…`;
};

const actionSummary = (description: string) => {
  const attackBonus = description.match(/([+-]\d+)\s+to hit/i)?.[1];
  const reachOrRange = description.match(/\b(?:reach|range)\s+[^.;]+/i)?.[0];
  const hitText = description.match(/\bHit:\s*([^.]*)/i)?.[1];
  const save = description.match(/DC\s+\d+\s+[A-Z]{3}\s+saving throw/i)?.[0];
  const pieces = [attackBonus ? `${attackBonus} to hit` : "", reachOrRange || "", hitText ? `Hit: ${compactSentence(hitText, 90)}` : "", save || ""].filter(Boolean);
  if (pieces.length > 0) return pieces.join(" · ");
  return compactSentence(description.split(/(?<=[.!?])\s+/)[0] || description);
};

const parseNamedEntries = (text: string): MonsterCombatActionReference[] => {
  const normalized = normalizeLines(text);
  if (!normalized) return [];
  const entryPattern = /(?:^|\n)([A-Z][^\n.]{1,80}(?:\s*\([^\n)]*\))?)\.\s+/g;
  const matches = [...normalized.matchAll(entryPattern)];
  if (matches.length === 0) {
    const firstPeriod = normalized.indexOf(".");
    const name = firstPeriod > 0 && firstPeriod < 80 ? normalized.slice(0, firstPeriod) : "Action";
    const description = firstPeriod > 0 && firstPeriod < 80 ? normalized.slice(firstPeriod + 1) : normalized;
    return [{ name: name.trim(), summary: actionSummary(description) }];
  }
  return matches.map((match, index) => {
    const start = (match.index || 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index || normalized.length : normalized.length;
    const description = normalized.slice(start, end).trim();
    const name = match[1].trim();
    const recharge = name.match(/Recharge\s+[^)]+/i)?.[0];
    return { name, summary: actionSummary(description), recharge };
  });
};

const prioritizedActions = (monster: SrdMonsterRecord) => {
  const actions = parseNamedEntries(monster.actions);
  return [...actions].sort((a, b) => {
    const score = (action: MonsterCombatActionReference) => (action.name.toLowerCase().includes("multiattack") ? 4 : 0) + (action.summary.includes("to hit") ? 3 : 0) + (action.summary.includes("saving throw") ? 2 : 0) + (action.recharge ? 1 : 0);
    return score(b) - score(a);
  }).slice(0, 3);
};

export const buildMonsterCombatReference = (monster: SrdMonsterRecord): MonsterCombatReference => {
  const abilities = parseAbilities(monster.rawText);
  const dexterity = abilities.find((ability) => ability.name === "DEX");
  const initiative = dexterity ? `${dexterity.modifier >= 0 ? "+" : ""}${dexterity.modifier} (DEX ${dexterity.score})` : "See full stat block";
  return {
    abilities,
    initiative,
    savingThrows: labeledValue(monster.rawText, "Saving Throws"),
    skills: labeledValue(monster.rawText, "Skills"),
    vulnerabilities: labeledValue(monster.rawText, "Damage Vulnerabilities"),
    resistances: labeledValue(monster.rawText, "Damage Resistances"),
    immunities: labeledValue(monster.rawText, "Damage Immunities"),
    conditionImmunities: labeledValue(monster.rawText, "Condition Immunities"),
    senses: labeledValue(monster.rawText, "Senses"),
    languages: labeledValue(monster.rawText, "Languages"),
    actions: prioritizedActions(monster),
    hasBonusActions: Boolean(monster.bonusActions.trim()),
    hasReactions: Boolean(monster.reactions.trim()),
    hasLegendaryActions: Boolean(monster.legendaryActions.trim())
  };
};
