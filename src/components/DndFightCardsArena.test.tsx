import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DndFightCardsArena } from "./DndFightCardsArena";

describe("Fight Cards showdown", () => {
  it("keeps the complete 2024 rosters while presenting a simple player-first fight surface", () => {
    const html = renderToStaticMarkup(<DndFightCardsArena />);

    expect(html).toContain("Pick two cards. Press FIGHT.");
    expect(html).toContain('data-hero-slot-count="240"');
    expect(html).toContain('data-monster-count="328"');
    expect(html).toContain("Choose hero");
    expect(html).toContain("Choose monster");
    expect(html).toContain(">FIGHT</button>");
    expect(html).toContain("No hidden balancing. The cards fight with their actual game stats.");
    expect(html).toContain("DM Details");
    expect((html.match(/<option/g) ?? [])).toHaveLength(568);
    expect((html.match(/fight-showcase-card /g) ?? [])).toHaveLength(2);

    expect(html).not.toContain("AUTO-FIGHT CERTIFIED");
    expect(html).not.toContain("SOURCE CARD · AUTOMATION PENDING");
    expect(html).not.toContain("Automation blocker:");
    expect(html).not.toContain("certification drives");
  });
});
