import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DndPrivateCardLibrary } from "../DndPrivateCardLibrary";
import { PrivateCardLibraryWorkspace } from "./PrivateCardLibraryWorkspace";

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
});
