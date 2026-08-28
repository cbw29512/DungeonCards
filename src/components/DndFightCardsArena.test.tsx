import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DndFightCardsArena } from "./DndFightCardsArena";

describe("Fight Cards showdown", () => {
  it("leads with two cards, simple fighter selectors, and one FIGHT action", () => {
    const html = renderToStaticMarkup(<DndFightCardsArena />);

    expect(html).toContain("Pregen Heroes vs. Monsters. Who Will Win?");
    expect(html).toContain("PREGEN HERO");
    expect(html).toContain("MONSTER");
    expect(html).toContain("Choose hero");
    expect(html).toContain("Choose monster");
    expect(html).toContain(">FIGHT</button>");
    expect(html).toContain("No stat fudging. No hidden balancing.");
    expect((html.match(/fight-showcase-card /g) ?? [])).toHaveLength(2);
  });
});
