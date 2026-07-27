import { describe, expect, it } from "vitest";
import { publicArchiveCard } from "./cardPlatformArchiveFixtures";
import { buildCardCatalog } from "./cardCatalogBuild";

const card = (id: string, title: string) => ({
  ...publicArchiveCard,
  id,
  content: { ...publicArchiveCard.content, title }
});

describe("Card Catalog source assembly", () => {
  it("keeps immutable built-in definitions ahead of conflicting private imports", () => {
    const builtIn = card("catalog:shared", "Built-in Card");
    const imported = card("catalog:shared", "Imported Replacement");
    const catalog = buildCardCatalog("dnd-2024", [
      { id: "rules", label: "Rules", definitions: [builtIn] },
      { id: "private", label: "Private", definitions: [imported], privateImported: true }
    ]);
    expect(catalog.entries).toHaveLength(1);
    expect(catalog.entries[0]?.definition.content.title).toBe("Built-in Card");
    expect(catalog.issues.some((issue) => issue.message.includes("immutable Rules"))).toBe(true);
  });

  it("allows later private sources to replace the same private ID", () => {
    const first = card("catalog:private", "First Private Card");
    const second = card("catalog:private", "Second Private Card");
    const catalog = buildCardCatalog("dnd-2024", [
      { id: "private", label: "Private A", definitions: [first], privateImported: true },
      { id: "private", label: "Private B", definitions: [second], privateImported: true }
    ]);
    expect(catalog.entries[0]?.definition.content.title).toBe("Second Private Card");
    expect(catalog.issues).toHaveLength(0);
  });

  it("excludes wrong-system and invalid definitions without crashing valid sources", () => {
    const valid = card("catalog:valid", "Valid Card");
    const wrongSystem = { ...card("catalog:wrong", "Wrong Card"), gameSystemId: "dnd-2014" as const };
    const invalid = { ...card("unsafe id", "Invalid Card") };
    const catalog = buildCardCatalog("dnd-2024", [
      { id: "rules", label: "Rules", definitions: [valid, wrongSystem, invalid] }
    ]);
    expect(catalog.entries.map((entry) => entry.definition.id)).toEqual([valid.id]);
    expect(catalog.issues).toHaveLength(2);
    expect(catalog.sourceCounts.rules).toBe(1);
    expect(catalog.familyCounts.procedure).toBe(1);
  });
});
