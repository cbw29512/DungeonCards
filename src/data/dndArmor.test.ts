import { describe, expect, it } from "vitest";
import { dndArmorCatalog, dndArmorEditionRules } from "./dndArmor";

describe("D&D armor source registry", () => {
  it("keeps armor IDs unique and the shared table complete", () => {
    expect(dndArmorCatalog).toHaveLength(12);
    expect(new Set(dndArmorCatalog.map((armor) => armor.id)).size).toBe(12);
    expect(dndArmorCatalog.every((armor) => armor.weightPounds > 0 && armor.costGp > 0)).toBe(true);
  });

  it("links both editions to official D&D Beyond rules", () => {
    for (const rules of Object.values(dndArmorEditionRules)) {
      expect(rules.armorSourceUrl).toMatch(/^https:\/\/www\.dndbeyond\.com\/sources\/dnd\//);
      expect(rules.carryingSourceUrl).toMatch(/^https:\/\/www\.dndbeyond\.com\/sources\/dnd\//);
    }
  });

  it("preserves shared armor timing and the shield action-language difference", () => {
    const oldRules = dndArmorEditionRules["srd-5.1-2014"];
    const newRules = dndArmorEditionRules["srd-5.2.1-2024"];
    expect(oldRules.categoryTiming).toEqual(newRules.categoryTiming);
    expect(oldRules.shieldTiming).toEqual({ don: "1 action", doff: "1 action" });
    expect(newRules.shieldTiming).toEqual({ don: "Utilize action", doff: "Utilize action" });
  });

  it("keeps the optional encumbrance variant in 2014 only", () => {
    expect(dndArmorEditionRules["srd-5.1-2014"].supportsVariantEncumbrance).toBe(true);
    expect(dndArmorEditionRules["srd-5.2.1-2024"].supportsVariantEncumbrance).toBe(false);
  });

  it("does not blend proficiency and training wording", () => {
    expect(dndArmorEditionRules["srd-5.1-2014"].armorTrainingSummary).toContain("ability checks, saving throws, and attack rolls");
    expect(dndArmorEditionRules["srd-5.2.1-2024"].armorTrainingSummary).toContain("D20 Tests");
    expect(dndArmorEditionRules["srd-5.2.1-2024"].shieldTrainingSummary).toContain("only if");
  });
});
