import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { RulesetId } from "../types/ruleCards";
import { buildMonsterCombatReference } from "./monsterCombatReference";

export type DndMonsterEncounterDefaults = {
  monsterId: string;
  name: string;
  ruleset: RulesetId;
  sourceReference: string;
  challenge: string;
  type: string;
  size: string;
  maximumHitPoints?: number;
  speedFeet?: number;
  dexterityModifier?: number;
  issues: string[];
};

const firstPositiveInteger = (value: string): number | undefined => {
  const match = String(value || "").match(/\b(\d+)\b/);
  if (!match) return undefined;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const abilityModifier = (score: number): number => Math.floor((score - 10) / 2);

export const buildDndMonsterEncounterDefaults = (
  entry: EncounterMonsterEntry
): DndMonsterEncounterDefaults => {
  const issues: string[] = [];
  const maximumHitPoints = entry.kind === "formatted"
    ? firstPositiveInteger(entry.monster.hp)
    : firstPositiveInteger(entry.monster.hitPoints);
  const speedFeet = entry.kind === "formatted"
    ? firstPositiveInteger(entry.monster.speed)
    : firstPositiveInteger(entry.monster.speed);
  const dexterityModifier = entry.kind === "formatted"
    ? abilityModifier(entry.monster.abilities.dex)
    : buildMonsterCombatReference(entry.monster).abilities.find((ability) => ability.name === "DEX")?.modifier;

  if (maximumHitPoints === undefined) issues.push("Hit Points could not be parsed; enter them manually.");
  if (speedFeet === undefined) issues.push("Walking Speed could not be parsed; enter it manually.");
  if (dexterityModifier === undefined) issues.push("Dexterity modifier could not be parsed; enter it manually.");

  return {
    monsterId: entry.id,
    name: entry.name,
    ruleset: entry.ruleset as RulesetId,
    sourceReference: entry.source,
    challenge: entry.cr,
    type: entry.type,
    size: entry.size,
    maximumHitPoints,
    speedFeet,
    dexterityModifier,
    issues
  };
};

export const filterDndEncounterMonsters = (
  entries: EncounterMonsterEntry[],
  ruleset: RulesetId,
  query: string
): EncounterMonsterEntry[] => {
  const normalized = query.trim().toLowerCase();
  return entries.filter((entry) => {
    if (entry.ruleset !== ruleset) return false;
    if (!normalized) return true;
    return `${entry.name} ${entry.type} ${entry.size} ${entry.cr}`.toLowerCase().includes(normalized);
  });
};
