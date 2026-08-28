import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("application front door", () => {
  it("opens directly into Fight Cards instead of requiring a system-picker decision", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Pick the cards. Press FIGHT.");
    expect(html).toContain("Choose a hero and a monster. Fight Cards handles the rules and shows you what happens.");
    expect(html).toContain("Choose hero");
    expect(html).toContain("Choose monster");
    expect(html).toContain(">FIGHT</button>");
    expect(html).toContain("DungeonCards tools");
    expect(html).toContain("Other games");
    expect(html).not.toContain("What are you running tonight?");
  });
});
