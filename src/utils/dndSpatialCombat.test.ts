import { describe, expect, it } from "vitest";
import {
  calculateDndGridDistanceFeet,
  calculateDndGridMovementFeet,
  dndCreatureSpaceSquares,
  doDndCreatureSpacesOverlap,
  parseDndActionDistanceRule,
  validateDndActionDistance,
  type DndGridPosition
} from "./dndSpatialCombat";

const position = (x: number, y: number, size: DndGridPosition["size"] = "Medium"): DndGridPosition => ({ x, y, size });

describe("D&D square-grid spatial calculations", () => {
  it("maps creature sizes to their grid footprints", () => {
    expect(dndCreatureSpaceSquares("Tiny")).toBe(1);
    expect(dndCreatureSpaceSquares("Medium")).toBe(1);
    expect(dndCreatureSpaceSquares("Large")).toBe(2);
    expect(dndCreatureSpaceSquares("Huge")).toBe(3);
    expect(dndCreatureSpaceSquares("Gargantuan")).toBe(4);
  });

  it("measures edge-to-edge range by the shortest grid route", () => {
    expect(calculateDndGridDistanceFeet(position(0, 0), position(1, 0))).toBe(5);
    expect(calculateDndGridDistanceFeet(position(0, 0), position(1, 1))).toBe(5);
    expect(calculateDndGridDistanceFeet(position(0, 0, "Large"), position(2, 0))).toBe(5);
    expect(calculateDndGridDistanceFeet(position(0, 0, "Huge"), position(4, 4))).toBe(10);
  });

  it("measures orthogonal and diagonal movement in five-foot segments", () => {
    expect(calculateDndGridMovementFeet(position(0, 0), position(4, 0))).toBe(20);
    expect(calculateDndGridMovementFeet(position(0, 0), position(4, 4))).toBe(20);
    expect(calculateDndGridMovementFeet(position(4, 4), position(1, 2))).toBe(15);
  });

  it("detects overlapping footprints without declaring table exceptions illegal", () => {
    expect(doDndCreatureSpacesOverlap(position(0, 0, "Large"), position(1, 1))).toBe(true);
    expect(doDndCreatureSpacesOverlap(position(0, 0, "Large"), position(2, 0))).toBe(false);
  });

  it("parses melee, normal-range, and long-range references", () => {
    expect(parseDndActionDistanceRule("reach 10 ft")).toEqual({ kind: "melee", normalFeet: 10 });
    expect(parseDndActionDistanceRule("range 80/320 ft.")).toEqual({ kind: "ranged", normalFeet: 80, longFeet: 320 });
    expect(parseDndActionDistanceRule("range 60 ft.")).toEqual({ kind: "ranged", normalFeet: 60, longFeet: undefined });
  });

  it("classifies melee reach and ranged distance bands", () => {
    expect(validateDndActionDistance(10, "reach 10 ft").status).toBe("melee-reach");
    expect(validateDndActionDistance(15, "reach 10 ft").status).toBe("out-of-range");
    expect(validateDndActionDistance(75, "range 80/320 ft.").status).toBe("normal-range");
    expect(validateDndActionDistance(120, "range 80/320 ft.").status).toBe("long-range");
    expect(validateDndActionDistance(325, "range 80/320 ft.").status).toBe("out-of-range");
    expect(validateDndActionDistance(30, undefined).status).toBe("manual-review");
  });
});