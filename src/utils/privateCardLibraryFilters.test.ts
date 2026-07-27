import { describe, expect, it } from "vitest";
import { privateArchiveCard, publicArchiveCard } from "./cardPlatformArchiveFixtures";
import {
  EMPTY_PRIVATE_LIBRARY_FILTERS,
  filterPrivateLibraryCards,
  privateLibraryFilterOptions
} from "./privateCardLibraryFilters";

const cards = [privateArchiveCard, publicArchiveCard];

describe("private card library filters", () => {
  it("derives stable family and review options", () => {
    expect(privateLibraryFilterOptions(cards)).toEqual({
      families: ["procedure"],
      reviews: ["draft"]
    });
  });

  it("searches titles, tags, actions, and sources", () => {
    expect(filterPrivateLibraryCards(cards, { ...EMPTY_PRIVATE_LIBRARY_FILTERS, query: "private" }))
      .toEqual([privateArchiveCard]);
    expect(filterPrivateLibraryCards(cards, { ...EMPTY_PRIVATE_LIBRARY_FILTERS, query: "Use card" }))
      .toHaveLength(2);
    expect(filterPrivateLibraryCards(cards, { ...EMPTY_PRIVATE_LIBRARY_FILTERS, query: "Owned private source" }))
      .toEqual([privateArchiveCard]);
  });

  it("combines family, visibility, and review filters", () => {
    expect(filterPrivateLibraryCards(cards, {
      query: "",
      family: "procedure",
      visibility: "private",
      review: "draft"
    })).toEqual([privateArchiveCard]);
    expect(filterPrivateLibraryCards(cards, {
      query: "",
      family: "spell",
      visibility: "all",
      review: "all"
    })).toEqual([]);
  });
});
