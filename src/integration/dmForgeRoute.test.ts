import { describe, expect, it } from "vitest";
import {
  cocRoute,
  dndRoute,
  parseCocPage,
  parseDndPage,
  parseSystem
} from "./dmForgeRoute";

describe("DM Forge route contract", () => {
  it("opens direct D&D routes without exposing the system preview first", () => {
    expect(parseSystem("?system=dnd&page=compendium")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=compendium")).toBe("compendium");
  });

  it("opens the public rules coverage ledger directly", () => {
    expect(parseSystem("?system=dnd&page=coverage")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=coverage")).toBe("coverage");
    expect(dndRoute("coverage")).toBe("?system=dnd&page=coverage");
  });

  it("opens edition-separated D&D workspaces directly", () => {
    for (const page of ["conditions", "movement", "health", "combat", "pregens", "mastery", "armor", "catalog", "library"] as const) {
      expect(parseSystem(`?system=dnd&page=${page}`)).toBe("dnd-5e");
      expect(parseDndPage(`?system=dnd&page=${page}`)).toBe(page);
      expect(dndRoute(page)).toBe(`?system=dnd&page=${page}`);
    }
  });

  it("opens every independent Call of Cthulhu shell area directly", () => {
    for (const page of [
      "investigator", "keeper", "rules", "catalog", "equipment", "spells",
      "creatures", "encounters", "library", "builders", "sources"
    ] as const) {
      expect(parseSystem(`?system=coc&page=${page}`)).toBe("coc-7e");
      expect(parseCocPage(`?system=coc&page=${page}`)).toBe(page);
      expect(cocRoute(page)).toBe(`?system=coc&page=${page}`);
    }
  });

  it("accepts stable long-form system identifiers", () => {
    expect(parseSystem("?system=dnd-5e&page=monster")).toBe("dnd-5e");
    expect(parseSystem("?system=coc-7e&page=keeper")).toBe("coc-7e");
    expect(parseCocPage("?system=coc-7e&page=keeper")).toBe("keeper");
  });

  it("falls back safely for unknown pages and systems", () => {
    expect(parseSystem("?system=unknown")).toBeUndefined();
    expect(parseDndPage("?page=private-admin")).toBe("home");
    expect(parseCocPage("?page=private-admin")).toBe("home");
  });

  it("generates encoded, deterministic links", () => {
    expect(dndRoute("catalog")).toBe("?system=dnd&page=catalog");
    expect(cocRoute("catalog")).toBe("?system=coc&page=catalog");
  });
});
