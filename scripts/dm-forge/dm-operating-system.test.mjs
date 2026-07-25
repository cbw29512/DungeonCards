import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [
  gateway,
  cthulhu,
  rules,
  sanity,
  combat,
  healing,
  magic,
  improvement,
  monsterFace,
  monsterParser,
  builder,
  diceCard,
  homebrewCss,
  baseCss,
  accessibilityCss,
  professionalCss,
  app
] = await Promise.all([
  readFile(new URL("../../src/components/GameSystemGateway.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocPreview.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocRulesGuide.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocSanityCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocCombatProcedureCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocHealingCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocMagicProcedureCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocImprovementCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/SrdMonsterEncounterFace.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/monsterCombatReference.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/HomebrewBuilder.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DiceCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/homebrew.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/base.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/accessibility.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/professional-polish.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/App.tsx", import.meta.url), "utf8")
]);

describe("DM Forge multi-system operating system", () => {
  it("offers D&D and Cthulhu from the gateway", () => {
    expect(gateway).toContain("What are you running tonight?");
    expect(gateway).toContain('onSelect("dnd-5e")');
    expect(gateway).toContain('onSelect("coc-7e")');
    expect(gateway).toContain("Cthulhu Keeper Tools");
  });

  it("gives the Cthulhu workspace verified table procedures", () => {
    expect(cthulhu).toContain('"investigation"');
    expect(cthulhu).toContain('"combat"');
    expect(cthulhu).toContain("keeperRunSheet");
    expect(cthulhu).toContain("investigationFlow");
    expect(cthulhu).toContain("combatRunSheet");
    expect(cthulhu).toContain("<CocCombatProcedureCard");
    expect(cthulhu).toContain("<CocHealingCard");
    expect(cthulhu).toContain("<CocMagicProcedureCard");
    expect(cthulhu).toContain("<CocImprovementCard");
    expect(rules.match(/title:/g)?.length).toBeGreaterThanOrEqual(25);
    expect(sanity).toContain("Any SAN loss causes a momentary involuntary action");
    expect(combat).toContain("Fighting Maneuver");
    expect(healing).toContain("Weekly Major Wound roll");
    expect(magic).toContain("Pay again and push");
    expect(improvement).toContain("Roll improvement");
    expect(app).toContain('import "./styles/coc-reference-expansion.css"');
  });

  it("builds every SRD monster around a structured combat face", () => {
    expect(monsterFace).toContain("buildMonsterCombatReference");
    expect(monsterFace).toContain("Combat Actions");
    expect(monsterFace).not.toContain("Reference Preview");
    expect(monsterParser).toContain("Saving Throws");
    expect(monsterParser).toContain("Damage Resistances");
    expect(monsterParser).toContain("prioritizedActions");
    expect(app).toContain('import "./styles/monster-combat-reference.css"');
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

  it("keeps both systems keyboard- and mobile-ready", () => {
    expect(app).toContain('className="skip-link"');
    expect(app).toContain('aria-controls="dnd-primary-navigation"');
    expect(app).toContain('className="navigation-toggle"');
    expect(app).toContain('id="dnd-main-content"');
    expect(app).toContain("prefers-reduced-motion: reduce");
    expect(cthulhu).toContain('className="skip-link skip-link--coc"');
    expect(cthulhu).toContain('aria-controls="coc-primary-navigation"');
    expect(cthulhu).toContain('navigation-toggle navigation-toggle--coc');
    expect(cthulhu).toContain('id="coc-main-content"');
    expect(baseCss).toContain(".navigation-toggle");
    expect(baseCss).toContain(".top-nav__actions.is-open");
    expect(accessibilityCss).toContain('@import "./professional-polish.css"');
    expect(professionalCss).toContain(".coc-nav__links.is-open");
    expect(professionalCss).toContain("@media print");
    expect(professionalCss).toContain("width: min(100%, 300px)");
  });
});
