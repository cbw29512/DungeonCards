import type { DndAbilityId, DndCharacterAttack, DndCharacterRecord } from "../types/dndCharacter";
import type { FightCombatantProfile, FightProfileBuildResult } from "../types/fightMatchmaker";
import type {
  FightActionDefinition,
  FightActionEconomy,
  FightActionEffectDefinition,
  FightAttackAction,
  FightDamageComponent,
  FightMultiattackAction,
  FightSaveAction
} from "../types/fightRules";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import { d20HitChance } from "./fightMatchmaker";
import { buildCriticalBonusFormula, parseSrdInitiativeBonus } from "./fightExecutionProfile";
import { buildMonsterCombatReference } from "./monsterCombatReference";

const abilityIds: DndAbilityId[] = ["str", "dex", "con", "int", "wis", "cha"];
const abilityModifier = (score: number): number => Math.floor((score - 10) / 2);
const proficiencyBonus = (level: number): number => 2 + Math.floor((level - 1) / 4);
const safeId = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "action";

type FormulaAverage = { average: number; diceAverage: number };

export const averageDiceFormula = (formula: string): FormulaAverage | null => {
  const normalized = formula.replaceAll(" ", "").toLowerCase();
  const terms = normalized.match(/[+-]?[^+-]+/g);
  if (!terms?.length || terms.join("") !== normalized) return null;

  let average = 0;
  let diceAverage = 0;
  for (const rawTerm of terms) {
    const sign = rawTerm.startsWith("-") ? -1 : 1;
    const term = rawTerm.replace(/^[+-]/, "");
    const dice = term.match(/^(\d*)d(\d+)$/);
    if (dice) {
      const count = Number(dice[1] || "1");
      const sides = Number(dice[2]);
      if (!Number.isInteger(count) || count <= 0 || !Number.isInteger(sides) || sides <= 1) return null;
      const value = sign * count * ((sides + 1) / 2);
      average += value;
      diceAverage += value;
      continue;
    }
    if (!/^\d+(?:\.\d+)?$/.test(term)) return null;
    average += sign * Number(term);
  }
  return average > 0 && diceAverage > 0 ? { average, diceAverage } : null;
};

const fighterAttacksPerRound = (character: DndCharacterRecord): number => {
  if (character.classId !== "fighter") return 1;
  if (character.level >= 20) return 4;
  if (character.level >= 11) return 3;
  if (character.level >= 5) return 2;
  return 1;
};

const parseRangeFeet = (value: string): number => Number(value.match(/\d+/)?.[0] ?? 5);

const characterSaveBonuses = (character: DndCharacterRecord): Partial<Record<DndAbilityId, number>> =>
  Object.fromEntries(abilityIds.map((ability) => [
    ability,
    abilityModifier(character.abilityScores[ability])
      + (character.savingThrowProficiencies.includes(ability) ? proficiencyBonus(character.level) : 0)
  ]));

const characterAttackAction = (
  character: DndCharacterRecord,
  attack: DndCharacterAttack,
  criticalAt: number
): FightAttackAction | null => {
  const criticalBonusFormula = buildCriticalBonusFormula(attack.damageFormula);
  if (!criticalBonusFormula || !averageDiceFormula(attack.damageFormula)) return null;
  return {
    id: `attack-${safeId(attack.id || attack.name)}`,
    name: attack.name,
    kind: "attack",
    economy: "action",
    attackBonus: abilityModifier(character.abilityScores[attack.attackAbility])
      + (attack.proficient ? proficiencyBonus(character.level) : 0),
    criticalAt,
    rangeFeet: parseRangeFeet(attack.rangeOrReach),
    damage: [{
      formula: attack.damageFormula,
      damageType: attack.damageType,
      criticalBonusFormula
    }]
  };
};

