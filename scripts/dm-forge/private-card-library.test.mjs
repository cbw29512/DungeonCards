import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [route, dndRegistry, cocRegistry, dndPage, cocPage, workspace, preview, browser, hook, storage, importer, standard, css] = await Promise.all([
  readFile(new URL("../../src/integration/dmForgeRoute.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/dndShell/dndPageRegistry.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cocShell/cocPageRegistry.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/dndShell/DndPageContent.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cocShell/CocPageContent.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cardPlatform/PrivateCardLibraryWorkspace.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cardPlatform/PrivateLibraryImportPreview.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cardPlatform/PrivateCardLibraryBrowser.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/hooks/usePrivateCardLibrary.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/privateCardLibraryStorage.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/privateCardLibraryImport.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/card-size-standard.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/private-card-library-browser.css", import.meta.url), "utf8")
]);

describe("system-safe private Card Platform libraries", () => {
  it("routes a first-class private library through both system shells", () => {
    expect(route).toContain('| "library"');
    expect(dndRegistry).toContain('library: "Private Card Library"');
    expect(cocRegistry).toContain('library: "Private Card Library"');
    expect(dndPage).toContain("<DndPrivateCardLibrary");
    expect(cocPage).toContain('<PrivateCardLibraryWorkspace gameSystemId="coc-7e"');
  });

  it("requires validation preview and explicit replacement confirmation", () => {
    expect(workspace).toContain("previewFile");
    expect(workspace).toContain("Selection validates only");
    expect(workspace).toContain("window.confirm");
    expect(preview).toContain("replacementConfirmed");
    expect(preview).toContain("Replace the entire currently saved exact-system private library");
    expect(preview).toContain("disabled={replacing && !replacementConfirmed}");
  });

  it("isolates storage and never trusts archived ownership", () => {
    expect(storage).toContain("${STORAGE_PREFIX}.${gameSystemId}");
    expect(importer).toContain("parseCardPlatformArchive(text, expectedGameSystemId)");
    expect(importer).toContain("prepareCardPlatformImport(parsed, targetOwnerId)");
    expect(hook).toContain("getOrCreateLocalPrivateLibraryOwner");
    expect(hook).toContain("The previous library was not changed");
  });

  it("searches imported cards and preserves the universal card shell", () => {
    expect(browser).toContain("filterPrivateLibraryCards");
    expect(browser).toContain("CardPlatformDefinitionCard");
    expect(browser).toContain("missing references");
    expect(standard).toContain(".card-platform-card");
    expect(css).toContain("var(--dm-card-print-width)");
    expect(css).not.toMatch(/\.card-platform-card\s*\{[^}]*width:\s*\d+px/s);
  });
});
