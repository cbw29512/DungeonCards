export type ArmorRuleset = "dnd-2014" | "dnd-2024";
export type ArmorCategory = "Light" | "Medium" | "Heavy" | "Shield";

export type ArmorDefinition = {
  id: string;
  name: string;
  category: ArmorCategory;
  baseAc: number;
  dexterity: "full" | "max-2" | "none";
  strengthRequired?: number;
  stealthDisadvantage: boolean;
  weight: number;
  costGp: number;
};

export const armorCatalog: ArmorDefinition[] = [
  { id: "padded", name: "Padded Armor", category: "Light", baseAc: 11, dexterity: "full", stealthDisadvantage: true, weight: 8, costGp: 5 },
  { id: "leather", name: "Leather Armor", category: "Light", baseAc: 11, dexterity: "full", stealthDisadvantage: false, weight: 10, costGp: 10 },
  { id: "studded-leather", name: "Studded Leather Armor", category: "Light", baseAc: 12, dexterity: "full", stealthDisadvantage: false, weight: 13, costGp: 45 },
  { id: "hide", name: "Hide Armor", category: "Medium", baseAc: 12, dexterity: "max-2", stealthDisadvantage: false, weight: 12, costGp: 10 },
  { id: "chain-shirt", name: "Chain Shirt", category: "Medium", baseAc: 13, dexterity: "max-2", stealthDisadvantage: false, weight: 20, costGp: 50 },
  { id: "scale-mail", name: "Scale Mail", category: "Medium", baseAc: 14, dexterity: "max-2", stealthDisadvantage: true, weight: 45, costGp: 50 },
  { id: "breastplate", name: "Breastplate", category: "Medium", baseAc: 14, dexterity: "max-2", stealthDisadvantage: false, weight: 20, costGp: 400 },
  { id: "half-plate", name: "Half Plate Armor", category: "Medium", baseAc: 15, dexterity: "max-2", stealthDisadvantage: true, weight: 40, costGp: 750 },
  { id: "ring-mail", name: "Ring Mail", category: "Heavy", baseAc: 14, dexterity: "none", stealthDisadvantage: true, weight: 40, costGp: 30 },
  { id: "chain-mail", name: "Chain Mail", category: "Heavy", baseAc: 16, dexterity: "none", strengthRequired: 13, stealthDisadvantage: true, weight: 55, costGp: 75 },
  { id: "splint", name: "Splint Armor", category: "Heavy", baseAc: 17, dexterity: "none", strengthRequired: 15, stealthDisadvantage: true, weight: 60, costGp: 200 },
  { id: "plate", name: "Plate Armor", category: "Heavy", baseAc: 18, dexterity: "none", strengthRequired: 15, stealthDisadvantage: true, weight: 65, costGp: 1500 },
  { id: "shield", name: "Shield", category: "Shield", baseAc: 2, dexterity: "none", stealthDisadvantage: false, weight: 6, costGp: 10 }
];

export const armorSourceByRuleset: Record<ArmorRuleset, { reference: string; url: string }> = {
  "dnd-2014": {
    reference: "Basic Rules 2014 • Equipment: Armor and Shields",
    url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment#ArmorandShields"
  },
  "dnd-2024": {
    reference: "SRD 5.2.1 • Equipment: Armor • CC BY 4.0",
    url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment#Armor"
  }
};

export const armorTimingByRuleset: Record<ArmorRuleset, Record<ArmorCategory, string>> = {
  "dnd-2014": {
    Light: "Don 1 minute · Doff 1 minute",
    Medium: "Don 5 minutes · Doff 1 minute",
    Heavy: "Don 10 minutes · Doff 5 minutes",
    Shield: "Don 1 action · Doff 1 action"
  },
  "dnd-2024": {
    Light: "Don 1 minute · Doff 1 minute",
    Medium: "Don 5 minutes · Doff 1 minute",
    Heavy: "Don 10 minutes · Doff 5 minutes",
    Shield: "Utilize action to don or doff"
  }
};
