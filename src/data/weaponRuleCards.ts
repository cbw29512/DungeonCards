import type {
  FormulaChoice,
  RuleCard,
  RuleCardVariant,
  RuleRollMode,
  RulesetId
} from "../types/ruleCards";
import { weaponCatalog2014 } from "./weaponCatalog2014";
import { weaponCatalog2024 } from "./weaponCatalog2024";
import type { WeaponDefinition } from "./weaponCatalogTypes";

const masteryNotes: Record<NonNullable<WeaponDefinition["mastery"]>, string> = {
  Cleave: "After a hit, make one attack against a second nearby creature; don't add a positive ability modifier to that damage.",
  Graze: "On a miss, deal damage equal to the attack ability modifier.",
  Nick: "Make the Light property's extra attack as part of the Attack action instead of as a Bonus Action.",
  Push: "On a hit, push a Large or smaller creature up to 10 feet straight away.",
  Sap: "On a hit, the target has Disadvantage on its next attack roll before your next turn.",
  Slow: "On a damaging hit, reduce the target's Speed by 10 feet until your next turn.",
  Topple: "On a hit, force a Constitution save or give the target the Prone condition.",
  Vex: "On a damaging hit, gain Advantage on your next attack against that target before the end of your next turn."
};

const attackMode: RuleRollMode = {
  id: "attack",
  label: "Attack",
  kind: "attack",
  formula: "1d20+5",
  allowsAdvantage: true,
  naturalRollRule: "attack",
  modifierControl: { label: "Attack bonus", defaultValue: 5, minimum: -5, maximum: 20 }
};

const doubleDamageDice = (formula: string): string =>
  formula.replace(/(\d*)d(\d+)/i, (_token, countText: string, sides: string) => {
    const count = countText === "" ? 1 : Number.parseInt(countText, 10);
    return `${count * 2}d${sides}`;
  });

const buildChoices = (
  weapon: WeaponDefinition,
  critical: boolean
): FormulaChoice[] | undefined => {
  if (!weapon.damage || !weapon.versatileDamage) {
    return undefined;
  }

  const oneHand = critical ? doubleDamageDice(weapon.damage) : weapon.damage;
  const twoHands = critical ? doubleDamageDice(weapon.versatileDamage) : weapon.versatileDamage;
  return [
    { id: "one", label: "One hand", formula: `${oneHand}+3` },
    { id: "two", label: "Two hands", formula: `${twoHands}+3` }
  ];
};

const buildDamageModes = (weapon: WeaponDefinition): RuleRollMode[] => {
  if (!weapon.damage) {
    return [];
  }

  return [
    {
      id: "damage",
      label: "Damage",
      kind: "damage",
      formula: `${weapon.damage}+3`,
      modifierControl: { label: "Damage bonus", defaultValue: 3, minimum: -5, maximum: 20 },
      choices: buildChoices(weapon, false)
    },
    {
      id: "critical",
      label: "Critical",
      kind: "damage",
      formula: `${doubleDamageDice(weapon.damage)}+3`,
      modifierControl: { label: "Damage bonus", defaultValue: 3, minimum: -5, maximum: 20 },
      choices: buildChoices(weapon, true)
    }
  ];
};

const buildVariant = (
  weapon: WeaponDefinition,
  ruleset: RulesetId
): RuleCardVariant => {
  const damage = weapon.damage && weapon.damageType
    ? `${weapon.damage} ${weapon.damageType}`
    : "Special attack";
  const mastery = weapon.mastery ? ` • ${weapon.mastery}` : "";
  const details = [
    weapon.note,
    weapon.mastery ? masteryNotes[weapon.mastery] : undefined,
    weapon.damage ? "Critical mode doubles damage dice and adds the modifier once." : undefined
  ].filter(Boolean).join(" ");

  return {
    ruleset,
    source: "srd",
    sourceReference: ruleset === "srd-5.1-2014"
      ? "SRD 5.1 • Equipment: Weapons"
      : "SRD 5.2.1 • Equipment: Weapons",
    summary: `${damage} • ${weapon.properties}${mastery}`,
    detail: details || "Use the weapon's listed properties when resolving the attack.",
    tags: ["weapon"],
    modes: [attackMode, ...buildDamageModes(weapon)]
  };
};

const oldById = new Map(weaponCatalog2014.map((weapon) => [weapon.id, weapon]));
const newById = new Map(weaponCatalog2024.map((weapon) => [weapon.id, weapon]));
const allIds = [...new Set([...oldById.keys(), ...newById.keys()])];

export const weaponRuleCards: RuleCard[] = allIds.map((id) => {
  const oldWeapon = oldById.get(id);
  const newWeapon = newById.get(id);
  const display = newWeapon ?? oldWeapon!;

  return {
    id,
    name: display.name,
    kind: "weapon",
    imageEmoji: display.icon ?? "⚔️",
    variants: {
      ...(oldWeapon ? { "srd-5.1-2014": buildVariant(oldWeapon, "srd-5.1-2014") } : {}),
      ...(newWeapon ? { "srd-5.2.1-2024": buildVariant(newWeapon, "srd-5.2.1-2024") } : {})
    }
  };
});