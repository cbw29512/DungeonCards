import type { DndLargeVehicleDefinition } from "../data/dndLargeVehicles";

export type DndVehicleManifest = {
  crewProvided: number;
  passengersProvided: number;
  cargoTons: number;
  crewRequirementMet?: boolean;
  passengerCapacityMet?: boolean;
  cargoCapacityMet?: boolean;
};

export type DndPassengerFare = {
  hammockPassengers: number;
  privatePassengers: number;
  days: number;
  maximumPrivatePassengers?: number;
  capacityMet?: boolean;
  totalFareGp: number;
};

export type DndShipRepair = {
  hitPointsToRepair: number;
  days: number;
  costGp: number;
  abundantSuppliesAndLabor: boolean;
};

const normalizeCount = (value: number): number => Math.max(0, Math.trunc(value) || 0);
const normalizeAmount = (value: number): number => Math.max(0, Number.isFinite(value) ? value : 0);

export const calculateDndVehicleManifest = (
  vehicle: DndLargeVehicleDefinition,
  crewProvided: number,
  passengersProvided: number,
  cargoTons: number
): DndVehicleManifest => {
  const stats = vehicle.stats2024;
  const crew = normalizeCount(crewProvided);
  const passengers = normalizeCount(passengersProvided);
  const cargo = normalizeAmount(cargoTons);
  return {
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
  hammockPassengers: number,
  privatePassengers: number,
  days: number
): DndPassengerFare => {
  const hammocks = normalizeCount(hammockPassengers);
  const privateCabins = normalizeCount(privatePassengers);
  const tripDays = normalizeAmount(days);
  const passengerCapacity = vehicle.stats2024?.passengers;
  const maximumPrivatePassengers = passengerCapacity === undefined
    ? undefined
    : Math.floor(passengerCapacity / 5);
  return {
    hammockPassengers: hammocks,
    privatePassengers: privateCabins,
    days: tripDays,
    maximumPrivatePassengers,
    capacityMet: passengerCapacity === undefined
      ? undefined
      : hammocks + (privateCabins * 5) <= passengerCapacity,
    totalFareGp: (hammocks * 0.5 * tripDays) + (privateCabins * 2 * tripDays)
  };
};

export const calculateDndShipRepair = (
  hitPointsToRepair: number,
  abundantSuppliesAndLabor: boolean
): DndShipRepair => {
  const hitPoints = normalizeCount(hitPointsToRepair);
  const multiplier = abundantSuppliesAndLabor ? 0.5 : 1;
  return {
    hitPointsToRepair: hitPoints,
    days: hitPoints * multiplier,
    costGp: hitPoints * 20 * multiplier,
    abundantSuppliesAndLabor
  };
};
