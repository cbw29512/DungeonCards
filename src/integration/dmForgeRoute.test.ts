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

  it("opens the health and death-state workspace directly", () => {
    expect(parseSystem("?system=dnd&page=health")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=health")).toBe("health");
    expect(dndRoute("health")).toBe("?system=dnd&page=health");
  });

  it("opens the live initiative and concentration tracker directly", () => {
    expect(parseSystem("?system=dnd&page=combat")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=combat")).toBe("combat");
    expect(dndRoute("combat")).toBe("?system=dnd&page=combat");
  });

  it("opens the pregen foundry directly", () => {
    expect(parseSystem("?system=dnd&page=pregens")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=pregens")).toBe("pregens");
    expect(dndRoute("pregens")).toBe("?system=dnd&page=pregens");
  });

  it("opens the 2024 Weapon Mastery workspace directly", () => {
    expect(parseSystem("?system=dnd&page=mastery")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=mastery")).toBe("mastery");
    expect(dndRoute("mastery")).toBe("?system=dnd&page=mastery");
  });

  it("opens the edition-separated Armor and Loadout workspace directly", () => {
    expect(parseSystem("?system=dnd&page=armor")).toBe("dnd-5e");
    expect(parseDndPage("?system=dnd&page=armor")).toBe("armor");
    expect(dndRoute("armor")).toBe("?system=dnd&page=armor");
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
