import type { RulesetId } from "../types/ruleCards";

export type DndFieldGearCategory = "combat" | "hazard" | "restraint" | "utility" | "light";
export type DndFieldGearDcModel = "dexterity-plus-proficiency" | "proficiency-only" | "fixed";

export type DndFieldGearAttack = {
  kind: "ranged-attack" | "saving-throw";
  rangeFeet?: number;
  saveAbility?: "Strength" | "Dexterity";
  dcModel?: DndFieldGearDcModel;
  fixedDc?: number;
  damageFormula?: string;
  damageType?: "Acid" | "Fire" | "Piercing" | "Radiant";
  onFailure?: string;
  onSuccess?: string;
};

export type DndFieldGearLight = {
  brightFeet: number;
  dimAdditionalFeet: number;
  durationHours: number;
  shape: "radius" | "cone";
  fuel?: "Oil";
};

export type DndFieldGearRule = {
  action: string;
  procedure: string;
  attack?: DndFieldGearAttack;
  light?: DndFieldGearLight;
  duration?: string;
  repeat?: string;
};

export type DndFieldGearDefinition = {
  id: string;
  name: string;
  category: DndFieldGearCategory;
  costCp: number;
  weightPounds?: number;
  maximumUses?: number;
  rules: Record<RulesetId, DndFieldGearRule>;
};

