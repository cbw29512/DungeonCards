import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [gateway, cthulhu, rules, builder, diceCard, homebrewCss, app] = await Promise.all([
  readFile(new URL("../../src/components/GameSystemGateway.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocPreview.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocRulesGuide.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/HomebrewBuilder.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DiceCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/homebrew.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/App.tsx", import.meta.url), "utf8")
]);

describe("DM Forge multi-system operating system", () => {
  it("offers D&D and Cthulhu from the gateway", () => {
    expect(gateway).toContain("What are you running tonight?");
    expect(gateway).toContain('onSelect("dnd-5e")');
    expect(gateway).toContain('onSelect("coc-7e")');
    expect(gateway).toContain("Cthulhu Keeper Tools");
  });

  it("gives the Cthulhu workspace substantial rules and session guidance", () => {
    expect(cthulhu).toContain('"investigation"');
    expect(cthulhu).toContain('"combat"');
    expect(cthulhu).toContain("keeperRunSheet");
    expect(cthulhu).toContain("investigationFlow");
    expect(cthulhu).toContain("combatRunSheet");
    expect(rules.match(/title:/g)?.length).toBeGreaterThanOrEqual(16);
    expect(app).toContain('import "./styles/coc-reference-expansion.css"');
  });

  it("renders the homebrew card as the user types", () => {
    expect(builder).toContain("previewCard");
    expect(builder).toContain("Updates as you type");
    expect(builder).toContain("<DiceCard");
    expect(builder).toContain("previewOnly");
    expect(diceCard).toContain("previewOnly?: boolean");
    expect(homebrewCss).toContain("homebrew-builder__workspace");
    expect(homebrewCss).toContain("homebrew-live-preview");
  });
});
