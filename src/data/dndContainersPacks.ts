import type { RulesetId } from "../types/ruleCards";

export type DndContainerDefinition = {
  id: string;
  names: Record<RulesetId, string>;
  costCp: number;
  emptyWeightPounds?: number;
  capacity: Record<RulesetId, string>;
  weightCapacityPounds: Partial<Record<RulesetId, number>>;
  notes?: Partial<Record<RulesetId, string>>;
};

export type DndEquipmentPackDefinition = {
  id: string;
  names: Record<RulesetId, string>;
  costCp: Record<RulesetId, number>;
  totalWeightPounds: Partial<Record<RulesetId, number>>;
  contents: Record<RulesetId, string[]>;
};

export const dndContainerCatalog: DndContainerDefinition[] = [
  {
    id: "backpack",
    names: { "srd-5.1-2014": "Backpack", "srd-5.2.1-2024": "Backpack" },
    costCp: 200,
    emptyWeightPounds: 5,
    capacity: { "srd-5.1-2014": "1 cubic foot and up to 30 pounds of gear", "srd-5.2.1-2024": "1 cubic foot and up to 30 pounds" },
    weightCapacityPounds: { "srd-5.1-2014": 30, "srd-5.2.1-2024": 30 },
    notes: { "srd-5.1-2014": "A bedroll, rope, or similar item can be strapped to the outside.", "srd-5.2.1-2024": "Can also serve as a saddlebag." }
  },
  {
    id: "barrel",
    names: { "srd-5.1-2014": "Barrel", "srd-5.2.1-2024": "Barrel" },
    costCp: 200,
    emptyWeightPounds: 70,
    capacity: { "srd-5.1-2014": "40 gallons of liquid or 4 cubic feet of solid material", "srd-5.2.1-2024": "40 gallons of liquid or 4 cubic feet of dry goods" },
    weightCapacityPounds: {}
  },
  {
    id: "basket",
    names: { "srd-5.1-2014": "Basket", "srd-5.2.1-2024": "Basket" },
    costCp: 40,
    emptyWeightPounds: 2,
    capacity: { "srd-5.1-2014": "2 cubic feet and up to 40 pounds of gear", "srd-5.2.1-2024": "2 cubic feet and up to 40 pounds" },
    weightCapacityPounds: { "srd-5.1-2014": 40, "srd-5.2.1-2024": 40 }
  },
  {
    id: "bottle",
    names: { "srd-5.1-2014": "Bottle", "srd-5.2.1-2024": "Bottle, Glass" },
    costCp: 200,
    emptyWeightPounds: 2,
    capacity: { "srd-5.1-2014": "1½ pints of liquid", "srd-5.2.1-2024": "1½ pints" },
    weightCapacityPounds: {}
  },
  {
    id: "bucket",
    names: { "srd-5.1-2014": "Bucket", "srd-5.2.1-2024": "Bucket" },
    costCp: 5,
    emptyWeightPounds: 2,
    capacity: { "srd-5.1-2014": "3 gallons of liquid or ½ cubic foot of solid material", "srd-5.2.1-2024": "½ cubic foot of contents" },
    weightCapacityPounds: {}
  },
  {
    id: "bolt-case",
    names: { "srd-5.1-2014": "Case, Crossbow Bolt", "srd-5.2.1-2024": "Case, Crossbow Bolt" },
    costCp: 100,
    emptyWeightPounds: 1,
    capacity: { "srd-5.1-2014": "Up to 20 crossbow bolts", "srd-5.2.1-2024": "Up to 20 bolts" },
    weightCapacityPounds: {}
  },
  {
    id: "map-case",
    names: { "srd-5.1-2014": "Case, Map or Scroll", "srd-5.2.1-2024": "Case, Map or Scroll" },
    costCp: 100,
    emptyWeightPounds: 1,
    capacity: { "srd-5.1-2014": "Up to 10 rolled sheets of paper or 5 rolled sheets of parchment", "srd-5.2.1-2024": "Up to 10 sheets of paper or 5 sheets of parchment" },
    weightCapacityPounds: {}
  },
  {
    id: "chest",
    names: { "srd-5.1-2014": "Chest", "srd-5.2.1-2024": "Chest" },
    costCp: 500,
    emptyWeightPounds: 25,
    capacity: { "srd-5.1-2014": "12 cubic feet and up to 300 pounds of gear", "srd-5.2.1-2024": "12 cubic feet of contents" },
    weightCapacityPounds: { "srd-5.1-2014": 300 }
  },
  {
    id: "flask",
    names: { "srd-5.1-2014": "Flask or Tankard", "srd-5.2.1-2024": "Flask" },
    costCp: 2,
    emptyWeightPounds: 1,
    capacity: { "srd-5.1-2014": "1 pint of liquid", "srd-5.2.1-2024": "1 pint" },
    weightCapacityPounds: {}
  },
  {
    id: "jug",
    names: { "srd-5.1-2014": "Jug or Pitcher", "srd-5.2.1-2024": "Jug" },
    costCp: 2,
    emptyWeightPounds: 4,
    capacity: { "srd-5.1-2014": "1 gallon of liquid", "srd-5.2.1-2024": "1 gallon" },
    weightCapacityPounds: {}
  },
  {
    id: "pot",
    names: { "srd-5.1-2014": "Pot, Iron", "srd-5.2.1-2024": "Pot, Iron" },
    costCp: 200,
    emptyWeightPounds: 10,
    capacity: { "srd-5.1-2014": "1 gallon of liquid", "srd-5.2.1-2024": "1 gallon" },
    weightCapacityPounds: {}
  },
  {
    id: "pouch",
    names: { "srd-5.1-2014": "Pouch", "srd-5.2.1-2024": "Pouch" },
    costCp: 50,
    emptyWeightPounds: 1,
    capacity: { "srd-5.1-2014": "⅕ cubic foot and up to 6 pounds of gear", "srd-5.2.1-2024": "⅕ cubic foot and up to 6 pounds" },
    weightCapacityPounds: { "srd-5.1-2014": 6, "srd-5.2.1-2024": 6 }
  },
  {
    id: "quiver",
    names: { "srd-5.1-2014": "Quiver", "srd-5.2.1-2024": "Quiver" },
    costCp: 100,
    emptyWeightPounds: 1,
    capacity: { "srd-5.1-2014": "Up to 20 arrows", "srd-5.2.1-2024": "Up to 20 arrows" },
    weightCapacityPounds: {}
  },
  {
    id: "sack",
    names: { "srd-5.1-2014": "Sack", "srd-5.2.1-2024": "Sack" },
    costCp: 1,
    emptyWeightPounds: 0.5,
    capacity: { "srd-5.1-2014": "1 cubic foot and up to 30 pounds of gear", "srd-5.2.1-2024": "1 cubic foot and up to 30 pounds" },
    weightCapacityPounds: { "srd-5.1-2014": 30, "srd-5.2.1-2024": 30 }
  },
  {
    id: "vial",
    names: { "srd-5.1-2014": "Vial", "srd-5.2.1-2024": "Vial" },
    costCp: 100,
    capacity: { "srd-5.1-2014": "4 ounces of liquid", "srd-5.2.1-2024": "4 ounces" },
    weightCapacityPounds: {}
  },
  {
    id: "waterskin",
    names: { "srd-5.1-2014": "Waterskin", "srd-5.2.1-2024": "Waterskin" },
    costCp: 20,
    capacity: { "srd-5.1-2014": "4 pints of liquid", "srd-5.2.1-2024": "4 pints" },
    weightCapacityPounds: {},
    notes: {
      "srd-5.1-2014": "The listed 5-pound equipment weight is for a full waterskin; an empty-container weight is not published.",
      "srd-5.2.1-2024": "The listed 5-pound equipment weight is for a full waterskin; an empty-container weight is not published."
    }
  }
];