export const buildCharacterFightProfile = (character: DndCharacterRecord): FightProfileBuildResult => {
  const championCritical = character.ruleset === "srd-5.1-2014"
    && character.classId === "fighter"
    && character.level >= 3
    && /champion/i.test(character.subclassName)
    ? 19
    : 20;
  const attackActions = character.attacks.flatMap((attack) => {
    const action = characterAttackAction(character, attack, championCritical);
    return action ? [{ attack, action }] : [];
  });
  if (!attackActions.length) {
    return { ok: false, issues: [`${character.name} has no attack with a safely parseable damage formula.`] };
  }

  const best = [...attackActions].sort((left, right) => {
    const leftAverage = averageDiceFormula(left.attack.damageFormula)?.average ?? 0;
    const rightAverage = averageDiceFormula(right.attack.damageFormula)?.average ?? 0;
    const leftScore = d20HitChance(left.action.attackBonus, 15) * leftAverage;
    const rightScore = d20HitChance(right.action.attackBonus, 15) * rightAverage;
    return rightScore - leftScore;
  })[0];
  const attacksPerRound = fighterAttacksPerRound(character);
  const actions: FightActionDefinition[] = attackActions.map(({ action }) => action);
  if (attacksPerRound > 1) {
    actions.push({
      id: "attack-action-multi",
      name: `Attack ×${attacksPerRound}`,
      kind: "multiattack",
      economy: "action",
      rangeFeet: best.action.rangeFeet,
      sequence: [{ actionId: best.action.id, count: attacksPerRound }]
    });
  }

  const resources: NonNullable<FightCombatantProfile["resources"]> = [];
  if (character.ruleset === "srd-5.1-2014" && character.classId === "fighter") {
    resources.push({ id: "second-wind", name: "Second Wind", maximum: 1, refresh: "short-rest" });
    actions.push({
      id: "second-wind",
      name: "Second Wind",
      kind: "heal",
      economy: "bonus-action",
      target: "self",
      formula: `1d10+${character.level}`,
      resourceCosts: [{ resourceId: "second-wind", amount: 1 }]
    });
    if (character.level >= 2) {
      resources.push({ id: "action-surge", name: "Action Surge", maximum: 1, refresh: "short-rest" });
      actions.push({
        id: "action-surge",
        name: "Action Surge",
        kind: "grant-action",
        economy: "free",
        grants: "action",
        resourceCosts: [{ resourceId: "action-surge", amount: 1 }]
      });
    }
  }

  const damage = averageDiceFormula(best.attack.damageFormula)!;
  return {
    ok: true,
    sourceActionName: best.attack.name,
    profile: {
      id: character.id,
      name: character.name,
      ruleset: character.ruleset,
      armorClass: character.armorClass,
      hitPoints: character.maximumHitPoints,
      attackBonus: best.action.attackBonus,
      attacksPerRound,
      averageDamageOnHit: damage.average,
      averageCriticalBonusDamage: damage.diceAverage,
      initiativeBonus: abilityModifier(character.abilityScores.dex),
      attackDamageFormula: best.attack.damageFormula,
      criticalBonusFormula: buildCriticalBonusFormula(best.attack.damageFormula) ?? undefined,
      sourceActionName: best.attack.name,
      attackDelivery: "weapon",
      speedFeet: character.speedFeet,
      savingThrowBonuses: characterSaveBonuses(character),
      actions,
      resources,
      level: character.level
    }
  };
};

const parseNumber = (value: string): number | null => {
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const parseChallenge = (value: string): number | undefined => {
  const fraction = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  return parseNumber(value) ?? undefined;
};

const compactEntries = (text: string): Array<{ name: string; description: string }> => {
  const normalized = String(text || "").replace(/\r/g, "").replace(/[\t ]+/g, " ").trim();
  if (!normalized) return [];
  const pattern = /(?:^|\n|(?<=\.\s))([A-Z][A-Za-z0-9'’/&,+\- ]{1,70}(?:\s*\([^\n)]*\))?)\.\s+(?=(?:Melee|Ranged|The\b|Each\b|One\b|Up to\b|A\b|An\b|If\b|When\b|While\b|Roll\b|Make\b|Choose\b))/g;
  const matches = [...normalized.matchAll(pattern)];
  if (!matches.length) return [];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? normalized.length : normalized.length;
    return { name: match[1].trim(), description: normalized.slice(start, end).trim() };
  });
};

const damagePattern = /(?:\d+\s*)?\(([^)]+)\)\s+([a-z]+)\s+damage/gi;
const damageComponents = (description: string): FightDamageComponent[] => [...description.matchAll(damagePattern)].flatMap((match) => {
  const formula = match[1].trim();
  const criticalBonusFormula = buildCriticalBonusFormula(formula);
  if (!averageDiceFormula(formula)) return [];
  return [{ formula, damageType: match[2].toLowerCase(), criticalBonusFormula: criticalBonusFormula ?? undefined }];
});

