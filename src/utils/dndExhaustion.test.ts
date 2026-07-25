import { describe, expect, it } from "vitest";
import { dndConditions2014 } from "../data/dndConditions2014";
import { dndConditions2024 } from "../data/dndConditions2024";
import { describeDndExhaustion } from "./dndExhaustion";

describe("edition-separated D&D conditions and exhaustion", () => {
  it("provides the complete named condition set for both editions", () => {
    expect(dndConditions2014).toHaveLength(15);
    expect(dndConditions2024).toHaveLength(15);
    expect(dndConditions2014.map((item) => item.name)).toEqual(
      dndConditions2024.map((item) => item.name)
    );
  });

  it("keeps changed condition effects separated by edition", () => {
    const grappled2014 = dndConditions2014.find((item) => item.name === "Grappled")!;
    const grappled2024 = dndConditions2024.find((item) => item.name === "Grappled")!;
    const stunned2014 = dndConditions2014.find((item) => item.name === "Stunned")!;
    const stunned2024 = dndConditions2024.find((item) => item.name === "Stunned")!;
    const invisible2024 = dndConditions2024.find((item) => item.name === "Invisible")!;

    expect(grappled2014.effects.join(" ")).not.toContain("targets other than the grappler");
    expect(grappled2024.effects.join(" ")).toContain("targets other than the grappler");
    expect(stunned2014.effects.join(" ")).toContain("cannot move");
    expect(stunned2024.effects.join(" ")).not.toContain("Speed is 0");
    expect(invisible2024.effects.join(" ")).toContain("Advantage on Initiative");
  });

  it("calculates cumulative 2014 exhaustion levels", () => {
    const level4 = describeDndExhaustion("srd-5.1-2014", 4);
    expect(level4.effects).toHaveLength(4);
    expect(level4.effects).toContain("Speed is halved.");
    expect(level4.effects).toContain("Hit point maximum is halved.");
    expect(level4.isDead).toBe(false);
    expect(describeDndExhaustion("srd-5.1-2014", 6).isDead).toBe(true);
  });

  it("calculates 2024 d20 and Speed penalties", () => {
    const level3 = describeDndExhaustion("srd-5.2.1-2024", 3);
    expect(level3.d20Penalty).toBe(6);
    expect(level3.speedPenaltyFeet).toBe(15);
    expect(level3.effects).toContain("Subtract 6 from every d20 Test.");
    expect(describeDndExhaustion("srd-5.2.1-2024", 6).isDead).toBe(true);
  });

  it("clamps exhaustion to the legal zero-through-six range", () => {
    expect(describeDndExhaustion("srd-5.1-2014", -4).level).toBe(0);
    expect(describeDndExhaustion("srd-5.2.1-2024", 99).level).toBe(6);
  });
});
