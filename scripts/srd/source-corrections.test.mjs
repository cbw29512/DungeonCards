import { describe, expect, it } from "vitest";
import { applySpellSourceCorrections } from "./source-corrections.mjs";

const spell = (edition, name, overrides = {}) => ({
  edition,
  name,
  description: "The spells ends.",
  higherLevels: "",
  ...overrides
});

describe("documented SRD PDF source corrections", () => {
  it("repairs the clipped 2014 Animal Friendship scaling sentence", () => {
    const [corrected] = applySpellSourceCorrections([
      spell("srd-5.1-2014", "Animal Friendship", {
        higherLevels: "At Higher Levels. You can affect one additional beast t level above 1st."
      })
    ]);

    expect(corrected.description).toContain("The spell ends");
    expect(corrected.higherLevels).toContain("for each slot level above 1st");
  });

  it("repairs the 2014 Animal Messenger ordinal", () => {
    const [corrected] = applySpellSourceCorrections([
      spell("srd-5.1-2014", "Animal Messenger", {
        higherLevels: "Use a spell slot of 3nd level or higher."
      })
    ]);

    expect(corrected.higherLevels).toContain("3rd level or higher");
    expect(corrected.higherLevels).not.toContain("3nd");
  });

  it("does not change unrelated records", () => {
    const original = spell("srd-5.1-2014", "Aid", {
      description: "Three creatures gain additional hit points."
    });
    expect(applySpellSourceCorrections([original])[0]).toEqual(original);
  });
});
