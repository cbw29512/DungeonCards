import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { srdMonsters } from "../data/srdCompendium";
import { stripMonsterExperienceText } from "../utils/monsterChallenge";
import { SrdMonsterReferenceCard } from "./SrdMonsterReferenceCard";

const escapeHtml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

describe("SRD Monster Compendium reference", () => {
  it("renders the complete licensed raw stat block and exact source metadata", () => {
    const monster = srdMonsters.find((record) => (
      record.edition === "srd-5.1-2014" && record.name === "Goblin"
    ));
    expect(monster).toBeDefined();
    if (!monster) return;

    const markup = renderToStaticMarkup(<SrdMonsterReferenceCard monster={monster} />);
    const completeSourceText = escapeHtml(stripMonsterExperienceText(monster.rawText).trim());

    expect(markup).toContain("Open complete stat-block reference");
    expect(markup).toContain("Complete licensed source record");
    expect(markup).toContain(`page ${monster.sourcePage}`);
    expect(markup).toContain(completeSourceText);
    expect(markup).toContain("<pre>");
  });
});