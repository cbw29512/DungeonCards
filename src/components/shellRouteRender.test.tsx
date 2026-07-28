import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CocAppPage, DndAppPage } from "../integration/dmForgeRoute";
import { CocPageContent } from "./cocShell/CocPageContent";
import { cocNavigationPages } from "./cocShell/cocPageRegistry";
import { DndPageContent, type DndPageContentProps } from "./dndShell/DndPageContent";
import { dndNavigationPages } from "./dndShell/dndPageRegistry";

const noOp = () => {};
const successfulWrite = () => true;

const dndProps: Omit<DndPageContentProps, "activePage"> = {
  homebrewCards: [],
  homebrewMonsters: [],
  homebrewStorageError: null,
  monsterStorageError: null,
  migrationNotice: null,
  onCreateCard: successfulWrite,
  onCreateMonster: successfulWrite,
  onDeleteCard: successfulWrite,
  onDeleteMonster: successfulWrite,
  onNavigate: noOp
};

const duplicateIds = (markup: string): string[] => {
  const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
};

const textOccurrences = (markup: string, value: string): number => markup.split(value).length - 1;

const renderDnd = (activePage: DndAppPage): string => renderToStaticMarkup(
  <DndPageContent {...dndProps} activePage={activePage} />
);

const renderCoc = (activePage: CocAppPage): string => renderToStaticMarkup(
  <CocPageContent activePage={activePage} onNavigate={noOp} />
);

describe("rendered shell routes", () => {
  it("renders every registered D&D route with unique HTML IDs", () => {
    for (const page of dndNavigationPages) {
      const markup = renderDnd(page);
      expect(markup.length, `${page} rendered no meaningful content`).toBeGreaterThan(100);
      expect(duplicateIds(markup), `${page} rendered duplicate HTML IDs`).toEqual([]);
    }
  });

  it("renders every registered percentile-horror route with unique HTML IDs", () => {
    for (const page of cocNavigationPages) {
      const markup = renderCoc(page);
      expect(markup.length, `${page} rendered no meaningful content`).toBeGreaterThan(100);
      expect(duplicateIds(markup), `${page} rendered duplicate HTML IDs`).toEqual([]);
    }
  });

  it("renders exactly one clearly named action for each primary D&D role", () => {
    const markup = renderDnd("home");
    expect(textOccurrences(markup, "Open Player workspace")).toBe(1);
    expect(textOccurrences(markup, "Open DM workspace")).toBe(1);
    expect(markup).not.toContain("role-card-grid");
  });

  it("renders exactly one clearly named action for each primary percentile-horror role", () => {
    const markup = renderCoc("home");
    expect(textOccurrences(markup, "Open Investigator workspace")).toBe(1);
    expect(textOccurrences(markup, "Open Keeper workspace")).toBe(1);
    expect(markup).not.toContain("coc-index-grid");
  });
});