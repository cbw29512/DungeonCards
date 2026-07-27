import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [
  gateway,
  app,
  dndShell,
  dndNavigation,
  cocShell,
  cocNavigation,
  cocRegistry,
  cocPages,
  cocHome,
  keeperRunSheet,
  investigationRunSheet,
  combatRunSheet,
  rules,
  sanity,
  combat,
  healing,
  magic,
  improvement,
  monsterFace,
  monsterParser,
  builder,
  builderDraft,
  builderPreview,
  diceCard,
  homebrewCss,
  applicationCss,
  baseCss,
  accessibilityCss,
  professionalCss,
  focusUtility
] = await Promise.all([
  readFile(new URL("../../src/components/GameSystemGateway.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/App.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/dndShell/DndAppShell.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/dndShell/DndNavigation.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cocShell/CocAppShell.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cocShell/CocNavigation.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cocShell/cocPageRegistry.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cocShell/CocPageContent.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/cocShell/CocHome.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/cocKeeperRunSheet.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/cocInvestigationRunSheet.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/cocCombatRunSheet.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocRulesGuide.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocSanityCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocCombatProcedureCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocHealingCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocMagicProcedureCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/CocImprovementCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/SrdMonsterEncounterFace.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/monsterCombatReference.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/HomebrewBuilder.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/hooks/useHomebrewCardDraft.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/HomebrewCardPreview.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DiceCard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/homebrew.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/application.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/base.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/accessibility.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/professional-polish.css", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/focusShellMainContent.ts", import.meta.url), "utf8")
]);

describe("DM Forge multi-system operating system", () => {
  it("offers D&D and Cthulhu from the gateway and keeps App focused on shell composition", () => {
    expect(gateway).toContain("What are you running tonight?");
    expect(gateway).toContain('onSelect("dnd-5e")');
    expect(gateway).toContain('onSelect("coc-7e")');
    expect(app).toContain("<DndAppShell");
    expect(app).toContain("<CocAppShell");
    expect(app).not.toContain("<DndHealthTracker");
    expect(app).not.toContain("<CocCombatProcedureCard");
  });

  it("gives Cthulhu independent routed card libraries and verified table procedures", () => {
    for (const page of ["investigator", "keeper", "rules", "equipment", "spells", "creatures", "encounters", "builders"]) {
      expect(cocRegistry).toContain(page);
    }
    expect(cocPages).toContain("<CocInvestigatorBuilder");
    expect(cocPages).toContain("<CocCombatProcedureCard");
    expect(cocPages).toContain("<CocHealingCard");
    expect(cocPages).toContain("<CocMagicProcedureCard");
    expect(cocPages).toContain("<CocImprovementCard");
    expect(keeperRunSheet).toContain("Prepare the mystery spine");
    expect(investigationRunSheet).toContain("Give the essential lead");
    expect(combatRunSheet).toContain("Use DEX order");
    expect(cocHome).toContain("card-centered Investigator and Keeper library");
    expect(rules.match(/title:/g)?.length).toBeGreaterThanOrEqual(25);
    expect(sanity).toContain("Any SAN loss causes a momentary involuntary action");
    expect(combat).toContain("Fighting Maneuver");
    expect(healing).toContain("Weekly Major Wound roll");
    expect(magic).toContain("Pay again and push");
    expect(improvement).toContain("Roll improvement");
  });

  it("builds every SRD monster around a structured combat face", () => {
    expect(monsterFace).toContain("buildMonsterCombatReference");
    expect(monsterFace).toContain("Combat Actions");
    expect(monsterFace).not.toContain("Reference Preview");
    expect(monsterParser).toContain("Saving Throws");
    expect(monsterParser).toContain("Damage Resistances");
    expect(monsterParser).toContain("prioritizedActions");
    expect(applicationCss).toContain('@import "./monster-combat-reference.css"');
  });

  it("renders the homebrew card as the user types", () => {
    expect(builder).toContain("useHomebrewCardDraft");
    expect(builder).toContain("<HomebrewCardPreview");
    expect(builderDraft).toContain("previewCard");
    expect(builderPreview).toContain("Updates as you type");
    expect(builderPreview).toContain("<DiceCard");
    expect(builderPreview).toContain("previewOnly");
    expect(diceCard).toContain("previewOnly?: boolean");
    expect(homebrewCss).toContain("homebrew-builder__workspace");
    expect(homebrewCss).toContain("homebrew-live-preview");
  });

  it("keeps both independent shells keyboard-, mobile-, print-, and reduced-motion-ready", () => {
    expect(dndShell).toContain('className="skip-link"');
    expect(dndShell).toContain('id="dnd-main-content"');
    expect(dndNavigation).toContain('aria-controls="dnd-primary-navigation"');
    expect(cocShell).toContain('className="skip-link skip-link--coc"');
    expect(cocShell).toContain('id="coc-main-content"');
    expect(cocNavigation).toContain('aria-controls="coc-primary-navigation"');
    expect(cocNavigation).toContain("navigation-toggle navigation-toggle--coc");
    expect(focusUtility).toContain("prefers-reduced-motion: reduce");
    expect(baseCss).toContain(".navigation-toggle");
    expect(baseCss).toContain(".top-nav__actions.is-open");
    expect(accessibilityCss).toContain('@import "./professional-polish.css"');
    expect(professionalCss).toContain(".coc-nav__links.is-open");
    expect(professionalCss).toContain("@media print");
    expect(professionalCss).toContain("width: min(100%, 300px)");
    expect(applicationCss).toContain('@import "./coc-reference-expansion.css"');
  });
});
