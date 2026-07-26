import type {
  DndToolDefinition,
  DndToolVariant
} from "../data/dndTools";
import type { RulesetId } from "../types/ruleCards";
import { secureRandomInteger, type RandomIntegerSource } from "./randomInteger";

export type DndToolPurchase = {
  name: string;
  costCp?: number;
  weightPounds?: number;
  variant?: DndToolVariant;
};

export type DndToolCheckResult = {
  ruleset: RulesetId;
  rolls: number[];
  chosenRoll: number;
  abilityModifier: number;
  proficiencyBonus: number;
  toolProficient: boolean;
  relevantSkillProficient: boolean;
  advantage: boolean;
  total: number;
  dc?: number;
  success?: boolean;
};

const normalizeInteger = (value: number): number => Math.trunc(Number.isFinite(value) ? value : 0);

export const extractDndToolDc = (procedure: string): number | undefined => {
  const match = procedure.match(/\(DC\s+(\d+)\)/i);
  return match ? Number.parseInt(match[1], 10) : undefined;
};

export const resolveDndToolPurchase = (
  tool: DndToolDefinition,
  variantId?: string
): DndToolPurchase => {
  const variant = tool.variants?.find((candidate) => candidate.id === variantId) ?? tool.variants?.[0];
  return {
    name: variant ? `${tool.name}: ${variant.name}` : tool.name,
    costCp: variant?.costCp ?? tool.costCp,
    weightPounds: variant?.weightPounds ?? tool.weightPounds,
    variant
  };
};

export const calculateDndToolCheckModifier = (
  abilityModifier: number,
  proficiencyBonus: number,
  toolProficient: boolean
): number => normalizeInteger(abilityModifier) + (toolProficient ? Math.max(0, normalizeInteger(proficiencyBonus)) : 0);

export const rollDndToolCheck = ({
  ruleset,
  abilityModifier,
  proficiencyBonus,
  toolProficient,
  relevantSkillProficient,
  dc,
  randomInteger = secureRandomInteger
}: {
  ruleset: RulesetId;
  abilityModifier: number;
  proficiencyBonus: number;
  toolProficient: boolean;
  relevantSkillProficient: boolean;
  dc?: number;
  randomInteger?: RandomIntegerSource;
}): DndToolCheckResult => {
  const advantage = ruleset === "srd-5.2.1-2024" && relevantSkillProficient;
  const rolls = advantage
    ? [randomInteger(1, 20), randomInteger(1, 20)]
    : [randomInteger(1, 20)];
  const chosenRoll = Math.max(...rolls);
  const normalizedDc = dc === undefined ? undefined : Math.max(0, normalizeInteger(dc));
  const modifier = calculateDndToolCheckModifier(abilityModifier, proficiencyBonus, toolProficient);
  const total = chosenRoll + modifier;

  return {
    ruleset,
    rolls,
    chosenRoll,
    abilityModifier: normalizeInteger(abilityModifier),
    proficiencyBonus: toolProficient ? Math.max(0, normalizeInteger(proficiencyBonus)) : 0,
    toolProficient,
    relevantSkillProficient,
    advantage,
    total,
    dc: normalizedDc,
    success: normalizedDc === undefined ? undefined : total >= normalizedDc
  };
};

export const filterDndTools = (
  tools: DndToolDefinition[],
  query: string,
  category: DndToolDefinition["category"] | "all"
): DndToolDefinition[] => {
  const normalized = query.trim().toLowerCase();
  return tools.filter((tool) => {
    if (category !== "all" && tool.category !== category) return false;
    if (!normalized) return true;
    return [
      tool.name,
      tool.ability2024,
      ...tool.utilize2024,
      ...tool.craft2024,
      ...(tool.variants?.map((variant) => variant.name) ?? [])
    ].join(" ").toLowerCase().includes(normalized);
  });
};
