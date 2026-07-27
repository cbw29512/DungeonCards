import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const standard = read("src/styles/card-size-standard.css");
const accessibility = read("src/styles/accessibility.css");
const diceCards = read("src/styles/cards.css");
const ruleCards = read("src/styles/rule-cards.css");
const monsterCards = read("src/styles/monster-card-flip.css");
const documentation = read("docs/CARD_SIZE_STANDARD.md");

describe("DM Forge universal card size", () => {
  it("locks the approved screen and print dimensions", () => {
    expect(standard).toContain("--dm-card-screen-width: 250px;");
    expect(standard).toContain("--dm-card-screen-height: 350px;");
    expect(standard).toContain("--dm-card-aspect-ratio: 5 / 7;");
    expect(standard).toContain("--dm-card-print-width: 2.5in;");
    expect(standard).toContain("--dm-card-print-height: 3.5in;");
  });

  it("loads the standard after the other shared polish rules", () => {
    expect(accessibility).toContain('@import "./professional-polish.css";');
    expect(accessibility).toContain('@import "./card-size-standard.css";');
    expect(accessibility.indexOf("card-size-standard.css")).toBeGreaterThan(
      accessibility.indexOf("professional-polish.css")
    );
  });

  it.each([
    ".dice-card",
    ".rule-card",
    ".monster-card-flip",
    ".srd-reference-card",
    ".coc-card"
  ])("covers the %s card family", (selector) => {
    expect(standard).toContain(selector);
  });

  it("removes the legacy dice and rule card dimensions", () => {
    expect(diceCards).not.toMatch(/min-height:\s*330px/);
    expect(ruleCards).not.toMatch(/230px|322px/);
    expect(diceCards).toContain("var(--dm-card-screen-width)");
    expect(ruleCards).toContain("var(--dm-card-screen-height)");
    expect(monsterCards).toContain("var(--dm-card-aspect-ratio)");
  });

  it("uses the shared print dimensions instead of a separate card size", () => {
    expect(standard).toContain("width: var(--dm-card-print-width) !important;");
    expect(standard).toContain("height: var(--dm-card-print-height) !important;");
  });

  it("documents that oversized content becomes cards, folios, or panels", () => {
    expect(documentation).toContain("250px");
    expect(documentation).toContain("2.5in × 3.5in");
    expect(documentation).toContain("must not stretch the card");
  });
});