const attackRange = (description: string): number => {
  const reach = description.match(/\breach\s+(\d+)\s*ft/i);
  if (reach) return Number(reach[1]);
  const range = description.match(/\brange\s+(\d+)(?:\s*\/\s*\d+)?\s*ft/i);
  if (range) return Number(range[1]);
  return 5;
};

const rechargeForName = (name: string) => {
  const match = name.match(/Recharge\s+(\d)(?:\s*[–—-]\s*\d)?/i);
  return match ? { minimum: Number(match[1]), dieSides: 6, initiallyReady: true } : undefined;
};

const parseAttackAction = (
  name: string,
  description: string,
  economy: FightActionEconomy
): FightAttackAction | null => {
  const attackBonus = description.match(/([+-]\d+)\s+to hit/i);
  const components = damageComponents(description);
  if (!attackBonus || !components.length || !/\bHit:/i.test(description)) return null;
  return {
    id: `${economy}-${safeId(name.replace(/\s*\([^)]*Recharge[^)]*\)/i, ""))}`,
    name,
    kind: "attack",
    economy,
    attackBonus: Number(attackBonus[1]),
    criticalAt: 20,
    rangeFeet: attackRange(description),
    recharge: rechargeForName(name),
    damage: components
  };
};

const abilityFromSaveText = (value: string): DndAbilityId | undefined => {
  const normalized = value.slice(0, 3).toLowerCase();
  return abilityIds.includes(normalized as DndAbilityId) ? normalized as DndAbilityId : undefined;
};

const supportedCondition = (description: string): string | undefined =>
  description.match(/\b(?:is|becomes)\s+(blinded|charmed|deafened|frightened|grappled|incapacitated|invisible|paralyzed|petrified|poisoned|prone|restrained|stunned|unconscious)\b/i)?.[1]?.toLowerCase();