export const dndEquipmentPackCatalog: DndEquipmentPackDefinition[] = [
  {
    id: "burglar",
    names: { "srd-5.1-2014": "Burglar’s Pack", "srd-5.2.1-2024": "Burglar’s Pack" },
    costCp: { "srd-5.1-2014": 1600, "srd-5.2.1-2024": 1600 },
    totalWeightPounds: { "srd-5.2.1-2024": 42 },
    contents: {
      "srd-5.1-2014": ["Backpack", "1,000 ball bearings", "10 feet of string", "Bell", "5 candles", "Crowbar", "Hammer", "10 pitons", "Hooded lantern", "2 flasks of oil", "5 days of rations", "Tinderbox", "Waterskin", "50 feet of hempen rope strapped outside"],
      "srd-5.2.1-2024": ["Backpack", "Ball bearings", "Bell", "10 candles", "Crowbar", "Hooded lantern", "7 flasks of oil", "5 days of rations", "Rope", "Tinderbox", "Waterskin"]
    }
  },
  {
    id: "diplomat",
    names: { "srd-5.1-2014": "Diplomat’s Pack", "srd-5.2.1-2024": "Diplomat’s Pack" },
    costCp: { "srd-5.1-2014": 3900, "srd-5.2.1-2024": 3900 },
    totalWeightPounds: { "srd-5.2.1-2024": 39 },
    contents: {
      "srd-5.1-2014": ["Chest", "2 map or scroll cases", "Fine clothes", "Ink", "Ink pen", "Lamp", "2 flasks of oil", "5 sheets of paper", "Perfume", "Sealing wax", "Soap"],
      "srd-5.2.1-2024": ["Chest", "Fine clothes", "Ink", "5 ink pens", "Lamp", "2 map or scroll cases", "4 flasks of oil", "5 sheets of paper", "5 sheets of parchment", "Perfume", "Tinderbox"]
    }
  },
  {
    id: "dungeoneer",
    names: { "srd-5.1-2014": "Dungeoneer’s Pack", "srd-5.2.1-2024": "Dungeoneer’s Pack" },
    costCp: { "srd-5.1-2014": 1200, "srd-5.2.1-2024": 1200 },
    totalWeightPounds: { "srd-5.2.1-2024": 55 },
    contents: {
      "srd-5.1-2014": ["Backpack", "Crowbar", "Hammer", "10 pitons", "10 torches", "Tinderbox", "10 days of rations", "Waterskin", "50 feet of hempen rope strapped outside"],
      "srd-5.2.1-2024": ["Backpack", "Caltrops", "Crowbar", "2 flasks of oil", "10 days of rations", "Rope", "Tinderbox", "10 torches", "Waterskin"]
    }
  },
  {
    id: "entertainer",
    names: { "srd-5.1-2014": "Entertainer’s Pack", "srd-5.2.1-2024": "Entertainer’s Pack" },
    costCp: { "srd-5.1-2014": 4000, "srd-5.2.1-2024": 4000 },
    totalWeightPounds: { "srd-5.2.1-2024": 58.5 },
    contents: {
      "srd-5.1-2014": ["Backpack", "Bedroll", "2 costumes", "5 candles", "5 days of rations", "Waterskin", "Disguise kit"],
      "srd-5.2.1-2024": ["Backpack", "Bedroll", "Bell", "Bullseye lantern", "3 costumes", "Mirror", "8 flasks of oil", "9 days of rations", "Tinderbox", "Waterskin"]
    }
  },
  {
    id: "explorer",
    names: { "srd-5.1-2014": "Explorer’s Pack", "srd-5.2.1-2024": "Explorer’s Pack" },
    costCp: { "srd-5.1-2014": 1000, "srd-5.2.1-2024": 1000 },
    totalWeightPounds: { "srd-5.2.1-2024": 55 },
    contents: {
      "srd-5.1-2014": ["Backpack", "Bedroll", "Mess kit", "Tinderbox", "10 torches", "10 days of rations", "Waterskin", "50 feet of hempen rope strapped outside"],
      "srd-5.2.1-2024": ["Backpack", "Bedroll", "2 flasks of oil", "10 days of rations", "Rope", "Tinderbox", "10 torches", "Waterskin"]
    }
  },
  {
    id: "priest",
    names: { "srd-5.1-2014": "Priest’s Pack", "srd-5.2.1-2024": "Priest’s Pack" },
    costCp: { "srd-5.1-2014": 1900, "srd-5.2.1-2024": 3300 },
    totalWeightPounds: { "srd-5.2.1-2024": 29 },
    contents: {
      "srd-5.1-2014": ["Backpack", "Blanket", "10 candles", "Tinderbox", "Alms box", "2 blocks of incense", "Censer", "Vestments", "2 days of rations", "Waterskin"],
      "srd-5.2.1-2024": ["Backpack", "Blanket", "Holy water", "Lamp", "7 days of rations", "Robe", "Tinderbox"]
    }
  },
  {
    id: "scholar",
    names: { "srd-5.1-2014": "Scholar’s Pack", "srd-5.2.1-2024": "Scholar’s Pack" },
    costCp: { "srd-5.1-2014": 4000, "srd-5.2.1-2024": 4000 },
    totalWeightPounds: { "srd-5.2.1-2024": 22 },
    contents: {
      "srd-5.1-2014": ["Backpack", "Book of lore", "Ink", "Ink pen", "10 sheets of parchment", "Small bag of sand", "Small knife"],
      "srd-5.2.1-2024": ["Backpack", "Book", "Ink", "Ink pen", "Lamp", "10 flasks of oil", "10 sheets of parchment", "Tinderbox"]
    }
  }
];

export const dndContainerPackSourceByRuleset: Record<RulesetId, { url: string; reference: string }> = {
  "srd-5.1-2014": {
    url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment",
    reference: "Basic Rules 2014 · Equipment: Container Capacity and Equipment Packs"
  },
  "srd-5.2.1-2024": {
    url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment",
    reference: "Free Rules 2024 · Equipment: Adventuring Gear and Equipment Packs"
  }
};
