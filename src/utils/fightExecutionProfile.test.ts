import { describe, expect, it } from "vitest";
import { parseSrdInitiativeBonus } from "./fightExecutionProfile";

describe("Fight execution profile", () => {
  it("parses interleaved labeled SRD ability rows", () => {
    expect(parseSrdInitiativeBonus("STR 18 (+4) DEX 11 (+0) CON 16 (+3) INT 6 (-2) WIS 16 (+3) CHA 9 (-1)"))
      .toBe(0);
  });

  it("parses SRD ability headers followed by values", () => {
    expect(parseSrdInitiativeBonus("STR DEX CON INT WIS CHA 18 (+4) 14 (+2) 16 (+3) 6 (-2) 12 (+1) 8 (-1)"))
      .toBe(2);
  });

  it("supports unicode minus signs without inventing a fallback", () => {
    expect(parseSrdInitiativeBonus("STR 8 (−1) DEX 6 (−2) CON 10 (+0) INT 4 (−3) WIS 8 (−1) CHA 5 (−3)"))
      .toBe(-2);
    expect(parseSrdInitiativeBonus("No ability scores here")).toBeUndefined();
  });
});
