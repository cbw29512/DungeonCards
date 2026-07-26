import { describe, expect, it } from "vitest";
import { dndToolCatalog, dndToolSourceByRuleset } from "./dndTools";

describe("D&D tool catalog", () => {
  it("contains 17 artisan and 8 other tool families", () => {
    expect(dndToolCatalog).toHaveLength(25);
    expect(dndToolCatalog.filter((tool) => tool.category === "artisan")).toHaveLength(17);
    expect(dndToolCatalog.filter((tool) => tool.category === "other")).toHaveLength(8);
    expect(new Set(dndToolCatalog.map((tool) => tool.id)).size).toBe(25);
  });

  it("contains all gaming and instrument variants as separate proficiencies", () => {
    const gaming = dndToolCatalog.find((tool) => tool.id === "gaming");
    const instrument = dndToolCatalog.find((tool) => tool.id === "instrument");
    expect(gaming?.variants).toHaveLength(4);
    expect(instrument?.variants).toHaveLength(10);
    expect(new Set([...(gaming?.variants ?? []), ...(instrument?.variants ?? [])].map((variant) => variant.id)).size).toBe(14);
  });

  it("keeps 2024 fixed abilities and procedures", () => {
    expect(dndToolCatalog.find((tool) => tool.id === "carpenter")).toMatchObject({
      ability2024: "Strength",
      utilize2024: ["Seal or pry open a door or container (DC 20)"]
    });
    expect(dndToolCatalog.find((tool) => tool.id === "thieves")).toMatchObject({
      ability2024: "Dexterity",
      utilize2024: ["Pick a lock (DC 15)", "Disarm a trap (DC 15)"]
    });
    expect(dndToolCatalog.find((tool) => tool.id === "navigator")?.ability2024).toBe("Wisdom");
  });

  it("keeps 2014 ability choice flexible", () => {
    expect(dndToolCatalog.find((tool) => tool.id === "woodcarver")?.procedure2014).toContain("Choose the ability that fits the task");
    expect(dndToolCatalog.find((tool) => tool.id === "disguise")?.procedure2014).not.toContain("Charisma");
  });

  it("preserves important craft boundaries", () => {
    expect(dndToolCatalog.find((tool) => tool.id === "herbalism")?.craft2024).toContain("Potion of Healing");
    expect(dndToolCatalog.find((tool) => tool.id === "smith")?.craft2024).toContain("Heavy armor");
    expect(dndToolCatalog.find((tool) => tool.id === "forgery")?.craft2024).toEqual([]);
  });

  it("links both editions to official D&D Beyond rules", () => {
    for (const source of Object.values(dndToolSourceByRuleset)) {
      expect(source.url).toMatch(/^https:\/\/www\.dndbeyond\.com\/sources\/dnd\//);
    }
  });
});
