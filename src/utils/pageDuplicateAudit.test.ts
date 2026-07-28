import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  cocNavigationPages,
  cocPageLabels
} from "../components/cocShell/cocPageRegistry";
import {
  dndNavigationLabels,
  dndNavigationPages,
  dndPageLabels
} from "../components/dndShell/dndPageRegistry";

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8");
const occurrences = (source: string, token: string): number => source.split(token).length - 1;

const routeBlock = (source: string, page: string, nextPage?: string): string => {
  const startToken = `if (activePage === "${page}")`;
  const start = source.indexOf(startToken);
  if (start < 0) throw new Error(`Route block not found: ${page}`);
  if (!nextPage) return source.slice(start);
  const end = source.indexOf(`if (activePage === "${nextPage}")`, start + startToken.length);
  return source.slice(start, end < 0 ? undefined : end);
};

const cocHome = read("../components/cocShell/CocHome.tsx");
const dndHome = read("../components/dndShell/DndHome.tsx");
const cocPages = read("../components/cocShell/CocPageContent.tsx");
const investigatorLibrary = read("../components/CocInvestigatorLibrary.tsx");
const investigatorDossier = read("../components/CocInvestigatorDossier.tsx");
const equipmentLibrary = read("../components/CocEquipmentLibrary.tsx");
const ritualLibrary = read("../components/CocRitualLibrary.tsx");

describe("duplicate-free routed pages", () => {
  it("keeps every navigation destination and label unique", () => {
    expect(new Set(cocNavigationPages).size).toBe(cocNavigationPages.length);
    expect(new Set(Object.values(cocPageLabels)).size).toBe(Object.values(cocPageLabels).length);
    expect(new Set(dndNavigationPages).size).toBe(dndNavigationPages.length);
    expect(new Set(Object.values(dndPageLabels)).size).toBe(Object.values(dndPageLabels).length);
    expect(new Set(Object.values(dndNavigationLabels)).size).toBe(Object.values(dndNavigationLabels).length);
  });

  it("uses one canonical navigation bar instead of duplicate home-page destination grids", () => {
    expect(cocHome).not.toContain("cocHomeCards");
    expect(cocHome).not.toContain("coc-index-grid");
    expect(cocHome).not.toContain("onNavigate(");
    expect(dndHome).not.toContain("dndHomeCards");
    expect(dndHome).not.toContain("role-card-grid");
    expect(dndHome).not.toContain("onNavigate(");
  });

  it("keeps one percentile roller on the Investigator page", () => {
    const investigatorRoute = routeBlock(cocPages, "investigator", "keeper");
    expect(occurrences(investigatorRoute, "<CocPercentileCard")).toBe(1);
    expect(investigatorLibrary).not.toContain("<CocPercentileCard");
    expect(investigatorDossier).not.toContain("<CocPercentileCard");
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
