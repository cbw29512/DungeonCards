import { describe, expect, it } from "vitest";
import { cocPreviewCreature, cocPreviewSpell, cocPreviewWeapon } from "../data/cocPreviewCatalog";
import { cocQuickReferenceCards, cocRuleSources } from "../data/cocRuleSources";
import type { CocRuleSourceRecord } from "../types/coc";
import { adaptCocCreature } from "./cardPlatformCocCreatureAdapter";
import { adaptCocQuickReference } from "./cardPlatformCocReferenceAdapter";
import { adaptCocSpell } from "./cardPlatformCocSpellAdapter";
import { adaptCocWeapon } from "./cardPlatformCocWeaponAdapter";
import { validateCardDefinition } from "./cardPlatformValidation";

const source = (id: string): CocRuleSourceRecord => {
  const match = cocRuleSources.find((record) => record.id === id);
  if (!match) throw new Error(`Missing CoC adapter test source ${id}.`);
  return match;
};

describe("Call of Cthulhu Card Platform adapters", () => {
  it("adapts the original weapon with executable rolls and ammunition", () => {
    const card = adaptCocWeapon(cocPreviewWeapon, { source: source("coc-original-weapon-preview") });
    expect(card).toMatchObject({
      gameSystemId: "coc-7e",
      family: "weapon",
      visibility: "player-safe",
      source: { kind: "original" },
      review: { status: "draft" },
      print: { sizeId: "poker-2.5x3.5" }
    });
    expect(card.actions).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "attack-check", rollSystem: "percentile" }),
      expect.objectContaining({ id: "damage", formula: "1d10" })
    ]));
    expect(card.resources[0]).toMatchObject({ id: "ammunition", maximum: 6, initial: 6 });
    expect(validateCardDefinition(card)).toEqual([]);
  });

  it("adapts the original ritual with structured casting procedure", () => {
    const card = adaptCocSpell(cocPreviewSpell, { source: source("coc-original-spell-preview") });
    expect(card).toMatchObject({ gameSystemId: "coc-7e", family: "ritual", visibility: "game-master-only" });
    expect(card.actions).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "casting-check", rollSystem: "percentile" }),
      expect.objectContaining({ id: "sanity-cost", formula: "1d4" }),
      expect.objectContaining({ id: "casting-procedure", kind: "procedure" })
    ]));
    expect(validateCardDefinition(card)).toEqual([]);
  });

  it("adapts the original creature with independent HP and MP state", () => {
    const card = adaptCocCreature(cocPreviewCreature, { source: source("coc-original-creature-preview") });
    expect(card).toMatchObject({ gameSystemId: "coc-7e", family: "creature", visibility: "game-master-only" });
    expect(card.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "hit-points", maximum: 18, initial: 18 }),
      expect.objectContaining({ id: "magic-points", maximum: 12, initial: 12 })
    ]));
    expect(card.actions).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: expect.stringContaining("attack-"), rollSystem: "percentile" }),
      expect.objectContaining({ id: "sanity-loss", formula: "1d6" })
    ]));
    expect(validateCardDefinition(card)).toEqual([]);
  });

  it("adapts verified quick references and rejects mismatched sources", () => {
    const reference = cocQuickReferenceCards[0]!;
    const verifiedSource = source(reference.sourceId);
    const card = adaptCocQuickReference(reference, verifiedSource);
    expect(card).toMatchObject({
      gameSystemId: "coc-7e",
      family: "procedure",
      visibility: "player-safe",
      review: { status: "verified", reviewedAt: "2026-07-24" },
      source: { kind: "reference-only", publicDistributionAllowed: true }
    });
    expect(validateCardDefinition(card)).toEqual([]);
    expect(() => adaptCocQuickReference(reference, source("coc-sanity-check"))).toThrow(/does not match source/i);
  });
});
