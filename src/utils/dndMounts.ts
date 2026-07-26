import type { DndArmorDefinition } from "../types/dndArmor";
import type { RulesetId } from "../types/ruleCards";
import type {
  DndDrawnVehicleDefinition,
  DndMountDefinition
} from "../data/dndMounts";

export type DndMountTeamCalculation = {
  animalCount: number;
  teamCarryingCapacity: number;
  pulledWeightMaximum: number;
  vehicleWeight: number;
  cargoWeight: number;
  totalPulledWeight: number;
  maximumCargoWeight: number;
  remainingCapacityAfterLoad: number;
  withinPulledMaximum: boolean;
  animalPurchaseCostGp: number;
  vehiclePurchaseCostGp: number;
  totalPurchaseCostGp: number;
};

const normalizeCount = (value: number): number => Math.min(20, Math.max(1, Math.trunc(value) || 1));
const normalizeWeight = (value: number): number => Math.max(0, Number.isFinite(value) ? value : 0);

export const calculateDndMountTeam = ({
  mount,
  ruleset,
  animalCount,
  vehicle,
  cargoWeight
}: {
  mount: DndMountDefinition;
  ruleset: RulesetId;
  animalCount: number;
  vehicle: DndDrawnVehicleDefinition;
  cargoWeight: number;
}): DndMountTeamCalculation => {
  const count = normalizeCount(animalCount);
  const cargo = normalizeWeight(cargoWeight);
  const teamCarryingCapacity = mount.carryingCapacity[ruleset] * count;
  const pulledWeightMaximum = teamCarryingCapacity * 5;
  const totalPulledWeight = vehicle.weightPounds + cargo;
  const maximumCargoWeight = Math.max(0, pulledWeightMaximum - vehicle.weightPounds);
  const remainingCapacityAfterLoad = Math.max(0, pulledWeightMaximum - totalPulledWeight);
  const animalPurchaseCostGp = mount.costGp * count;

  return {
    animalCount: count,
    teamCarryingCapacity,
    pulledWeightMaximum,
    vehicleWeight: vehicle.weightPounds,
    cargoWeight: cargo,
    totalPulledWeight,
    maximumCargoWeight,
    remainingCapacityAfterLoad,
    withinPulledMaximum: totalPulledWeight <= pulledWeightMaximum,
    animalPurchaseCostGp,
    vehiclePurchaseCostGp: vehicle.costGp,
    totalPurchaseCostGp: animalPurchaseCostGp + vehicle.costGp
  };
};

export const calculateDndBarding = (armor: DndArmorDefinition) => ({
  armorId: armor.id,
  costGp: armor.costGp * 4,
  weightPounds: armor.weightPounds * 2
});
