import { describe, expect, it } from "vitest";
import { dndRoute, parseDndPage, parseSystem } from "./dmForgeRoute";

describe("DM Forge route contract", () => {
  it("opens direct D&D routes without exposing the system preview first", () => {
    expect(parseSystem("?system=dnd&page=compendium")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=compendium")).toBe("compendium");
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
