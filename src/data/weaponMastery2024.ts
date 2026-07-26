import type { WeaponDefinition } from "./weaponCatalogTypes";

export type WeaponMasteryName = NonNullable<WeaponDefinition["mastery"]>;

export type WeaponMasteryDefinition = {
  id: WeaponMasteryName;
  trigger: string;
  effect: string;
  limits: string[];
  oncePerTurn: boolean;
  requiresDamage: boolean;
  save?: "Constitution";
};

export const WEAPON_MASTERY_SOURCE_URL = "https://www.dndbeyond.com/sources/dnd/br-2024/equipment#MasteryProperties";
export const WEAPON_MASTERY_SOURCE_REFERENCE = "SRD 5.2.1 • Equipment: Mastery Properties • CC BY 4.0";

export const weaponMasteryDefinitions2024: Record<WeaponMasteryName, WeaponMasteryDefinition> = {
  Cleave: {
    id: "Cleave",
    trigger: "Hit a creature with a melee attack roll using the mastered weapon.",
    effect: "Make one melee attack with the weapon against a different creature within 5 feet of the first target and also within your reach. On a hit, deal the weapon's damage without adding a positive ability modifier; a negative modifier still applies.",
    limits: ["The extra attack is available only once per turn.", "The second target must satisfy both the 5-foot and weapon-reach requirements."],
    oncePerTurn: true,
    requiresDamage: false
  },
  Graze: {
    id: "Graze",
    trigger: "Miss a creature with an attack roll using the mastered weapon.",
    effect: "Deal damage equal to the ability modifier used for the attack roll. The damage has the weapon's damage type.",
    limits: ["This damage can be increased only by increasing that ability modifier."],
    oncePerTurn: false,
    requiresDamage: false
  },
  Nick: {
    id: "Nick",
    trigger: "Make the extra attack granted by the Light property.",
    effect: "Make that extra attack as part of the Attack action instead of using a Bonus Action.",
    limits: ["The Light-property extra attack can be made this way only once per turn."],
    oncePerTurn: true,
    requiresDamage: false
  },
  Push: {
    id: "Push",
    trigger: "Hit a creature with the mastered weapon.",
    effect: "Push the creature up to 10 feet straight away from yourself.",
    limits: ["The target must be Large or smaller."],
    oncePerTurn: false,
    requiresDamage: false
  },
  Sap: {
    id: "Sap",
    trigger: "Hit a creature with the mastered weapon.",
    effect: "The creature has Disadvantage on its next attack roll before the start of your next turn.",
    limits: ["The effect ends after that next attack roll or at the start of your next turn."],
    oncePerTurn: false,
    requiresDamage: false
  },
  Slow: {
    id: "Slow",
    trigger: "Hit a creature with the mastered weapon and deal damage to it.",
    effect: "Reduce the creature's Speed by 10 feet until the start of your next turn.",
    limits: ["Multiple hits from weapons with Slow do not reduce the creature's Speed by more than 10 feet."],
    oncePerTurn: false,
    requiresDamage: true
  },
  Topple: {
    id: "Topple",
    trigger: "Hit a creature with the mastered weapon.",
    effect: "The creature makes a Constitution saving throw. On a failed save, it gains the Prone condition.",
    limits: ["Save DC = 8 + the ability modifier used for the attack roll + your Proficiency Bonus."],
    oncePerTurn: false,
    requiresDamage: false,
    save: "Constitution"
  },
  Vex: {
    id: "Vex",
    trigger: "Hit a creature with the mastered weapon and deal damage to it.",
    effect: "Gain Advantage on your next attack roll against that creature before the end of your next turn.",
    limits: ["The Advantage applies only to your next attack roll against that same creature within the stated duration."],
    oncePerTurn: false,
    requiresDamage: true
  }
};

export const weaponMasteryOrder: WeaponMasteryName[] = [
  "Cleave",
  "Graze",
  "Nick",
  "Push",
  "Sap",
  "Slow",
  "Topple",
  "Vex"
];
