import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const occurrences = (source, token) => source.split(token).length - 1;

const routeBlock = (source, page, nextPage) => {
  const startToken = `if (activePage === "${page}")`;
  const start = source.indexOf(startToken);
  if (start < 0) throw new Error(`Route block not found: ${page}`);
  if (!nextPage) return source.slice(start);
  const end = source.indexOf(`if (activePage === "${nextPage}")`, start + startToken.length);
  return source.slice(start, end < 0 ? undefined : end);
};

const exportBlock = (source, name) => {
  const start = source.indexOf(`export const ${name}`);
  if (start < 0) throw new Error(`Export block not found: ${name}`);
  const end = source.indexOf(";", start);
  return source.slice(start, end + 1);
};

const quotedValues = (source) => [...source.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
const objectValues = (source) => [...source.matchAll(/(?:^|\n)\s*(?:"[^"]+"|[A-Za-z0-9_-]+)\s*:\s*"([^"]+)"/g)]
  .map((match) => match[1]);

const cocRegistry = read("src/components/cocShell/cocPageRegistry.ts");
const dndRegistry = read("src/components/dndShell/dndPageRegistry.ts");
const cocHome = read("src/components/cocShell/CocHome.tsx");
const dndHome = read("src/components/dndShell/DndHome.tsx");
const cocPages = read("src/components/cocShell/CocPageContent.tsx");
const cocCatalog = read("src/components/CocCardCatalog.tsx");
const dndCatalog = read("src/components/DndCardCatalog.tsx");
const investigatorLibrary = read("src/components/CocInvestigatorLibrary.tsx");
const investigatorDossier = read("src/components/CocInvestigatorDossier.tsx");
const equipmentLibrary = read("src/components/CocEquipmentLibrary.tsx");
const ritualLibrary = read("src/components/CocRitualLibrary.tsx");

describe("duplicate-free routed pages", () => {
  it("keeps every navigation destination and label unique", () => {
    const cocPagesList = quotedValues(exportBlock(cocRegistry, "cocNavigationPages"));
    const cocLabels = objectValues(exportBlock(cocRegistry, "cocPageLabels"));
    const dndPagesList = quotedValues(exportBlock(dndRegistry, "dndNavigationPages"));
    const dndPageLabels = objectValues(exportBlock(dndRegistry, "dndPageLabels"));
    const dndNavigationLabels = objectValues(exportBlock(dndRegistry, "dndNavigationLabels"));

    expect(new Set(cocPagesList).size).toBe(cocPagesList.length);
    expect(new Set(cocLabels).size).toBe(cocLabels.length);
    expect(new Set(dndPagesList).size).toBe(dndPagesList.length);
    expect(new Set(dndPageLabels).size).toBe(dndPageLabels.length);
    expect(new Set(dndNavigationLabels).size).toBe(dndNavigationLabels.length);
  });

  it("keeps landing pages to two primary role actions instead of duplicate sitemap grids", () => {
    expect(cocHome).not.toContain("cocHomeCards");
    expect(cocHome).not.toContain("coc-index-grid");
    expect(occurrences(cocHome, "onNavigate(")).toBe(2);
    expect(cocHome).toContain('onNavigate("investigator")');
    expect(cocHome).toContain('onNavigate("keeper")');
    expect(cocHome).not.toContain('onNavigate("catalog")');

    expect(dndHome).not.toContain("dndHomeCards");
    expect(dndHome).not.toContain("role-card-grid");
    expect(occurrences(dndHome, "onNavigate(")).toBe(2);
    expect(dndHome).toContain('onNavigate("player")');
    expect(dndHome).toContain('onNavigate("dm")');
    expect(dndHome).not.toContain('onNavigate("catalog")');
  });

  it("keeps catalog source summaries count-only rather than repeating workspace links", () => {
    expect(cocCatalog).not.toContain("onNavigate");
    expect(cocCatalog).not.toContain("onOpen");
    expect(dndCatalog).not.toContain("onNavigate");
    expect(dndCatalog).not.toContain("onOpen");
  });

  it("keeps one percentile roller and one full occupation package on the Investigator page", () => {
    const investigatorRoute = routeBlock(cocPages, "investigator", "keeper");
    expect(occurrences(investigatorRoute, "<CocPercentileCard")).toBe(1);
    expect(investigatorLibrary).not.toContain("<CocPercentileCard");
    expect(investigatorDossier).not.toContain("<CocPercentileCard");
    expect(investigatorDossier).not.toContain("occupation.summary");
    expect(investigatorDossier).not.toContain("occupation.contacts");
    expect(investigatorDossier).not.toContain("occupation.typicalGear");
    expect(investigatorDossier).not.toContain("occupation.complication");
    expect(investigatorLibrary).toContain("occupation.summary");
  });

  it("does not repeat library-owned procedure cards in their route wrappers", () => {
    const equipmentRoute = routeBlock(cocPages, "equipment", "spells");
    expect(occurrences(equipmentRoute, "<CocEquipmentLibrary")).toBe(1);
    expect(equipmentRoute).not.toContain("<CocFirearmProcedureCard");
    expect(equipmentRoute).not.toContain("<CocInjuryCard");
    expect(equipmentRoute).not.toContain("<CocHealingCard");
    expect(equipmentLibrary).toContain("<CocFirearmProcedureCard");
    expect(equipmentLibrary).toContain("<CocInjuryCard");
    expect(equipmentLibrary).toContain("<CocHealingCard");

    const ritualRoute = routeBlock(cocPages, "spells", "creatures");
    expect(occurrences(ritualRoute, "<CocRitualLibrary")).toBe(1);
    expect(ritualRoute).not.toContain("<CocMagicProcedureCard");
    expect(ritualLibrary).toContain("<CocMagicProcedureCard");
  });
});