import { describe, expect, it } from "vitest";
import type { CardCatalogEntry } from "../types/cardCatalog";
import { publicArchiveCard } from "./cardPlatformArchiveFixtures";
import {
  CARD_CATALOG_PAGE_SIZE,
  EMPTY_CARD_CATALOG_FILTERS,
  filterCardCatalogEntries,
  paginateCardCatalogEntries
} from "./cardCatalogQuery";

const entries: CardCatalogEntry[] = Array.from({ length: 80 }, (_, index) => ({
  definition: {
    ...publicArchiveCard,
    id: `catalog:test:${index}`,
    family: index % 2 === 0 ? "spell" : "procedure",
    content: {
      ...publicArchiveCard.content,
      title: `Card ${String(index).padStart(2, "0")}`,
      summary: index === 42 ? "Contains the silver lantern clue." : "Catalog test card.",
      tags: index % 2 === 0 ? ["arcane"] : ["procedure"]
    },
    review: { status: index % 3 === 0 ? "verified" : "draft" }
  },
  sourceId: index % 2 === 0 ? "spells" : "rules",
  sourceLabel: index % 2 === 0 ? "SRD Spells" : "Rules",
  privateImported: false
}));

describe("Card Catalog query engine", () => {
  it("searches content and combines source family and review filters", () => {
    const searched = filterCardCatalogEntries(entries, { ...EMPTY_CARD_CATALOG_FILTERS, query: "silver lantern" });
    expect(searched.map((entry) => entry.definition.id)).toEqual(["catalog:test:42"]);
    const filtered = filterCardCatalogEntries(entries, {
      ...EMPTY_CARD_CATALOG_FILTERS,
      sourceId: "spells",
      family: "spell",
      review: "verified"
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((entry) => entry.sourceId === "spells" && entry.definition.family === "spell" && entry.definition.review.status === "verified")).toBe(true);
  });

  it("sorts predictably and mounts no more than the page-size boundary", () => {
    const sorted = filterCardCatalogEntries(entries, { ...EMPTY_CARD_CATALOG_FILTERS, sort: "title" });
    expect(sorted[0]?.definition.content.title).toBe("Card 00");
    const first = paginateCardCatalogEntries(sorted, 1);
    const last = paginateCardCatalogEntries(sorted, 99);
    expect(first.entries).toHaveLength(CARD_CATALOG_PAGE_SIZE);
    expect(first.pageCount).toBe(3);
    expect(last.page).toBe(3);
    expect(last.entries).toHaveLength(8);
  });
});
