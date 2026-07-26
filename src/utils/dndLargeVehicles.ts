import type { DndLargeVehicleDefinition } from "../data/dndLargeVehicles";
import type { RulesetId } from "../types/ruleCards";

export type DndVehicleManifest = {
  available: boolean;
  crewProvided: number;
  passengersProvided: number;
  cargoTons: number;
  crewRequirementMet?: boolean;
  passengerCapacityMet?: boolean;
  cargoCapacityMet?: boolean;
};

export type DndPassengerFare = {
  available: boolean;
  hammockPassengers: number;
  privatePassengers: number;
  days: number;
  maximumPrivatePassengers?: number;
  capacityMet?: boolean;
  totalFareGp?: number;
};

export type DndShipRepair = {
  available: boolean;
  hitPointsToRepair: number;
  days?: number;
  costGp?: number;
  abundantSuppliesAndLabor: boolean;
};

const normalizeCount = (value: number): number => Math.max(0, Math.trunc(value) || 0);
const normalizeAmount = (value: number): number => Math.max(0, Number.isFinite(value) ? value : 0);

export const calculateDndVehicleManifest = (
  vehicle: DndLargeVehicleDefinition,
  ruleset: RulesetId,
  crewProvided: number,
  passengersProvided: number,
  cargoTons: number
): DndVehicleManifest => {
  const stats = ruleset === "srd-5.2.1-2024" ? vehicle.stats2024 : undefined;
  const crew = normalizeCount(crewProvided);
  const passengers = normalizeCount(passengersProvided);
  const cargo = normalizeAmount(cargoTons);
  return {
    available: Boolean(stats),
    crewProvided: crew,
    passengersProvided: passengers,
    cargoTons: cargo,
    crewRequirementMet: stats ? crew >= stats.crew : undefined,
    passengerCapacityMet: stats?.passengers === undefined ? undefined : passengers <= stats.passengers,
    cargoCapacityMet: stats?.cargoTons === undefined ? undefined : cargo <= stats.cargoTons
  };
};

export const calculateDndPassengerFare = (
  vehicle: DndLargeVehicleDefinition,
  ruleset: RulesetId,
  hammockPassengers: number,
  privatePassengers: number,
  days: number
): DndPassengerFare => {
  const hammocks = normalizeCount(hammockPassengers);
  const privateCabins = normalizeCount(privatePassengers);
  const tripDays = normalizeAmount(days);
  const passengerCapacity = ruleset === "srd-5.2.1-2024"
    ? vehicle.stats2024?.passengers
    : undefined;
  const available = ruleset === "srd-5.2.1-2024";
  const maximumPrivatePassengers = passengerCapacity === undefined
    ? undefined
    : Math.floor(passengerCapacity / 5);
  return {
    available,
    hammockPassengers: hammocks,
    privatePassengers: privateCabins,
    days: tripDays,
    maximumPrivatePassengers,
    capacityMet: passengerCapacity === undefined
      ? undefined
      : hammocks + (privateCabins * 5) <= passengerCapacity,
    totalFareGp: available ? (hammocks * 0.5 * tripDays) + (privateCabins * 2 * tripDays) : undefined
  };
};

export const calculateDndShipRepair = (
  ruleset: RulesetId,
  hitPointsToRepair: number,
  abundantSuppliesAndLabor: boolean
): DndShipRepair => {
  const hitPoints = normalizeCount(hitPointsToRepair);
  const available = ruleset === "srd-5.2.1-2024";
  const multiplier = abundantSuppliesAndLabor ? 0.5 : 1;
  return {
    available,
    hitPointsToRepair: hitPoints,
    days: available ? hitPoints * multiplier : undefined,
    costGp: available ? hitPoints * 20 * multiplier : undefined,
    abundantSuppliesAndLabor
  };
};
