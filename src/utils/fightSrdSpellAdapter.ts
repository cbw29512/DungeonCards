import type { DndAbilityId } from "../types/dndCharacter";
import type {
  FightActionDefinition,
  FightActionEconomy,
  FightActionEffectDefinition,
  FightDamageComponent
} from "../types/fightRules";
import type { SrdSpellRecord } from "../types/srdCompendium";
import { buildCriticalBonusFormula } from "./fightExecutionProfile";

const abilityIds: DndAbilityId[] = ["str", "dex", "con", "int", "wis", "cha"];
const safeId = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "spell";

const spellEconomy = (castingTime: string): FightActionEconomy => {
  if (/bonus action/i.test(castingTime)) return "bonus-action";
  if (/reaction/i.test(castingTime)) return "reaction";
  return "action";
};

const spellRangeFeet = (range: string): number => {
  if (/touch/i.test(range)) return 5;
  if (/self/i.test(range)) return 0;
  return Number(range.match(/\d+/)?.[0] ?? 30);
};

const saveAbilityFromText = (description: string): DndAbilityId | undefined => {
  const match = description.match(/\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|STR|DEX|CON|INT|WIS|CHA)\s+saving throw/i);
  if (!match) return undefined;
  const normalized = match[1].slice(0, 3).toLowerCase() as DndAbilityId;
  return abilityIds.includes(normalized) ? normalized : undefined;
};

const cantripScaledFormula = (description: string, level: number, fallback: string): string => {
  if (level < 5) return fallback;
  const tiers = [...description.matchAll(/\b(5|11|17)(?:st|nd|rd|th) level\s*\((\d+d\d+)\)/gi)]
    .map((match) => ({ level: Number(match[1]), formula: match[2] }))
    .filter((tier) => tier.level <= level)
    .sort((left, right) => right.level - left.level);
  return tiers[0]?.formula ?? fallback;
};

const damageComponents = (spell: SrdSpellRecord, characterLevel: number): FightDamageComponent[] => {
  const matches = [...spell.description.matchAll(/\b(?:takes?|deals?|take)\s+(?:an extra\s+)?(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+([a-z]+)\s+damage|\b(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+([a-z]+)\s+damage/gi)];
  const seen = new Set<string>();
  return matches.flatMap((match) => {
    const baseFormula = (match[1] ?? match[3])?.trim();
    const damageType = (match[2] ?? match[4])?.toLowerCase();
    if (!baseFormula || !damageType) return [];
    const formula = spell.level === 0 ? cantripScaledFormula(spell.description, characterLevel, baseFormula) : baseFormula;
    const key = `${formula}:${damageType}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ formula, damageType, criticalBonusFormula: buildCriticalBonusFormula(formula) ?? undefined }];
  });
};

const supportedCondition = (description: string): string | undefined =>
  description.match(/\b(?:is|becomes)\s+(blinded|charmed|deafened|frightened|grappled|incapacitated|invisible|paralyzed|petrified|poisoned|prone|restrained|stunned|unconscious)\b/i)?.[1]?.toLowerCase();

const conditionEffect = (
  spell: SrdSpellRecord,
  condition: string,
  saveAbility: DndAbilityId,
  saveDc: number
): FightActionEffectDefinition => {
  const repeat = spell.description.match(/repeat(?:s)? the saving throw at (?:the )?(start|end) of (?:each of )?(?:its|their|the target'?s) turns?/i);
  return {
    id: `spell-${safeId(spell.name)}-${condition}`,
    name: condition[0].toUpperCase() + condition.slice(1),
    kind: "condition",
    iconKey: condition,
    sourceName: spell.name,
    tickTiming: "manual",
    saveAbility: repeat ? saveAbility : undefined,
    saveDc: repeat ? saveDc : undefined,
    saveTiming: repeat ? repeat[1].toLowerCase() as "start" | "end" : undefined,
    concentrationLinked: /concentration/i.test(spell.duration),
    attackRollMode: condition === "poisoned" || condition === "frightened" ? "disadvantage" : undefined
  };
};

const resourceCosts = (spell: SrdSpellRecord) => spell.level > 0
  ? [{ resourceId: `spell-slot-${spell.level}`, amount: 1 }]
  : undefined;

const healingFormula = (description: string, spellcastingModifier: number): string | undefined => {
  const equal = description.match(/regains?[^.]{0,80}?hit points equal to\s+(\d+d\d+)(?:\s*\+\s*your spellcasting ability modifier)?/i);
  if (equal) {
    return /spellcasting ability modifier/i.test(equal[0])
      ? `${equal[1]}${spellcastingModifier >= 0 ? "+" : ""}${spellcastingModifier}`
      : equal[1];
  }
  return description.match(/regains?\s+(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+hit points/i)?.[1]?.replaceAll(" ", "");
};

const temporaryHitPointsFormula = (description: string): string | undefined =>
  description.match(/(?:gain|gains)\s+(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+temporary hit points/i)?.[1]?.replaceAll(" ", "");

export const buildSrdSpellFightAction = ({
  spell,
  characterLevel,
  spellAttackBonus,
  spellSaveDc,
  spellcastingModifier
}: {
  spell: SrdSpellRecord;
  characterLevel: number;
  spellAttackBonus: number;
  spellSaveDc: number;
  spellcastingModifier: number;
}): FightActionDefinition | null => {
  const base = {
    id: `spell-${safeId(spell.name)}`,
    name: spell.name,
    economy: spellEconomy(spell.castingTime),
    delivery: "spell" as const,
    rangeFeet: spellRangeFeet(spell.range),
    requiresConcentration: /concentration/i.test(spell.duration),
    resourceCosts: resourceCosts(spell)
  };
  const damage = damageComponents(spell, characterLevel);
  if (/\b(?:melee|ranged) spell attack\b/i.test(spell.description) && damage.length) {
    return {
      ...base,
      kind: "attack",
      attackBonus: spellAttackBonus,
      criticalAt: 20,
      damage
    };
  }

  const saveAbility = saveAbilityFromText(spell.description);
  if (saveAbility) {
    const condition = supportedCondition(spell.description);
    if (damage.length || condition) {
      return {
        ...base,
        kind: "save",
        saveAbility,
        saveDc: spellSaveDc,
        damage: damage.length ? damage : undefined,
        damageOnSuccess: /half as much damage on (?:a )?successful/i.test(spell.description) ? "half" : "none",
        effectsOnFailure: condition ? [conditionEffect(spell, condition, saveAbility, spellSaveDc)] : undefined
      };
    }
  }

  if (!/another creature/i.test(spell.description)) {
    const healing = healingFormula(spell.description, spellcastingModifier);
    if (healing) return { ...base, kind: "heal", target: "self", formula: healing };
    const temp = temporaryHitPointsFormula(spell.description);
    if (temp) return { ...base, kind: "temporary-hit-points", target: "self", formula: temp };
  }
  return null;
};
