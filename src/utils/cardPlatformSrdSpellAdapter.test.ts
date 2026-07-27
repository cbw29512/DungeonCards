import { describe, expect, it } from "vitest";
import { srdSpells } from "../data/srdCompendium";
import { validateCardDefinition } from "./cardPlatformValidation";
import { adaptSrdSpell } from "./cardPlatformSrdSpellAdapter";

describe("SRD spell Card Platform adapter", () => {
  it("preserves exact edition, source page, casting procedure, and universal size", () => {
    for (const edition of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      const spell = srdSpells.find((candidate) => candidate.edition === edition);
      expect(spell).toBeDefined();
      const card = adaptSrdSpell(spell!);
      expect(card.gameSystemId).toBe(edition === "srd-5.1-2014" ? "dnd-2014" : "dnd-2024");
      expect(card.family).toBe("spell");
      expect(card.source.page).toBe(spell!.sourcePage);
      expect(card.actions.some((action) => action.label === `Cast ${spell!.name}`)).toBe(true);
      expect(card.print.sizeId).toBe("poker-2.5x3.5");
      expect(validateCardDefinition(card)).toEqual([]);
    }
  });
});