const conditionEffect = (
  condition: string,
  actionName: string,
  saveAbility: DndAbilityId,
  saveDc: number,
  description: string
): FightActionEffectDefinition => {
  const repeat = description.match(/repeat(?:s)? the saving throw at (?:the )?(start|end) of (?:each of )?(?:its|their|the target'?s) turns?/i);
  return {
    id: condition,
    name: condition[0].toUpperCase() + condition.slice(1),
    kind: "condition",
    iconKey: condition,
    sourceName: actionName,
    tickTiming: "manual",
    saveAbility: repeat ? saveAbility : undefined,
    saveDc: repeat ? saveDc : undefined,
    saveTiming: repeat ? repeat[1].toLowerCase() as "start" | "end" : undefined,
    attackRollMode: condition === "poisoned" || condition === "frightened" ? "disadvantage" : undefined
  };
};

const parseSaveAction = (
  name: string,
  description: string,
  economy: FightActionEconomy
): FightSaveAction | null => {
  const save = description.match(/DC\s+(\d+)\s+(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|STR|DEX|CON|INT|WIS|CHA)\s+saving throw/i);
  if (!save) return null;
  const saveAbility = abilityFromSaveText(save[2]);
  if (!saveAbility) return null;
  const components = damageComponents(description);
  const condition = supportedCondition(description);
  if (!components.length && !condition) return null;
  const saveDc = Number(save[1]);
  const within = description.match(/within\s+(\d+)\s+feet/i);
  const range = description.match(/(\d+)-foot/i);
  return {
    id: `${economy}-${safeId(name.replace(/\s*\([^)]*Recharge[^)]*\)/i, ""))}`,
    name,
    kind: "save",
    economy,
    recharge: rechargeForName(name),
    rangeFeet: Number(within?.[1] ?? range?.[1] ?? 30),
    saveAbility,
    saveDc,
    damage: components.length ? components : undefined,
    damageOnSuccess: /half as much damage on (?:a )?successful/i.test(description) ? "half" : "none",
    effectsOnFailure: condition ? [conditionEffect(condition, name, saveAbility, saveDc, description)] : undefined
  };
};

const numberWord = (value: string): number | undefined => {
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  return /^\d+$/.test(value) ? Number(value) : words[value.toLowerCase()];
};

const canonicalActionName = (value: string): string => value
  .toLowerCase()
  .replace(/\([^)]*\)/g, "")
  .replace(/\b(?:its|the|a|an)\b/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim()
  .replace(/s$/, "");

const parseMultiattack = (
  entry: { name: string; description: string } | undefined,
  actions: FightActionDefinition[]
): FightMultiattackAction | null => {
  if (!entry) return null;
  const declared = entry.description.match(/makes?\s+(one|two|three|four|five|six|\d+)\s+attacks?/i);
  const declaredCount = declared ? numberWord(declared[1]) : undefined;
  const pieces = [...entry.description.matchAll(/\b(one|two|three|four|five|six|\d+)\s+(?:attacks?\s+)?with\s+(?:its|the|a|an)\s+([a-z][a-z'’ -]*?)(?=,|\s+and\s+|\.|$)/gi)]
    .map((match) => ({ count: numberWord(match[1]) ?? 0, name: match[2] }));
  if (!pieces.length) {
    const repeated = entry.description.match(/makes?\s+(one|two|three|four|five|six|\d+)\s+([a-z][a-z'’ -]+?)\s+attacks?/i);
    if (repeated) pieces.push({ count: numberWord(repeated[1]) ?? 0, name: repeated[2] });
  }
  if (!pieces.length || pieces.some((piece) => piece.count < 1)) return null;
  const sequence = pieces.flatMap((piece) => {
    const wanted = canonicalActionName(piece.name);
    const action = actions.find((candidate) => candidate.kind === "attack"
      && (canonicalActionName(candidate.name).includes(wanted) || wanted.includes(canonicalActionName(candidate.name))));
    return action ? [{ actionId: action.id, count: piece.count }] : [];
  });
  if (sequence.length !== pieces.length) return null;
  const total = sequence.reduce((sum, step) => sum + step.count, 0);
  if (declaredCount !== undefined && total !== declaredCount) return null;
  return {
    id: "action-multiattack",
    name: entry.name,
    kind: "multiattack",
    economy: "action",
    rangeFeet: Math.max(...sequence.map((step) => actions.find((action) => action.id === step.actionId)?.rangeFeet ?? 5)),
    sequence
  };
};

const damageTypeNames = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
const parseDamageTypeList = (value: string): string[] => damageTypeNames.filter((type) => new RegExp(`\\b${type}\\b`, "i").test(value));

const monsterSaveBonuses = (monster: SrdMonsterRecord): Partial<Record<DndAbilityId, number>> => {
  const reference = buildMonsterCombatReference(monster);
  const bonuses: Partial<Record<DndAbilityId, number>> = {};
  for (const ability of reference.abilities) bonuses[ability.name.toLowerCase() as DndAbilityId] = ability.modifier;
  for (const match of reference.savingThrows.matchAll(/\b(STR|DEX|CON|INT|WIS|CHA)\s*([+-]\d+)/gi)) {
    bonuses[match[1].toLowerCase() as DndAbilityId] = Number(match[2]);
  }
  return bonuses;
};

const parseActionsForBlock = (text: string, economy: FightActionEconomy): FightActionDefinition[] => compactEntries(text).flatMap((entry) => {
  const attack = parseAttackAction(entry.name, entry.description, economy);
  if (attack) return [attack];
  const save = parseSaveAction(entry.name, entry.description, economy);
  return save ? [save] : [];
});

export const buildSrdMonsterFightProfile = (monster: SrdMonsterRecord): FightProfileBuildResult => {
  const entries = compactEntries(monster.actions);
  const actionEntries = entries.filter((entry) => !/^Multiattack\b/i.test(entry.name));
  const actions = actionEntries.flatMap((entry) => {
    const attack = parseAttackAction(entry.name, entry.description, "action");
    if (attack) return [attack];
    const save = parseSaveAction(entry.name, entry.description, "action");
    return save ? [save] : [];
  });
  const multiEntry = entries.find((entry) => /^Multiattack\b/i.test(entry.name));
  const multiattack = parseMultiattack(multiEntry, actions);
  if (multiEntry && !multiattack) {
    return { ok: false, issues: [`${monster.name}'s Multiattack could not be reconciled to canonical component attacks safely.`] };
  }
  if (multiattack) actions.push(multiattack);
  actions.push(...parseActionsForBlock(monster.bonusActions, "bonus-action"));
  actions.push(...parseActionsForBlock(monster.reactions, "reaction"));
  if (!actions.some((action) => action.kind === "attack" || action.kind === "save" || action.kind === "multiattack")) {
    return { ok: false, issues: [`${monster.name} has no high-confidence executable attack or save action for Fight Cards.`] };
  }

  const reference = buildMonsterCombatReference(monster);
  const armorClass = parseNumber(monster.armorClass);
  const hitPoints = parseNumber(monster.hitPoints);
  if (armorClass === null || hitPoints === null) {
    return { ok: false, issues: [`${monster.name} is missing safe AC or HP data.`] };
  }
  const attackActions = actions.filter((action): action is FightAttackAction => action.kind === "attack");
  const bestAttack = [...attackActions].sort((left, right) => {
    const leftAverage = left.damage.reduce((sum, component) => sum + (averageDiceFormula(component.formula)?.average ?? 0), 0);
    const rightAverage = right.damage.reduce((sum, component) => sum + (averageDiceFormula(component.formula)?.average ?? 0), 0);
    return d20HitChance(right.attackBonus, 15) * rightAverage - d20HitChance(left.attackBonus, 15) * leftAverage;
  })[0];
  const bestSave = actions.find((action): action is FightSaveAction => action.kind === "save");
  const sourceAction = multiattack ?? bestAttack ?? bestSave!;
  const bestDamage = bestAttack?.damage.reduce((sum, component) => sum + (averageDiceFormula(component.formula)?.average ?? 0), 0)
    ?? bestSave?.damage?.reduce((sum, component) => sum + (averageDiceFormula(component.formula)?.average ?? 0), 0)
    ?? 1;
  const bestCritical = bestAttack?.damage.reduce((sum, component) => sum + (averageDiceFormula(component.formula)?.diceAverage ?? 0), 0) ?? 0;
  const primaryDamage = bestAttack?.damage[0];
  const attacksPerRound = multiattack?.sequence.reduce((sum, step) => sum + step.count, 0) ?? 1;

  return {
    ok: true,
    sourceActionName: sourceAction.name,
    profile: {
      id: monster.id,
      name: monster.name,
      ruleset: monster.edition,
      armorClass,
      hitPoints,
      attackBonus: bestAttack?.attackBonus ?? 0,
      attacksPerRound,
      averageDamageOnHit: bestDamage,
      averageCriticalBonusDamage: bestCritical || undefined,
      initiativeBonus: parseSrdInitiativeBonus(monster.rawText),
      attackDamageFormula: primaryDamage?.formula,
      criticalBonusFormula: primaryDamage?.criticalBonusFormula,
      sourceActionName: sourceAction.name,
      attackDelivery: bestAttack ? "weapon" : "spell",
      speedFeet: parseNumber(monster.speed) ?? 30,
      savingThrowBonuses: monsterSaveBonuses(monster),
      damageResistances: parseDamageTypeList(reference.resistances),
      damageImmunities: parseDamageTypeList(reference.immunities),
      damageVulnerabilities: parseDamageTypeList(reference.vulnerabilities),
      actions,
      resources: [],
      challengeRating: parseChallenge(monster.challenge)
    }
  };
};