import { describe, expect, it } from "vitest";
import { dndRoute, parseDndPage, parseSystem } from "./dmForgeRoute";

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

  it("opens the edition-separated conditions workspace directly", () => {
    expect(parseSystem("?system=dnd&page=conditions")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=conditions")).toBe("conditions");
    expect(dndRoute("conditions")).toBe("?system=dnd&page=conditions");
  });

  it("opens the movement and special-actions workspace directly", () => {
    expect(parseSystem("?system=dnd&page=movement")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=movement")).toBe("movement");
    expect(dndRoute("movement")).toBe("?system=dnd&page=movement");
  });

  it("accepts stable long-form system identifiers", () => {
    expect(parseSystem("?system=dnd-5e&page=monster")).toBe("dnd-5e");
    expect(parseSystem("?system=coc-7e")).toBe("coc-7e");
  });

  it("falls back safely for unknown pages and systems", () => {
    expect(parseSystem("?system=unknown")).toBeUndefined();
    expect(parseDndPage("?page=private-admin")).toBe("home");
  });

  it("generates encoded, deterministic D&D links", () => {
    expect(dndRoute("monster-homebrew")).toBe("?system=dnd&page=monster-homebrew");
  });
});
