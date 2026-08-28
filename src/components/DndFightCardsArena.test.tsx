import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DndFightCardsArena } from "./DndFightCardsArena";

describe("Fight Cards showdown", () => {
  it("keeps the complete 2024 hero and SRD monster rosters visible instead of filtering unsupported fights", () => {
    const html = renderToStaticMarkup(<DndFightCardsArena />);

    expect(html).toContain("Pregen Heroes vs. Every SRD Monster. Who Will Win?");
    expect(html).toContain('data-hero-slot-count="240"');
    expect(html).toContain('data-monster-count="328"');
    expect(html).toContain("all 240 hero slots and all 328 official SRD 5.2.1 monsters stay visible");
    expect(html).toContain("Choose hero");
    expect(html).toContain("Choose monster · all 328");
    expect(html).toContain(">FIGHT</button>");
    expect(html).toContain("No CR gate. No stat fudging. No hidden balancing.");
    expect((html.match(/<option/g) ?? [])).toHaveLength(568);
    expect((html.match(/fight-showcase-card /g) ?? [])).toHaveLength(2);
  });
});
