import { describe, expect, it } from "vitest";
import { dndVaultReadyBuilds } from "../data/dndVaultReadyBuilds";
import { parseCardPlatformArchive } from "./cardPlatformArchive";
import { buildDndVaultCardArchiveDownload } from "./dndVaultCardArchive";

describe("Character Vault card archive download", () => {
  it("builds an exact-edition definitions-only archive", () => {
    const profile = dndVaultReadyBuilds.find((entry) => (
      entry.classId === "cleric" && entry.ruleset === "srd-5.1-2014" && entry.level === 5
    ));
    expect(profile).toBeDefined();
    const download = buildDndVaultCardArchiveDownload(profile!.id, "2026-07-27T16:00:00.000Z");
    expect(download.filename).toContain("dnd-2014");
    const archive = parseCardPlatformArchive(download.text, "dnd-2014");
    expect(archive.definitions).toHaveLength(download.cardCount);
    expect(archive.decks).toHaveLength(1);
    expect(archive.decks[0]?.kind).toBe("character");
    expect(archive.instances).toEqual([]);
    expect(archive.deckStates).toEqual([]);
    expect(archive.definitions.every((card) => card.gameSystemId === "dnd-2014")).toBe(true);
    expect(archive.definitions.every((card) => card.print.sizeId === "poker-2.5x3.5")).toBe(true);
  });

  it("rejects unknown immutable build IDs", () => {
    expect(() => buildDndVaultCardArchiveDownload("missing-build"))
      .toThrow(/build not found/i);
  });
});
