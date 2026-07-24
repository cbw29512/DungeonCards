import { describe, expect, it } from "vitest";
import {
  cocQuickReferenceCards,
  cocRuleSources,
  getCocRuleSource
} from "./cocRuleSources";

describe("Call of Cthulhu rule source registry", () => {
  it("uses unique, stable source IDs", () => {
    const ids = cocRuleSources.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("provides required source metadata for every record", () => {
    for (const source of cocRuleSources) {
      expect(source.system).toBe("call-of-cthulhu");
      expect(source.edition).toBe("7e");
      expect(source.ruleName.trim()).not.toBe("");
      expect(source.sourceTitle.trim()).not.toBe("");
      expect(source.sourceUrl).toMatch(/^https:\/\//);
      expect(source.chapterOrSection.trim()).not.toBe("");
      expect(source.implementationSummary.trim()).not.toBe("");
      expect(source.notes.length).toBeGreaterThan(0);
    }
  });

  it("requires official-source verification metadata for every verified rule", () => {
    const verified = cocRuleSources.filter((candidate) => candidate.status === "verified");
    expect(verified.length).toBeGreaterThanOrEqual(10);
    for (const source of verified) {
      expect(source.primaryReviewer).toBeTruthy();
      expect(source.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.sourceUrl).toMatch(/^https:\/\/cthulhuwiki\.chaosium\.com\//);
    }
  });

  it("keeps original demonstrations outside the verified rules set", () => {
    for (const source of cocRuleSources.filter((candidate) => candidate.status === "prototype")) {
      expect(source.sourceTitle).toContain("DM Forge original demonstration content");
    }
  });

  it("links every quick-reference card to an existing source", () => {
    for (const card of cocQuickReferenceCards) {
      expect(getCocRuleSource(card.sourceId).id).toBe(card.sourceId);
    }
  });

  it("throws when a card requests an unknown source", () => {
    expect(() => getCocRuleSource("missing-source")).toThrow("not found");
  });
});
