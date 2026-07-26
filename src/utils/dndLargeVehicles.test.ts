import { describe, expect, it } from "vitest";
import { dndLargeVehicleCatalog } from "../data/dndLargeVehicles";
import {
  calculateDndPassengerFare,
  calculateDndShipRepair,
  calculateDndVehicleManifest
} from "./dndLargeVehicles";

const vehicle = (id: string) => dndLargeVehicleCatalog.find((item) => item.id === id)!;

describe("D&D large vehicle operations", () => {
  it("validates 2024 crew, passenger, and cargo manifests", () => {
    expect(calculateDndVehicleManifest(
      vehicle("sailing-ship"),
      "srd-5.2.1-2024",
      20,
      20,
      100
    )).toMatchObject({
      available: true,
      crewRequirementMet: true,
      passengerCapacityMet: true,
      cargoCapacityMet: true
    });

    expect(calculateDndVehicleManifest(
      vehicle("keelboat"),
      "srd-5.2.1-2024",
      0,
      7,
      0.75
    )).toMatchObject({
      crewRequirementMet: false,
      passengerCapacityMet: false,
      cargoCapacityMet: false
    });
  });

  it("does not apply 2024 manifest statistics to 2014", () => {
    expect(calculateDndVehicleManifest(
      vehicle("warship"),
      "srd-5.1-2014",
      0,
      1000,
      1000
    )).toEqual({
      available: false,
      crewProvided: 0,
      passengersProvided: 1000,
      cargoTons: 1000,
      crewRequirementMet: undefined,
      passengerCapacityMet: undefined,
      cargoCapacityMet: undefined
    });
  });

  it("calculates hammock and private-cabin fares", () => {
    expect(calculateDndPassengerFare(
      vehicle("sailing-ship"),
      "srd-5.2.1-2024",
      10,
      2,
      3
    )).toMatchObject({
      available: true,
      maximumPrivatePassengers: 4,
      capacityMet: true,
      totalFareGp: 27
    });
  });

  it("uses five hammock spaces per private passenger", () => {
    expect(calculateDndPassengerFare(
      vehicle("keelboat"),
      "srd-5.2.1-2024",
      2,
      1,
      1
    ).capacityMet).toBe(false);
  });

  it("keeps unpublished passenger capacity unknown", () => {
    expect(calculateDndPassengerFare(
      vehicle("galley"),
      "srd-5.2.1-2024",
      10,
      1,
      1
    )).toMatchObject({
      available: true,
      maximumPrivatePassengers: undefined,
      capacityMet: undefined,
      totalFareGp: 7
    });
  });

  it("calculates 2024 ship repairs and blocks the procedure in 2014", () => {
    expect(calculateDndShipRepair("srd-5.2.1-2024", 10, false)).toEqual({
      available: true,
      hitPointsToRepair: 10,
      days: 10,
      costGp: 200,
      abundantSuppliesAndLabor: false
    });
    expect(calculateDndShipRepair("srd-5.2.1-2024", 10, true)).toMatchObject({ days: 5, costGp: 100 });
    expect(calculateDndShipRepair("srd-5.1-2014", 10, false)).toMatchObject({
      available: false,
      days: undefined,
      costGp: undefined
    });
  });
});
