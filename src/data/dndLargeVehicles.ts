import type { RulesetId } from "../types/ruleCards";

export type DndLargeVehicleStats2024 = {
  crew: number;
  passengers: number;
  cargoTons?: number;
  armorClass: number;
  hitPoints: number;
  damageThreshold?: number;
};

export type DndLargeVehicleDefinition = {
  id: string;
  name: string;
  rulesets: RulesetId[];
  speedMph: number;
  costGp: number;
  rowable: boolean;
  sailDriven: boolean;
  carriedWeightPounds?: number;
  stats2024?: DndLargeVehicleStats2024;
};

export const dndLargeVehicleCatalog: DndLargeVehicleDefinition[] = [
  {
    id: "airship",
    name: "Airship",
    rulesets: ["srd-5.2.1-2024"],
    speedMph: 8,
    costGp: 40000,
    rowable: false,
    sailDriven: false,
    stats2024: { crew: 10, passengers: 20, cargoTons: 1, armorClass: 13, hitPoints: 300 }
  },
  {
    id: "galley",
    name: "Galley",
    rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"],
    speedMph: 4,
    costGp: 30000,
    rowable: true,
    sailDriven: true,
    stats2024: { crew: 80, passengers: 0, cargoTons: 150, armorClass: 15, hitPoints: 500, damageThreshold: 20 }
  },
  {
    id: "keelboat",
    name: "Keelboat",
    rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"],
    speedMph: 1,
    costGp: 3000,
    rowable: true,
    sailDriven: true,
    stats2024: { crew: 1, passengers: 6, cargoTons: 0.5, armorClass: 15, hitPoints: 100, damageThreshold: 10 }
  },
  {
    id: "longship",
    name: "Longship",
    rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"],
    speedMph: 3,
    costGp: 10000,
    rowable: true,
    sailDriven: true,
    stats2024: { crew: 40, passengers: 150, cargoTons: 10, armorClass: 15, hitPoints: 300, damageThreshold: 15 }
  },
  {
    id: "rowboat",
    name: "Rowboat",
    rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"],
    speedMph: 1.5,
    costGp: 50,
    rowable: true,
    sailDriven: false,
    carriedWeightPounds: 100,
    stats2024: { crew: 1, passengers: 3, armorClass: 11, hitPoints: 50 }
  },
  {
    id: "sailing-ship",
    name: "Sailing Ship",
    rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"],
    speedMph: 2,
    costGp: 10000,
    rowable: false,
    sailDriven: true,
    stats2024: { crew: 20, passengers: 20, cargoTons: 100, armorClass: 15, hitPoints: 300, damageThreshold: 15 }
  },
  {
    id: "warship",
    name: "Warship",
    rulesets: ["srd-5.1-2014", "srd-5.2.1-2024"],
    speedMph: 2.5,
    costGp: 25000,
    rowable: false,
    sailDriven: true,
    stats2024: { crew: 60, passengers: 60, cargoTons: 200, armorClass: 15, hitPoints: 500, damageThreshold: 20 }
  }
];

export const dndLargeVehicleSourceByRuleset: Record<RulesetId, { url: string; reference: string }> = {
  "srd-5.1-2014": {
    url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment",
    reference: "Basic Rules 2014 · Equipment: Waterborne Vehicles"
  },
  "srd-5.2.1-2024": {
    url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment",
    reference: "Free Rules 2024 · Equipment: Airborne and Waterborne Vehicles"
  }
};