export const dndFieldGearCatalog: DndFieldGearDefinition[] = [
  {
    id: "acid",
    name: "Acid",
    category: "combat",
    costCp: 2500,
    weightPounds: 1,
    rules: {
      "srd-5.1-2014": {
        action: "Action",
        procedure: "Throw the vial up to 20 feet as an improvised ranged weapon attack. On a hit, the target takes 2d6 Acid damage.",
        attack: { kind: "ranged-attack", rangeFeet: 20, damageFormula: "2d6", damageType: "Acid" }
      },
      "srd-5.2.1-2024": {
        action: "Replace one attack in the Attack action",
        procedure: "Target one creature within 20 feet. The target makes a Dexterity save against 8 + your Dexterity modifier + Proficiency Bonus, taking 2d6 Acid damage on a failed save.",
        attack: { kind: "saving-throw", rangeFeet: 20, saveAbility: "Dexterity", dcModel: "dexterity-plus-proficiency", damageFormula: "2d6", damageType: "Acid", onSuccess: "No damage" }
      }
    }
  },
  {
    id: "alchemists-fire",
    name: "Alchemist’s Fire",
    category: "combat",
    costCp: 5000,
    weightPounds: 1,
    rules: {
      "srd-5.1-2014": {
        action: "Action",
        procedure: "Throw the flask up to 20 feet as an improvised ranged weapon attack. On a hit, the target takes 1d4 Fire damage at the start of each of its turns.",
        attack: { kind: "ranged-attack", rangeFeet: 20, damageFormula: "1d4", damageType: "Fire" },
        repeat: "The target can use its action to make a DC 10 Dexterity check, ending the fire on a success."
      },
      "srd-5.2.1-2024": {
        action: "Replace one attack in the Attack action",
        procedure: "Target one creature within 20 feet. On a failed Dexterity save against 8 + your Dexterity modifier + Proficiency Bonus, it takes 1d4 Fire damage and catches fire.",
        attack: { kind: "saving-throw", rangeFeet: 20, saveAbility: "Dexterity", dcModel: "dexterity-plus-proficiency", damageFormula: "1d4", damageType: "Fire", onFailure: "Target catches fire", onSuccess: "No damage" },
        repeat: "At the end of each of its turns, the burning target takes 1d4 Fire damage and repeats the save, ending the effect on a success."
      }
    }
  },
  {
    id: "antitoxin",
    name: "Antitoxin",
    category: "utility",
    costCp: 5000,
    rules: {
      "srd-5.1-2014": {
        action: "Action",
        procedure: "Drink the vial. For 1 hour, you have Advantage on saving throws against poison. It gives no benefit to Constructs or Undead.",
        duration: "1 hour"
      },
      "srd-5.2.1-2024": {
        action: "Bonus Action",
        procedure: "Drink the vial. For 1 hour, you have Advantage on saving throws to avoid or end the Poisoned condition.",
        duration: "1 hour"
      }
    }
  },
  {
    id: "ball-bearings",
    name: "Ball Bearings",
    category: "hazard",
    costCp: 100,
    weightPounds: 2,
    rules: {
      "srd-5.1-2014": {
        action: "Action",
        procedure: "Cover a level 10-foot-square area within reach. A creature moving across it makes a DC 10 Dexterity save or falls Prone. Moving at half Speed avoids the save.",
        attack: { kind: "saving-throw", saveAbility: "Dexterity", dcModel: "fixed", fixedDc: 10, onFailure: "Prone", onSuccess: "No effect" }
      },
      "srd-5.2.1-2024": {
        action: "Utilize action",
        procedure: "Cover a level 10-foot-square area within 10 feet. A creature entering it for the first time on a turn makes a DC 10 Dexterity save or gains the Prone condition. Moving at half Speed avoids the save.",
        attack: { kind: "saving-throw", rangeFeet: 10, saveAbility: "Dexterity", dcModel: "fixed", fixedDc: 10, onFailure: "Prone", onSuccess: "No effect" }
      }
    }
  },
  {
    id: "caltrops",
    name: "Caltrops",
    category: "hazard",
    costCp: 100,
    weightPounds: 2,
    rules: {
      "srd-5.1-2014": {
        action: "Action",
        procedure: "Cover a 5-foot-square area within reach. A creature entering it makes a DC 15 Dexterity save or stops moving and takes 1 Piercing damage. Its walking Speed is reduced by 10 feet until it regains at least 1 HP. Moving at half Speed avoids the save.",
        attack: { kind: "saving-throw", saveAbility: "Dexterity", dcModel: "fixed", fixedDc: 15, damageFormula: "1", damageType: "Piercing", onFailure: "Stop moving; walking Speed −10 feet until at least 1 HP is regained", onSuccess: "No effect" }
      },
      "srd-5.2.1-2024": {
        action: "Utilize action",
        procedure: "Cover a 5-foot-square area within 5 feet. A creature entering it for the first time on a turn makes a DC 15 Dexterity save or takes 1 Piercing damage and has Speed 0 until the start of its next turn. Moving at half Speed avoids the save. Recovery takes 10 minutes.",
        attack: { kind: "saving-throw", rangeFeet: 5, saveAbility: "Dexterity", dcModel: "fixed", fixedDc: 15, damageFormula: "1", damageType: "Piercing", onFailure: "Speed 0 until the start of its next turn", onSuccess: "No effect" }
      }
    }
  },
  {
    id: "chain",
    name: "Chain",
    category: "restraint",
    costCp: 500,
    weightPounds: 10,
    rules: {
      "srd-5.1-2014": {
        action: "DM adjudication",
        procedure: "A chain has 10 HP and can be burst with a successful DC 20 Strength check. The 2014 equipment text does not publish the 2024 creature-binding procedure.",
        attack: { kind: "saving-throw", saveAbility: "Strength", dcModel: "fixed", fixedDc: 20, onFailure: "Chain holds", onSuccess: "Chain bursts" }
      },
      "srd-5.2.1-2024": {
        action: "Utilize action",
        procedure: "Wrap the chain around an unwilling creature within 5 feet that is Grappled, Incapacitated, or Restrained after a DC 13 Strength (Athletics) check. Bound legs make it Restrained.",
        repeat: "Escape: action and DC 18 Dexterity (Acrobatics). Burst: action and DC 20 Strength (Athletics)."
      }
    }
  },
  {
    id: "climbers-kit",
    name: "Climber’s Kit",
    category: "utility",
    costCp: 2500,
    weightPounds: 12,
    rules: {
      "srd-5.1-2014": {
        action: "Action",
        procedure: "Anchor yourself. While anchored, you can’t fall more than 25 feet from the anchor point and can’t climb more than 25 feet away without undoing the anchor."
      },
      "srd-5.2.1-2024": {
        action: "Utilize action",
        procedure: "Anchor yourself. You can’t fall more than 25 feet from the anchor or move more than 25 feet away without undoing it as a Bonus Action."
      }
    }
  },
  {
    id: "crowbar",
    name: "Crowbar",
    category: "utility",
    costCp: 200,
    weightPounds: 5,
    rules: {
      "srd-5.1-2014": { action: "Use with a Strength check", procedure: "Gain Advantage on Strength checks where the crowbar’s leverage can be applied." },
      "srd-5.2.1-2024": { action: "Use with a Strength check", procedure: "Gain Advantage on Strength checks where the crowbar’s leverage can be applied." }
    }
  },
  {
    id: "healers-kit",
    name: "Healer’s Kit",
    category: "utility",
    costCp: 500,
    weightPounds: 3,
    maximumUses: 10,
    rules: {
      "srd-5.1-2014": { action: "Action", procedure: "Expend one use to stabilize a creature at 0 HP without making a Wisdom (Medicine) check." },
      "srd-5.2.1-2024": { action: "Utilize action", procedure: "Expend one use to stabilize a creature at 0 HP without making a Wisdom (Medicine) check." }
    }
  },
  {
    id: "holy-water",
    name: "Holy Water",
    category: "combat",
    costCp: 2500,
    weightPounds: 1,
    rules: {
      "srd-5.1-2014": {
        action: "Action",
        procedure: "Splash a creature within 5 feet or throw the flask up to 20 feet as an improvised ranged weapon attack. On a hit, a Fiend or Undead takes 2d6 Radiant damage.",
        attack: { kind: "ranged-attack", rangeFeet: 20, damageFormula: "2d6", damageType: "Radiant" }
      },
      "srd-5.2.1-2024": {
        action: "Replace one attack in the Attack action",
        procedure: "Target one Fiend or Undead within 20 feet. It makes a Dexterity save against 8 + your Dexterity modifier + Proficiency Bonus, taking 2d8 Radiant damage on a failed save.",
        attack: { kind: "saving-throw", rangeFeet: 20, saveAbility: "Dexterity", dcModel: "dexterity-plus-proficiency", damageFormula: "2d8", damageType: "Radiant", onSuccess: "No damage" }
      }
    }
  },
  {
    id: "hunting-trap",
    name: "Hunting Trap",
    category: "hazard",
    costCp: 500,
    weightPounds: 25,
    rules: {
      "srd-5.1-2014": {
        action: "Action to set",
        procedure: "A creature stepping on the pressure plate makes a DC 13 Dexterity save or takes 1d4 Piercing damage and stops moving. It is limited by the chain until freed.",
        attack: { kind: "saving-throw", saveAbility: "Dexterity", dcModel: "fixed", fixedDc: 13, damageFormula: "1d4", damageType: "Piercing", onFailure: "Stops moving and is limited by the chain", onSuccess: "No effect" },
        repeat: "The trapped creature or an adjacent creature can use an action to make a DC 13 Strength check to free it. Each failed check deals 1 Piercing damage."
      },
      "srd-5.2.1-2024": {
        action: "Utilize action to set",
        procedure: "A creature entering the trap’s space makes a Strength save against 8 + your Proficiency Bonus or takes 1d4 Piercing damage and has Speed 0 until the start of its next turn.",
        attack: { kind: "saving-throw", saveAbility: "Strength", dcModel: "proficiency-only", damageFormula: "1d4", damageType: "Piercing", onFailure: "Speed 0 until the start of its next turn", onSuccess: "No effect" }
      }
    }
  },
  {
    id: "manacles",
    name: "Manacles",
    category: "restraint",
    costCp: 200,
    weightPounds: 6,
    rules: {
      "srd-5.1-2014": {
        action: "Action to bind a suitable creature",
        procedure: "Restrain a Small or Medium creature. Escape requires a successful DC 20 Dexterity check; bursting requires a successful DC 20 Strength check. Each set has one key, and thieves’ tools can pick the lock at DC 15. Manacles have 15 HP.",
        repeat: "Escape DC 20 Dexterity; burst DC 20 Strength; pick lock DC 15 Dexterity with thieves’ tools."
      },
      "srd-5.2.1-2024": {
        action: "Utilize action",
        procedure: "Bind an unwilling Small or Medium creature within 5 feet that is Grappled, Incapacitated, or Restrained after a DC 13 Dexterity (Sleight of Hand) check. The bound creature has Disadvantage on attack rolls and is Restrained if fixed to an immobile object.",
        repeat: "Escape: action and DC 20 Dexterity (Sleight of Hand). Burst: action and DC 25 Strength (Athletics). Pick lock: action and DC 15 Dexterity (Sleight of Hand) with thieves’ tools."
      }
    }
  },
  {
    id: "oil",
    name: "Oil",
    category: "combat",
    costCp: 10,
    weightPounds: 1,
    rules: {
      "srd-5.1-2014": {
        action: "Action",
        procedure: "Throw the flask up to 20 feet as an improvised ranged weapon attack. On a hit, the target is covered for 1 minute and takes 5 extra Fire damage the next time it takes Fire damage before the oil dries. Oil poured on a 5-foot square burns for 2 rounds and deals 5 Fire damage to a creature entering or ending its turn there.",
        attack: { kind: "ranged-attack", rangeFeet: 20, damageFormula: "5", damageType: "Fire" },
        duration: "1 minute on a target; 2 rounds when burned on the ground"
      },
      "srd-5.2.1-2024": {
        action: "Replace one attack, or Utilize to douse a space",
        procedure: "Throw at a creature or object within 20 feet. On a failed Dexterity save against 8 + your Dexterity modifier + Proficiency Bonus, it is covered for 1 minute and takes 5 extra Fire damage if ignited. Ground oil covers a 5-foot square within 5 feet and burns for 12 seconds, dealing 5 Fire damage once per turn to creatures entering or ending there.",
        attack: { kind: "saving-throw", rangeFeet: 20, saveAbility: "Dexterity", dcModel: "dexterity-plus-proficiency", damageFormula: "5", damageType: "Fire", onFailure: "Covered in oil for 1 minute", onSuccess: "Not covered" },
        duration: "1 minute on a target; 12 seconds on the ground"
      }
    }
  },
  {
    id: "portable-ram",
    name: "Portable Ram",
    category: "utility",
    costCp: 400,
    weightPounds: 35,
    rules: {
      "srd-5.1-2014": { action: "Use with a Strength check to break a door", procedure: "Add +4 to the Strength check. One other creature can help, giving Advantage on the check." },
      "srd-5.2.1-2024": { action: "Use with a Strength check to break a door", procedure: "Add +4 to the Strength check. One other creature can help, giving Advantage on the check." }
    }
  },
  {
    id: "rope",
    name: "Rope",
    category: "restraint",
    costCp: 100,
    weightPounds: 5,
    rules: {
      "srd-5.1-2014": {
        action: "DM adjudication",
        procedure: "Rope has 2 HP and can be burst with a successful DC 17 Strength check. The 2014 equipment text does not publish the 2024 knot and creature-binding procedure.",
        attack: { kind: "saving-throw", saveAbility: "Strength", dcModel: "fixed", fixedDc: 17, onFailure: "Rope holds", onSuccess: "Rope bursts" }
      },
      "srd-5.2.1-2024": {
        action: "Utilize action",
        procedure: "Tie a knot with a DC 10 Dexterity (Sleight of Hand) check. Bind an unwilling creature only if it is Grappled, Incapacitated, or Restrained; bound legs make it Restrained.",
        repeat: "Escape: action and DC 15 Dexterity (Acrobatics). Burst: action and DC 20 Strength (Athletics)."
      }
    }
  },
  {
    id: "candle",
    name: "Candle",
    category: "light",
    costCp: 1,
    rules: {
      "srd-5.1-2014": { action: "Light with a tinderbox", procedure: "Burns for 1 hour.", light: { brightFeet: 5, dimAdditionalFeet: 5, durationHours: 1, shape: "radius" } },
      "srd-5.2.1-2024": { action: "Light with a tinderbox", procedure: "Burns for 1 hour.", light: { brightFeet: 5, dimAdditionalFeet: 5, durationHours: 1, shape: "radius" } }
    }
  },
  {
    id: "lamp",
    name: "Lamp",
    category: "light",
    costCp: 50,
    weightPounds: 1,
    rules: {
      "srd-5.1-2014": { action: "Light with a tinderbox", procedure: "One flask of Oil fuels 6 total hours of use.", light: { brightFeet: 15, dimAdditionalFeet: 30, durationHours: 6, shape: "radius", fuel: "Oil" } },
      "srd-5.2.1-2024": { action: "Bonus Action to light with a tinderbox", procedure: "One flask of Oil fuels 6 total hours and can be extinguished and relit until consumed.", light: { brightFeet: 15, dimAdditionalFeet: 30, durationHours: 6, shape: "radius", fuel: "Oil" } }
    }
  },
  {
    id: "bullseye-lantern",
    name: "Bullseye Lantern",
    category: "light",
    costCp: 1000,
    weightPounds: 2,
    rules: {
      "srd-5.1-2014": { action: "Light with a tinderbox", procedure: "One flask of Oil fuels 6 hours.", light: { brightFeet: 60, dimAdditionalFeet: 60, durationHours: 6, shape: "cone", fuel: "Oil" } },
      "srd-5.2.1-2024": { action: "Bonus Action to light with a tinderbox", procedure: "One flask of Oil fuels 6 total hours.", light: { brightFeet: 60, dimAdditionalFeet: 60, durationHours: 6, shape: "cone", fuel: "Oil" } }
    }
  },
  {
    id: "hooded-lantern",
    name: "Hooded Lantern",
    category: "light",
    costCp: 500,
    weightPounds: 2,
    rules: {
      "srd-5.1-2014": { action: "Action to lower or raise the hood", procedure: "One flask of Oil fuels 6 hours. Lowering the hood reduces the light to Dim Light in a 5-foot radius.", light: { brightFeet: 30, dimAdditionalFeet: 30, durationHours: 6, shape: "radius", fuel: "Oil" } },
      "srd-5.2.1-2024": { action: "Bonus Action to lower or raise the hood", procedure: "One flask of Oil fuels 6 total hours. Lowering the hood reduces the light to Dim Light in a 5-foot radius.", light: { brightFeet: 30, dimAdditionalFeet: 30, durationHours: 6, shape: "radius", fuel: "Oil" } }
    }
  },
  {
    id: "tinderbox",
    name: "Tinderbox",
    category: "utility",
    costCp: 50,
    weightPounds: 1,
    rules: {
      "srd-5.1-2014": { action: "Action", procedure: "Light a torch or anything else with abundant exposed fuel. Lighting another fire takes 1 minute." },
      "srd-5.2.1-2024": { action: "Bonus Action", procedure: "Light a candle, lamp, lantern, torch, or exposed fuel. Lighting any other fire takes 1 minute." }
    }
  },
  {
    id: "torch",
    name: "Torch",
    category: "light",
    costCp: 1,
    weightPounds: 1,
    rules: {
      "srd-5.1-2014": { action: "Light with a tinderbox", procedure: "Burns for 1 hour. An improvised melee attack with a burning torch deals 1 Fire damage on a hit.", attack: { kind: "ranged-attack", damageFormula: "1", damageType: "Fire" }, light: { brightFeet: 20, dimAdditionalFeet: 20, durationHours: 1, shape: "radius" } },
      "srd-5.2.1-2024": { action: "Bonus Action to light with a tinderbox", procedure: "Burns for 1 hour. It is a Simple Melee weapon that deals 1 Fire damage on a hit.", attack: { kind: "ranged-attack", damageFormula: "1", damageType: "Fire" }, light: { brightFeet: 20, dimAdditionalFeet: 20, durationHours: 1, shape: "radius" } }
    }
  }
];

export const dndFieldGearSourceByRuleset: Record<RulesetId, { url: string; reference: string }> = {
  "srd-5.1-2014": {
    url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment",
    reference: "Basic Rules 2014 · Equipment: Adventuring Gear"
  },
  "srd-5.2.1-2024": {
    url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment",
    reference: "Free Rules 2024 · Equipment: Adventuring Gear"
  }
};
