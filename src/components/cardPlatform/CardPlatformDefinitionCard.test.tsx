import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { dndConditions2024 } from "../../data/dndConditions2024";
import { adaptDndCondition } from "../../utils/cardPlatformDndConditionAdapter";
import { CardPlatformDefinitionCard } from "./CardPlatformDefinitionCard";

describe("universal Card Platform definition card", () => {
  it("renders every structured condition effect on the shared card back", () => {
    const condition = dndConditions2024.find((entry) => entry.name === "Unconscious");
    expect(condition).toBeDefined();
    const html = renderToStaticMarkup(
      <CardPlatformDefinitionCard card={adaptDndCondition(condition!)} />
    );

    for (const effect of condition!.effects) {
      expect(html).toContain(effect);
    }
    expect(html).toContain("D&amp;D 2024");
    expect(html).toContain("CC BY 4.0");
  });
});
