import { describe, expect, it } from "vitest";
import {
  getDndFullCasterSlots,
  getDndHalfCasterSlots2014,
  getDndHalfCasterSlots2024
} from "./dndCasterProgression";

describe("D&D caster slot progressions", () => {
  it("preserves the 2014 and 2024 half-caster level-one difference", () => {
    expect(getDndHalfCasterSlots2014(1)).toEqual({});
    expect(getDndHalfCasterSlots2024(1)).toEqual({ 1: 2 });
    expect(getDndHalfCasterSlots2014(2)).toEqual({ 1: 2 });
    expect(getDndHalfCasterSlots2024(2)).toEqual({ 1: 2 });
  });

  it("matches shared half-caster progression after level one", () => {
    for (let level = 2; level <= 20; level += 1) {
      expect(getDndHalfCasterSlots2024(level)).toEqual(getDndHalfCasterSlots2014(level));
    }
    expect(getDndHalfCasterSlots2014(20)).toEqual({ 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 });
  });

  it("returns independent slot objects and rejects invalid levels", () => {
    const slots = getDndFullCasterSlots(5);
    slots[1] = 0;
    expect(getDndFullCasterSlots(5)).toEqual({ 1: 4, 2: 3, 3: 2 });
    expect(() => getDndHalfCasterSlots2014(0)).toThrow(RangeError);
    expect(() => getDndHalfCasterSlots2024(21)).toThrow(RangeError);
  });
});
