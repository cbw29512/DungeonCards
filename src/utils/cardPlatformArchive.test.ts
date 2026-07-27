import { describe, expect, it } from "vitest";
import { cocPreviewWeapon } from "../data/cocPreviewCatalog";
import { cocRuleSources } from "../data/cocRuleSources";
import { dndVaultReadyBuilds } from "../data/dndVaultReadyBuilds";
import {
  buildCardPlatformArchive,
  parseCardPlatformArchive,
  prepareCardPlatformImport,
  serializeCardPlatformArchive
} from "./cardPlatformArchive";
import {
  privateArchiveCard,
  publicArchiveCard,
  validArchiveFixture
} from "./cardPlatformArchiveFixtures";
import { MAX_CARD_PLATFORM_ARCHIVE_BYTES } from "./cardPlatformArchiveLimits";
import { adaptCocWeapon } from "./cardPlatformCocWeaponAdapter";
import { generateDndCharacterCardBundle } from "./dndCharacterCardGeneration";

const cloneFixture = () => structuredClone(validArchiveFixture());

describe("Card Platform versioned import and export", () => {
  it("serializes deterministically and round-trips one exact system", () => {
    const archive = buildCardPlatformArchive(cloneFixture());
    const first = serializeCardPlatformArchive(archive);
    const second = serializeCardPlatformArchive({
      ...archive,
      definitions: [...archive.definitions].reverse(),
      instances: [...archive.instances].reverse()
    });
    expect(second).toBe(first);
    const parsed = parseCardPlatformArchive(first, "dnd-2024");
    expect(parsed).toEqual(archive);
    expect(parsed.definitions.map((card) => card.id)).toEqual([
      privateArchiveCard.id,
      publicArchiveCard.id
    ].sort());
  });

  it("rejects wrong systems and broken graph references", () => {
    const archive = cloneFixture();
    expect(() => parseCardPlatformArchive(serializeCardPlatformArchive(archive), "dnd-2014"))
      .toThrow(/Expected dnd-2014 archive/i);
    archive.decks[0]!.cardDefinitionIds.push("missing-card");
    expect(() => serializeCardPlatformArchive(archive)).toThrow(/missing card/i);
  });

  it("rejects malformed, oversized, polluted, and lossy JSON", () => {
    expect(() => parseCardPlatformArchive("not-json")).toThrow(/not valid JSON/i);
    expect(() => parseCardPlatformArchive('{"__proto__":{"polluted":true}}')).toThrow(/forbidden object key/i);
    const oversized = JSON.stringify({ value: "x".repeat(MAX_CARD_PLATFORM_ARCHIVE_BYTES) });
    expect(() => parseCardPlatformArchive(oversized)).toThrow(/5 MB import limit/i);
    const lossy = cloneFixture();
    lossy.definitions[0]!.source.page = Number.NaN;
    expect(() => serializeCardPlatformArchive(lossy)).toThrow(/not JSON-safe/i);
  });

  it("never trusts archived owners during import preparation", () => {
    const archive = cloneFixture();
    expect(() => prepareCardPlatformImport(archive)).toThrow(/requires a target owner/i);
    const prepared = prepareCardPlatformImport(archive, "user-123");
    const publicInstance = prepared.instances.find((instance) => instance.definitionId === publicArchiveCard.id)!;
    const privateInstance = prepared.instances.find((instance) => instance.definitionId === privateArchiveCard.id)!;
    expect(publicInstance.ownerId).toBeUndefined();
    expect(privateInstance.ownerId).toBe("user-123");
    expect(() => prepareCardPlatformImport(archive, "bad owner/id")).toThrow(/owner ID is invalid/i);
  });

  it("exports a generated Character Vault deck without changing its cards", () => {
    const profile = dndVaultReadyBuilds.find((entry) => (
      entry.classId === "fighter" && entry.ruleset === "srd-5.2.1-2024" && entry.level === 1
    ));
    expect(profile).toBeDefined();
    const bundle = generateDndCharacterCardBundle(profile!);
    const archive = buildCardPlatformArchive({
      gameSystemId: bundle.gameSystemId,
      exportedAt: "2026-07-27T16:00:00.000Z",
      definitions: bundle.definitions,
      decks: [bundle.deck]
    });
    const parsed = parseCardPlatformArchive(serializeCardPlatformArchive(archive), "dnd-2024");
    expect(parsed.definitions).toEqual([...bundle.definitions].sort((a, b) => a.id.localeCompare(b.id)));
    expect(parsed.decks[0]?.cardDefinitionIds).toEqual(bundle.deck.cardDefinitionIds);
    expect(parsed.definitions.every((card) => card.print.sizeId === "poker-2.5x3.5")).toBe(true);
  });

  it("round-trips exact-system Call of Cthulhu cards", () => {
    const source = cocRuleSources.find((record) => record.id === "coc-original-weapon-preview");
    expect(source).toBeDefined();
    const definition = adaptCocWeapon(cocPreviewWeapon, { source });
    const archive = buildCardPlatformArchive({
      gameSystemId: "coc-7e",
      exportedAt: "2026-07-27T16:00:00.000Z",
      definitions: [definition]
    });
    const parsed = parseCardPlatformArchive(serializeCardPlatformArchive(archive), "coc-7e");
    expect(parsed.definitions[0]).toEqual(definition);
    expect(() => parseCardPlatformArchive(serializeCardPlatformArchive(archive), "dnd-2024"))
      .toThrow(/Expected dnd-2024 archive/i);
  });
});
