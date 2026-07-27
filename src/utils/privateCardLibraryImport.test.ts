import { describe, expect, it, vi } from "vitest";
import { serializeCardPlatformArchive } from "./cardPlatformArchive";
import { validArchiveFixture } from "./cardPlatformArchiveFixtures";
import { MAX_CARD_PLATFORM_ARCHIVE_BYTES } from "./cardPlatformArchiveLimits";
import {
  countPrivateLibraryConflicts,
  previewPrivateLibraryImport,
  readPrivateLibraryArchiveFile,
  totalPrivateLibraryConflicts
} from "./privateCardLibraryImport";
import { createEmptyPrivateCardLibrary } from "./privateCardLibraryStorage";

const archiveText = () => serializeCardPlatformArchive(validArchiveFixture());

describe("private card library import preview", () => {
  it("enforces the selected exact system and rebinds ownership", () => {
    const preview = previewPrivateLibraryImport(
      "fighter-cards.json",
      archiveText(),
      "dnd-2024",
      "local-owner-test",
      createEmptyPrivateCardLibrary("dnd-2024")
    );
    expect(preview.archive.gameSystemId).toBe("dnd-2024");
    const privateInstance = preview.archive.instances.find((item) => item.definitionId.includes("private-card"));
    const publicInstance = preview.archive.instances.find((item) => item.definitionId.includes("public-card"));
    expect(privateInstance?.ownerId).toBe("local-owner-test");
    expect(publicInstance?.ownerId).toBeUndefined();
    expect(preview.privateDefinitionCount).toBe(1);
    expect(preview.privateInstanceCount).toBe(1);
    expect(totalPrivateLibraryConflicts(preview.conflicts)).toBe(0);
    expect(() => previewPrivateLibraryImport(
      "wrong-edition.json",
      archiveText(),
      "dnd-2014",
      "local-owner-test",
      createEmptyPrivateCardLibrary("dnd-2014")
    )).toThrow(/Expected dnd-2014 archive/i);
  });

  it("counts every conflicting graph ID before replacement", () => {
    const current = validArchiveFixture();
    const preview = previewPrivateLibraryImport(
      "replacement.json",
      archiveText(),
      "dnd-2024",
      "local-owner-test",
      current
    );
    expect(preview.conflicts).toEqual({
      definitions: current.definitions.length,
      instances: current.instances.length,
      decks: current.decks.length,
      deckStates: current.deckStates.length
    });
    expect(countPrivateLibraryConflicts(current, preview.archive)).toEqual(preview.conflicts);
  });

  it("rejects oversized files before reading their text", async () => {
    const text = vi.fn(async () => archiveText());
    const file = { size: MAX_CARD_PLATFORM_ARCHIVE_BYTES + 1, text } as unknown as File;
    await expect(readPrivateLibraryArchiveFile(file)).rejects.toThrow(/5 MB import limit/i);
    expect(text).not.toHaveBeenCalled();
  });

  it("reads files within the limit and leaves validation to the archive parser", async () => {
    const text = vi.fn(async () => archiveText());
    const file = { size: 100, text } as unknown as File;
    await expect(readPrivateLibraryArchiveFile(file)).resolves.toContain("dm-forge-card-platform");
    expect(text).toHaveBeenCalledOnce();
  });
});
