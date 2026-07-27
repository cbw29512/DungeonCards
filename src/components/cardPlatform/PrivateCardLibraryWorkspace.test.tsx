import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { serializeCardPlatformArchive } from "../../utils/cardPlatformArchive";
import { validArchiveFixture } from "../../utils/cardPlatformArchiveFixtures";
import { previewPrivateLibraryImport } from "../../utils/privateCardLibraryImport";
import { DndPrivateCardLibrary } from "../DndPrivateCardLibrary";
import { PrivateCardLibraryBrowser } from "./PrivateCardLibraryBrowser";
import { PrivateCardLibraryWorkspace } from "./PrivateCardLibraryWorkspace";
import { PrivateLibraryImportPreview } from "./PrivateLibraryImportPreview";

describe("private Card Platform library workspaces", () => {
  it("renders a validation-only file selector and empty exact-system state", () => {
    const html = renderToStaticMarkup(<PrivateCardLibraryWorkspace gameSystemId="coc-7e" />);
    expect(html).toContain("Call of Cthulhu 7e · local-first");
    expect(html).toContain('accept=".json,application/json"');
    expect(html).toContain("Selection validates only");
    expect(html).toContain("No private cards saved for Call of Cthulhu 7e");
    expect(html).toContain("Built-in SRD and verified cards remain separate");
    expect(html).toContain("Export saved library");
    expect(html).toContain("disabled");
  });

  it("requires an explicit D&D edition before using the shared workspace", () => {
    const html = renderToStaticMarkup(<DndPrivateCardLibrary />);
    expect(html).toContain("Choose the D&amp;D library before importing");
    expect(html).toContain("D&amp;D 2014");
    expect(html).toContain("D&amp;D 2024");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("D&amp;D 2024 · local-first");
  });

  it("renders explicit replacement confirmation for a validated archive", () => {
    const current = validArchiveFixture();
    const preview = previewPrivateLibraryImport(
      "replacement.json",
      serializeCardPlatformArchive(current),
      "dnd-2024",
      "local-owner-test",
      current
    );
    const html = renderToStaticMarkup(
      <PrivateLibraryImportPreview
        onCancel={() => undefined}
        onCommit={() => undefined}
        onReplacementConfirmed={() => undefined}
        preview={preview}
        replacementConfirmed={false}
        replacing
      />
    );
    expect(html).toContain("Validated archive preview");
    expect(html).toContain("Replace the entire currently saved exact-system private library");
    expect(html).toContain("Replace private library");
    expect(html).toContain("disabled");
  });

  it("renders imported deck summaries, filters, and universal cards", () => {
    const html = renderToStaticMarkup(<PrivateCardLibraryBrowser library={validArchiveFixture()} />);
    expect(html).toContain("Archive Test Deck");
    expect(html).toContain("0 missing references");
    expect(html).toContain("All families");
    expect(html).toContain("All visibility");
    expect(html).toContain("card-platform-card");
  });
});
