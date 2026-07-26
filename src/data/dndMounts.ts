import type { RulesetId } from "../types/ruleCards";

export type DndMountDefinition = {
  id: string;
  names: Record<RulesetId, string>;
  carryingCapacity: Record<RulesetId, number>;
  costGp: number;
  speedFeet2014?: number;
};

export type DndDrawnVehicleDefinition = {
  id: string;
  name: string;
  weightPounds: number;
  costGp: number;
};

export type DndSaddleDefinition = {
  id: string;
  name: string;
  weightPounds: number;
  costGp: number;
  rulesets: RulesetId[];
  note: string;
};

export const dndMountCatalog: DndMountDefinition[] = [
  { id: "camel", names: { "srd-5.1-2014": "Camel", "srd-5.2.1-2024": "Camel" }, carryingCapacity: { "srd-5.1-2014": 480, "srd-5.2.1-2024": 450 }, costGp: 50, speedFeet2014: 50 },
  { id: "elephant", names: { "srd-5.1-2014": "Elephant", "srd-5.2.1-2024": "Elephant" }, carryingCapacity: { "srd-5.1-2014": 1320, "srd-5.2.1-2024": 1320 }, costGp: 200, speedFeet2014: 40 },
  { id: "draft-horse", names: { "srd-5.1-2014": "Draft Horse", "srd-5.2.1-2024": "Horse, Draft" }, carryingCapacity: { "srd-5.1-2014": 540, "srd-5.2.1-2024": 540 }, costGp: 50, speedFeet2014: 40 },
  { id: "riding-horse", names: { "srd-5.1-2014": "Riding Horse", "srd-5.2.1-2024": "Horse, Riding" }, carryingCapacity: { "srd-5.1-2014": 480, "srd-5.2.1-2024": 480 }, costGp: 75, speedFeet2014: 60 },
  { id: "mastiff", names: { "srd-5.1-2014": "Mastiff", "srd-5.2.1-2024": "Mastiff" }, carryingCapacity: { "srd-5.1-2014": 195, "srd-5.2.1-2024": 195 }, costGp: 25, speedFeet2014: 40 },
  { id: "mule", names: { "srd-5.1-2014": "Donkey or Mule", "srd-5.2.1-2024": "Mule" }, carryingCapacity: { "srd-5.1-2014": 420, "srd-5.2.1-2024": 420 }, costGp: 8, speedFeet2014: 40 },
  { id: "pony", names: { "srd-5.1-2014": "Pony", "srd-5.2.1-2024": "Pony" }, carryingCapacity: { "srd-5.1-2014": 225, "srd-5.2.1-2024": 225 }, costGp: 30, speedFeet2014: 40 },
  { id: "warhorse", names: { "srd-5.1-2014": "Warhorse", "srd-5.2.1-2024": "Warhorse" }, carryingCapacity: { "srd-5.1-2014": 540, "srd-5.2.1-2024": 540 }, costGp: 400, speedFeet2014: 60 }
];

export const dndDrawnVehicleCatalog: DndDrawnVehicleDefinition[] = [
  { id: "carriage", name: "Carriage", weightPounds: 600, costGp: 100 },
  { id: "cart", name: "Cart", weightPounds: 200, costGp: 15 },
  { id: "chariot", name: "Chariot", weightPounds: 100, costGp: 250 },
  { id: "sled", name: "Sled", weightPounds: 300, costGp: 20 },
  { id: "wagon", name: "Wagon", weightPounds: 400, costGp: 35 }
];

export const dndSaddleCatalog: DndSaddleDefinition[] = [
  { id: "exotic", name: "Exotic Saddle", weightPounds: 40, costGp: 60, rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"], note: "Required for an aquatic or flying mount." },
  { id: "military", name: "Military Saddle", weightPounds: 30, costGp: 20, rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"], note: "Gives Advantage on checks made to remain mounted." },
  { id: "pack", name: "Pack Saddle", weightPounds: 15, costGp: 5, rulesets: ["srd-5.1-2014"], note: "Listed in the 2014 saddle table." },
  { id: "riding", name: "Riding Saddle", weightPounds: 25, costGp: 10, rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"], note: "Standard riding saddle." }
];

export const dndMountSourceByRuleset: Record<RulesetId, { url: string; reference: string }> = {
  "srd-5.1-2014": {
    url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment",
    reference: "Basic Rules 2014 · Equipment: Mounts and Vehicles"
  },
  "srd-5.2.1-2024": {
    url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment",
    reference: "Free Rules 2024 · Equipment: Mounts and Vehicles"
  }
};
